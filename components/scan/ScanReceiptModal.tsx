'use client';

import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Upload, ScanLine, RefreshCw, CheckCircle,
  ImageIcon, Loader2, AlertCircle, X
} from 'lucide-react';
import { format } from 'date-fns';
import { createTransaction } from '@/app/(app)/transactions/actions';
import type { ReceiptScanResult } from '@/lib/gemini';

type Category = { id: string; name: string; type: 'income' | 'expense' };

interface ScanReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
}

type ScanStep = 'upload' | 'scanning' | 'review' | 'savingTx';

function ConfidenceBadge({ score }: { score: number }) {
  if (score >= 0.8) return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Tinggi ✓</Badge>;
  if (score >= 0.5) return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Sedang</Badge>;
  return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Rendah</Badge>;
}

export function ScanReceiptModal({ open, onOpenChange, categories }: ScanReceiptModalProps) {
  const [step, setStep] = useState<ScanStep>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editedResult, setEditedResult] = useState<ReceiptScanResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setImageFile(file);
    setError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }, []);

  const handleScan = async () => {
    if (!imageFile) return;
    setStep('scanning');
    setError(null);

    try {
      const fd = new FormData();
      fd.append('image', imageFile);

      const res = await fetch('/api/scan-receipt', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setEditedResult(data);
      setStep('review');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses gambar');
      setStep('upload');
    }
  };

  const handleConfirm = async () => {
    if (!editedResult) return;
    setIsSaving(true);

    const fd = new FormData();
    fd.set('type', 'expense');
    fd.set('amount', String(editedResult.total_amount));
    fd.set('currency', editedResult.currency || 'IDR');
    fd.set('description', editedResult.merchant_name || 'Scan Nota');
    fd.set('date', editedResult.date || format(new Date(), 'yyyy-MM-dd'));
    fd.set('is_recurring', 'false');
    if (selectedCategory) fd.set('category_id', selectedCategory);

    await createTransaction(fd);
    setIsSaving(false);
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setStep('upload');
    setPreviewUrl(null);
    setImageFile(null);
    setScanResult(null);
    setEditedResult(null);
    setSelectedCategory('');
    setError(null);
    setIsDragging(false);
    setIsSaving(false);
  };

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleReset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-purple-600" />
            Scan Nota / Invoice
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1: Upload */}
        {(step === 'upload' || step === 'scanning') && (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {!previewUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Drag & drop gambar nota
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      atau klik untuk pilih dari perangkat
                    </p>
                    <p className="text-xs text-slate-400 mt-2">PNG, JPG, WEBP — Max 10MB</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview nota" className="w-full max-h-64 object-contain bg-slate-50 dark:bg-slate-900" />
                {step !== 'scanning' && (
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 rounded-full bg-white dark:bg-slate-800 shadow p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <X className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()} disabled={step === 'scanning'}>
                <ImageIcon className="mr-2 h-4 w-4" /> Pilih Gambar
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleScan}
                disabled={!imageFile || step === 'scanning'}
              >
                {step === 'scanning' ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memindai dengan AI...</>
                ) : (
                  <><ScanLine className="mr-2 h-4 w-4" /> Scan Sekarang</>
                )}
              </Button>
            </div>

            {step === 'scanning' && (
              <div className="text-center space-y-2 py-4">
                <div className="flex justify-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gemini AI sedang membaca nota Anda...</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Review */}
        {step === 'review' && editedResult && (
          <div className="space-y-4">
            {/* Confidence + Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Akurasi:</span>
                <ConfidenceBadge score={editedResult.confidence_score} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep('upload')} className="text-slate-500 hover:text-slate-700">
                <RefreshCw className="mr-1 h-3.5 w-3.5" /> Scan Ulang
              </Button>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Merchant</Label>
                <Input
                  value={editedResult.merchant_name}
                  onChange={(e) => setEditedResult(p => p ? { ...p, merchant_name: e.target.value } : p)}
                  className="bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Tanggal</Label>
                <Input
                  type="date"
                  value={editedResult.date}
                  onChange={(e) => setEditedResult(p => p ? { ...p, date: e.target.value } : p)}
                  className="bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            </div>

            {/* Items Table */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-2">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-4 text-right">Total</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                {editedResult.items.map((item, idx) => (
                  <div key={idx} className="px-3 py-2 grid grid-cols-12 gap-2 items-center">
                    <input
                      value={item.name}
                      onChange={(e) => setEditedResult(p => {
                        if (!p) return p;
                        const items = [...p.items];
                        items[idx] = { ...items[idx], name: e.target.value };
                        return { ...p, items };
                      })}
                      className="col-span-6 text-sm bg-transparent border-b border-transparent focus:border-slate-300 dark:focus:border-slate-600 outline-none"
                    />
                    <span className="col-span-2 text-center text-sm text-slate-600 dark:text-slate-400">{item.quantity}x</span>
                    <input
                      type="number"
                      value={item.total_price}
                      onChange={(e) => setEditedResult(p => {
                        if (!p) return p;
                        const items = [...p.items];
                        items[idx] = { ...items[idx], total_price: Number(e.target.value) };
                        return { ...p, items };
                      })}
                      className="col-span-4 text-sm text-right bg-transparent border-b border-transparent focus:border-slate-300 dark:focus:border-slate-600 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Subtotal</span><span>{formatIDR(editedResult.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Pajak</span><span>{formatIDR(editedResult.tax_amount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <input
                  type="number"
                  value={editedResult.total_amount}
                  onChange={(e) => setEditedResult(p => p ? { ...p, total_amount: Number(e.target.value) } : p)}
                  className="text-right font-semibold bg-transparent border-b border-slate-300 dark:border-slate-600 outline-none w-36"
                />
              </div>
            </div>

            <Separator />

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Kategori Transaksi</Label>
              <Select onValueChange={(v: string | null) => setSelectedCategory(v ?? '')} value={selectedCategory}>
                <SelectTrigger className="bg-white dark:bg-slate-800">
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.type === 'expense').map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleReset}>Batal</Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleConfirm}
                disabled={isSaving}
              >
                {isSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><CheckCircle className="mr-2 h-4 w-4" /> Simpan Transaksi</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
