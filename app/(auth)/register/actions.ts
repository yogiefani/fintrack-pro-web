'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'member', // Default role for new signups
      },
      // Since we don't have email verification setup for this project right now, 
      // Supabase might require confirmation depending on project settings.
      // Usually, it's best to handle errors gracefully.
    },
  });

  if (error) {
    redirect('/register?error=' + encodeURIComponent(error.message));
  }

  // After successful registration, redirect to login or dashboard
  // Depending on Supabase settings, if email confirm is off, they might be logged in automatically.
  // We'll redirect to dashboard, middleware will catch if they aren't logged in.
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
