import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PieChart, Shield, TrendingUp, Wallet } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans selection:bg-blue-500/30">
      {/* Navbar */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">FinTrack</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#features" className="hover:text-white transition-colors">Fitur</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">Cara Kerja</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
              Masuk
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0">
              Mulai Gratis
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-blue-300 mb-8 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          FinTrack Pro v2.0 Tersedia
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-8">
          Kendalikan Keuangan Anda dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Kecerdasan AI</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Satu aplikasi untuk melacak pengeluaran bulanan, mengelola portofolio investasi, mencatat hutang piutang, hingga scan nota cerdas menggunakan Google Gemini AI.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/login">
            <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full group">
              Coba Sekarang 
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/20 hover:bg-white/5">
            Lihat Demo
          </Button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-32 text-left">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <PieChart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Manajemen Budget</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Pantau batas pengeluaran bulanan per kategori dan raih tujuan tabungan impian Anda tepat waktu.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Portofolio Saham</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Monitor nilai aset dan P&L investasi saham Anda secara real-time terintegrasi dengan Alpha Vantage.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Scan Nota AI</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Unggah foto nota dan biarkan Gemini AI mengekstrak data item dan total belanja secara instan.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
