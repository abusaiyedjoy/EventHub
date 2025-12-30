// src/lib/utils.ts
// Utility helper functions

import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

/**
 * Generate a unique ID
 */
export function generateId(prefix?: string): string {
  const id = nanoid(16);
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Format error response
 */
export function formatError(message: string, status: number = 400) {
  return {
    error: {
      message,
      status,
    },
  };
}

/**
 * Format success response
 */
export function formatSuccess<T>(data: T, message?: string) {
  return {
    success: true,
    ...(message && { message }),
    data,
  };
}

/**
 * Paginate results
 */
export function paginate(page: number, limit: number) {
  const offset = (page - 1) * limit;
  return { limit, offset };
}

/**
 * Calculate pagination metadata
 */
export function paginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Validate file type (for image uploads)
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(mimeType);
}

/**
 * Generate a safe filename
 */
export function generateSafeFilename(
  originalName: string,
  prefix?: string
): string {
  const ext = originalName.split('.').pop() || 'jpg';
  const id = nanoid(12);
  return prefix ? `${prefix}_${id}.${ext}` : `${id}.${ext}`;
}

/**
 * Format date to ISO string
 */
export function formatDate(date: Date | number): string {
  return new Date(date).toISOString();
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  return new Date(date) > new Date();
}

/**
 * CORS headers helper
 */
export function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Sanitize user data (remove sensitive fields)
 */
export function sanitizeUser(user: any) {
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Check if user owns resource
 */
export function checkOwnership(
  userId: string,
  resourceOwnerId: string
): boolean {
  return userId === resourceOwnerId;
}

/**
 * Delay helper (for rate limiting)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}