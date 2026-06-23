import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service';
import { success, created } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';
import { uploadToCloudinary, deleteByUrl, isLocalPath } from '../../services/cloudinary.service';

export class SettingsController {
  async getPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await settingsService.getPublic();
      success(res, data, 'Settings retrieved');
    } catch (err) { next(err); }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await settingsService.getAll();
      success(res, data, 'Settings retrieved');
    } catch (err) { next(err); }
  }

  async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError('No file uploaded', 400);
      const existing = await settingsService.getPublic();
      const oldLogo = existing.site_logo;
      const result = await uploadToCloudinary(req.file.buffer, 'settings');
      if (oldLogo && !isLocalPath(oldLogo)) {
        await deleteByUrl(oldLogo);
      }
      await settingsService.set('site_logo', result.secureUrl);
      created(res, { url: result.secureUrl }, 'Logo uploaded successfully');
    } catch (err) { next(err); }
  }

  async removeLogo(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await settingsService.getPublic();
      const oldLogo = existing.site_logo;
      if (oldLogo && !isLocalPath(oldLogo)) {
        await deleteByUrl(oldLogo);
      }
      await settingsService.set('site_logo', '');
      success(res, null, 'Logo removed');
    } catch (err) { next(err); }
  }

  async set(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, value } = req.body;
      if (!key) throw new AppError('Key is required', 400);
      const setting = await settingsService.set(key, String(value ?? ''));
      success(res, setting, 'Setting updated');
    } catch (err) { next(err); }
  }

  async uploadPreloaderLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError('No file uploaded', 400);
      const existing = await settingsService.getPublic();
      const oldPreloader = existing.preloader_logo;
      const result = await uploadToCloudinary(req.file.buffer, 'settings');
      if (oldPreloader && !isLocalPath(oldPreloader)) {
        await deleteByUrl(oldPreloader);
      }
      await settingsService.set('preloader_logo', result.secureUrl);
      created(res, { url: result.secureUrl }, 'Preloader logo uploaded');
    } catch (err) { next(err); }
  }

  async removePreloaderLogo(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await settingsService.getPublic();
      const oldPreloader = existing.preloader_logo;
      if (oldPreloader && !isLocalPath(oldPreloader)) {
        await deleteByUrl(oldPreloader);
      }
      await settingsService.set('preloader_logo', '');
      success(res, null, 'Preloader logo removed');
    } catch (err) { next(err); }
  }
}

export const settingsController = new SettingsController();
