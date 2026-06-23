import { Request, Response, NextFunction } from 'express';
import { categoriesService } from './categories.service';
import { AuthenticatedRequest } from '../../types';
import { success, created } from '../../utils/response';
import { uploadToCloudinary } from '../../services/cloudinary.service';

export class CategoriesController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const cat = await categoriesService.create(req.body, user.id);
      created(res, cat, 'Category created');
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cat = await categoriesService.update(req.params.id, req.body);
      success(res, cat, 'Category updated');
    } catch (err) { next(err); }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await categoriesService.delete(req.params.id);
      success(res, null, 'Category deleted');
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { isActive, visibility, search } = req.query as any;
      const activeFilter = isActive !== undefined ? isActive === 'true' : undefined;
      const cats = await categoriesService.list({ isActive: activeFilter, visibility, search });
      success(res, cats, 'Categories retrieved');
    } catch (err) { next(err); }
  }

  async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cats = await categoriesService.getPublic();
      success(res, cats, 'Categories retrieved');
    } catch (err) { next(err); }
  }

  async uploadIcon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = (req as any).file;
      if (!file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }
      const result = await uploadToCloudinary(file.buffer, 'categories');
      success(res, { url: result.secureUrl, filename: file.originalname, size: file.size, mimetype: file.mimetype }, 'Icon uploaded');
    } catch (err) { next(err); }
  }

  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await categoriesService.reorder(req.body.items);
      success(res, null, 'Categories reordered');
    } catch (err) { next(err); }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cat = await categoriesService.toggleStatus(req.params.id, req.body.isActive);
      success(res, cat, 'Category status updated');
    } catch (err) { next(err); }
  }
}

export const categoriesController = new CategoriesController();
