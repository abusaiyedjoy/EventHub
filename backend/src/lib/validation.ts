
import { z } from 'zod';

// Auth validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Event validation schemas
export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title is too long'),
  description: z
    .string()
    .max(2000, 'Description is too long')
    .optional(),
  date: z.string().datetime('Invalid date format'),
  location: z.string().max(300, 'Location is too long').optional(),
  maxAttendees: z.number().int().positive().optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  date: z.string().datetime().optional(),
  location: z.string().max(300).optional(),
  maxAttendees: z.number().int().positive().optional(),
});

// Query parameter validation
export const eventQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  sort: z.enum(['date', 'created', 'title']).optional().default('date'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});

// File upload validation
export const uploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventQueryParams = z.infer<typeof eventQuerySchema>;