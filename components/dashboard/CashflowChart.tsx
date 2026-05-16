'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

type ChartData = { name: string; income: number; expense: number };

export function CashflowChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800 h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Cashflow (6 Bulan)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} className="text-slate-500" />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${value / 1000000}M`} className="text-slate-500" />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number | string | (number | string)[]) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0)}
              />
              <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
