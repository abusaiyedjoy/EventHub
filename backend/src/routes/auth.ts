// src/routes/auth.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../types/env';
import { getDb } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import {
    registerSchema,
    loginSchema,
    type RegisterInput,
    type LoginInput,
} from '../lib/validation';
import {
    generateId,
    hashPassword,
    verifyPassword,
    formatError,
    formatSuccess,
    sanitizeUser,
} from '../lib/utils';
import { initializeLucia } from '../lib/lucia';
import { authMiddleware } from '../middleware/auth';
import { getCookie } from 'hono/cookie';

const auth = new Hono<{ Bindings: Env }>();

// Register route
auth.post('/register', zValidator('json', registerSchema), async (c) => {
    try {
        const { email, password, name } = await c.req.json<RegisterInput>();
        const db = getDb(c.env);

        // Check if user exists
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .get();

        if (existingUser) {
            return c.json(formatError('Email already registered', 400), 400);
        }

        // Create user
        const userId = generateId('user');
        const hashedPassword = await hashPassword(password);

        const newUser = await db
            .insert(users)
            .values({
                id: userId,
                email,
                password: hashedPassword,
                name: name || null,
            })
            .returning()
            .get();

        // Create session with Lucia
        const lucia = initializeLucia(c.env.DB);
        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        // Set cookie
        c.header('Set-Cookie', sessionCookie.serialize());

        return c.json(
            formatSuccess(
                {
                    user: sanitizeUser(newUser),
                    session: { id: session.id },
                },
                'Registration successful'
            ),
            201
        );
    } catch (error) {
        console.error('Register error:', error);
        return c.json(formatError('Registration failed', 500), 500);
    }
});

// Login route
auth.post('/login', zValidator('json', loginSchema), async (c) => {
    try {
        const { email, password } = await c.req.json<LoginInput>();
        const db = getDb(c.env);

        // Find user
        const user = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .get();

        if (!user) {
            return c.json(formatError('Invalid email or password', 401), 401);
        }

        // Verify password
        const validPassword = await verifyPassword(password, user.password);

        if (!validPassword) {
            return c.json(formatError('Invalid email or password', 401), 401);
        }

        // Create session with Lucia
        const lucia = initializeLucia(c.env.DB);
        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        // Set cookie
        c.header('Set-Cookie', sessionCookie.serialize());

        return c.json(
            formatSuccess(
                {
                    user: sanitizeUser(user),
                    session: { id: session.id },
                },
                'Login successful'
            )
        );
    } catch (error) {
        console.error('Login error:', error);
        return c.json(formatError('Login failed', 500), 500);
    }
});

// Get current user
auth.get('/me', authMiddleware, async (c) => {
    const user = c.get('user');
    return c.json(formatSuccess({ user }));
});

// Logout route
auth.post('/logout', authMiddleware, async (c) => {
    try {
        const sessionId = getCookie(c, 'auth_session');

        if (sessionId) {
            const lucia = initializeLucia(c.env.DB);
            await lucia.invalidateSession(sessionId);
        }

        // Create blank session cookie to clear it
        const lucia = initializeLucia(c.env.DB);
        const blankCookie = lucia.createBlankSessionCookie();
        c.header('Set-Cookie', blankCookie.serialize());

        return c.json(formatSuccess(null, 'Logout successful'));
    } catch (error) {
        console.error('Logout error:', error);
        return c.json(formatError('Logout failed', 500), 500);
    }
});

export default auth;