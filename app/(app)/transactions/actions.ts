'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { transactionSchema } from '@/lib/validations/schemas';
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function createTransaction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const raw = Object.fromEntries(formData);
  const parsed = transactionSchema.safeParse({
    ...raw,
    is_recurring: raw.is_recurring === 'true',
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { type, amount, currency, description, category_id, date, is_recurring, recurring_interval } = parsed.data;

  await db.insert(transactions).values({
    userId: user.id,
    categoryId: category_id || null,
    type,
    amount: amount.toString(),
    currency,
    description,
    date: new Date(date),
    isRecurring: is_recurring,
    recurringInterval: recurring_interval,
  });

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateTransaction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const raw = Object.fromEntries(formData);
  const parsed = transactionSchema.safeParse({
    ...raw,
    is_recurring: raw.is_recurring === 'true',
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { type, amount, currency, description, category_id, date, is_recurring, recurring_interval } = parsed.data;

  await db
    .update(transactions)
    .set({
      categoryId: category_id || null,
      type,
      amount: amount.toString(),
      currency,
      description,
      date: new Date(date),
      isRecurring: is_recurring,
      recurringInterval: recurring_interval,
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getUserCategories() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, user.id));
}
