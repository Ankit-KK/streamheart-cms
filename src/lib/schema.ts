import { pgTable, uuid, text, numeric, timestamp } from 'drizzle-orm/pg-core';

export const creators = pgTable('creators', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorHandle: text('creator_handle').notNull(),
  creatorCode: text('creator_code').notNull(),
  email: text('email'),
  phoneNumber: text('phone_number'),
  payoutRate: numeric('payout_rate'),
  status: text('status').default('ACTIVE'),
  notes: text('notes'),
  contactEmail: text('contact_email'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
