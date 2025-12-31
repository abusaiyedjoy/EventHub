// app/event/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEvent, useDeleteEvent } from '@/hooks/useEvents';
import { useJoinEvent, useLeaveEvent } from '@/hooks/useAttendees';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { AttendeeList } from '@/components/events/AttendeeList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate, formatDateTime, isEventPast } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const { user, isAuthenticated } = useAuth();
  const { data, isLoading, error } = useEvent(eventId);
  const joinEvent = useJoinEvent(eventId);
  const leaveEvent = useLeaveEvent(eventId);
  const deleteEvent = useDeleteEvent();

  if (isLoading) {
    return (
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading event..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-8">
        <ErrorMessage message="Event not found" />
      </div>
    );
  }

  const event = data.data.event;
  const isCreator = user?.id === event.creator?.id;
  const isPast = isEventPast(event.date);

  const handleDelete = async () => {
    await deleteEvent.mutateAsync(eventId);
    router.push('/');
  };

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Banner Image */}
        {event.bannerUrl && (
          <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-lg">
            <Image
              src={event.bannerUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <CardTitle className="text-3xl">{event.title}</CardTitle>
                      {isPast && <Badge variant="secondary">Past Event</Badge>}
                    </div>
                  </div>

                  {isCreator && (
                    <div className="flex gap-2">
                      <Link href={`/event/${eventId}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently
                              delete your event and remove all attendees.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Event Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <p className="font-medium text-foreground">
                        {formatDate(event.date, 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm">
                        {formatDateTime(event.date, 'p')}
                      </p>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      <p>{event.location}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <p>
                      {event.attendeeCount || 0}{' '}
                      {event.attendeeCount === 1 ? 'attendee' : 'attendees'}
                      {event.maxAttendees && ` / ${event.maxAttendees} max`}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {event.description && (
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      About this event
                    </h3>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                )}

                {/* Organizer */}
                {event.creator && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">
                      Organized by
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                        {event.creator.name?.[0]?.toUpperCase() ||
                          event.creator.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">
                          {event.creator.name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event.creator.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {isAuthenticated && !isCreator && !isPast && (
                  <div className="pt-4">
                    <Button
                      onClick={() => joinEvent.mutate()}
                      disabled={joinEvent.isPending}
                      className="w-full"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {joinEvent.isPending ? 'Joining...' : 'Join Event'}
                    </Button>
                  </div>
                )}

                {isAuthenticated && !isCreator && (
                  <div className="pt-4">
                    <Button
                      onClick={() => leaveEvent.mutate()}
                      disabled={leaveEvent.isPending}
                      variant="outline"
                      className="w-full"
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      {leaveEvent.isPending ? 'Leaving...' : 'Leave Event'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <AttendeeList eventId={eventId} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}