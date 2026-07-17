import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Initialize the connection
const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);

// Export the drizzle instance
export const db = drizzle(sql);
