import { ChatInterface } from '@/components/ai/ChatInterface';
import { getChatHistory } from '@/app/(app)/ai-advisor/actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AiAdvisorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const history = await getChatHistory();
  
  // Format for the client component
  const formattedHistory = history.map(h => ({
    id: h.id,
    role: h.role as 'user' | 'assistant',
    content: h.content,
    createdAt: h.createdAt
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Financial Advisor</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Konsultasikan kondisi keuangan Anda dengan asisten cerdas yang membaca data finansial Anda secara real-time.
        </p>
      </div>
      
      <ChatInterface initialHistory={formattedHistory} />
    </div>
  );
}
