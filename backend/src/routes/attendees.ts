import { Hono } from 'hono';
import type { Env } from '../types/env';
import { getDb } from '../db';
import { attendees, events, users } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { generateId, formatError, formatSuccess } from '../lib/utils';
import { authMiddleware } from '../middleware/auth';

const attendeesRouter = new Hono<{ Bindings: Env }>();

// Join event (protected)
attendeesRouter.post('/:eventId/join', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json(formatError('Unauthorized', 401), 401);
    }

    const eventId = c.req.param('eventId');
    const db = getDb(c.env);

    // Check if event exists
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .get();

    if (!event) {
      return c.json(formatError('Event not found', 404), 404);
    }

    // Check if user is the creator
    if (event.createdBy === user.id) {
      return c.json(
        formatError('Event creator cannot join their own event', 400),
        400
      );
    }

    // Check if already joined
    const existingAttendee = await db
      .select()
      .from(attendees)
      .where(
        and(eq(attendees.eventId, eventId), eq(attendees.userId, user.id))
      )
      .get();

    if (existingAttendee) {
      return c.json(formatError('Already joined this event', 400), 400);
    }

    // Check max attendees limit
    if (event.maxAttendees) {
      const attendeeCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(attendees)
        .where(eq(attendees.eventId, eventId))
        .get();

      if ((attendeeCount?.count || 0) >= event.maxAttendees) {
        return c.json(formatError('Event is full', 400), 400);
      }
    }

    // Join event
    const attendeeId = generateId('attendee');
    const newAttendee = await db
      .insert(attendees)
      .values({
        id: attendeeId,
        userId: user.id,
        eventId,
      })
      .returning()
      .get();

    return c.json(
      formatSuccess({ attendee: newAttendee }, 'Successfully joined event'),
      201
    );
  } catch (error) {
    console.error('Join event error:', error);
    return c.json(formatError('Failed to join event', 500), 500);
  }
});

// Leave event (protected)
attendeesRouter.delete('/:eventId/leave', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json(formatError('Unauthorized', 401), 401);
    }

    const eventId = c.req.param('eventId');
    const db = getDb(c.env);

    // Check if user is attending
    const attendee = await db
      .select()
      .from(attendees)
      .where(
        and(eq(attendees.eventId, eventId), eq(attendees.userId, user.id))
      )
      .get();

    if (!attendee) {
      return c.json(formatError('Not attending this event', 400), 400);
    }

    // Leave event
    await db
      .delete(attendees)
      .where(
        and(eq(attendees.eventId, eventId), eq(attendees.userId, user.id))
      );

    return c.json(formatSuccess(null, 'Successfully left event'));
  } catch (error) {
    console.error('Leave event error:', error);
    return c.json(formatError('Failed to leave event', 500), 500);
  }
});

// Get event attendees (public)
attendeesRouter.get('/:eventId', async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const db = getDb(c.env);

    // Check if event exists
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .get();

    if (!event) {
      return c.json(formatError('Event not found', 404), 404);
    }

    // Get attendees
    const eventAttendees = await db
      .select({
        id: attendees.id,
        joinedAt: attendees.joinedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(attendees)
      .leftJoin(users, eq(attendees.userId, users.id))
      .where(eq(attendees.eventId, eventId))
      .all();

    return c.json(formatSuccess({ attendees: eventAttendees }));
  } catch (error) {
    console.error('Get attendees error:', error);
    return c.json(formatError('Failed to fetch attendees', 500), 500);
  }
});

// Get user's joined events (protected)
attendeesRouter.get('/user/joined', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json(formatError('Unauthorized', 401), 401);
    }

    const db = getDb(c.env);

    const joinedEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        location: events.location,
        bannerUrl: events.bannerUrl,
        joinedAt: attendees.joinedAt,
        creator: {
          id: users.id,
          name: users.name,
        },
      })
      .from(attendees)
      .leftJoin(events, eq(attendees.eventId, events.id))
      .leftJoin(users, eq(events.createdBy, users.id))
      .where(eq(attendees.userId, user.id))
      .all();

    return c.json(formatSuccess({ events: joinedEvents }));
  } catch (error) {
    console.error('Get joined events error:', error);
    return c.json(formatError('Failed to fetch joined events', 500), 500);
  }
});

export default attendeesRouter;