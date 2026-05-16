'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, KeyRound } from 'lucide-react';
import { updateProfile, updatePassword } from '@/app/(app)/settings/actions';

export function ProfileManager({ currentName, currentEmail }: { currentName: string; currentEmail: string }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(currentName || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set('full_name', name);
      const res = await updateProfile(fd);
      if (res?.error) setMsg({ type: 'error', text: res.error });
      else setMsg({ type: 'success', text: 'Profil berhasil diperbarui!' });
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (password !== confirmPassword) {
      setMsg({ type: 'error', text: 'Password konfirmasi tidak cocok!' });
      return;
    }
    if (password.length < 6) {
      setMsg({ type: 'error', text: 'Password minimal 6 karakter!' });
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set('password', password);
      const res = await updatePassword(fd);
      if (res?.error) setMsg({ type: 'error', text: res.error });
      else {
        setMsg({ type: 'success', text: 'Password berhasil diganti!' });
        setPassword('');
        setConfirmPassword('');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            <CardTitle>Profil Pengguna</CardTitle>
          </div>
          <CardDescription>Perbarui informasi akun Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email (Tidak bisa diubah)</Label>
              <Input value={currentEmail} disabled className="bg-slate-50 dark:bg-slate-800" />
            </div>
            <div className="space-y-1.5">
              <Label>Nama Lengkap</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required disabled={isPending} />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending || !name || name === currentName}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Simpan Profil'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-amber-500" />
            <CardTitle>Ganti Password</CardTitle>
          </div>
          <CardDescription>Ubah kata sandi untuk keamanan akun.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Password Baru</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isPending} minLength={6} placeholder="Minimal 6 karakter" />
            </div>
            <div className="space-y-1.5">
              <Label>Konfirmasi Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isPending} placeholder="Ulangi password baru" />
            </div>
            <Button type="submit" variant="secondary" className="w-full" disabled={isPending || !password || !confirmPassword}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {msg && (
        <div className={`md:col-span-2 p-4 rounded-lg text-sm text-center font-medium ${msg.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
          {msg.text}
        </div>
      )}
    </div>
  );
}
