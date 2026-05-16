import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { categories } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Missing env vars');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

const defaultCategories = [
  // Expense
  { name: 'Makanan & Minuman', type: 'expense' as const, icon: '🍔', color: '#f59e0b', isDefault: true },
  { name: 'Transportasi', type: 'expense' as const, icon: '🚗', color: '#3b82f6', isDefault: true },
  { name: 'Belanja', type: 'expense' as const, icon: '🛍️', color: '#ec4899', isDefault: true },
  { name: 'Tagihan & Utilitas', type: 'expense' as const, icon: '📄', color: '#8b5cf6', isDefault: true },
  { name: 'Hiburan', type: 'expense' as const, icon: '🎬', color: '#10b981', isDefault: true },
  { name: 'Kesehatan', type: 'expense' as const, icon: '⚕️', color: '#ef4444', isDefault: true },
  { name: 'Pendidikan', type: 'expense' as const, icon: '📚', color: '#6366f1', isDefault: true },
  // Income
  { name: 'Gaji', type: 'income' as const, icon: '💰', color: '#10b981', isDefault: true },
  { name: 'Bonus', type: 'income' as const, icon: '🎁', color: '#f59e0b', isDefault: true },
  { name: 'Investasi', type: 'income' as const, icon: '📈', color: '#3b82f6', isDefault: true },
  { name: 'Lainnya', type: 'income' as const, icon: '💵', color: '#64748b', isDefault: true },
];

async function seedCategories() {
  console.log('Menambahkan kategori default...');
  
  // Check if defaults exist
  const existing = await db.select().from(categories).where(eq(categories.isDefault, true));
  if (existing.length > 0) {
    console.log('Kategori default sudah ada di database.');
    process.exit(0);
  }

  try {
    for (const cat of defaultCategories) {
      await db.insert(categories).values(cat);
    }
    console.log('✅ Berhasil menambahkan', defaultCategories.length, 'kategori default!');
  } catch (err: unknown) {
    console.error('❌ Gagal menambahkan kategori:', err.message);
  }

  process.exit(0);
}

seedCategories();
