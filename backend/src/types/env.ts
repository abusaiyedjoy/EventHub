
export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  SESSIONS: KVNamespace;
  ENVIRONMENT: string;
  FRONTEND_URL: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: {
      id: string;
      email: string;
      name: string | null;
    } | null;
  }
}