import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, and, or, isNull } from 'drizzle-orm';
import { SubscriptionManager } from '@/components/subscriptions/SubscriptionManager';

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [subs, cats] = await Promise.all([
    db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        recurringInterval: transactions.recurringInterval,
        date: transactions.date,
        categoryName: categories.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(eq(transactions.userId, user.id), eq(transactions.isRecurring, true))),

    db
      .select({ id: categories.id, name: categories.name, type: categories.type })
      .from(categories)
      .where(or(eq(categories.userId, user.id), isNull(categories.userId))),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Langganan & Berulang</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Pantau pengeluaran rutin dan biaya berlangganan bulanan Anda.
        </p>
      </div>
      <SubscriptionManager
        subscriptions={subs.map(s => ({ ...s, description: s.description ?? '' }))}
        categories={cats}
      />
    </div>
  );
}
