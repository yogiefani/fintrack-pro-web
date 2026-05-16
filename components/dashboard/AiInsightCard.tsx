import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function AiInsightCard() {
  return (
    <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md border-0 group relative overflow-hidden h-full">
      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <h3 className="font-semibold text-white">Gemini Insight</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          &quot;Halo! Saya AI Advisor Anda. Berdasarkan aktivitas finansial Anda bulan ini, pengeluaran terbesar Anda ada di kategori Makanan. Apakah Anda ingin tips berhemat?&quot;
        </p>
        </div>
        <Link href="/ai-advisor" className="mt-4 text-xs font-semibold uppercase tracking-wider text-yellow-300 hover:text-white transition-colors flex items-center">
          Tanya AI Advisor &rarr;
        </Link>
      </CardContent>
    </Card>
  );
}
