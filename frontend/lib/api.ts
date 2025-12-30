// lib/api.ts
import axios, { AxiosError } from 'axios';
import type {
    ApiResponse,
    ApiError,
    User,
    Event,
    EventsResponse,
    Attendee,
    AuthResponse,
    RegisterInput,
    LoginInput,
    CreateEventInput,
    UpdateEventInput,
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

// Create axios instance
export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Error handler
export function handleApiError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;
        return axiosError.response?.data?.error?.message || 'An error occurred';
    }
    return 'An unexpected error occurred';
}

// Auth API
export const authApi = {
    register: async (data: RegisterInput) => {
        const response = await api.post<ApiResponse<AuthResponse>>(
            '/api/auth/register',
            data
        );
        return response.data;
    },

    login: async (data: LoginInput) => {
        const response = await api.post<ApiResponse<AuthResponse>>(
            '/api/auth/login',
            data
        );
        return response.data;
    },

    logout: async () => {
        const response = await api.post<ApiResponse<null>>('/api/auth/logout');
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get<ApiResponse<{ user: User }>>(
            '/api/auth/me'
        );
        return response.data;
    },
};

// Events API
export const eventsApi = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        sort?: string;
        order?: string;
    }) => {
        const response = await api.get<ApiResponse<EventsResponse>>(
            '/api/events',
            { params }
        );
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<ApiResponse<{ event: Event }>>(
            `/api/events/${id}`
        );
        return response.data;
    },

    create: async (data: CreateEventInput) => {
        const response = await api.post<ApiResponse<{ event: Event }>>(
            '/api/events',
            data
        );
        return response.data;
    },

    update: async (id: string, data: UpdateEventInput) => {
        const response = await api.put<ApiResponse<{ event: Event }>>(
            `/api/events/${id}`,
            data
        );
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete<ApiResponse<null>>(`/api/events/${id}`);
        return response.data;
    },

    getUserCreated: async () => {
        const response = await api.get<ApiResponse<{ events: Event[] }>>(
            '/api/events/user/created'
        );
        return response.data;
    },
};

// Attendees API
export const attendeesApi = {
    join: async (eventId: string) => {
        const response = await api.post<ApiResponse<{ attendee: Attendee }>>(
            `/api/attendees/${eventId}/join`
        );
        return response.data;
    },

    leave: async (eventId: string) => {
        const response = await api.delete<ApiResponse<null>>(
            `/api/attendees/${eventId}/leave`
        );
        return response.data;
    },

    getEventAttendees: async (eventId: string) => {
        const response = await api.get<ApiResponse<{ attendees: Attendee[] }>>(
            `/api/attendees/${eventId}`
        );
        return response.data;
    },

    getUserJoined: async () => {
        const response = await api.get<ApiResponse<{ events: Event[] }>>(
            '/api/attendees/user/joined'
        );
        return response.data;
    },
};

// Upload API
export const uploadApi = {
    uploadBanner: async (eventId: string, file: File) => {
        const formData = new FormData();
        formData.append('banner', file);

        const response = await api.post<ApiResponse<{ event: Event; bannerUrl: string }>>(
            `/api/upload/${eventId}/banner`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    deleteBanner: async (eventId: string) => {
        const response = await api.delete<ApiResponse<{ event: Event }>>(
            `/api/upload/${eventId}/banner`
        );
        return response.data;
    },
};