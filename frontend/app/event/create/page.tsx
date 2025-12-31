// app/event/create/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useCreateEvent } from '@/hooks/useEvents';
import { uploadApi } from '@/lib/api';
import { EventForm } from '@/components/events/EventForm';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { motion } from 'framer-motion';
import type { CreateEventInput } from '@/types/api';

export default function CreateEventPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const createEvent = useCreateEvent();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (
    data: CreateEventInput & { banner?: File | null }
  ) => {
    const { banner, ...eventData } = data;

    try {
      const result = await createEvent.mutateAsync(eventData);
      const eventId = result.data.event.id;

      // Upload banner if provided
      if (banner) {
        await uploadApi.uploadBanner(eventId, banner);
      }

      router.push(`/event/${eventId}`);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl"
      >
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Create New Event</h1>
          <p className="text-muted-foreground">
            Fill in the details to create your event
          </p>
        </div>

        <EventForm
          onSubmit={handleSubmit}
          isLoading={createEvent.isPending}
          submitText="Create Event"
        />
      </motion.div>
    </div>
  );
}