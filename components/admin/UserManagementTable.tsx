'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { MoreHorizontal, ShieldAlert, Trash2, Edit, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUserRole, deleteUser } from '@/app/(app)/admin/actions';

type UserProfile = {
  id: string;
  email: string;
  fullName: string | null;
  role: 'super_admin' | 'app_admin' | 'manager' | 'member';
  createdAt: Date;
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  app_admin: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  member: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export function UserManagementTable({ users, isSuperAdmin }: { users: UserProfile[], isSuperAdmin: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [dialogMode, setDialogMode] = useState<'role' | 'delete' | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  const handleAction = (user: UserProfile, mode: 'role' | 'delete') => {
    setSelectedUser(user);
    setNewRole(user.role);
    setDialogMode(mode);
  };

  const submitRoleChange = () => {
    if (!selectedUser || newRole === selectedUser.role) {
      setDialogMode(null);
      return;
    }
    startTransition(async () => {
      const res = await updateUserRole(selectedUser.id, newRole as any);
      if (res?.error) alert(res.error);
      setDialogMode(null);
    });
  };

  const submitDelete = () => {
    if (!selectedUser) return;
    startTransition(async () => {
      const res = await deleteUser(selectedUser.id);
      if (res?.error) alert(res.error);
      setDialogMode(null);
    });
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="text-left py-3 px-4 font-medium text-slate-500">Pengguna</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Email</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Role</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Bergabung</th>
              {isSuperAdmin && <th className="w-[50px]"></th>}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {(u.fullName ?? u.email).charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{u.fullName ?? '—'}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-500">{u.email}</td>
                <td className="py-3 px-4">
                  <Badge className={`text-xs font-medium border-0 ${ROLE_COLORS[u.role]}`}>
                    {u.role.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-slate-500">
                  {format(new Date(u.createdAt), 'dd MMM yyyy', { locale: idLocale })}
                </td>
                {isSuperAdmin && (
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction(u, 'role')}>
                          <ShieldAlert className="mr-2 h-4 w-4" /> Ubah Role
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleAction(u, 'delete')}>
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogMode !== null} onOpenChange={(v) => !v && setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'role' ? 'Ubah Role Pengguna' : 'Hapus Pengguna'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'role' 
                ? `Pilih hak akses baru untuk ${selectedUser?.email}.` 
                : `Tindakan ini tidak bisa dibatalkan. Menghapus ${selectedUser?.email} akan menghilangkan semua data finansial mereka.`}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === 'role' && (
            <div className="py-4">
              <Select value={newRole} onValueChange={(v) => { if (v) setNewRole(v); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="app_admin">App Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)} disabled={isPending}>Batal</Button>
            {dialogMode === 'role' ? (
              <Button onClick={submitRoleChange} disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Simpan'}
              </Button>
            ) : (
              <Button onClick={submitDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700 text-white">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Ya, Hapus'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
