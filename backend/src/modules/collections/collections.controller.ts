import { Request, Response, NextFunction } from 'express';
import { collectionsService } from './collections.service';
import { AuthenticatedRequest } from '../../types';
import { success, created } from '../../utils/response';

export class CollectionsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const result = await collectionsService.list(user.id, req.query as Record<string, unknown>);
      success(res, result, 'Collections retrieved');
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const collection = await collectionsService.getById(req.params.id, user.id);
      success(res, collection, 'Collection retrieved');
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const collection = await collectionsService.create(user.id, req.body);
      created(res, collection, 'Collection created');
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const collection = await collectionsService.update(req.params.id, user.id, req.body);
      success(res, collection, 'Collection updated');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const result = await collectionsService.delete(req.params.id, user.id);
      success(res, result, 'Collection deleted');
    } catch (err) { next(err); }
  }

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const { productId, note } = req.body;
      const item = await collectionsService.addItem(req.params.id, user.id, productId, note);
      created(res, item, 'Product added to collection');
    } catch (err) { next(err); }
  }

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const result = await collectionsService.removeItem(req.params.id, user.id, req.params.productId);
      success(res, result, 'Product removed from collection');
    } catch (err) { next(err); }
  }
}

export const collectionsController = new CollectionsController();
