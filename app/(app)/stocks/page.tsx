import { StockPortfolio } from '@/components/stocks/StockPortfolio';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { stockHoldings, stockPricesCache } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

export default async function StocksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const holdings = await db.select().from(stockHoldings).where(eq(stockHoldings.userId, user.id));

  // Get cached prices for all tickers
  const tickers = [...new Set(holdings.map(h => h.ticker))];
  const prices = tickers.length > 0
    ? await db.select().from(stockPricesCache).where(inArray(stockPricesCache.ticker, tickers))
    : [];
  const priceMap = Object.fromEntries(prices.map(p => [p.ticker, { currentPrice: parseFloat(p.currentPrice), changePercent: parseFloat(p.changePercent ?? '0') }]));

  const enriched = holdings.map(h => ({
    ...h,
    currentPrice: priceMap[h.ticker]?.currentPrice,
    changePercent: priceMap[h.ticker]?.changePercent,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portofolio Saham</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Monitor nilai dan P&L portofolio investasi Anda secara real-time.
        </p>
      </div>
      <StockPortfolio holdings={enriched} />
    </div>
  );
}
