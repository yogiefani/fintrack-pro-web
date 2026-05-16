const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY!;

export interface StockQuote {
  ticker: string;
  currentPrice: number;
  changePercent: number;
  companyName?: string;
}

export async function getStockQuote(ticker: string): Promise<StockQuote | null> {
  try {
    const url = `${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 300 } }); // 5-min cache
    if (!res.ok) return null;
    const data = await res.json();
    const q = data['Global Quote'];
    if (!q || !q['05. price']) return null;
    return {
      ticker,
      currentPrice: parseFloat(q['05. price']),
      changePercent: parseFloat(q['10. change percent']?.replace('%', '') || '0'),
    };
  } catch {
    return null;
  }
}

export async function getMultipleQuotes(tickers: string[]): Promise<Record<string, StockQuote>> {
  const results = await Promise.allSettled(tickers.map(t => getStockQuote(t)));
  const map: Record<string, StockQuote> = {};
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      map[tickers[i]] = r.value;
    }
  });
  return map;
}
