import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { bruteForceProtection } from '../../middleware/security.middleware';
import { env } from '../../config/env';
import {
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
  loginSchema,
} from './auth.validators';

const router = Router();

const otpLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.OTP_RATE_LIMIT_MAX,
  message: { success: false, message: 'Too many OTP requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route POST /auth/login
 * @desc  Login with mobile number + password
 * @access Public
 */
router.post('/login', bruteForceProtection, validate(loginSchema), authController.loginWithPassword.bind(authController));

/**
 * @route POST /auth/register
 * @desc  Register new user (and optionally set password)
 * @access Public
 */
router.post('/register', otpLimiter, validate(registerSchema), authController.register.bind(authController));

/**
 * @route POST /auth/otp/send
 * @desc  Send OTP to existing phone number
 * @access Public
 */
router.post('/otp/send', otpLimiter, validate(sendOtpSchema), authController.sendOtp.bind(authController));

/**
 * @route POST /auth/otp/verify
 * @desc  Verify OTP and receive JWT tokens
 * @access Public
 */
router.post('/otp/verify', bruteForceProtection, validate(verifyOtpSchema), authController.verifyOtp.bind(authController));

/**
 * @route POST /auth/token/refresh
 * @desc  Refresh access token using refresh token
 * @access Public
 */
router.post('/token/refresh', validate(refreshTokenSchema), authController.refreshToken.bind(authController));

/**
 * @route POST /auth/logout
 * @desc  Revoke all refresh tokens
 * @access Protected
 */
router.post('/logout', authenticate, authController.logout.bind(authController));

export default router;
