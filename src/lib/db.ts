import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema'; // Import the schema

// Initialize the connection
const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);

// Export the drizzle instance, passing the schema so `db.query` works
export const db = drizzle(sql, { schema });
