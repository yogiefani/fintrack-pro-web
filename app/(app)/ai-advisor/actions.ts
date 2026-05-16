'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { aiConversations, transactions, budgets, savingGoals } from '@/lib/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getChatHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const history = await db.select()
    .from(aiConversations)
    .where(eq(aiConversations.userId, user.id))
    .orderBy(aiConversations.createdAt);

  return history;
}

export async function sendChatMessage(message: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // 1. Save user message
  await db.insert(aiConversations).values({
    userId: user.id,
    role: 'user',
    content: message,
  });

  // 2. Gather financial context (current month)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const txs = await db.select().from(transactions).where(and(eq(transactions.userId, user.id), gte(transactions.date, monthStart), lte(transactions.date, monthEnd)));
  const userBudgets = await db.select().from(budgets).where(and(eq(budgets.userId, user.id), eq(budgets.month, now.getMonth() + 1), eq(budgets.year, now.getFullYear())));
  const goals = await db.select().from(savingGoals).where(eq(savingGoals.userId, user.id));

  const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
  
  const financialContext = `
Data Keuangan User Bulan Ini:
- Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}
- Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}
- Total Budget Bulanan: Rp ${userBudgets.reduce((s, b) => s + parseFloat(b.amount), 0).toLocaleString('id-ID')}
- Jumlah Tujuan Tabungan Aktif: ${goals.filter(g => !g.isCompleted).length}
  `;

  // 3. Get recent history for context
  const rawHistory = await db.select().from(aiConversations)
    .where(eq(aiConversations.userId, user.id))
    .orderBy(desc(aiConversations.createdAt))
    .limit(10);
  
  const contents = rawHistory.reverse().map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // 4. Call Gemini API
  try {
    const systemInstruction = `Kamu adalah 'FinTrack AI', seorang penasihat keuangan pribadi (Financial Advisor) yang ramah, profesional, cerdas, dan suportif. 
Tugasmu adalah membantu user merencanakan keuangan, memberi tips berhemat, dan menganalisis pengeluaran mereka berdasarkan konteks yang diberikan. 
Selalu gunakan bahasa Indonesia yang santai tapi sopan (gunakan 'kamu' atau 'Anda' sesuai konteks, tapi konsisten ramah).
Gunakan formatting Markdown (bold, bullet points) agar jawaban mudah dibaca. Jawab dengan ringkas namun berbobot.
Berikut adalah data keuangan user saat ini: ${financialContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const aiText = response.text || "Maaf, saya tidak bisa memproses permintaan Anda saat ini.";

    // 5. Save AI response
    await db.insert(aiConversations).values({
      userId: user.id,
      role: 'assistant',
      content: aiText,
      contextSnapshot: { totalIncome, totalExpense }
    });

    return { success: true };
  } catch (err: any) {
    console.error('Gemini error:', err);
    return { error: 'Gagal terhubung ke AI Advisor.' };
  }
}
