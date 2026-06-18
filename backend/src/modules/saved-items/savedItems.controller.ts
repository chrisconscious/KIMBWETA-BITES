import { Request, Response, NextFunction } from 'express';
import { savedItemsService } from './savedItems.service';
import { AuthenticatedRequest } from '../../types';
import { success, created } from '../../utils/response';

export class SavedItemsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const result = await savedItemsService.list(user.id, req.query as Record<string, unknown>);
      success(res, result, 'Saved items retrieved');
    } catch (err) { next(err); }
  }

  async save(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const { productId, notes } = req.body;
      const item = await savedItemsService.save(user.id, productId, notes);
      created(res, item, 'Product saved');
    } catch (err) { next(err); }
  }

  async updateNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const { productId } = req.params;
      const { notes } = req.body;
      const item = await savedItemsService.updateNotes(user.id, productId, notes);
      success(res, item, 'Notes updated');
    } catch (err) { next(err); }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const { productId } = req.params;
      const result = await savedItemsService.remove(user.id, productId);
      success(res, result, 'Product unsaved');
    } catch (err) { next(err); }
  }
}

export const savedItemsController = new SavedItemsController();
