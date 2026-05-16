import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { borderBottom: '2 solid #3b82f6', paddingBottom: 15, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 5 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', borderBottom: '1 solid #e2e8f0', paddingBottom: 5, marginBottom: 10, color: '#0f172a' },
  row: { flexDirection: 'row', borderBottom: '1 solid #f1f5f9', paddingVertical: 6 },
  col1: { width: '15%' },
  col2: { width: '40%' },
  col3: { width: '25%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  bold: { fontWeight: 'bold' },
  income: { color: '#10b981' },
  expense: { color: '#ef4444' },
  summaryBox: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 15, borderRadius: 5, marginBottom: 20 },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 10, color: '#64748b', marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
});

type ReportData = {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  transactions: { id: string; date: Date; description: string; amount: number; type: string; categoryName: string }[];
};

export function FinancialReportPDF({ data }: { data: ReportData }) {
  const formatIDR = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Laporan Keuangan FinTrack</Text>
          <Text style={styles.subtitle}>
            Periode: {format(new Date(data.year, data.month - 1), 'MMMM yyyy', { locale: idLocale })}
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Pemasukan</Text>
            <Text style={[styles.summaryValue, styles.income]}>{formatIDR(data.totalIncome)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Pengeluaran</Text>
            <Text style={[styles.summaryValue, styles.expense]}>{formatIDR(data.totalExpense)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net Income</Text>
            <Text style={styles.summaryValue}>{formatIDR(data.netIncome)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daftar Transaksi</Text>
          <View style={[styles.row, { backgroundColor: '#f1f5f9', fontWeight: 'bold', borderBottom: 'none' }]}>
            <Text style={styles.col1}>Tanggal</Text>
            <Text style={styles.col2}>Deskripsi</Text>
            <Text style={styles.col3}>Kategori</Text>
            <Text style={styles.col4}>Jumlah</Text>
          </View>

          {data.transactions.length === 0 ? (
            <Text style={{ padding: 10, textAlign: 'center', color: '#94a3b8' }}>Tidak ada transaksi di periode ini.</Text>
          ) : (
            data.transactions.map((t) => (
              <View key={t.id} style={styles.row}>
                <Text style={styles.col1}>{format(new Date(t.date), 'dd/MM/yy')}</Text>
                <Text style={styles.col2}>{t.description}</Text>
                <Text style={styles.col3}>{t.categoryName}</Text>
                <Text style={[styles.col4, t.type === 'income' ? styles.income : styles.expense]}>
                  {t.type === 'income' ? '+' : '-'}{formatIDR(t.amount)}
                </Text>
              </View>
            ))
          )}
        </View>
        <Text style={{ position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#94a3b8', fontSize: 8 }}>
          Digenerate oleh FinTrack App pada {format(new Date(), 'dd MMMM yyyy HH:mm', { locale: idLocale })}
        </Text>
      </Page>
    </Document>
  );
}
