import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  decimal,
  boolean,
  integer,
  jsonb,
  date,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['super_admin', 'app_admin', 'manager', 'member']);
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense', 'transfer']);
export const categoryTypeEnum = pgEnum('category_type', ['income', 'expense']);
export const debtTypeEnum = pgEnum('debt_type', ['hutang', 'piutang']);
export const receiptScanStatusEnum = pgEnum('receipt_scan_status', ['pending', 'success', 'failed']);
export const aiRoleEnum = pgEnum('ai_role', ['user', 'assistant']);

// Profiles (extends Supabase auth.users)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(), // FK to auth.users handled in DB
  fullName: text('full_name'),
  email: text('email').notNull(),
  avatarUrl: text('avatar_url'),
  role: roleEnum('role').default('member').notNull(),
  baseCurrency: text('base_currency').default('IDR').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Categories
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }), // null means global/system category
  name: text('name').notNull(),
  type: categoryTypeEnum('type').notNull(),
  icon: text('icon'),
  color: text('color'),
  isDefault: boolean('is_default').default(false).notNull(),
});

// Transactions
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: text('currency').default('IDR').notNull(),
  description: text('description').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  isRecurring: boolean('is_recurring').default(false).notNull(),
  recurringInterval: text('recurring_interval'), // e.g., 'monthly', 'weekly'
  receiptUrl: text('receipt_url'),
  receiptScanData: jsonb('receipt_scan_data'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Budgets
export const budgets = pgTable('budgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
});

// Saving Goals
export const savingGoals = pgTable('saving_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  targetAmount: decimal('target_amount', { precision: 15, scale: 2 }).notNull(),
  currentAmount: decimal('current_amount', { precision: 15, scale: 2 }).default('0').notNull(),
  deadline: timestamp('deadline', { withTimezone: true }),
  isCompleted: boolean('is_completed').default(false).notNull(),
});

// Saving Contributions
export const savingContributions = pgTable('saving_contributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  goalId: uuid('goal_id').notNull().references(() => savingGoals.id, { onDelete: 'cascade' }),
  transactionId: uuid('transaction_id').references(() => transactions.id, { onDelete: 'set null' }),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  date: timestamp('date', { withTimezone: true }).defaultNow().notNull(),
});

// Stock Holdings
export const stockHoldings = pgTable('stock_holdings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),
  companyName: text('company_name'),
  lotQuantity: decimal('lot_quantity', { precision: 15, scale: 4 }).notNull(),
  avgBuyPrice: decimal('avg_buy_price', { precision: 15, scale: 2 }).notNull(),
  buyDate: timestamp('buy_date', { withTimezone: true }),
  broker: text('broker'),
  sector: text('sector'),
  notes: text('notes'),
});

// Stock Prices Cache
export const stockPricesCache = pgTable('stock_prices_cache', {
  ticker: text('ticker').primaryKey().notNull(),
  currentPrice: decimal('current_price', { precision: 15, scale: 2 }).notNull(),
  changePercent: decimal('change_percent', { precision: 10, scale: 4 }),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow().notNull(),
});

// Dividends
export const dividends = pgTable('dividends', {
  id: uuid('id').primaryKey().defaultRandom(),
  holdingId: uuid('holding_id').notNull().references(() => stockHoldings.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  exDate: date('ex_date'),
  payDate: date('pay_date'),
  notes: text('notes'),
});

// Debts
export const debts = pgTable('debts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  contactName: text('contact_name').notNull(),
  contactPhone: text('contact_phone'),
  type: debtTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).default('0').notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }),
  notes: text('notes'),
  isCompleted: boolean('is_completed').default(false).notNull(),
});

// Receipt Scans
export const receiptScans = pgTable('receipt_scans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  transactionId: uuid('transaction_id').references(() => transactions.id, { onDelete: 'set null' }),
  imageUrl: text('image_url').notNull(),
  rawOcrText: text('raw_ocr_text'),
  detectedItems: jsonb('detected_items'),
  detectedTotal: decimal('detected_total', { precision: 15, scale: 2 }),
  detectedDate: timestamp('detected_date', { withTimezone: true }),
  detectedMerchant: text('detected_merchant'),
  confidenceScore: decimal('confidence_score', { precision: 3, scale: 2 }),
  status: receiptScanStatusEnum('status').default('pending').notNull(),
});

// AI Conversations
export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: aiRoleEnum('role').notNull(),
  content: text('content').notNull(),
  contextSnapshot: jsonb('context_snapshot'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  categories: many(categories),
  transactions: many(transactions),
  budgets: many(budgets),
  savingGoals: many(savingGoals),
  stockHoldings: many(stockHoldings),
  dividends: many(dividends),
  debts: many(debts),
  receiptScans: many(receiptScans),
  aiConversations: many(aiConversations),
}));
