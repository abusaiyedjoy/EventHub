// components/events/EventForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/shared/ImageUpload';
import type { CreateEventInput, Event } from '@/types/api';

interface EventFormProps {
  onSubmit: (data: CreateEventInput & { banner?: File | null }) => void;
  isLoading?: boolean;
  initialData?: Event;
  submitText?: string;
}

export function EventForm({
  onSubmit,
  isLoading,
  initialData,
  submitText = 'Create Event',
}: EventFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date
      ? new Date(initialData.date).toISOString().slice(0, 16)
      : '',
    location: initialData?.location || '',
    maxAttendees: initialData?.maxAttendees?.toString() || '',
  });

  const [banner, setBanner] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateEventInput & { banner?: File | null } = {
      title: formData.title,
      description: formData.description || undefined,
      date: new Date(formData.date).toISOString(),
      location: formData.location || undefined,
      maxAttendees: formData.maxAttendees
        ? parseInt(formData.maxAttendees)
        : undefined,
      banner: banner || undefined,
    };

    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Event' : 'Create New Event'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Annual Tech Conference"
              required
              minLength={3}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell people about your event..."
              rows={5}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date & Time *</Label>
              <Input
                id="date"
                type="datetime-local"
                required
                min={new Date().toISOString().slice(0, 16)}
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
              <Input
                id="maxAttendees"
                type="number"
                min="1"
                placeholder="Unlimited"
                value={formData.maxAttendees}
                onChange={(e) =>
                  setFormData({ ...formData, maxAttendees: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              placeholder="123 Main St, City, Country"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Event Banner</Label>
            <ImageUpload
              value={initialData?.bannerUrl}
              onChange={setBanner}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : submitText}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}