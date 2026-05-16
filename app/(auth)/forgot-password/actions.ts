'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  
  if (!email) {
    redirect('/forgot-password?error=Email tidak boleh kosong');
  }

  const headersList = await headers();
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  if (error) {
    redirect('/forgot-password?error=' + encodeURIComponent(error.message));
  }

  redirect('/forgot-password?success=Tautan reset password telah dikirim ke email Anda.');
}
