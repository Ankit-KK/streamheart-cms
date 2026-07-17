import { auth } from '@/lib/auth/server';

// This exports the GET and POST handlers that proxy all requests to Neon Auth
export const { GET, POST } = auth.handler();
