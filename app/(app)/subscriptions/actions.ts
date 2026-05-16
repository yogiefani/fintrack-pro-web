'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const SubSchema = z.object({
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  category_id: z.string().optional(),
  recurring_interval: z.enum(['weekly', 'monthly', 'yearly']),
  date: z.string(),
});

export async function createSubscription(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const parsed = SubSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error('Invalid data');

  const { description, amount, category_id, recurring_interval, date } = parsed.data;

  await db.insert(transactions).values({
    userId: user.id,
    categoryId: category_id || null,
    type: 'expense',
    amount: amount.toString(),
    currency: 'IDR',
    description,
    date: new Date(date),
    isRecurring: true,
    recurringInterval: recurring_interval,
  });

  revalidatePath('/subscriptions');
}

export async function deleteSubscription(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  await db.delete(transactions).where(
    and(eq(transactions.id, id), eq(transactions.userId, user.id))
  );

  revalidatePath('/subscriptions');
}
