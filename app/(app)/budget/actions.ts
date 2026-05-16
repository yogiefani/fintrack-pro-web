'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { budgets, categories } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { budgetSchema } from '@/lib/validations/schemas';

export async function createBudget(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const parsed = budgetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { category_id, amount, month, year } = parsed.data;

  // Upsert budget (one budget per category per month/year)
  const existing = await db
    .select({ id: budgets.id })
    .from(budgets)
    .where(
      and(
        eq(budgets.userId, user.id),
        eq(budgets.categoryId, category_id),
        eq(budgets.month, month),
        eq(budgets.year, year)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(budgets)
      .set({ amount: amount.toString() })
      .where(eq(budgets.id, existing[0].id));
  } else {
    await db.insert(budgets).values({
      userId: user.id,
      categoryId: category_id,
      amount: amount.toString(),
      month,
      year,
    });
  }

  revalidatePath('/budget');
  return { success: true };
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  await db.delete(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, user.id)));
  revalidatePath('/budget');
  return { success: true };
}
