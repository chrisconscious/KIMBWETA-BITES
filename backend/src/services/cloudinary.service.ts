import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { AppError } from '../middleware/error.middleware';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

function ensureConfigured() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError(
      'Cloudinary connection failed. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, ' +
      'and CLOUDINARY_API_SECRET in environment variables.',
      502
    );
  }
}

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  options?: { publicId?: string; transformation?: any }
): Promise<CloudinaryUploadResult> {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `kimbweta/${folder}`,
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error || !result) {
          logger.error({ err: error }, 'Cloudinary upload failed');
          return reject(error || new Error('Upload returned no result'));
        }
        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  ensureConfigured();
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info({ publicId, result }, 'Cloudinary delete result');
  } catch (error) {
    logger.error({ err: error, publicId }, 'Cloudinary delete failed');
  }
}

export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || url.startsWith('/uploads/')) return null;
  try {
    const parts = new URL(url).pathname.split('/');
    const filename = parts[parts.length - 1];
    const folderPart = parts[parts.length - 2];
    if (folderPart === 'kimbweta') {
      parts.splice(parts.indexOf('kimbweta'));
      const subfolder = parts[parts.indexOf('upload') + 2];
      const publicIdWithExt = filename.substring(0, filename.lastIndexOf('.'));
      return `kimbweta/${subfolder}/${publicIdWithExt}`;
    }
    const publicIdWithExt = filename.substring(0, filename.lastIndexOf('.'));
    return publicIdWithExt;
  } catch {
    return null;
  }
}

export async function deleteByUrl(url: string): Promise<void> {
  const publicId = extractPublicIdFromUrl(url);
  if (publicId) {
    await deleteFromCloudinary(publicId);
  }
}

export async function replaceCloudinaryImage(
  buffer: Buffer | null,
  folder: string,
  oldUrl: string | null
): Promise<string | null> {
  if (oldUrl) {
    await deleteByUrl(oldUrl);
  }
  if (!buffer) return oldUrl;
  const result = await uploadToCloudinary(buffer, folder);
  return result.secureUrl;
}

export function isLocalPath(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('/uploads/');
}
