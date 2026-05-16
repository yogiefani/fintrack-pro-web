import * as dotenv from 'dotenv';
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error('Missing DATABASE_URL'); process.exit(1); }

const sql = postgres(connectionString);

async function run() {
  console.log('🔧 Membuat trigger auto-profile di Supabase...');
  try {
    const script = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'create-profile-trigger.sql'),
      'utf-8'
    );
    await sql.unsafe(script);
    console.log('✅ Trigger berhasil dibuat!');
    console.log('   Sekarang setiap user baru yang daftar akan otomatis masuk ke tabel profiles.');
  } catch (err: unknown) {
    console.error('❌ Gagal:', err.message);
  }
  process.exit(0);
}

run();
