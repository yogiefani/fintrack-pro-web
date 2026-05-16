'use server';

import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Create admin client bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkIsSuperAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'super_admin';
}

export async function updateUserRole(userId: string, newRole: 'super_admin' | 'app_admin' | 'manager' | 'member') {
  const isSuperAdmin = await checkIsSuperAdmin();
  if (!isSuperAdmin) return { error: 'Hanya Super Admin yang bisa mengubah role.' };

  try {
    // 1. Update in Auth User Metadata
    const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole }
    });
    if (authErr) throw authErr;

    // 2. Update in Database Profile
    await db.update(profiles).set({ role: newRole }).where(eq(profiles.id, userId));

    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteUser(userId: string) {
  const isSuperAdmin = await checkIsSuperAdmin();
  if (!isSuperAdmin) return { error: 'Hanya Super Admin yang bisa menghapus user.' };

  try {
    // 1. Delete from Auth (this will cascade to profiles if trigger is set up correctly, but we can do both)
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authErr) throw authErr;

    // Database deletion will cascade because profile id references auth.users (if configured)
    // Or we delete profile directly first
    await db.delete(profiles).where(eq(profiles.id, userId));

    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
