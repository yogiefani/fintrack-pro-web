import { ReportGenerator } from '@/components/reports/ReportGenerator';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const rawTx = await db
    .select({
      id: transactions.id,
      date: transactions.date,
      description: transactions.description,
      amount: transactions.amount,
      type: transactions.type,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, user.id))
    .orderBy(desc(transactions.date));

  const txData = rawTx.map(t => ({
    id: t.id,
    date: t.date,
    description: t.description ?? '',
    amount: Number(t.amount),
    type: t.type,
    categoryName: t.categoryName ?? 'Lainnya',
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laporan Keuangan</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Generate dan download laporan keuangan Anda dalam format PDF.
        </p>
      </div>
      <ReportGenerator transactions={txData} />
    </div>
  );
}
