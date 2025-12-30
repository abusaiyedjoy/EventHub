// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistance, isPast, isFuture } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting
export function formatDate(date: string | Date, formatStr: string = 'PPP') {
  return format(new Date(date), formatStr);
}

export function formatDateTime(
  date: string | Date,
  formatStr: string = 'PPP p'
) {
  return format(new Date(date), formatStr);
}

export function formatRelativeTime(date: string | Date) {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

export function isEventPast(date: string | Date) {
  return isPast(new Date(date));
}

export function isEventFuture(date: string | Date) {
  return isFuture(new Date(date));
}

// File upload helpers
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF files are allowed' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  return { valid: true };
}

// String helpers
export function truncate(str: string, length: number = 100) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Number helpers
export function formatNumber(num: number) {
  return new Intl.NumberFormat().format(num);
}