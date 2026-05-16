'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, User, Loader2 } from 'lucide-react';
import { sendChatMessage } from '@/app/(app)/ai-advisor/actions';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
};

export function ChatInterface({ initialHistory }: { initialHistory: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialHistory);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, createdAt: new Date() };
    setMessages(p => [...p, userMsg]);
    setInput('');

    startTransition(async () => {
      const res = await sendChatMessage(userMsg.content);
      if (res?.error) {
        setMessages(p => [...p, { id: Date.now().toString(), role: 'assistant', content: '⚠️ Maaf, terjadi kesalahan: ' + res.error, createdAt: new Date() }]);
      } else {
        // Refresh page to get actual DB messages (or we could return it from action, but refreshing is simpler to stay in sync)
        window.location.reload();
      }
    });
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)] border-0 shadow-md overflow-hidden bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-inner">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">FinTrack AI Advisor</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* Chat Area */}
      <CardContent className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30 dark:bg-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto text-slate-500">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center mb-4 rotate-12 transition-transform hover:rotate-0">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-2">Halo! Saya AI Advisor Anda.</h3>
            <p className="text-sm">Saya sudah menganalisis data keuangan Anda. Tanyakan apa saja tentang budget, investasi, atau tips berhemat bulan ini!</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center mt-1 ${m.role === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                {m.role === 'user' ? <User className="w-4 h-4 text-slate-600 dark:text-slate-300" /> : <Sparkles className="w-4 h-4 text-white" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-tl-none'}`}>
                <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            </div>
          ))
        )}
        {isPending && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex shrink-0 items-center justify-center mt-1">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-tl-none flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </CardContent>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSend} className="relative flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pertanyaan keuangan Anda..."
            className="pr-14 py-6 rounded-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
            disabled={isPending}
          />
          <Button 
            type="submit" 
            size="icon"
            className="absolute right-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white w-10 h-10"
            disabled={!input.trim() || isPending}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </Button>
        </form>
      </div>
    </Card>
  );
}
