import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { profiles } from '../lib/db/schema';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const connectionString = process.env.DATABASE_URL;

if (!supabaseUrl || !serviceRoleKey || !connectionString) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const client = postgres(connectionString);
const db = drizzle(client);

async function fixProfiles() {
  console.log('Sinkronisasi auth.users ke public.profiles...');
  
  // 1. Ambil semua user dari auth.users
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Gagal mengambil users:', error);
    process.exit(1);
  }

  // 2. Insert ke tabel profiles
  for (const user of users) {
    try {
      await db.insert(profiles).values({
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0],
        role: user.user_metadata?.role || 'member',
      }).onConflictDoNothing();
      console.log(`✅ Profile untuk ${user.email} tersinkronisasi.`);
    } catch (err: unknown) {
      console.error(`❌ Gagal sinkronisasi ${user.email}:`, err.message);
    }
  }
  
  console.log('Selesai!');
  process.exit(0);
}

fixProfiles();
