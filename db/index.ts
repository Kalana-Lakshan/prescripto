import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// This connects to the URL you put in .env.local
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);