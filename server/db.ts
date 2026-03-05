import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Connection pool configuration to prevent "too many connections"
  max: 10, // Maximum pool size - keep low for serverless
  min: 1,  // Minimum pool size
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Connection timeout 10s
  maxUses: 7500, // Maximum uses per connection before recycling
  log: (level, message) => {
    if (level === 'error') {
      console.error('Database pool error:', message);
    }
  }
});

export const db = drizzle({ client: pool, schema });