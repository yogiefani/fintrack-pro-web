'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { profiles } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const fullName = formData.get('full_name') as string;
  if (!fullName) return { error: 'Nama tidak boleh kosong' };

  try {
    // Update in Auth
    const { error: authErr } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    if (authErr) throw authErr;

    // Update in DB
    await db.update(profiles).set({ fullName }).where(eq(profiles.id, user.id));

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get('password') as string;
  
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  
  return { success: true };
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const type = formData.get('type') as 'income' | 'expense';
  const icon = formData.get('icon') as string;
  const color = formData.get('color') as string;

  if (!name || !type) throw new Error('Invalid data');

  const isSystem = formData.get('isSystem') === 'true';
  let userIdToInsert: string | null = user.id;

  if (isSystem) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role === 'super_admin' || profile?.role === 'app_admin') {
      userIdToInsert = null;
    }
  }

  await db.insert(categories).values({
    userId: userIdToInsert,
    name,
    type,
    icon: icon || '📝',
    color: color || '#64748b',
    isDefault: userIdToInsert === null,
  });
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'app_admin';

  if (isAdmin) {
    // Admin can delete any category, or at least system categories and their own
    await db.delete(categories).where(
      and(eq(categories.id, id), isAdmin ? undefined : eq(categories.userId, user.id))
    );
  } else {
    // Normal users can only delete their own
    await db.delete(categories).where(
      and(eq(categories.id, id), eq(categories.userId, user.id))
    );
  }
}
