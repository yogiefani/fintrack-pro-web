'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FinancialReportPDF } from '@/components/reports/FinancialReportPDF';
import { FileText, Download, Loader2, Table } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

type Tx = { id: string; date: Date; description: string; amount: number; type: string; categoryName: string };

export function ReportGenerator({ transactions }: { transactions: Tx[] }) {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const YEARS = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - i));

  // Filter data
  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year);
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netIncome = totalIncome - totalExpense;

  const reportData = {
    month: parseInt(month),
    year: parseInt(year),
    totalIncome,
    totalExpense,
    netIncome,
    transactions: filtered,
  };

  const handleDownloadCSV = () => {
    if (filtered.length === 0) {
      alert('Tidak ada transaksi di periode ini.');
      return;
    }

    const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah'];
    const rows = filtered.map(t => [
      format(new Date(t.date), 'yyyy-MM-dd'),
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.categoryName}"`,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.amount
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FinTrack-Data-${MONTHS[parseInt(month) - 1]}-${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Generate Laporan PDF</h2>
              <p className="text-sm text-slate-500">Pilih periode laporan keuangan bulanan.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Bulan</label>
              <Select value={month} onValueChange={(v) => setMonth(v ?? String(now.getMonth() + 1))}>
                <SelectTrigger className="bg-white dark:bg-slate-900"><SelectValue /></SelectTrigger>
                <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tahun</label>
              <Select value={year} onValueChange={(v) => setYear(v ?? String(now.getFullYear()))}>
                <SelectTrigger className="bg-white dark:bg-slate-900"><SelectValue /></SelectTrigger>
                <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <PDFDownloadLink
            document={<FinancialReportPDF data={reportData} />}
            fileName={`FinTrack-Report-${MONTHS[parseInt(month) - 1]}-${year}.pdf`}
            className="block w-full"
          >
            {({ loading }) => (
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                {loading ? 'Menyiapkan PDF...' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>

          <Button 
            variant="outline" 
            className="w-full mt-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" 
            onClick={handleDownloadCSV}
          >
            <Table className="mr-2 h-4 w-4 text-emerald-600" />
            Download Excel (CSV)
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-slate-50 dark:bg-slate-900">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 text-slate-700 dark:text-slate-300">Pratinjau Data ({MONTHS[parseInt(month) - 1]} {year})</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-sm text-slate-500">Total Transaksi</span>
              <span className="font-medium">{filtered.length} transaksi</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-sm text-slate-500">Pemasukan</span>
              <span className="font-medium text-emerald-600">Rp {totalIncome.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-sm text-slate-500">Pengeluaran</span>
              <span className="font-medium text-red-500">Rp {totalExpense.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center py-2 pt-4">
              <span className="font-semibold">Net Income</span>
              <span className={`font-bold text-lg ${netIncome >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                Rp {netIncome.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
