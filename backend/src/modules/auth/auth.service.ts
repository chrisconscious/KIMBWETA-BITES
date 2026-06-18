import bcrypt from 'bcryptjs';
import { prisma } from '../../database/prisma';
import { generateOtp, getOtpExpiry, sendOtpSms, hashOtp } from '../../utils/otp';
import { generateTokenPair, hashToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middleware/error.middleware';
import { logger } from '../../config/logger';
import { env } from '../../config/env';
import { recordFailedAttempt, clearAttempts } from '../../middleware/security.middleware';
import type { RegisterDto, VerifyOtpDto, LoginDto } from './auth.validators';
import { UserRole } from '@prisma/client';

/** Normalize phone to E.164 format (+255XXXXXXXXX) */
function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.startsWith('+255')) return cleaned;
  if (cleaned.startsWith('255')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+255${cleaned.slice(1)}`;
  return cleaned;
}

function getPhoneSearchValues(phone: string): string[] {
  const cleaned = phone.replace(/\s+/g, '');
  const normalized = normalizePhone(cleaned);
  const values = new Set<string>([normalized, cleaned]);

  if (cleaned.startsWith('+255')) {
    values.add(cleaned.slice(1));
    values.add(`0${cleaned.slice(4)}`);
  } else if (cleaned.startsWith('255')) {
    values.add(`+${cleaned}`);
    values.add(`0${cleaned.slice(3)}`);
  } else if (cleaned.startsWith('0')) {
    values.add(`255${cleaned.slice(1)}`);
  }

  return Array.from(values);
}

export class AuthService {

  /** Password login (mobile number + password) */
  async loginWithPassword(dto: LoginDto, deviceInfo?: string, ip?: string) {
    const phoneNumber = normalizePhone(dto.phoneNumber);
    const phoneSearchValues = getPhoneSearchValues(dto.phoneNumber);

    logger.info({ phoneNumber: dto.phoneNumber, normalizedPhone: phoneNumber, ip }, 'Login attempt with password');

    const user = await prisma.user.findFirst({
      where: { phoneNumber: { in: phoneSearchValues } },
      include: {
        campusAdminOf: {
          where: { isActive: true },
          select: { campusId: true },
        },
      },
    });

    if (!user) {
      recordFailedAttempt(dto.phoneNumber, ip || 'unknown');
      logger.warn({ phoneNumber: dto.phoneNumber, normalizedPhone: phoneNumber, ip }, 'Login failed: user not found');
      throw new AppError('Invalid phone number or password', 401);
    }
    if (user.status === 'blocked') throw new AppError('Account is blocked', 403);
    if (!user.passwordHash) {
      recordFailedAttempt(dto.phoneNumber, ip || 'unknown');
      logger.warn({ userId: user.id, phoneNumber: user.phoneNumber, ip }, 'Login failed: OTP-only account');
      throw new AppError('This account uses OTP login. Use OTP to sign in.', 400);
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      recordFailedAttempt(dto.phoneNumber, ip || 'unknown');
      logger.warn({ userId: user.id, phoneNumber: user.phoneNumber, ip }, 'Login failed: invalid password');
      throw new AppError('Invalid phone number or password', 401);
    }

    // Clear brute-force attempts on success
    clearAttempts(dto.phoneNumber, ip || 'unknown');

    // Activate user if pending
    if (user.status === 'pending') {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: 'active', phoneVerified: true, lastLoginAt: new Date() },
      });
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    }

    const campusId = user.campusAdminOf[0]?.campusId ?? user.campusId;
    const { accessToken, refreshToken } = generateTokenPair(user.id, user.role, campusId);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);

    // Revoke old tokens before creating a new one
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, isRevoked: false },
      data: { isRevoked: true },
    });
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        deviceInfo: deviceInfo ?? null,
        ipAddress: ip ?? null,
        expiresAt: refreshExpiry,
      },
    });

    logger.info({ userId: user.id, ip }, 'User logged in via password');

    return {
      accessToken,
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        campusId,
      },
    };
  }

  /**
   * Register a new user. Optionally sets password if provided.
   */
  async register(dto: RegisterDto, ip?: string) {
    const phoneNumber = normalizePhone(dto.phoneNumber);
    const phoneSearchValues = getPhoneSearchValues(dto.phoneNumber);

    const existing = await prisma.user.findFirst({ where: { phoneNumber: { in: phoneSearchValues } } });
    if (existing && existing.phoneVerified) {
      throw new AppError('Phone number already registered', 409);
    }

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 12) : null;

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: dto.name,
            email: dto.email,
            campusId: dto.campusId ?? null,
            ...(passwordHash ? { passwordHash } : {}),
          },
        })
      : await prisma.user.create({
          data: {
            name: dto.name,
            phoneNumber,
            email: dto.email,
            role: dto.role as UserRole,
            status: 'pending',
            passwordHash,
            campusId: dto.campusId ?? null,
          },
        });

    // Send OTP only if no password
    if (!dto.password) {
      await this.sendOtp(phoneNumber, user.id);
      logger.info({ userId: user.id, ip }, 'User registered, OTP sent');
      return { userId: user.id, message: 'OTP sent to your phone number' };
    }

    logger.info({ userId: user.id, ip }, 'User registered with password');
    return { userId: user.id, message: 'Registration successful. You can now login.' };
  }

  /**
   * Generate a new OTP for a phone number and send via SMS.
   */
  async sendOtp(phoneNumber: string, userId?: string): Promise<void> {
    const normalized = normalizePhone(phoneNumber);

    await prisma.otpCode.updateMany({
      where: { phoneNumber: normalized, verified: false },
      data: { verified: true },
    });

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = getOtpExpiry();

    await prisma.otpCode.create({
      data: {
        userId: userId ?? null,
        phoneNumber: normalized,
        code: env.NODE_ENV === 'production' ? otpHash : otp,
        expiresAt,
        channel: 'SMS',
      },
    });

    await sendOtpSms(normalized, otp);
  }

  /**
   * Verify OTP and issue JWT tokens.
   */
  async verifyOtpAndLogin(dto: VerifyOtpDto, deviceInfo?: string, ip?: string) {
    const phoneNumber = normalizePhone(dto.phoneNumber);
    const phoneSearchValues = getPhoneSearchValues(dto.phoneNumber);

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phoneNumber,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      recordFailedAttempt(dto.phoneNumber, ip || 'unknown');
      throw new AppError('OTP not found or expired', 400);
    }

    if (otpRecord.attempts >= 5) {
      recordFailedAttempt(dto.phoneNumber, ip || 'unknown');
      await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { verified: true } });
      throw new AppError('Too many failed attempts. Request a new OTP.', 429);
    }

    const inputCode = env.NODE_ENV === 'production' ? hashOtp(dto.otp) : dto.otp;
    const isValid = inputCode === otpRecord.code;

    if (!isValid) {
      recordFailedAttempt(dto.phoneNumber, ip || 'unknown');
      await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { attempts: { increment: 1 } } });
      throw new AppError('Invalid OTP', 401);
    }

    clearAttempts(dto.phoneNumber, ip || 'unknown');
    await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { verified: true } });

    let user = await prisma.user.findFirst({
      where: { phoneNumber: { in: phoneSearchValues } },
      include: {
        campusAdminOf: { where: { isActive: true }, select: { campusId: true } },
      },
    });

    if (!user) throw new AppError('User not found', 404);
    if (user.status === 'blocked') throw new AppError('Account is blocked', 403);

    if (!user.phoneVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true, status: 'active', lastLoginAt: new Date() },
        include: { campusAdminOf: { where: { isActive: true }, select: { campusId: true } } },
      });
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    }

    const campusId = user.campusAdminOf[0]?.campusId ?? user.campusId;
    const { accessToken, refreshToken } = generateTokenPair(user.id, user.role, campusId);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);

    // Revoke old tokens before creating a new one
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, isRevoked: false },
      data: { isRevoked: true },
    });
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        deviceInfo: deviceInfo ?? null,
        ipAddress: ip ?? null,
        expiresAt: refreshExpiry,
      },
    });

    logger.info({ userId: user.id, ip }, 'User logged in via OTP');

    return {
      accessToken,
      token: accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, phoneNumber: user.phoneNumber, role: user.role, campusId },
    };
  }

  async refreshTokens(token: string, ip?: string) {
    let payload: any;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokenHash = hashToken(token);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new AppError('Refresh token expired or revoked', 401);
    }

    await prisma.refreshToken.update({ where: { id: stored.id }, data: { isRevoked: true } });

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { campusAdminOf: { where: { isActive: true }, select: { campusId: true } } },
    });

    if (!user || user.status !== 'active') throw new AppError('User not found or inactive', 401);

    const campusId = user.campusAdminOf[0]?.campusId ?? user.campusId;
    const { accessToken, refreshToken: newRefresh } = generateTokenPair(user.id, user.role, campusId);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(newRefresh),
        ipAddress: ip ?? null,
        expiresAt: refreshExpiry,
      },
    });

    return { accessToken, refreshToken: newRefresh };
  }

  async logout(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }
}

export const authService = new AuthService();
