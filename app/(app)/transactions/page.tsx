import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, desc, or, isNull } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [txData, catData] = await Promise.all([
    db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        type: transactions.type,
        currency: transactions.currency,
        description: transactions.description,
        date: transactions.date,
        categoryName: categories.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, user.id))
      .orderBy(desc(transactions.date))
      .limit(100),

    db
      .select({ id: categories.id, name: categories.name, type: categories.type })
      .from(categories)
      .where(or(eq(categories.userId, user.id), isNull(categories.userId))),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Catat dan pantau seluruh pemasukan & pengeluaran Anda.
          </p>
        </div>
        <AddTransactionModal categories={catData} />
      </div>

      <TransactionsTable initialData={txData} categories={catData} />
    </div>
  );
}
