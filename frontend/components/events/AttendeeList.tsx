// components/events/AttendeeList.tsx
'use client';

import { useEventAttendees } from '@/hooks/useAttendees';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/lib/utils';
import { Users } from 'lucide-react';

interface AttendeeListProps {
  eventId: string;
}

export function AttendeeList({ eventId }: AttendeeListProps) {
  const { data, isLoading, error } = useEventAttendees(eventId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner text="Loading attendees..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load attendees" />;
  }

  const attendees = data?.data.attendees || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Attendees ({attendees.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attendees.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No attendees yet. Be the first to join!
          </p>
        ) : (
          <div className="space-y-4">
            {attendees.map((attendee) => (
              <div
                key={attendee.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {attendee.user.name?.[0]?.toUpperCase() ||
                        attendee.user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {attendee.user.name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {attendee.user.email}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(attendee.joinedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}