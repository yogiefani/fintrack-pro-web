import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

export function NetWorthCard({ amount = 0 }: { amount?: number }) {
  const isPositive = amount >= 0;
  const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg border-0 overflow-hidden relative">
      <div className="absolute -right-6 -top-6 text-white/10">
        <Wallet className="w-32 h-32" />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-blue-100 text-sm font-medium">Total Kekayaan (Net Worth)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-bold tracking-tight">{formattedAmount}</div>
            <div className="flex items-center mt-2 text-sm text-blue-100">
              <span className={`flex items-center px-2 py-0.5 rounded-full mr-2 ${isPositive ? 'bg-white/20' : 'bg-red-500/50'}`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                100%
              </span>
              Net Worth Keseluruhan
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
