'use client';

import { useState, useCallback } from 'react';

export interface Toast {
    id?: string;
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

let toastId = 0;
const listeners: ((toast: Toast | null) => void)[] = [];

export function useToast() {
    const [_toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((props: Omit<Toast, 'id'>) => {
        const id = String(toastId++);
        const newToast = { ...props, id };

        // Notify all listeners
        listeners.forEach((listener) => listener(newToast));

        // Auto remove after 3 seconds
        setTimeout(() => {
            listeners.forEach((listener) => listener(null));
        }, 3000);

        return newToast;
    }, []);

    return { toast };
}
