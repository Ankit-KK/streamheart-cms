import { pgTable, uuid, text, numeric, timestamp, integer, bigint, date, doublePrecision, jsonb } from 'drizzle-orm/pg-core';

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

export const creatorLedger = pgTable('creator_ledger', {
  creatorId: uuid('creator_id').primaryKey(),
  totalGrossInr: bigint('total_gross_inr', { mode: 'number' }),
  totalFeesInr: bigint('total_fees_inr', { mode: 'number' }),
  totalTaxInr: bigint('total_tax_inr', { mode: 'number' }),
  totalRefundsInr: bigint('total_refunds_inr', { mode: 'number' }),
  totalPaymentsCount: integer('total_payments_count'),
  totalPaidOutInr: integer('total_paid_out_inr'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const payments = pgTable('payments', {
  paymentId: text('payment_id').primaryKey(),
  orderId: text('order_id'),
  creatorId: uuid('creator_id'),
  originalCurrency: text('original_currency'),
  originalAmount: bigint('original_amount', { mode: 'number' }),
  amountInr: bigint('amount_inr', { mode: 'number' }),
  feeInr: bigint('fee_inr', { mode: 'number' }),
  taxInr: bigint('tax_inr', { mode: 'number' }),
  status: text('status'),
  method: text('method'),
  email: text('email'),
  contact: text('contact'),
  receipt: text('receipt'),
  creatorCodeAttempted: text('creator_code_attempted'),
  rawPaymentPayload: jsonb('raw_payment_payload'),
  rawOrderPayload: jsonb('raw_order_payload'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const payoutHistory = pgTable('payout_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id').notNull(),
  grossInr: integer('gross_inr').notNull(),
  refundsInr: integer('refunds_inr').notNull(),
  payoutRate: doublePrecision('payout_rate').notNull(),
  netPayoutInr: integer('net_payout_inr').notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  status: text('status').notNull(),
  transactionReference: text('transaction_reference'),
  paymentMethod: text('payment_method'),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  lockedAt: timestamp('locked_at', { withTimezone: true }),
});
