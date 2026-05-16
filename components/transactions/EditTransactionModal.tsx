'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TransactionForm } from './TransactionForm';
import { updateTransaction } from '@/app/(app)/transactions/actions';

type Category = { id: string; name: string; type: 'income' | 'expense' };
type Tx = { id: string; description: string; amount: any; type: string; currency: string; date: Date; categoryName?: string | null };

export function EditTransactionModal({
  transaction,
  categories,
  open,
  onOpenChange,
}: {
  transaction: Tx;
  categories: Category[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaksi</DialogTitle>
        </DialogHeader>
        <TransactionForm
          categories={categories}
          initialValues={{
            description: transaction.description,
            amount: Number(transaction.amount),
            type: transaction.type as 'income' | 'expense',
            currency: transaction.currency,
            date: new Date(transaction.date).toISOString().split('T')[0],
          }}
          onSuccess={() => onOpenChange(false)}
          action={(fd) => updateTransaction(transaction.id, fd)}
        />
      </DialogContent>
    </Dialog>
  );
}
