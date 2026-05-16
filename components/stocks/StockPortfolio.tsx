'use client';

import { useState, useTransition } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { createHolding, deleteHolding } from '@/app/(app)/stocks/actions';
import { Plus, TrendingUp, TrendingDown, Trash2, Loader2 } from 'lucide-react';

type Holding = {
  id: string; ticker: string; companyName: string | null;
  lotQuantity: string; avgBuyPrice: string; sector: string | null;
  currentPrice?: number; changePercent?: number;
};

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

export function StockPortfolio({ holdings }: { holdings: Holding[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ ticker: '', company_name: '', lot_quantity: '', avg_buy_price: '', broker: '', sector: '' });

  const formatIDR = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const enriched = holdings.map(h => {
    const lots = parseFloat(h.lotQuantity);
    const avgPrice = parseFloat(h.avgBuyPrice);
    const curPrice = h.currentPrice ?? avgPrice;
    const shares = lots * 100; // 1 lot = 100 shares (IDX)
    const investedValue = shares * avgPrice;
    const currentValue = shares * curPrice;
    const pnl = currentValue - investedValue;
    const pnlPct = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
    return { ...h, lots, avgPrice, curPrice, shares, investedValue, currentValue, pnl, pnlPct };
  });

  const totalValue = enriched.reduce((s, h) => s + h.currentValue, 0);
  const totalPnL = enriched.reduce((s, h) => s + h.pnl, 0);
  const totalInvested = enriched.reduce((s, h) => s + h.investedValue, 0);
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  // Sector breakdown
  const sectorMap: Record<string, number> = {};
  enriched.forEach(h => {
    const sector = h.sector || 'Lainnya';
    sectorMap[sector] = (sectorMap[sector] ?? 0) + h.currentValue;
  });
  const pieData = Object.entries(sectorMap).map(([name, value]) => ({ name, value }));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.set(k, v); });
    startTransition(async () => {
      await createHolding(fd);
      setOpen(false);
      setForm({ ticker: '', company_name: '', lot_quantity: '', avg_buy_price: '', broker: '', sector: '' });
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0 shadow-md">
          <CardContent className="pt-5 pb-4">
            <p className="text-slate-300 text-xs uppercase tracking-wider">Total Nilai Portfolio</p>
            <p className="text-2xl font-bold mt-1">{formatIDR(totalValue)}</p>
          </CardContent>
        </Card>
        <Card className={`border-0 shadow-md text-white bg-gradient-to-br ${totalPnL >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'}`}>
          <CardContent className="pt-5 pb-4">
            <p className="text-white/80 text-xs uppercase tracking-wider">Total P&L</p>
            <p className="text-2xl font-bold mt-1">{totalPnL >= 0 ? '+' : ''}{formatIDR(totalPnL)}</p>
            <p className="text-sm text-white/70">{totalPnLPct >= 0 ? '+' : ''}{totalPnLPct.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-md">
          <CardContent className="pt-5 pb-4">
            <p className="text-blue-100 text-xs uppercase tracking-wider">Jumlah Saham</p>
            <p className="text-2xl font-bold mt-1">{holdings.length} Emiten</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Holdings</h2>
            <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Tambah Saham
            </Button>
          </div>

          {holdings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-600 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <TrendingUp className="w-12 h-12 mb-3" />
              <p className="font-medium">Belum ada portofolio saham</p>
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead>Ticker</TableHead>
                    <TableHead className="text-right">Lot</TableHead>
                    <TableHead className="text-right">Avg Price</TableHead>
                    <TableHead className="text-right">Harga Skrg</TableHead>
                    <TableHead className="text-right">Nilai</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enriched.map(h => (
                    <TableRow key={h.id}>
                      <TableCell>
                        <div>
                          <p className="font-bold text-sm">{h.ticker}</p>
                          {h.companyName && <p className="text-xs text-slate-500">{h.companyName}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{h.lots}</TableCell>
                      <TableCell className="text-right text-sm">{formatIDR(h.avgPrice)}</TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm">{formatIDR(h.curPrice)}</div>
                        {h.changePercent !== undefined && (
                          <div className={`text-xs flex items-center justify-end gap-0.5 ${h.changePercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {h.changePercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {h.changePercent >= 0 ? '+' : ''}{h.changePercent.toFixed(2)}%
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatIDR(h.currentValue)}</TableCell>
                      <TableCell className="text-right">
                        <div className={`text-sm font-semibold ${h.pnl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {h.pnl >= 0 ? '+' : ''}{formatIDR(h.pnl)}
                        </div>
                        <div className={`text-xs ${h.pnlPct >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                          {h.pnlPct >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <button onClick={() => startTransition(async () => { void deleteHolding(h.id); })} disabled={isPending}
                          className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Sector Pie */}
        <div>
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Alokasi Sektor</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatIDR(v)} />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">Belum ada data sektor</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Saham</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            {[
              { key: 'ticker', label: 'Ticker (e.g. BBCA.JK)', placeholder: 'BBCA.JK', required: true },
              { key: 'company_name', label: 'Nama Perusahaan', placeholder: 'Bank Central Asia' },
              { key: 'lot_quantity', label: 'Jumlah Lot', placeholder: '10', required: true, type: 'number' },
              { key: 'avg_buy_price', label: 'Harga Beli Rata-rata', placeholder: '8750', required: true, type: 'number' },
              { key: 'broker', label: 'Broker', placeholder: 'Mirae, IPOT, dll.' },
              { key: 'sector', label: 'Sektor', placeholder: 'Perbankan, Teknologi...' },
            ].map(f => (
              <div key={f.key} className="space-y-1">
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input id={f.key} type={f.type ?? 'text'} placeholder={f.placeholder} required={f.required}
                  value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="bg-white dark:bg-slate-800" />
              </div>
            ))}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
