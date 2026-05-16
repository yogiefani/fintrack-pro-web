'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { createCategory, deleteCategory } from '@/app/(app)/settings/actions';

type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  color: string | null;
  isDefault: boolean;
};

export function CategoryManager({ categories, isAdmin = false }: { categories: Category[], isAdmin?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [icon, setIcon] = useState('📝');
  const [color, setColor] = useState('#3b82f6');
  const [isSystem, setIsSystem] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const fd = new FormData();
    fd.set('name', name);
    fd.set('type', type);
    fd.set('icon', icon);
    fd.set('color', color);
    if (isAdmin) fd.set('isSystem', isSystem.toString());

    startTransition(async () => {
      await createCategory(fd);
      setName('');
      setIcon('📝');
      setIsSystem(false);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteCategory(id);
    });
  };

  return (
    <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle>Manajemen Kategori</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Add Form */}
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Nama Kategori</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Pulsa" required disabled={isPending} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipe</Label>
            <Select value={type} onValueChange={(v) => { if (v) setType(v as 'expense' | 'income'); }} disabled={isPending}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Pengeluaran</SelectItem>
                <SelectItem value="income">Pemasukan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 flex items-center gap-2">
            <div className="flex-1">
              <Label>Icon (Emoji)</Label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={2} disabled={isPending} />
            </div>
            <div>
              <Label>Warna</Label>
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 p-1 h-9 cursor-pointer" disabled={isPending} />
            </div>
          </div>
          <div className="flex flex-col justify-end gap-2">
            {isAdmin && (
              <div className="flex items-center gap-2 mb-1">
                <input 
                  type="checkbox" 
                  id="isSystem" 
                  checked={isSystem} 
                  onChange={(e) => setIsSystem(e.target.checked)} 
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isSystem" className="text-xs text-slate-500 cursor-pointer">Buat Default Sistem</Label>
              </div>
            )}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending || !name}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Tambah
            </Button>
          </div>
        </form>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold mb-3 text-slate-500 uppercase tracking-wider">Kategori Pengeluaran</h3>
            <div className="space-y-2">
              {categories.filter(c => c.type === 'expense').map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: `${c.color}20`, color: c.color || '#fff' }}>
                      {c.icon}
                    </div>
                    <span className="font-medium">{c.name}</span>
                    {c.isDefault && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">Default Sistem</span>}
                  </div>
                  {(!c.isDefault || isAdmin) && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} disabled={isPending} className="h-8 w-8 text-slate-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-3 text-slate-500 uppercase tracking-wider">Kategori Pemasukan</h3>
            <div className="space-y-2">
              {categories.filter(c => c.type === 'income').map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: `${c.color}20`, color: c.color || '#fff' }}>
                      {c.icon}
                    </div>
                    <span className="font-medium">{c.name}</span>
                    {c.isDefault && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">Default Sistem</span>}
                  </div>
                  {(!c.isDefault || isAdmin) && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} disabled={isPending} className="h-8 w-8 text-slate-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
