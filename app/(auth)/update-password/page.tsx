import { updatePassword } from './actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If there's no user session, they shouldn't be here
  if (!user) {
    redirect('/login?error=Sesi tidak valid atau telah kedaluwarsa. Silakan minta link reset baru.');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Buat Password Baru</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Silakan masukkan password baru Anda.
          </p>
        </div>

        {searchParams?.error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30">
            {searchParams.error}
          </div>
        )}

        <form action={updatePassword} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Password Baru
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
              placeholder="Ulangi password baru"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-[0.98]"
          >
            Simpan Password
          </button>
        </form>
      </div>
    </div>
  );
}
