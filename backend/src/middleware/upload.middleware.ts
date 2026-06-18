import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { AppError } from './error.middleware';
import { env } from '../config/env';
import { logger } from '../config/logger';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);
const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.dll', '.apk', '.js', '.php', '.py', '.sh',
  '.vbs', '.ps1', '.msi', '.jar', '.class', '.cmd', '.com',
  '.reg', '.scr', '.cpl', '.inf',
]);

const MAX_IMAGE_SIZE = (env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024;
const MAX_VIDEO_SIZE = (env.MAX_VIDEO_SIZE_MB || 50) * 1024 * 1024;

export function validateFileUpload(req: Request, _res: Response, next: NextFunction): void {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    next();
    return;
  }

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();

    if (DANGEROUS_EXTENSIONS.has(ext)) {
      logger.warn({ filename: file.originalname, ext }, 'Blocked dangerous file upload');
      return next(new AppError(`File type "${ext}" is not allowed for security reasons`, 400));
    }

    const isImage = ALLOWED_IMAGE_TYPES.has(file.mimetype);
    const isVideo = ALLOWED_VIDEO_TYPES.has(file.mimetype);

    if (!isImage && !isVideo) {
      logger.warn({ filename: file.originalname, mimetype: file.mimetype }, 'Blocked upload: unsupported MIME type');
      return next(new AppError(`Unsupported file type: ${file.mimetype}. Allowed: jpg, jpeg, png, webp, mp4, webm`, 400));
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return next(new AppError(`Image too large. Max size: ${env.MAX_FILE_SIZE_MB}MB`, 400));
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return next(new AppError(`Video too large. Max size: ${env.MAX_VIDEO_SIZE_MB}MB`, 400));
    }
  }

  next();
}
