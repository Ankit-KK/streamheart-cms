import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const creators = pgTable('creators', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorHandle: text('creator_handle').notNull().unique(),
  creatorCode: text('creator_code').notNull().unique(),
  upiId: text('upi_id').notNull(),
  payoutRate: integer('payout_rate').notNull(), // Stored as percentage (e.g., 89)
  status: text('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
