// hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, handleApiError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';
import type { RegisterInput, LoginInput } from '@/types/api';

export function useAuth() {
    const { user, isAuthenticated, setUser, logout: logoutStore } = useAuthStore();
    const queryClient = useQueryClient();
    const router = useRouter();
    const { toast } = useToast();

    // Get current user
    const { data, isLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authApi.getCurrentUser,
        enabled: isAuthenticated,
        retry: false,
    });

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: authApi.register,
        onSuccess: (data) => {
            setUser(data.data.user);
            toast({
                title: 'Success',
                description: 'Account created successfully!',
            });
            router.push('/');
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: handleApiError(error),
                variant: 'destructive',
            });
        },
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            setUser(data.data.user);
            toast({
                title: 'Success',
                description: 'Logged in successfully!',
            });
            router.push('/');
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: handleApiError(error),
                variant: 'destructive',
            });
        },
    });

    // Logout mutation
    const logoutMutation = useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            logoutStore();
            queryClient.clear();
            toast({
                title: 'Success',
                description: 'Logged out successfully!',
            });
            router.push('/login');
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: handleApiError(error),
                variant: 'destructive',
            });
        },
    });

    return {
        user,
        isAuthenticated,
        isLoading,
        register: (data: RegisterInput) => registerMutation.mutate(data),
        login: (data: LoginInput) => loginMutation.mutate(data),
        logout: () => logoutMutation.mutate(),
        isRegistering: registerMutation.isPending,
        isLoggingIn: loginMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
    };
}