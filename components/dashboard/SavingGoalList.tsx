'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSavingGoal, addContribution, markGoalComplete, deleteSavingGoal } from '@/app/(app)/savings/actions';
import { format, differenceInDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Plus, PiggyBank, CheckCircle, Trash2, Loader2, HandCoins } from 'lucide-react';

type Goal = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  targetAmount: string;
  currentAmount: string;
  deadline: Date | null;
  isCompleted: boolean;
};

const GOAL_ICONS = ['🏖️', '🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '🎸', '⛵'];
const GOAL_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

function AnimatedCircle({ current, target, color }: { current: number; target: number; color: string }) {
  const pct = Math.min((current / target) * 100, 100);
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90 absolute">
        <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-slate-100 dark:text-slate-800" />
        <circle
          cx="48" cy="48" r={r}
          fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <span className="relative text-lg font-bold" style={{ color }}>{Math.round(pct)}%</span>
    </div>
  );
}

export function SavingGoalList({ goals }: { goals: Goal[] }) {
  const [open, setOpen] = useState(false);
  const [contribOpen, setContribOpen] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(GOAL_ICONS[0]);
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [contribAmount, setContribAmount] = useState('');

  const formatIDR = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set('name', name); fd.set('icon', icon); fd.set('color', color);
    fd.set('target_amount', target); fd.set('current_amount', '0');
    if (deadline) fd.set('deadline', deadline);
    startTransition(async () => { await createSavingGoal(fd); setOpen(false); setName(''); setTarget(''); setDeadline(''); });
  };

  const handleContribute = (goalId: string) => {
    const amt = parseFloat(contribAmount);
    if (!amt || amt <= 0) return;
    startTransition(async () => { await addContribution(goalId, amt); setContribOpen(null); setContribAmount(''); });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Hapus tujuan tabungan ini?')) return;
    startTransition(async () => { await deleteSavingGoal(id); });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Tujuan Tabungan Anda</h2>
        <Button onClick={() => setOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
          <Plus className="mr-2 h-4 w-4" /> Tambah Tujuan
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
          <PiggyBank className="w-14 h-14 mb-3" />
          <p className="font-medium text-base">Belum ada tujuan tabungan</p>
          <p className="text-sm mt-1">Mulai menabung dengan menetapkan tujuan pertama Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const current = parseFloat(goal.currentAmount);
            const target = parseFloat(goal.targetAmount);
            const daysLeft = goal.deadline ? differenceInDays(goal.deadline, new Date()) : null;
            const projectedDate = (() => {
              if (!goal.deadline || current >= target) return null;
              const dailyRate = daysLeft && daysLeft > 0 ? (target - current) / daysLeft : 0;
              return dailyRate > 0 ? `~${formatIDR(dailyRate)}/hari` : null;
            })();

            return (
              <Card key={goal.id} className={`border shadow-sm relative overflow-hidden transition-all hover:shadow-md ${goal.isCompleted ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                {goal.isCompleted && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">Selesai ✓</Badge>
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <AnimatedCircle current={current} target={target} color={goal.color ?? GOAL_COLORS[0]} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{goal.icon ?? '🎯'}</span>
                        <h3 className="font-semibold text-base truncate">{goal.name}</h3>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{formatIDR(current)}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">dari {formatIDR(target)}</p>
                    </div>
                  </div>

                  {goal.deadline && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                      <span>Deadline: {format(goal.deadline, 'd MMM yyyy', { locale: idLocale })}</span>
                      {daysLeft !== null && daysLeft > 0 && <span className="font-medium text-slate-700 dark:text-slate-300">{daysLeft} hari lagi</span>}
                      {daysLeft !== null && daysLeft <= 0 && <Badge className="text-[10px] bg-red-100 text-red-600">Lewat deadline</Badge>}
                    </div>
                  )}
                  {projectedDate && (
                    <p className="text-xs text-blue-500 dark:text-blue-400 mb-3">💡 Nabung {projectedDate} untuk tepat waktu</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    {!goal.isCompleted && (
                      <>
                        <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                          onClick={() => setContribOpen(goal.id)} disabled={isPending}>
                          <HandCoins className="mr-1 h-3.5 w-3.5" /> Setor
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs h-8 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          onClick={() => startTransition(async () => { void markGoalComplete(goal.id); })} disabled={isPending}>
                          <CheckCircle className="mr-1 h-3.5 w-3.5" /> Selesai
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                      onClick={() => handleDelete(goal.id)} disabled={isPending}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>

                {/* Contribution Dialog */}
                <Dialog open={contribOpen === goal.id} onOpenChange={(v) => !v && setContribOpen(null)}>
                  <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <span>{goal.icon ?? '🎯'}</span> Setor ke {goal.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="contribAmt">Jumlah (IDR)</Label>
                        <Input id="contribAmt" type="number" placeholder="500000" value={contribAmount}
                          onChange={e => setContribAmount(e.target.value)} className="bg-white dark:bg-slate-800" />
                      </div>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleContribute(goal.id)} disabled={isPending || !contribAmount}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Konfirmasi Setoran
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Goal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PiggyBank className="h-5 w-5 text-emerald-600" /> Buat Tujuan Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="goalName">Nama Tujuan</Label>
              <Input id="goalName" placeholder="Liburan ke Jepang..." value={name} onChange={e => setName(e.target.value)} className="bg-white dark:bg-slate-800" />
            </div>
            <div className="space-y-1.5">
              <Label>Ikon</Label>
              <div className="flex flex-wrap gap-2">
                {GOAL_ICONS.map(ic => (
                  <button key={ic} type="button" onClick={() => setIcon(ic)}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${icon === ic ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-500' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Warna</Label>
              <div className="flex gap-2">
                {GOAL_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-slate-500 scale-110' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetAmt">Target (IDR)</Label>
              <Input id="targetAmt" type="number" placeholder="20000000" value={target} onChange={e => setTarget(e.target.value)} className="bg-white dark:bg-slate-800" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goalDeadline">Deadline (opsional)</Label>
              <Input id="goalDeadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="bg-white dark:bg-slate-800" />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isPending || !name || !target}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Buat Tujuan
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
