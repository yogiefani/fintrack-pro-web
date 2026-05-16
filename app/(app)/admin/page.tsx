import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { profiles, transactions, aiConversations, debts } from '@/lib/db/schema';
import { sql, desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, MessageSquare, HandCoins, ShieldAlert } from 'lucide-react';
import { UserManagementTable } from '@/components/admin/UserManagementTable';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (!['super_admin', 'app_admin', 'manager'].includes(myProfile?.role)) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold">Akses Ditolak</h1>
        <p className="text-slate-500">Halaman ini hanya bisa diakses oleh Staff/Administrator.</p>
      </div>
    );
  }

  const [
    [{ userCount }],
    [{ txCount }],
    [{ aiCount }],
    [{ debtCount }],
    allUsers,
  ] = await Promise.all([
    db.select({ userCount: sql<number>`count(*)` }).from(profiles),
    db.select({ txCount: sql<number>`count(*)` }).from(transactions),
    db.select({ aiCount: sql<number>`count(*)` }).from(aiConversations),
    db.select({ debtCount: sql<number>`count(*)` }).from(debts),
    db.select({
      id: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
      role: profiles.role,
      createdAt: profiles.createdAt,
    }).from(profiles).orderBy(desc(profiles.createdAt)),
  ]);

  const stats = [
    { name: 'Total Pengguna', value: userCount, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Total Transaksi', value: txCount, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Interaksi AI', value: aiCount, icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: 'Catatan Hutang', value: debtCount, icon: HandCoins, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const isSuperAdmin = myProfile?.role === 'super_admin';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Pantau seluruh aktivitas dan pengguna sistem FinTrack.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-0 shadow-sm dark:bg-slate-900">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <h3 className="text-2xl font-bold">{Number(stat.value).toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Management Table */}
      {myProfile?.role !== 'manager' && (
        <Card className="border-0 shadow-md dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Manajemen Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <UserManagementTable users={allUsers as any} isSuperAdmin={isSuperAdmin} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
