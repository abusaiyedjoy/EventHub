'use client';

import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EventList } from '@/components/events/EventList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [sortBy, setSortBy] = useState<'date' | 'created'>('date');
  const { data, isLoading, error } = useEvents({
    page: 1,
    limit: 12,
    sort: sortBy,
    order: 'asc',
  });

  const events = data?.data.events || [];

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Discover Amazing Events
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Join thousands of events happening around you. Create your own events
          and connect with like-minded people.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <Tabs
          defaultValue="date"
          onValueChange={(value) => setSortBy(value as 'date' | 'created')}
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              By Date
            </TabsTrigger>
            <TabsTrigger value="created" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recently Added
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Events List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <EventList
          events={events}
          isLoading={isLoading}
          error={error ? 'Failed to load events' : null}
        />
      </motion.div>

      {/* Stats Section */}
      {!isLoading && events.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 grid gap-6 sm:grid-cols-3"
        >
          <div className="rounded-lg border bg-card p-6 text-center">
            <Calendar className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="text-3xl font-bold">{events.length}</p>
            <p className="text-sm text-muted-foreground">Active Events</p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-center">
            <TrendingUp className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="text-3xl font-bold">
              {events.reduce((acc, e) => acc + (e.attendeeCount || 0), 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Attendees</p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="text-3xl font-bold">
              {events.filter((e) => new Date(e.date) > new Date()).length}
            </p>
            <p className="text-sm text-muted-foreground">Upcoming Events</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}