'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createBudget, deleteBudget } from '@/app/(app)/budget/actions';
import { Loader2, Plus, Target, Trash2, TrendingUp } from 'lucide-react';

type Category = { id: string; name: string; type: 'income' | 'expense' };
type BudgetWithSpend = {
  id: string;
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  month: number;
  year: number;
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

function CircularProgress({ value, size = 72 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  const color = value >= 100 ? '#ef4444' : value >= 75 ? '#f59e0b' : '#22c55e';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

export function BudgetManager({ budgets, categories, currentMonth, currentYear }: {
  budgets: BudgetWithSpend[];
  categories: Category[];
  currentMonth: number;
  currentYear: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedCat, setSelectedCat] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(String(currentMonth));
  const [year, setYear] = useState(String(currentYear));

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const totalBudget = budgets.reduce((s, b) => s + b.budgetAmount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spentAmount, 0);
  const savingRate = totalBudget > 0 ? Math.max(0, ((totalBudget - totalSpent) / totalBudget) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set('category_id', selectedCat);
    fd.set('amount', amount);
    fd.set('month', month);
    fd.set('year', year);
    startTransition(async () => {
      await createBudget(fd);
      setOpen(false);
      setSelectedCat(''); setAmount('');
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => { await deleteBudget(id); });
  };

  const formatIDR = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-md">
          <CardContent className="pt-5 pb-4">
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Total Budget</p>
            <p className="text-2xl font-bold mt-1">{formatIDR(totalBudget)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-md">
          <CardContent className="pt-5 pb-4">
            <p className="text-red-100 text-xs font-medium uppercase tracking-wider">Total Terpakai</p>
            <p className="text-2xl font-bold mt-1">{formatIDR(totalSpent)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-md">
          <CardContent className="pt-5 pb-4">
            <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Sisa Budget</p>
            <p className="text-2xl font-bold mt-1">{formatIDR(Math.max(0, totalBudget - totalSpent))}</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Budget {MONTH_NAMES[currentMonth - 1]} {currentYear}</h2>
          <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Set Budget
          </Button>
        </div>

        {budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-600">
            <Target className="w-12 h-12 mb-3" />
            <p className="font-medium">Belum ada budget bulan ini</p>
            <p className="text-sm mt-1">Klik "Set Budget" untuk mulai merencanakan pengeluaran</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {budgets.map((b) => {
              const pct = b.budgetAmount > 0 ? (b.spentAmount / b.budgetAmount) * 100 : 0;
              const isOver = pct >= 100;
              const isWarning = pct >= 75 && pct < 100;
              return (
                <Card key={b.id} className={`shadow-sm border ${isOver ? 'border-red-200 dark:border-red-900' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-slate-900`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isOver ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                          {b.categoryName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{b.categoryName}</p>
                          {isOver && <Badge className="text-[10px] h-4 px-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Over Budget</Badge>}
                          {isWarning && <Badge className="text-[10px] h-4 px-1 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">Hampir Habis</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CircularProgress value={pct} size={48} />
                        <button onClick={() => handleDelete(b.id)} disabled={isPending} className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <Progress
                      value={Math.min(pct, 100)}
                      className={`h-1.5 mb-2 ${isOver ? '[&>div]:bg-red-500' : isWarning ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`}
                    />
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatIDR(b.spentAmount)} terpakai</span>
                      <span className="font-medium">{Math.round(pct)}%</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Budget: {formatIDR(b.budgetAmount)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Budget Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-600" /> Set Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select onValueChange={(v: string | null) => setSelectedCat(v ?? '')} value={selectedCat}>
                <SelectTrigger className="bg-white dark:bg-slate-800"><SelectValue placeholder="Pilih kategori..." /></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budgetAmount">Jumlah Budget (IDR)</Label>
              <Input id="budgetAmount" type="number" placeholder="3000000" value={amount} onChange={e => setAmount(e.target.value)} className="bg-white dark:bg-slate-800" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Bulan</Label>
                <Select onValueChange={(v: string | null) => setMonth(v ?? String(currentMonth))} value={month}>
                  <SelectTrigger className="bg-white dark:bg-slate-800"><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTH_NAMES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">Tahun</Label>
                <Input id="year" type="number" value={year} onChange={e => setYear(e.target.value)} className="bg-white dark:bg-slate-800" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending || !selectedCat || !amount}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan Budget
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
