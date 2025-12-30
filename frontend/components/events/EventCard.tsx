// components/events/EventCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, isEventPast } from '@/lib/utils';
import type { Event } from '@/types/api';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const isPast = isEventPast(event.date);

  return (
    <Link href={`/event/${event.id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {event.bannerUrl ? (
            <Image
              src={event.bannerUrl}
              alt={event.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {isPast && (
            <Badge
              variant="secondary"
              className="absolute right-2 top-2"
            >
              Past Event
            </Badge>
          )}
        </div>

        <CardHeader className="space-y-2">
          <h3 className="line-clamp-2 text-xl font-semibold group-hover:text-primary">
            {event.title}
          </h3>
          {event.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {event.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.date, 'PPP')}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}

          {event.attendeeCount !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {event.attendeeCount}{' '}
                {event.attendeeCount === 1 ? 'attendee' : 'attendees'}
                {event.maxAttendees && ` / ${event.maxAttendees}`}
              </span>
            </div>
          )}
        </CardContent>

        {event.creator && (
          <CardFooter className="border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {event.creator.name?.[0]?.toUpperCase() || 
                 event.creator.email[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium">
                  {event.creator.name || 'Anonymous'}
                </p>
                <p className="text-xs text-muted-foreground">Organizer</p>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}