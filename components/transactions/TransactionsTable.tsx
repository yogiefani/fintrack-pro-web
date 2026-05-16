'use client';

import { useState, useTransition } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Search, MoreHorizontal, Edit, Trash, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { deleteTransaction } from '@/app/(app)/transactions/actions';
import { EditTransactionModal } from './EditTransactionModal';

type Tx = {
  id: string;
  amount: any;
  type: string;
  currency: string;
  description: string;
  date: Date;
  categoryName?: string | null;
};

type Category = { id: string; name: string; type: 'income' | 'expense' };

export function TransactionsTable({ initialData, categories }: { initialData: Tx[]; categories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [editTx, setEditTx] = useState<Tx | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = initialData.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.categoryName ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatIDR = (amount: any, currency: string) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: currency ?? 'IDR', maximumFractionDigits: 0 }).format(Number(amount));

  const handleDelete = (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    startTransition(async () => { void deleteTransaction(id); });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari transaksi atau kategori..."
            className="pl-9 bg-white dark:bg-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter((v ?? 'all') as any)}>
          <SelectTrigger className="w-full sm:w-44 bg-white dark:bg-slate-900">
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="income">Pemasukan</SelectItem>
            <SelectItem value="expense">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  {searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : 'Belum ada transaksi.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((trx) => (
                <TableRow key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableCell className="font-medium text-sm">
                    {format(new Date(trx.date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{trx.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal text-xs">
                      {trx.categoryName || 'Lainnya'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs border-0 font-medium ${
                      trx.type === 'income'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {trx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-semibold text-sm ${trx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    {trx.type === 'income' ? '+' : '-'}{formatIDR(trx.amount, trx.currency)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditTx(trx)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(trx.id)} className="text-red-600 dark:text-red-400 cursor-pointer">
                          <Trash className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-slate-400">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length} transaksi
        </p>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Halaman {currentPage} dari {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      {editTx && (
        <EditTransactionModal
          transaction={editTx}
          categories={categories}
          open={!!editTx}
          onOpenChange={(v) => { if (!v) setEditTx(null); }}
        />
      )}
    </div>
  );
}
