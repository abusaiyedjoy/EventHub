import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import type { Env } from './types/env';

import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import attendeeRoutes from './routes/attendees';
import uploadRoutes from './routes/upload';



const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: (origin) => origin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'EventHub API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development',
  });
});

// Message route for public/index.html
app.get('/message', (c) => {
  return c.text('Welcome to EventHub!');
});

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/events', eventRoutes);
app.route('/api/attendees', attendeeRoutes);
app.route('/api/upload', uploadRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: {
        message: 'Route not found',
        status: 404,
        path: c.req.path,
      },
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);

  return c.json(
    {
      error: {
        message: err.message || 'Internal server error',
        status: 500,
      },
    },
    500
  );
});

export default app;