import crypto from 'crypto';
import { env } from '../config/env';
import { logger } from '../config/logger';

export function generateOtp(): string {
  // Cryptographically secure OTP
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0);
  const otp = (num % Math.pow(10, env.OTP_LENGTH))
    .toString()
    .padStart(env.OTP_LENGTH, '0');
  return otp;
}

export function getOtpExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + env.OTP_EXPIRY_MINUTES);
  return expiry;
}

export async function sendOtpSms(phoneNumber: string, otp: string): Promise<void> {
  // Always mock in non-production or when mock mode is enabled
  if (env.OTP_MOCK_MODE || env.NODE_ENV !== 'production') {
    logger.info({ phoneNumber, otp }, '🔐 [MOCK] OTP generated — would be sent via SMS');
    return;
  }

  // TODO: Integrate Africa's Talking or similar SMS gateway
  // Example with Africa's Talking:
  // const AfricasTalking = require('africastalking');
  // const at = AfricasTalking({ apiKey: env.SMS_API_KEY, username: env.SMS_USERNAME });
  // await at.SMS.send({ to: [phoneNumber], message: `Your KIMBWETA code: ${otp}. Expires in ${env.OTP_EXPIRY_MINUTES} minutes.`, from: env.SMS_SENDER_ID });
  
  logger.warn({ phoneNumber }, 'SMS gateway not configured. OTP would be sent but mock is disabled.');
  // Fallback: allow OTP to work in production by logging it instead of crashing
  logger.info({ phoneNumber, otp }, '⚠️ [FALLBACK] OTP logged instead of sent via SMS');
}

export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}
