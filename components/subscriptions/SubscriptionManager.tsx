'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2, RefreshCw, Calendar, Zap } from 'lucide-react';
import { createSubscription, deleteSubscription } from '@/app/(app)/subscriptions/actions';

type Subscription = {
  id: string;
  description: string;
  amount: string;
  recurringInterval: string | null;
  date: Date;
  categoryName: string | null;
};

type Category = { id: string; name: string; type: string };

const INTERVAL_LABELS: Record<string, string> = {
  weekly: 'Mingguan',
  monthly: 'Bulanan',
  yearly: 'Tahunan',
};

const INTERVAL_COLORS: Record<string, string> = {
  weekly: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  monthly: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  yearly: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export function SubscriptionManager({ subscriptions, categories }: { subscriptions: Subscription[]; categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ description: '', amount: '', category_id: '', recurring_interval: 'monthly', date: '' });

  const formatIDR = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const totalMonthly = subscriptions.reduce((sum, s) => {
    const amt = parseFloat(s.amount);
    if (s.recurringInterval === 'monthly') return sum + amt;
    if (s.recurringInterval === 'weekly') return sum + amt * 4.33;
    if (s.recurringInterval === 'yearly') return sum + amt / 12;
    return sum;
  }, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.set(k, v); });
    startTransition(async () => {
      await createSubscription(fd);
      setOpen(false);
      setForm({ description: '', amount: '', category_id: '', recurring_interval: 'monthly', date: '' });
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
          <CardContent className="p-6 flex items-center gap-4">
            <RefreshCw className="w-10 h-10 opacity-40" />
            <div>
              <p className="text-blue-100 text-xs uppercase tracking-widest">Total Langganan</p>
              <p className="text-2xl font-bold">{subscriptions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md">
          <CardContent className="p-6 flex items-center gap-4">
            <Zap className="w-10 h-10 opacity-40" />
            <div>
              <p className="text-purple-100 text-xs uppercase tracking-widest">Biaya Bulanan (~)</p>
              <p className="text-2xl font-bold">{formatIDR(totalMonthly)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-md">
          <CardContent className="p-6 flex items-center gap-4">
            <Calendar className="w-10 h-10 opacity-40" />
            <div>
              <p className="text-rose-100 text-xs uppercase tracking-widest">Biaya Tahunan (~)</p>
              <p className="text-2xl font-bold">{formatIDR(totalMonthly * 12)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Daftar Langganan</h2>
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
          <Plus className="mr-2 h-4 w-4" /> Tambah Langganan
        </Button>
      </div>

      {/* Grid */}
      {subscriptions.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <RefreshCw className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Belum ada langganan</p>
          <p className="text-sm mt-1">Tambahkan biaya langganan seperti Netflix, Spotify, dll.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((s) => (
            <Card key={s.id} className="border border-slate-100 dark:border-slate-800 shadow-sm dark:bg-slate-900 group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
                      {s.categoryName ? s.categoryName.charAt(0) : '💳'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{s.description}</p>
                      <p className="text-xs text-slate-500">{s.categoryName ?? 'Tanpa Kategori'}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => startTransition(async () => { void deleteSubscription(s.id); })}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold">{formatIDR(parseFloat(s.amount))}</p>
                  <Badge className={`text-xs font-medium border-0 ${INTERVAL_COLORS[s.recurringInterval ?? 'monthly']}`}>
                    {INTERVAL_LABELS[s.recurringInterval ?? 'monthly']}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Tambah Langganan Baru</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            {[
              { key: 'description', label: 'Nama Layanan', placeholder: 'Netflix, Spotify, dll.' },
              { key: 'amount', label: 'Biaya (IDR)', placeholder: '54000', type: 'number' },
              { key: 'date', label: 'Tanggal Mulai', type: 'date' },
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <Label>{f.label}</Label>
                <Input type={f.type ?? 'text'} placeholder={f.placeholder} required
                  value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm(p => ({ ...p, category_id: v ?? '' }))}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori..." /></SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.type === 'expense').map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Frekuensi</Label>
              <Select value={form.recurring_interval} onValueChange={(v) => setForm(p => ({ ...p, recurring_interval: v ?? 'monthly' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
