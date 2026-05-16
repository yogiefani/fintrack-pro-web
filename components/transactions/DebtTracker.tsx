'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createDebt, addPayment, markDebtComplete, deleteDebt } from '@/app/(app)/debts/actions';
import { format, differenceInDays } from 'date-fns';
import { Plus, HandCoins, CheckCircle, Trash2, Clock, Loader2, ArrowDownLeft, ArrowUpRight, Phone } from 'lucide-react';

type Debt = {
  id: string; contactName: string; contactPhone: string | null;
  type: 'hutang' | 'piutang'; amount: string; paidAmount: string;
  dueDate: Date | null; notes: string | null; isCompleted: boolean;
};

export function DebtTracker({ debts }: { debts: Debt[] }) {
  const [open, setOpen] = useState(false);
  const [payOpen, setPayOpen] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<'hutang' | 'piutang'>('hutang');
  const [form, setForm] = useState({ contact_name: '', contact_phone: '', amount: '', due_date: '', notes: '' });
  const [payAmount, setPayAmount] = useState('');

  const hutangList = debts.filter(d => d.type === 'hutang');
  const piutangList = debts.filter(d => d.type === 'piutang');

  const formatIDR = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const totalHutang = hutangList.filter(d => !d.isCompleted).reduce((s, d) => s + parseFloat(d.amount) - parseFloat(d.paidAmount), 0);
  const totalPiutang = piutangList.filter(d => !d.isCompleted).reduce((s, d) => s + parseFloat(d.amount) - parseFloat(d.paidAmount), 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.set(k, v); });
    fd.set('type', type);
    fd.set('paid_amount', '0');
    startTransition(async () => { await createDebt(fd); setOpen(false); setForm({ contact_name: '', contact_phone: '', amount: '', due_date: '', notes: '' }); });
  };

  const handlePay = (id: string) => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;
    startTransition(async () => { await addPayment(id, amt); setPayOpen(null); setPayAmount(''); });
  };

  const getStatus = (d: Debt) => {
    if (d.isCompleted) return { label: 'Lunas', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
    const paid = parseFloat(d.paidAmount);
    if (paid > 0) return { label: 'Sebagian', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
    if (d.dueDate && differenceInDays(d.dueDate, new Date()) < 0) return { label: 'Jatuh Tempo', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    return { label: 'Aktif', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
  };

  const DebtCard = ({ d }: { d: Debt }) => {
    const status = getStatus(d);
    const amount = parseFloat(d.amount);
    const paid = parseFloat(d.paidAmount);
    const remaining = amount - paid;
    const pct = amount > 0 ? (paid / amount) * 100 : 0;
    const daysLeft = d.dueDate ? differenceInDays(d.dueDate, new Date()) : null;

    return (
      <Card className={`border shadow-sm bg-white dark:bg-slate-900 ${d.isCompleted ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${d.type === 'piutang' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                  {d.contactName.charAt(0)}
                </div>
                <span className="font-semibold text-sm">{d.contactName}</span>
                {d.contactPhone && <span className="text-xs text-slate-400 flex items-center gap-1"><Phone className="h-3 w-3" />{d.contactPhone}</span>}
              </div>
              <Badge className={`text-xs ${status.cls}`}>{status.label}</Badge>
            </div>
            <div className="text-right">
              <p className={`font-bold text-base ${d.type === 'piutang' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatIDR(remaining)}
              </p>
              <p className="text-xs text-slate-400">dari {formatIDR(amount)}</p>
            </div>
          </div>

          <Progress value={pct} className="h-1.5 mb-2 [&>div]:bg-emerald-500" />

          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <span>Dibayar: {formatIDR(paid)}</span>
            {d.dueDate && (
              <span className={`flex items-center gap-1 ${daysLeft !== null && daysLeft < 0 ? 'text-red-500' : ''}`}>
                <Clock className="h-3 w-3" />
                {daysLeft !== null && daysLeft >= 0 ? `${daysLeft} hari lagi` : 'Lewat deadline'}
                {d.dueDate && ` (${format(d.dueDate, 'dd/MM/yy')})`}
              </span>
            )}
          </div>

          {!d.isCompleted && (
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setPayOpen(d.id)} disabled={isPending}>
                <HandCoins className="mr-1 h-3 w-3" /> Bayar
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => startTransition(async () => { void markDebtComplete(d.id); })} disabled={isPending}>
                <CheckCircle className="mr-1 h-3 w-3" /> Lunas
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-red-500" onClick={() => startTransition(async () => { void deleteDebt(d.id); })} disabled={isPending}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* Payment Dialog */}
          <Dialog open={payOpen === d.id} onOpenChange={v => !v && setPayOpen(null)}>
            <DialogContent className="sm:max-w-xs">
              <DialogHeader><DialogTitle>Catat Pembayaran — {d.contactName}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Sisa: {formatIDR(remaining)}</Label>
                  <Input type="number" placeholder="Jumlah pembayaran..." value={payAmount} onChange={e => setPayAmount(e.target.value)} className="bg-white dark:bg-slate-800" />
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handlePay(d.id)} disabled={isPending || !payAmount}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan Pembayaran
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-md">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <ArrowUpRight className="w-8 h-8 opacity-50" />
            <div>
              <p className="text-red-100 text-xs uppercase tracking-wider">Total Hutang</p>
              <p className="text-xl font-bold">{formatIDR(totalHutang)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-md">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <ArrowDownLeft className="w-8 h-8 opacity-50" />
            <div>
              <p className="text-blue-100 text-xs uppercase tracking-wider">Total Piutang</p>
              <p className="text-xl font-bold">{formatIDR(totalPiutang)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
          <Plus className="mr-2 h-4 w-4" /> Tambah Catatan
        </Button>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-red-500" />
            <h3 className="font-semibold text-base">Hutang Saya ({hutangList.length})</h3>
          </div>
          {hutangList.length === 0 ? <p className="text-sm text-slate-400 py-8 text-center">Tidak ada hutang 🎉</p> : hutangList.map(d => <DebtCard key={d.id} d={d} />)}
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="h-4 w-4 text-blue-500" />
            <h3 className="font-semibold text-base">Piutang Saya ({piutangList.length})</h3>
          </div>
          {piutangList.length === 0 ? <p className="text-sm text-slate-400 py-8 text-center">Tidak ada piutang</p> : piutangList.map(d => <DebtCard key={d.id} d={d} />)}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Tambah Hutang / Piutang</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {(['hutang', 'piutang'] as const).map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`py-2 rounded-lg text-sm font-medium border transition-all capitalize ${type === t ? t === 'hutang' ? 'bg-red-500 text-white border-red-500' : 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {t === 'hutang' ? '📤 Hutang' : '📥 Piutang'}
                </button>
              ))}
            </div>
            {[
              { key: 'contact_name', label: 'Nama Kontak', placeholder: 'Budi, Ani...', required: true },
              { key: 'contact_phone', label: 'No. Telepon (opsional)', placeholder: '08123...' },
              { key: 'amount', label: 'Jumlah (IDR)', placeholder: '1000000', required: true, type: 'number' },
              { key: 'due_date', label: 'Jatuh Tempo (opsional)', type: 'date' },
              { key: 'notes', label: 'Catatan (opsional)', placeholder: 'Hutang untuk...' },
            ].map(f => (
              <div key={f.key} className="space-y-1">
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input id={f.key} type={f.type ?? 'text'} placeholder={f.placeholder} required={f.required}
                  value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="bg-white dark:bg-slate-800" />
              </div>
            ))}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
