'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || password.length < 6) {
    redirect('/update-password?error=Password minimal 6 karakter');
  }

  if (password !== confirmPassword) {
    redirect('/update-password?error=Password konfirmasi tidak cocok');
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    redirect('/update-password?error=' + encodeURIComponent(error.message));
  }

  // Sign out the user after updating password so they have to re-login, or redirect to dashboard
  redirect('/dashboard');
}
