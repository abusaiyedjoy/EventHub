
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

export function generateId(prefix?: string): string {
  const id = nanoid(16);
  return prefix ? `${prefix}_${id}` : id;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function formatError(message: string, status: number = 400) {
  return {
    error: {
      message,
      status,
    },
  };
}

export function formatSuccess<T>(data: T, message?: string) {
  return {
    success: true,
    ...(message && { message }),
    data,
  };
}

export function paginate(page: number, limit: number) {
  const offset = (page - 1) * limit;
  return { limit, offset };
}

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

export function isValidImageType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(mimeType);
}


export function generateSafeFilename(
  originalName: string,
  prefix?: string
): string {
  const ext = originalName.split('.').pop() || 'jpg';
  const id = nanoid(12);
  return prefix ? `${prefix}_${id}.${ext}` : `${id}.${ext}`;
}


export function formatDate(date: Date | number): string {
  return new Date(date).toISOString();
}

export function isFutureDate(date: Date | string): boolean {
  return new Date(date) > new Date();
}

export function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}


export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function sanitizeUser(user: any) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export function checkOwnership(
  userId: string,
  resourceOwnerId: string
): boolean {
  return userId === resourceOwnerId;
}


export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}