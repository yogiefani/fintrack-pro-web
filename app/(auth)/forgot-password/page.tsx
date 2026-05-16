import { resetPassword } from './actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800">
        <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Login
        </Link>
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Lupa Password?</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Masukkan email Anda, dan kami akan mengirimkan tautan untuk mengatur ulang password Anda.
          </p>
        </div>

        {searchParams?.error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30">
            {searchParams.error}
          </div>
        )}

        {searchParams?.success ? (
          <div className="mb-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4 text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 text-center">
            {searchParams.success}
          </div>
        ) : (
          <form action={resetPassword} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                placeholder="nama@email.com"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-[0.98]"
            >
              Kirim Link Reset
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
