

import type { R2Bucket } from '@cloudflare/workers-types';
import { generateSafeFilename, isValidImageType } from './utils';

/**
 * Upload file to R2 bucket
 */
export async function uploadToR2(
  bucket: R2Bucket,
  file: File,
  folder: string = 'events'
): Promise<{ url: string; key: string }> {
  // Validate file type
  if (!isValidImageType(file.type)) {
    throw new Error('Invalid file type. Only images are allowed.');
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit.');
  }

  // Generate safe filename
  const filename = generateSafeFilename(file.name, folder);
  const key = `${folder}/${filename}`;

  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Upload to R2
  await bucket.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
    },
  });

  // Return public URL (adjust based on your R2 setup)
  // Option 1: Public bucket with custom domain
  const url = `https://images.yourdomain.com/${key}`;
  
  // Option 2: R2.dev subdomain (if enabled)
  // const url = `https://pub-xxxxx.r2.dev/${key}`;

  return { url, key };
}

/**
 * Delete file from R2 bucket
 */
export async function deleteFromR2(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  await bucket.delete(key);
}

/**
 * Get file from R2 bucket
 */
export async function getFromR2(
  bucket: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  return bucket.get(key);
}

/**
 * Check if file exists in R2
 */
export async function fileExistsInR2(
  bucket: R2Bucket,
  key: string
): Promise<boolean> {
  const object = await bucket.head(key);
  return object !== null;
}

/**
 * Extract R2 key from URL
 */
export function extractR2Key(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Extract path without leading slash
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}

/**
 * Generate presigned URL for private files (if needed)
 */
export async function generatePresignedUrl(
  bucket: R2Bucket,
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  // Note: R2 presigned URLs require additional setup
  // This is a placeholder for the implementation
  // Refer to: https://developers.cloudflare.com/r2/api/workers/workers-api-reference/#generatepresignedurl
  
  throw new Error('Presigned URLs not implemented yet');
}

/**
 * List files in R2 bucket (for admin purposes)
 */
export async function listR2Files(
  bucket: R2Bucket,
  prefix?: string,
  limit: number = 100
): Promise<string[]> {
  const list = await bucket.list({ prefix, limit });
  return list.objects.map((obj) => obj.key);
}

/**
 * Get file metadata
 */
export async function getFileMetadata(
  bucket: R2Bucket,
  key: string
): Promise<{
  size: number;
  uploaded: Date;
  contentType?: string;
} | null> {
  const object = await bucket.head(key);
  
  if (!object) return null;

  return {
    size: object.size,
    uploaded: object.uploaded,
    contentType: object.httpMetadata?.contentType,
  };
}