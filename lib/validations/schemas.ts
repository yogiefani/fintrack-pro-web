import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  currency: z.string().default('IDR'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  category_id: z.string().uuid('Pilih kategori yang valid').nullable().optional(),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  is_recurring: z.boolean().default(false),
  recurring_interval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export const budgetSchema = z.object({
  category_id: z.string().uuid('Pilih kategori'),
  amount: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2100),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;

export const savingGoalSchema = z.object({
  name: z.string().min(1, 'Nama tujuan wajib diisi'),
  icon: z.string().optional(),
  color: z.string().optional(),
  target_amount: z.coerce.number().positive('Target harus lebih dari 0'),
  current_amount: z.coerce.number().min(0).default(0),
  deadline: z.string().optional(),
});

export type SavingGoalFormValues = z.infer<typeof savingGoalSchema>;

export const debtSchema = z.object({
  contact_name: z.string().min(1, 'Nama kontak wajib diisi'),
  contact_phone: z.string().optional(),
  type: z.enum(['hutang', 'piutang']),
  amount: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  paid_amount: z.coerce.number().min(0).default(0),
  due_date: z.string().optional(),
  notes: z.string().optional(),
});

export type DebtFormValues = z.infer<typeof debtSchema>;

export const stockHoldingSchema = z.object({
  ticker: z.string().min(1, 'Ticker wajib diisi').toUpperCase(),
  company_name: z.string().optional(),
  lot_quantity: z.coerce.number().positive('Lot harus lebih dari 0'),
  avg_buy_price: z.coerce.number().positive('Harga beli harus lebih dari 0'),
  buy_date: z.string().optional(),
  broker: z.string().optional(),
  sector: z.string().optional(),
  notes: z.string().optional(),
});

export type StockHoldingFormValues = z.infer<typeof stockHoldingSchema>;
