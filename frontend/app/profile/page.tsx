// app/profile/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUserCreatedEvents } from '@/hooks/useEvents';
import { useUserJoinedEvents } from '@/hooks/useAttendees';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EventList } from '@/components/events/EventList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    data: createdData,
    isLoading: createdLoading,
    error: createdError,
  } = useUserCreatedEvents();
  const {
    data: joinedData,
    isLoading: joinedLoading,
    error: joinedError,
  } = useUserJoinedEvents();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const createdEvents = createdData?.data.events || [];
  const joinedEvents = joinedData?.data.events || [];

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* User Info Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{user.name || 'User'}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold">{createdEvents.length}</p>
                  <p className="text-sm text-muted-foreground">Created</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{joinedEvents.length}</p>
                  <p className="text-sm text-muted-foreground">Joined</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Tabs */}
        <Tabs defaultValue="created" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="created" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              My Events
            </TabsTrigger>
            <TabsTrigger value="joined" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Joined Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="created">
            <EventList
              events={createdEvents}
              isLoading={createdLoading}
              error={createdError ? 'Failed to load created events' : null}
            />
          </TabsContent>

          <TabsContent value="joined">
            <EventList
              events={joinedEvents}
              isLoading={joinedLoading}
              error={joinedError ? 'Failed to load joined events' : null}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}