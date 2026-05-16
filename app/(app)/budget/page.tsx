import { BudgetManager } from '@/components/dashboard/BudgetManager';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { budgets, categories, transactions } from '@/lib/db/schema';
import { eq, and, or, isNull, gte, lte, sql } from 'drizzle-orm';

export default async function BudgetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthStart = new Date(currentYear, now.getMonth(), 1);
  const monthEnd = new Date(currentYear, now.getMonth() + 1, 0, 23, 59, 59);

  // Get budgets for current month
  const budgetRows = await db
    .select({
      id: budgets.id,
      categoryId: budgets.categoryId,
      categoryName: categories.name,
      budgetAmount: budgets.amount,
      month: budgets.month,
      year: budgets.year,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(
      and(
        eq(budgets.userId, user.id),
        eq(budgets.month, currentMonth),
        eq(budgets.year, currentYear)
      )
    );

  // Get total spend per category for current month
  const spendRows = await db
    .select({
      categoryId: transactions.categoryId,
      total: sql<number>`cast(sum(${transactions.amount}) as numeric)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, user.id),
        eq(transactions.type, 'expense'),
        gte(transactions.date, monthStart),
        lte(transactions.date, monthEnd)
      )
    )
    .groupBy(transactions.categoryId);

  const spendMap = Object.fromEntries(spendRows.map(r => [r.categoryId, Number(r.total)]));

  const budgetData = budgetRows.map(b => ({
    id: b.id,
    categoryId: b.categoryId ?? '',
    categoryName: b.categoryName ?? 'Lainnya',
    budgetAmount: Number(b.budgetAmount),
    spentAmount: spendMap[b.categoryId ?? ''] ?? 0,
    month: b.month,
    year: b.year,
  }));

  const allCategories = await db
    .select({ id: categories.id, name: categories.name, type: categories.type })
    .from(categories)
    .where(or(eq(categories.userId, user.id), isNull(categories.userId)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Rencanakan dan pantau batas pengeluaran bulanan Anda.
        </p>
      </div>
      <BudgetManager
        budgets={budgetData}
        categories={allCategories}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
    </div>
  );
}
