import { Response } from 'express';
import { PaginationParams, PaginatedResponse } from '../types';

export function success<T>(res: Response, data: T, message = 'Success', statusCode = 200): Response {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200): Response {
  return success(res, data, message, statusCode);
}

export function created<T>(res: Response, data: T, message = 'Created'): Response {
  return res.status(201).json({ success: true, message, data });
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}

export function badRequest(res: Response, message: string, errors?: Record<string, string[]>): Response {
  return res.status(400).json({ success: false, message, errors });
}

export function unauthorized(res: Response, message = 'Unauthorized'): Response {
  return res.status(401).json({ success: false, message });
}

export function forbidden(res: Response, message = 'Forbidden'): Response {
  return res.status(403).json({ success: false, message });
}

export function notFound(res: Response, message = 'Not found'): Response {
  return res.status(404).json({ success: false, message });
}

export function conflict(res: Response, message: string): Response {
  return res.status(409).json({ success: false, message });
}

export function serverError(res: Response, message = 'Internal server error'): Response {
  return res.status(500).json({ success: false, message });
}

// Pagination
export function getPaginationParams(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'), 10)));
  return { page, limit, skip: (page - 1) * limit };
}

export function paginate<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / params.limit);
  return {
    data,
    meta: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
}
