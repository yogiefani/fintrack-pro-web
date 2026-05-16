import { NextRequest, NextResponse } from 'next/server';
import { getStockQuote } from '@/lib/alpha-vantage';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { stockPricesCache } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ticker } = await params;
  const symbol = ticker.toUpperCase();

  // Check cache first (5 min TTL)
  const [cached] = await db.select().from(stockPricesCache).where(eq(stockPricesCache.ticker, symbol));
  if (cached) {
    const age = Date.now() - cached.lastUpdated.getTime();
    if (age < 5 * 60 * 1000) {
      return NextResponse.json({ ticker: symbol, currentPrice: cached.currentPrice, changePercent: cached.changePercent, cached: true });
    }
  }

  const quote = await getStockQuote(symbol);
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

  // Upsert into cache
  await db
    .insert(stockPricesCache)
    .values({ ticker: symbol, currentPrice: quote.currentPrice.toString(), changePercent: quote.changePercent.toString(), lastUpdated: new Date() })
    .onConflictDoUpdate({
      target: stockPricesCache.ticker,
      set: { currentPrice: quote.currentPrice.toString(), changePercent: quote.changePercent.toString(), lastUpdated: new Date() },
    });

  return NextResponse.json(quote);
}
