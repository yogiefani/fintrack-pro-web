import { NetWorthCard } from '@/components/dashboard/NetWorthCard';
import { CashflowChart } from '@/components/dashboard/CashflowChart';
import { AiInsightCard } from '@/components/dashboard/AiInsightCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { transactions, budgets, categories, savingGoals } from '@/lib/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // 1. Fetch Recent Transactions
  const recentTxs = await db.select({
    id: transactions.id,
    description: transactions.description,
    amount: transactions.amount,
    type: transactions.type,
    currency: transactions.currency,
    date: transactions.date,
    categoryName: categories.name,
    categoryIcon: categories.icon,
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(eq(transactions.userId, user.id))
  .orderBy(desc(transactions.date))
  .limit(5);

  // 2. Fetch Budgets & Current Month Spending
  const activeBudgets = await db.select({
    categoryId: budgets.categoryId,
    categoryName: categories.name,
    amount: budgets.amount,
  })
  .from(budgets)
  .leftJoin(categories, eq(budgets.categoryId, categories.id))
  .where(and(eq(budgets.userId, user.id), eq(budgets.month, currentMonth), eq(budgets.year, currentYear)));

  const convertedAmount = sql<number>`
    cast(sum(
      CASE 
        WHEN ${transactions.currency} = 'USD' THEN ${transactions.amount} * 16000
        WHEN ${transactions.currency} = 'SGD' THEN ${transactions.amount} * 11500
        ELSE ${transactions.amount}
      END
    ) as numeric)
  `;

  const monthSpends = await db.select({
    categoryId: transactions.categoryId,
    total: convertedAmount,
  })
  .from(transactions)
  .where(and(
    eq(transactions.userId, user.id),
    eq(transactions.type, 'expense'),
    gte(transactions.date, monthStart),
    lte(transactions.date, monthEnd)
  ))
  .groupBy(transactions.categoryId);

  const spendMap = Object.fromEntries(monthSpends.map(s => [s.categoryId, Number(s.total)]));
  
  const budgetData = activeBudgets.map(b => {
    const spent = spendMap[b.categoryId ?? ''] ?? 0;
    const limit = Number(b.amount);
    const percent = Math.min(100, Math.round((spent / limit) * 100));
    return { name: b.categoryName ?? 'Lainnya', spent, limit, percent };
  });

  // 3. Fetch Active Saving Goals
  const goals = await db.select()
    .from(savingGoals)
    .where(and(eq(savingGoals.userId, user.id), eq(savingGoals.isCompleted, false)))
    .limit(3);

  // 4. Generate 6-Month Cashflow Data
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const targetDate = subMonths(now, i);
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);
    
    const txs = await db.select({
      type: transactions.type,
      total: convertedAmount,
    })
    .from(transactions)
    .where(and(eq(transactions.userId, user.id), gte(transactions.date, start), lte(transactions.date, end)))
    .groupBy(transactions.type);

    let income = 0;
    let expense = 0;
    txs.forEach(t => {
      if (t.type === 'income') income = Number(t.total);
      if (t.type === 'expense') expense = Number(t.total);
    });

    chartData.push({
      name: format(targetDate, 'MMM', { locale: idLocale }),
      income,
      expense
    });
  }

  // 5. Calculate Total Net Worth
  const lifetimeTxs = await db.select({
    type: transactions.type,
    total: convertedAmount,
  })
  .from(transactions)
  .where(eq(transactions.userId, user.id))
  .groupBy(transactions.type);

  let totalIncome = 0;
  let totalExpense = 0;
  lifetimeTxs.forEach(t => {
    if (t.type === 'income') totalIncome = Number(t.total);
    if (t.type === 'expense') totalExpense = Number(t.total);
  });
  
  const netWorth = totalIncome - totalExpense;

  const formatIDR = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Ringkasan finansial Anda bulan ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1"><NetWorthCard amount={netWorth} /></div>
        <div className="md:col-span-2"><AiInsightCard /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[350px]">
            <CashflowChart data={chartData} />
          </div>

          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Transaksi Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                {recentTxs.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">Belum ada transaksi</p>
                ) : (
                  recentTxs.map((trx) => (
                    <div key={trx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                          {trx.categoryIcon || (trx.type === 'income' ? '💰' : '💸')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{trx.description}</p>
                          <p className="text-xs text-slate-500">{format(trx.date, 'dd MMM yyyy, HH:mm')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${trx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {trx.type === 'income' ? '+' : '-'}{formatIDR(Number(trx.amount))}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Progress Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 mt-4">
              {budgetData.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Belum ada budget diset bulan ini</p>
              ) : (
                budgetData.map((b, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="font-medium">{b.name}</span>
                      <span className={`font-medium ${b.percent > 100 ? 'text-red-500' : 'text-slate-500'}`}>{b.percent}%</span>
                    </div>
                    <Progress value={Math.min(100, b.percent)} className={`h-2 bg-slate-100 dark:bg-slate-800 [&>div]:${b.percent > 100 ? 'bg-red-500' : b.percent > 80 ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <p className={`text-xs mt-1 ${b.percent > 100 ? 'text-red-500' : 'text-slate-500'}`}>
                      {b.percent > 100 ? `Over budget ${formatIDR(b.spent - b.limit)}` : `Sisa ${formatIDR(b.limit - b.spent)}`}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Tujuan Tabungan</CardTitle>
            </CardHeader>
            <CardContent className="mt-4 space-y-4">
              {goals.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Belum ada target tabungan aktif</p>
              ) : (
                goals.map(g => {
                  const pct = Math.min(100, Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100));
                  return (
                    <div key={g.id} className="flex items-center gap-4">
                      <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                          <path className="text-emerald-500" strokeDasharray={`${pct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                        </svg>
                        <div className="absolute text-[10px] font-bold">{pct}%</div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm truncate">{g.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{formatIDR(Number(g.currentAmount))} / {formatIDR(Number(g.targetAmount))}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
