import { SavingGoalList } from '@/components/dashboard/SavingGoalList';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { savingGoals } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function SavingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const goals = await db
    .select()
    .from(savingGoals)
    .where(eq(savingGoals.userId, user.id))
    .orderBy(desc(savingGoals.isCompleted));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tabungan</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Pantau progress tujuan finansial jangka panjang Anda.
        </p>
      </div>
      <SavingGoalList goals={goals} />
    </div>
  );
}
