// hooks/useAttendees.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendeesApi, handleApiError } from '@/lib/api';
import { useToast } from './use-toast';

export function useEventAttendees(eventId: string) {
    return useQuery({
        queryKey: ['eventAttendees', eventId],
        queryFn: () => attendeesApi.getEventAttendees(eventId),
        enabled: !!eventId,
    });
}

export function useUserJoinedEvents() {
    return useQuery({
        queryKey: ['userJoinedEvents'],
        queryFn: attendeesApi.getUserJoined,
    });
}

export function useJoinEvent(eventId: string) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => attendeesApi.join(eventId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            queryClient.invalidateQueries({ queryKey: ['eventAttendees', eventId] });
            queryClient.invalidateQueries({ queryKey: ['userJoinedEvents'] });
            toast({
                title: 'Success',
                description: 'Joined event successfully!',
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

export function useLeaveEvent(eventId: string) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => attendeesApi.leave(eventId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            queryClient.invalidateQueries({ queryKey: ['eventAttendees', eventId] });
            queryClient.invalidateQueries({ queryKey: ['userJoinedEvents'] });
            toast({
                title: 'Success',
                description: 'Left event successfully!',
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