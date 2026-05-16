'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowRightLeft,
  PieChart,
  PiggyBank,
  TrendingUp,
  HandCoins,
  FileText,
  Sparkles,
  Settings,
  RefreshCw,
  Shield,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transaksi', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Budget', href: '/budget', icon: PieChart },
  { name: 'Tabungan', href: '/savings', icon: PiggyBank },
  { name: 'Saham', href: '/stocks', icon: TrendingUp },
  { name: 'Hutang', href: '/debts', icon: HandCoins },
  { name: 'Langganan', href: '/subscriptions', icon: RefreshCw },
  { name: 'Laporan', href: '/reports', icon: FileText },
  { name: 'AI Advisor', href: '/ai-advisor', icon: Sparkles },
  { name: 'Pengaturan', href: '/settings', icon: Settings },
  { name: 'Admin Panel', href: '/admin', icon: Shield, roles: ['super_admin', 'app_admin', 'manager'] },
];

export function Sidebar({ role = 'member' }: { role?: string }) {
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(item => !item.roles || item.roles.includes(role));

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <div className="flex flex-col flex-grow bg-slate-900 border-r border-slate-800 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">FinTrack<span className="text-blue-500">.</span></h1>
          </div>
          <div className="mt-8 flex-1 flex flex-col px-4">
            <nav className="flex-1 space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto pt-4 border-t border-slate-800">
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
                >
                  <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-slate-400 group-hover:text-white" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center px-2 pb-safe">
        {filteredNavigation.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
