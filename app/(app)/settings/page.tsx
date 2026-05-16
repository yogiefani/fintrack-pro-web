import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { categories, profiles } from '@/lib/db/schema';
import { eq, or, isNull } from 'drizzle-orm';
import { CategoryManager } from '@/components/settings/CategoryManager';
import { ProfileManager } from '@/components/settings/ProfileManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [rawCategories, userProfile] = await Promise.all([
    db
      .select()
      .from(categories)
      .where(or(eq(categories.userId, user.id), isNull(categories.userId)))
      .orderBy(categories.name),
    db
      .select({ fullName: profiles.fullName, email: profiles.email, role: profiles.role })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)
  ]);

  // Parse for client component
  const allCategories = rawCategories.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    icon: c.icon,
    color: c.color,
    isDefault: c.isDefault,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Kelola preferensi akun dan personalisasi aplikasi Anda.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="profile">Profil Akun</TabsTrigger>
          <TabsTrigger value="categories">Kategori Custom</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-0">
          <ProfileManager currentName={userProfile[0]?.fullName ?? ''} currentEmail={userProfile[0]?.email ?? ''} />
        </TabsContent>
        <TabsContent value="categories" className="mt-0">
          <CategoryManager 
            categories={allCategories} 
            isAdmin={userProfile[0]?.role === 'super_admin' || userProfile[0]?.role === 'app_admin'} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
