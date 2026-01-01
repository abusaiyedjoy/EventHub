import { createMiddleware } from 'hono/factory';
import type { Env } from '../types/env';

export const corsMiddleware = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const origin = c.req.header('Origin');
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      c.env.FRONTEND_URL,
    ];

    if (origin && allowedOrigins.includes(origin)) {
      c.header('Access-Control-Allow-Origin', origin);
      c.header('Access-Control-Allow-Credentials', 'true');
    }

    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Cookie'
    );

    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204);
    }

    await next();
  }
);
