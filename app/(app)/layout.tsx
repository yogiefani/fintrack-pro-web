import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role || 'member';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar role={userRole} />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Navbar userName={profile?.full_name || user.email} />
        <main className="flex-1 pb-16 md:pb-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
