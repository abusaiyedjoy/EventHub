// types/api.ts
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  bannerUrl: string | null;
  maxAttendees: number | null;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string | null;
    email: string;
  };
  attendeeCount?: number;
}

export interface Attendee {
  id: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  error: {
    message: string;
    status: number;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface EventsResponse {
  events: Event[];
  pagination: PaginationMeta;
}

export interface AuthResponse {
  user: User;
  session: {
    id: string;
  };
}

// Form inputs
export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  date: string;
  location?: string;
  maxAttendees?: number;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  maxAttendees?: number;
}