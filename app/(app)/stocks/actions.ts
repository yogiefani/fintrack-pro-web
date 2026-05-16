'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { stockHoldings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { stockHoldingSchema } from '@/lib/validations/schemas';

export async function createHolding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const parsed = stockHoldingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { ticker, company_name, lot_quantity, avg_buy_price, buy_date, broker, sector, notes } = parsed.data;

  await db.insert(stockHoldings).values({
    userId: user.id,
    ticker: ticker.toUpperCase(),
    companyName: company_name ?? null,
    lotQuantity: lot_quantity.toString(),
    avgBuyPrice: avg_buy_price.toString(),
    buyDate: buy_date ? new Date(buy_date) : null,
    broker: broker ?? null,
    sector: sector ?? null,
    notes: notes ?? null,
  });

  revalidatePath('/stocks');
  return { success: true };
}

export async function deleteHolding(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  await db.delete(stockHoldings).where(and(eq(stockHoldings.id, id), eq(stockHoldings.userId, user.id)));
  revalidatePath('/stocks');
  return { success: true };
}
