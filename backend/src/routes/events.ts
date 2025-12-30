// src/routes/events.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../types/env';
import { getDb } from '../db';
import { events, attendees, users } from '../db/schema';
import { eq, desc, asc, sql, and } from 'drizzle-orm';
import {
    createEventSchema,
    updateEventSchema,
    eventQuerySchema,
    type CreateEventInput,
    type UpdateEventInput,
} from '../lib/validation';
import {
    generateId,
    formatError,
    formatSuccess,
    paginate,
    paginationMeta,
    checkOwnership,
    isFutureDate,
} from '../lib/utils';
import { authMiddleware } from '../middleware/auth';

const eventsRouter = new Hono<{ Bindings: Env }>();

// Get all events (public)
eventsRouter.get('/', zValidator('query', eventQuerySchema), async (c) => {
    try {
        const { page, limit, sort, order } = c.req.valid('query');
        const db = getDb(c.env);

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const { offset } = paginate(pageNum, limitNum);

        // Build order by clause
        const orderByColumn =
            sort === 'title'
                ? events.title
                : sort === 'created'
                    ? events.createdAt
                    : events.date;
        const orderDirection = order === 'desc' ? desc : asc;

        // Get events with creator info and attendee count
        const eventsList = await db
            .select({
                id: events.id,
                title: events.title,
                description: events.description,
                date: events.date,
                location: events.location,
                bannerUrl: events.bannerUrl,
                maxAttendees: events.maxAttendees,
                createdAt: events.createdAt,
                updatedAt: events.updatedAt,
                creator: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                },
                attendeeCount: sql<number>`count(${attendees.id})`,
            })
            .from(events)
            .leftJoin(users, eq(events.createdBy, users.id))
            .leftJoin(attendees, eq(events.id, attendees.eventId))
            .groupBy(events.id)
            .orderBy(orderDirection(orderByColumn))
            .limit(limitNum)
            .offset(offset)
            .all();

        // Get total count
        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(events)
            .get();
        const total = totalResult?.count || 0;

        return c.json(
            formatSuccess({
                events: eventsList,
                pagination: paginationMeta(total, pageNum, limitNum),
            })
        );
    } catch (error) {
        console.error('Get events error:', error);
        return c.json(formatError('Failed to fetch events', 500), 500);
    }
});

// Get single event (public)
eventsRouter.get('/:id', async (c) => {
    try {
        const eventId = c.req.param('id');
        const db = getDb(c.env);

        const event = await db
            .select({
                id: events.id,
                title: events.title,
                description: events.description,
                date: events.date,
                location: events.location,
                bannerUrl: events.bannerUrl,
                maxAttendees: events.maxAttendees,
                createdAt: events.createdAt,
                updatedAt: events.updatedAt,
                creator: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                },
                attendeeCount: sql<number>`count(${attendees.id})`,
            })
            .from(events)
            .leftJoin(users, eq(events.createdBy, users.id))
            .leftJoin(attendees, eq(events.id, attendees.eventId))
            .where(eq(events.id, eventId))
            .groupBy(events.id)
            .get();

        if (!event) {
            return c.json(formatError('Event not found', 404), 404);
        }

        return c.json(formatSuccess({ event }));
    } catch (error) {
        console.error('Get event error:', error);
        return c.json(formatError('Failed to fetch event', 500), 500);
    }
});

// Create event (protected)
eventsRouter.post(
    '/',
    authMiddleware,
    zValidator('json', createEventSchema),
    async (c) => {
        try {
            const user = c.get('user');
            if (!user) {
                return c.json(formatError('Unauthorized', 401), 401);
            }

            const data = await c.req.json<CreateEventInput>();
            const db = getDb(c.env);

            // Validate future date
            if (!isFutureDate(data.date)) {
                return c.json(
                    formatError('Event date must be in the future', 400),
                    400
                );
            }

            // Create event
            const eventId = generateId('event');
            const newEvent = await db
                .insert(events)
                .values({
                    id: eventId,
                    title: data.title,
                    description: data.description || null,
                    date: new Date(data.date),
                    location: data.location || null,
                    maxAttendees: data.maxAttendees || null,
                    bannerUrl: null,
                    createdBy: user.id,
                })
                .returning()
                .get();

            return c.json(
                formatSuccess({ event: newEvent }, 'Event created successfully'),
                201
            );
        } catch (error) {
            console.error('Create event error:', error);
            return c.json(formatError('Failed to create event', 500), 500);
        }
    }
);

