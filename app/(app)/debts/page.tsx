import { DebtTracker } from '@/components/transactions/DebtTracker';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { debts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function DebtsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const debtList = await db
    .select()
    .from(debts)
    .where(eq(debts.userId, user.id))
    .orderBy(desc(debts.isCompleted));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hutang & Piutang</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Lacak semua catatan hutang dan piutang Anda secara terorganisir.
        </p>
      </div>
      <DebtTracker initialDebts={debtList} />
    </div>
  );
}
