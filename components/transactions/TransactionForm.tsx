'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, type TransactionFormValues } from '@/lib/validations/schemas';
import { createTransaction, updateTransaction } from '@/app/(app)/transactions/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

type Category = { id: string; name: string; type: 'income' | 'expense' };

interface TransactionFormProps {
  categories: Category[];
  defaultValues?: Partial<TransactionFormValues> & { id?: string };
  initialValues?: { description: string; amount: number; type: 'income' | 'expense'; currency: string; date: string };
  onSuccess?: () => void;
  action?: (fd: FormData) => Promise<any>;
}

export function TransactionForm({ categories, defaultValues, initialValues, onSuccess, action }: TransactionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      type: 'expense',
      currency: 'IDR',
      date: format(new Date(), 'yyyy-MM-dd'),
      is_recurring: false,
      ...defaultValues,
      ...(initialValues ? {
        description: initialValues.description,
        amount: initialValues.amount,
        type: initialValues.type,
        currency: initialValues.currency,
        date: initialValues.date,
      } : {}),
    },
  });

  const selectedType = watch('type');
  const filteredCategories = categories.filter(
    (c) => c.type === selectedType || selectedType === 'transfer'
  );

  const onSubmit = (data: TransactionFormValues) => {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.set(k, String(v));
      });

      const result = action
        ? await action(formData)
        : defaultValues?.id
        ? await updateTransaction(defaultValues.id, formData)
        : await createTransaction(formData);

      if (result?.error) {
        setServerError(typeof result.error === 'string' ? result.error : 'Terjadi kesalahan validasi');
      } else {
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      {serverError && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
          {serverError}
        </div>
      )}

      {/* Type */}
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-3 gap-2">
            {(['income', 'expense', 'transfer'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => field.onChange(t)}
                className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                  field.value === t
                    ? t === 'income'
                      ? 'bg-green-600 text-white border-green-600'
                      : t === 'expense'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                {t === 'income' ? 'Pemasukan' : t === 'expense' ? 'Pengeluaran' : 'Transfer'}
              </button>
            ))}
          </div>
        )}
      />

      {/* Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="amount">Jumlah</Label>
        <div className="flex gap-2">
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value ?? 'IDR'}>
                <SelectTrigger className="w-24 bg-white dark:bg-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SGD">SGD</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0"
            className="bg-white dark:bg-slate-800"
            {...register('amount')}
          />
        </div>
        {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Deskripsi</Label>
        <Input
          id="description"
          placeholder="Contoh: Makan siang, Gaji bulanan..."
          className="bg-white dark:bg-slate-800"
          {...register('description')}
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>Kategori</Label>
        <Controller
          name="category_id"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value ?? undefined}>
              <SelectTrigger className="bg-white dark:bg-slate-800">
                <SelectValue placeholder="Pilih kategori..." />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-slate-500">Belum ada kategori</div>
                )}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="date">Tanggal</Label>
        <Input
          id="date"
          type="date"
          className="bg-white dark:bg-slate-800"
          {...register('date')}
        />
        {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {defaultValues?.id ? 'Simpan Perubahan' : 'Tambah Transaksi'}
      </Button>
    </form>
  );
}
