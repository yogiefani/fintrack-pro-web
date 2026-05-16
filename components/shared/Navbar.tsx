'use client';

import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Navbar({ userName }: { userName?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 sm:text-sm bg-transparent outline-none"
            placeholder="Search transactions..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <span className="sr-only">Toggle Dark Mode</span>
            {mounted && theme === 'dark' ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
          
          <button type="button" className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200 dark:lg:bg-slate-700" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative">
            <div className="flex items-center gap-x-4 p-1.5 cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-900">
                {userName?.charAt(0) || 'U'}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="text-sm font-semibold leading-6 text-slate-900 dark:text-white" aria-hidden="true">
                  {userName || 'User'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