// Update event (protected)
eventsRouter.put(
    '/:id',
    authMiddleware,
    zValidator('json', updateEventSchema),
    async (c) => {
        try {
            const user = c.get('user');
            if (!user) {
                return c.json(formatError('Unauthorized', 401), 401);
            }

            const eventId = c.req.param('id');
            const data = await c.req.json<UpdateEventInput>();
            const db = getDb(c.env);

            // Check if event exists
            const existingEvent = await db
                .select()
                .from(events)
                .where(eq(events.id, eventId))
                .get();

            if (!existingEvent) {
                return c.json(formatError('Event not found', 404), 404);
            }

            // Check ownership
            if (!checkOwnership(user.id, existingEvent.createdBy)) {
                return c.json(
                    formatError('You are not authorized to update this event', 403),
                    403
                );
            }

            // Validate date if provided
            if (data.date && !isFutureDate(data.date)) {
                return c.json(
                    formatError('Event date must be in the future', 400),
                    400
                );
            }

            // Update event
            const updatedEvent = await db
                .update(events)
                .set({
                    ...data,
                    date: data.date ? new Date(data.date) : undefined,
                    updatedAt: new Date(),
                })
                .where(eq(events.id, eventId))
                .returning()
                .get();

            return c.json(
                formatSuccess({ event: updatedEvent }, 'Event updated successfully')
            );
        } catch (error) {
            console.error('Update event error:', error);
            return c.json(formatError('Failed to update event', 500), 500);
        }
    }
);

// Delete event (protected)
eventsRouter.delete('/:id', authMiddleware, async (c) => {
    try {
        const user = c.get('user');
        if (!user) {
            return c.json(formatError('Unauthorized', 401), 401);
        }

        const eventId = c.req.param('id');
        const db = getDb(c.env);

        // Check if event exists
        const existingEvent = await db
            .select()
            .from(events)
            .where(eq(events.id, eventId))
            .get();

        if (!existingEvent) {
            return c.json(formatError('Event not found', 404), 404);
        }

        // Check ownership
        if (!checkOwnership(user.id, existingEvent.createdBy)) {
            return c.json(
                formatError('You are not authorized to delete this event', 403),
                403
            );
        }

        // Delete event (cascade will delete attendees)
        await db.delete(events).where(eq(events.id, eventId));

        return c.json(formatSuccess(null, 'Event deleted successfully'));
    } catch (error) {
        console.error('Delete event error:', error);
        return c.json(formatError('Failed to delete event', 500), 500);
    }
});

// Get user's created events (protected)
eventsRouter.get('/user/created', authMiddleware, async (c) => {
    try {
        const user = c.get('user');
        if (!user) {
            return c.json(formatError('Unauthorized', 401), 401);
        }

        const db = getDb(c.env);

        const userEvents = await db
            .select({
                id: events.id,
                title: events.title,
                description: events.description,
                date: events.date,
                location: events.location,
                bannerUrl: events.bannerUrl,
                maxAttendees: events.maxAttendees,
                createdAt: events.createdAt,
                attendeeCount: sql<number>`count(${attendees.id})`,
            })
            .from(events)
            .leftJoin(attendees, eq(events.id, attendees.eventId))
            .where(eq(events.createdBy, user.id))
            .groupBy(events.id)
            .orderBy(desc(events.createdAt))
            .all();

        return c.json(formatSuccess({ events: userEvents }));
    } catch (error) {
        console.error('Get user events error:', error);
        return c.json(formatError('Failed to fetch user events', 500), 500);
    }
});

export default eventsRouter;