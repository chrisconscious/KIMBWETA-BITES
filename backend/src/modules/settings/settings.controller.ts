import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service';
import { success, created } from '../../utils/response';
import { AppError } from '../../middleware/error.middleware';

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
      const url = await settingsService.uploadLogo(req.file);
      created(res, { url }, 'Logo uploaded successfully');
    } catch (err) { next(err); }
  }

  async removeLogo(req: Request, res: Response, next: NextFunction) {
    try {
      await settingsService.set('site_logo', '');
      success(res, null, 'Logo removed');
    } catch (err) { next(err); }
  }

  async set(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, value } = req.body;
      if (!key) throw new AppError('Key is required', 400);
      let val = String(value ?? '');
      const imageKeys = ['site_logo', 'preloader_logo', 'favicon'];
      if (imageKeys.includes(key) && val && val.indexOf('/') === -1) {
        val = '/uploads/settings/' + val;
      }
      const setting = await settingsService.set(key, val);
      success(res, setting, 'Setting updated');
    } catch (err) { next(err); }
  }

  async uploadPreloaderLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError('No file uploaded', 400);
      const url = `/uploads/settings/${req.file.filename}`;
      await settingsService.set('preloader_logo', url);
      created(res, { url }, 'Preloader logo uploaded');
    } catch (err) { next(err); }
  }

  async removePreloaderLogo(req: Request, res: Response, next: NextFunction) {
    try {
      await settingsService.set('preloader_logo', '');
      success(res, null, 'Preloader logo removed');
    } catch (err) { next(err); }
  }
}

export const settingsController = new SettingsController();
