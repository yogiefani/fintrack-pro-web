import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const users = [
  { email: 'superadmin@fintrack.app', password: 'SuperAdmin@2', role: 'super_admin' },
  { email: 'appadmin@fintrack.app', password: 'AppAdmin@2', role: 'app_admin' },
  { email: 'manager@fintrack.app', password: 'Manager@2', role: 'manager' },
  { email: 'member@fintrack.app', password: 'Member@2', role: 'member' }
];

async function seed() {
  console.log('🌱 Menjalankan seed script...');
  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { role: u.role }
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`⚠️ User ${u.email} sudah ada.`);
      } else {
        console.error(`❌ Error membuat ${u.email}:`, error.message);
      }
    } else {
      console.log(`✅ Berhasil membuat user: ${u.email} (Role: ${u.role})`);
    }
  }
  console.log('✅ Seed selesai!');
}

seed();
