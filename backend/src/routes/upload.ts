import { Hono } from 'hono';
import type { Env } from '../types/env';
import { getDb } from '../db';
import { events } from '../db/schema';
import { eq } from 'drizzle-orm';
import { uploadToR2, deleteFromR2, extractR2Key } from '../lib/r2';
import { formatError, formatSuccess, checkOwnership } from '../lib/utils';
import { authMiddleware } from '../middleware/auth';

const uploadRouter = new Hono<{ Bindings: Env }>();

// Upload event banner (protected)
uploadRouter.post('/:eventId/banner', authMiddleware, async (c) => {
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

    // Check ownership
    if (!checkOwnership(user.id, event.createdBy)) {
      return c.json(
        formatError('You are not authorized to upload banner for this event', 403),
        403
      );
    }

    // Get file from form data
    const formData = await c.req.formData();
    const file = formData.get('banner') as unknown as File;

    if (!file) {
      return c.json(formatError('No file provided', 400), 400);
    }

    // Delete old banner if exists
    if (event.bannerUrl) {
      const oldKey = extractR2Key(event.bannerUrl);
      if (oldKey) {
        try {
          await deleteFromR2(c.env.IMAGES, oldKey);
        } catch (error) {
          console.error('Failed to delete old banner:', error);
        }
      }
    }

    // Upload to R2
    const { url, key } = await uploadToR2(c.env.IMAGES, file, 'events');

    // Update event with new banner URL
    const updatedEvent = await db
      .update(events)
      .set({ bannerUrl: url })
      .where(eq(events.id, eventId))
      .returning()
      .get();

    return c.json(
      formatSuccess(
        { event: updatedEvent, bannerUrl: url },
        'Banner uploaded successfully'
      )
    );
  } catch (error) {
    console.error('Upload banner error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return c.json(formatError(message, 500), 500);
  }
});

// Delete event banner (protected)
uploadRouter.delete('/:eventId/banner', authMiddleware, async (c) => {
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

    // Check ownership
    if (!checkOwnership(user.id, event.createdBy)) {
      return c.json(
        formatError('You are not authorized to delete banner for this event', 403),
        403
      );
    }

    if (!event.bannerUrl) {
      return c.json(formatError('No banner to delete', 400), 400);
    }

    // Delete from R2
    const key = extractR2Key(event.bannerUrl);
    if (key) {
      await deleteFromR2(c.env.IMAGES, key);
    }

    // Update event
    const updatedEvent = await db
      .update(events)
      .set({ bannerUrl: null })
      .where(eq(events.id, eventId))
      .returning()
      .get();

    return c.json(
      formatSuccess({ event: updatedEvent }, 'Banner deleted successfully')
    );
  } catch (error) {
    console.error('Delete banner error:', error);
    return c.json(formatError('Failed to delete banner', 500), 500);
  }
});

export default uploadRouter;