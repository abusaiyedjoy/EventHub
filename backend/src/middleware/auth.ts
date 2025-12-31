// src/middleware/auth.ts
import { createMiddleware } from 'hono/factory';
import type { Env } from '../types/env';
import { initializeLucia } from '../lib/lucia';
import { formatError } from '../lib/utils';
import { getCookie } from 'hono/cookie';

export const authMiddleware = createMiddleware<{ Bindings: Env }>(
    async (c, next) => {
        const lucia = initializeLucia(c.env.DB);

        // Get session ID from cookie
        const sessionId = getCookie(c, 'auth_session');

        if (!sessionId) {
            return c.json(formatError('Unauthorized - No session found', 401), 401);
        }

        // Validate session using Lucia's method
        const { session, user } = await lucia.validateSession(sessionId);

        if (!session || !user) {
            // Create blank cookie to clear invalid session
            const blankCookie = lucia.createBlankSessionCookie();
            c.header('Set-Cookie', blankCookie.serialize());
            return c.json(formatError('Unauthorized - Invalid session', 401), 401);
        }

        // If session is fresh (renewed), update the cookie
        if (session.fresh) {
            const sessionCookie = lucia.createSessionCookie(session.id);
            c.header('Set-Cookie', sessionCookie.serialize());
        }

        // Set user in context
        c.set('user', {
            id: user.id,
            email: user.email,
            name: user.name,
        });

        await next();
    }
);