import * as dotenv from 'dotenv';
import postgres from 'postgres';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Missing env vars');
  process.exit(1);
}

const sql = postgres(connectionString);

async function alterEnum() {
  console.log('Menambahkan enum...');
  try {
    await sql`ALTER TYPE role ADD VALUE IF NOT EXISTS 'app_admin'`;
    await sql`ALTER TYPE role ADD VALUE IF NOT EXISTS 'manager'`;
    console.log('✅ Berhasil menambahkan enum!');
  } catch (err: unknown) {
    console.error(`❌ Gagal alter enum:`, err.message);
  }
  process.exit(0);
}

alterEnum();
