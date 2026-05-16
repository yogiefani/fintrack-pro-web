'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { savingGoals, savingContributions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { savingGoalSchema } from '@/lib/validations/schemas';

export async function createSavingGoal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const parsed = savingGoalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { name, icon, color, target_amount, current_amount, deadline } = parsed.data;

  await db.insert(savingGoals).values({
    userId: user.id,
    name,
    icon: icon ?? null,
    color: color ?? null,
    targetAmount: target_amount.toString(),
    currentAmount: (current_amount ?? 0).toString(),
    deadline: deadline ? new Date(deadline) : null,
    isCompleted: false,
  });

  revalidatePath('/savings');
  return { success: true };
}

export async function updateSavingGoal(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const parsed = savingGoalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { name, icon, color, target_amount, current_amount, deadline } = parsed.data;

  await db
    .update(savingGoals)
    .set({
      name,
      icon: icon ?? null,
      color: color ?? null,
      targetAmount: target_amount.toString(),
      currentAmount: (current_amount ?? 0).toString(),
      deadline: deadline ? new Date(deadline) : null,
    })
    .where(and(eq(savingGoals.id, id), eq(savingGoals.userId, user.id)));

  revalidatePath('/savings');
  return { success: true };
}

export async function addContribution(goalId: string, amount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const [goal] = await db
    .select({ currentAmount: savingGoals.currentAmount, targetAmount: savingGoals.targetAmount })
    .from(savingGoals)
    .where(and(eq(savingGoals.id, goalId), eq(savingGoals.userId, user.id)));

  if (!goal) return { error: 'Goal not found' };

  const newAmount = parseFloat(goal.currentAmount) + amount;
  const isCompleted = newAmount >= parseFloat(goal.targetAmount);

  await db
    .update(savingGoals)
    .set({ currentAmount: newAmount.toString(), isCompleted })
    .where(eq(savingGoals.id, goalId));

  await db.insert(savingContributions).values({
    goalId,
    amount: amount.toString(),
    date: new Date(),
  });

  revalidatePath('/savings');
  return { success: true };
}

export async function markGoalComplete(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  await db
    .update(savingGoals)
    .set({ isCompleted: true })
    .where(and(eq(savingGoals.id, id), eq(savingGoals.userId, user.id)));

  revalidatePath('/savings');
  return { success: true };
}

export async function deleteSavingGoal(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  await db.delete(savingGoals).where(and(eq(savingGoals.id, id), eq(savingGoals.userId, user.id)));
  revalidatePath('/savings');
  return { success: true };
}
