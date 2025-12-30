// components/events/EventList.tsx
'use client';

import { EventCard } from './EventCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import type { Event } from '@/types/api';

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
  error?: string | null;
}

export function EventList({ events, isLoading, error }: EventListProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading events..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (events.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <p className="text-lg font-medium text-muted-foreground">
          No events found
        </p>
        <p className="text-sm text-muted-foreground">
          Be the first to create an event!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}