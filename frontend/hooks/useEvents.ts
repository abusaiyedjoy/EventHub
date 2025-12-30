// hooks/useEvents.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsApi, handleApiError } from '@/lib/api';
import { useToast } from './use-toast';
import type { CreateEventInput, UpdateEventInput } from '@/types/api';

export function useEvents(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
}) {
    return useQuery({
        queryKey: ['events', params],
        queryFn: () => eventsApi.getAll(params),
    });
}

export function useEvent(id: string) {
    return useQuery({
        queryKey: ['event', id],
        queryFn: () => eventsApi.getById(id),
        enabled: !!id,
    });
}

export function useUserCreatedEvents() {
    return useQuery({
        queryKey: ['userCreatedEvents'],
        queryFn: eventsApi.getUserCreated,
    });
}

export function useCreateEvent() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: eventsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['userCreatedEvents'] });
            toast({
                title: 'Success',
                description: 'Event created successfully!',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: handleApiError(error),
                variant: 'destructive',
            });
        },
    });
}

export function useUpdateEvent(id: string) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateEventInput) => eventsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event', id] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['userCreatedEvents'] });
            toast({
                title: 'Success',
                description: 'Event updated successfully!',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: handleApiError(error),
                variant: 'destructive',
            });
        },
    });
}

export function useDeleteEvent() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: eventsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['userCreatedEvents'] });
            toast({
                title: 'Success',
                description: 'Event deleted successfully!',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: handleApiError(error),
                variant: 'destructive',
            });
        },
    });
}