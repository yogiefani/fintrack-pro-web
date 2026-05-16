'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, ScanLine } from 'lucide-react';
import { TransactionForm } from './TransactionForm';
import { ScanReceiptModal } from '@/components/scan/ScanReceiptModal';

type Category = { id: string; name: string; type: 'income' | 'expense' };

export function AddTransactionModal({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  return (
    <>
      {/* Scan Receipt Modal */}
      <ScanReceiptModal
        open={scanOpen}
        onOpenChange={setScanOpen}
        categories={categories}
      />

      {/* Manual Transaction Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setScanOpen(true)}
            className="bg-white dark:bg-slate-900 gap-2"
          >
            <ScanLine className="h-4 w-4 text-purple-600" />
            Scan Nota
          </Button>
          <DialogTrigger>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" type="button">
              <Plus className="h-4 w-4" />
              Transaksi Baru
            </Button>
          </DialogTrigger>
        </div>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Transaksi</DialogTitle>
          </DialogHeader>
          <TransactionForm
            categories={categories}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
