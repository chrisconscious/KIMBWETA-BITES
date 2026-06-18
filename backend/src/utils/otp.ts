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
  if (env.OTP_MOCK_MODE) {
    // In mock mode, just log the OTP (development only)
    logger.info({ phoneNumber, otp }, '🔐 [MOCK] OTP generated — would be sent via SMS');
    return;
  }

  // TODO: Integrate Africa's Talking or similar SMS gateway
  // Example with Africa's Talking:
  // const AfricasTalking = require('africastalking');
  // const at = AfricasTalking({ apiKey: env.SMS_API_KEY, username: env.SMS_USERNAME });
  // await at.SMS.send({ to: [phoneNumber], message: `Your KIMBWETA code: ${otp}. Expires in ${env.OTP_EXPIRY_MINUTES} minutes.`, from: env.SMS_SENDER_ID });
  
  throw new Error('SMS gateway not configured. Set OTP_MOCK_MODE=true for development.');
}

export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}
