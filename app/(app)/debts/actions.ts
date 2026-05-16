'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { debts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { debtSchema } from '@/lib/validations/schemas';

export async function createDebt(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const parsed = debtSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { contact_name, contact_phone, type, amount, paid_amount, due_date, notes } = parsed.data;

  await db.insert(debts).values({
    userId: user.id,
    contactName: contact_name,
    contactPhone: contact_phone ?? null,
    type,
    amount: amount.toString(),
    paidAmount: (paid_amount ?? 0).toString(),
    dueDate: due_date ? new Date(due_date) : null,
    notes: notes ?? null,
    isCompleted: false,
  });

  revalidatePath('/debts');
  return { success: true };
}

export async function addPayment(id: string, payAmount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const [debt] = await db.select({ amount: debts.amount, paidAmount: debts.paidAmount })
    .from(debts).where(and(eq(debts.id, id), eq(debts.userId, user.id)));
  if (!debt) return { error: 'Not found' };

  const newPaid = Math.min(parseFloat(debt.paidAmount) + payAmount, parseFloat(debt.amount));
  const isCompleted = newPaid >= parseFloat(debt.amount);

  await db.update(debts).set({ paidAmount: newPaid.toString(), isCompleted }).where(eq(debts.id, id));
  revalidatePath('/debts');
  return { success: true };
}

export async function markDebtComplete(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  await db.update(debts).set({ isCompleted: true }).where(and(eq(debts.id, id), eq(debts.userId, user.id)));
  revalidatePath('/debts');
  return { success: true };
}

export async function deleteDebt(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  await db.delete(debts).where(and(eq(debts.id, id), eq(debts.userId, user.id)));
  revalidatePath('/debts');
  return { success: true };
}
