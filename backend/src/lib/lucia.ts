

import { Lucia } from 'lucia';
import { D1Adapter } from '@lucia-auth/adapter-sqlite';

export function initializeLucia(db: D1Database) {
    // Create D1 adapter for Lucia
    const adapter = new D1Adapter(db, {
        user: 'users',
        session: 'sessions'
    });

    return new Lucia(adapter, {
        sessionCookie: {
            attributes: {
                secure: true,
                sameSite: 'lax',
            },
        },
        getUserAttributes: (attributes) => {
            return {
                email: attributes.email,
                name: attributes.name,
            };
        },
    });
}

// Type declarations for Lucia
declare module 'lucia' {
    interface Register {
        Lucia: ReturnType<typeof initializeLucia>;
        DatabaseUserAttributes: {
            email: string;
            name: string | null;
        };
    }
}