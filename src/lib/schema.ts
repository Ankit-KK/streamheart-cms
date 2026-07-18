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

export const creatorFinancials = pgTable('creator_financials', {
  creatorId: uuid('creator_id').primaryKey(),
  legalName: text('legal_name'),
  panNumber: text('pan_number'),
  upiId: text('upi_id'),
  bankName: text('bank_name'),
  accountHolderName: text('account_holder_name'),
  accountNumberLast4: text('account_number_last4'),
  ifsc: text('ifsc'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
