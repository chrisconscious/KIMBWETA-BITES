import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthenticatedRequest } from '../../types';
import { success, created } from '../../utils/response';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body, req.ip);
      created(res, result, 'Registration successful.');
    } catch (err) { next(err); }
  }

  /** Password login (mobile number + password) */
  async loginWithPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceInfo = req.headers['user-agent'];
      const result = await authService.loginWithPassword(req.body, deviceInfo, req.ip);
      success(res, result, 'Login successful');
    } catch (err) { next(err); }
  }

  async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.sendOtp(req.body.phoneNumber);
      success(res, null, 'OTP sent successfully');
    } catch (err) { next(err); }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceInfo = req.headers['user-agent'];
      const result = await authService.verifyOtpAndLogin(req.body, deviceInfo, req.ip);
      success(res, result, 'Login successful');
    } catch (err) { next(err); }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.refreshTokens(req.body.refreshToken, req.ip);
      success(res, result, 'Tokens refreshed');
    } catch (err) { next(err); }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      await authService.logout(authReq.user.id);
      success(res, null, 'Logged out successfully');
    } catch (err) { next(err); }
  }
}

export const authController = new AuthController();
