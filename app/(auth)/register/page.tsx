import { register } from './actions';
import Link from 'next/link';

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Buat Akun</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Mulai perjalanan finansial Anda bersama FinTrack.</p>
        </div>

        {searchParams?.error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30">
            {searchParams.error}
          </div>
        )}

        <form action={register} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nama Lengkap
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
              placeholder="Masukkan nama lengkap Anda"
            />
          </div>

          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
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

          <button
            type="submit"
            className="w-full mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-[0.98]"
          >
            Daftar Sekarang
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
