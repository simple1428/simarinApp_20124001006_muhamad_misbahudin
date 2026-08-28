import { useState, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import {
    Download,
    Printer,
    Copy,
    Check,
    TrendingUp,
    Award,
    SlidersHorizontal,
    Table as TableIcon,
    FileSpreadsheet,
    Layers,
    BookOpen,
    Search,
    Filter,
    HelpCircle,
    BarChart3
} from 'lucide-react';

interface ComparisonRow {
    no: number;
    periode_key: string;
    periode_label: string;
    periode_short: string;
    bulan: number;
    tahun: number;
    aktual: number;
    sma_val: number | null;
    sma_diff: number | null;
    sma_abs_diff: number | null;
    sma_ape: number | null;
    hw_val: number | null;
    hw_diff: number | null;
    hw_abs_diff: number | null;
    hw_ape: number | null;
    winner: 'HW' | 'SMA' | 'EQUAL' | null;
}

interface ChartItem {
    periode: string;
    Aktual: number;
    SMA: number | null;
    HoltWinters: number | null;
}

interface ModelStats {
    name: string;
    shortName: string;
    mape: number;
    mae: number;
    rmse: number;
    evaluatedPeriods: number;
    lewis: {
        category: string;
        badge: string;
        desc: string;
    };
}

interface PageProps {
    comparisonRows: ComparisonRow[];
    chartData: ChartItem[];
    smaWindow: number;
    totalDataCount: number;
    summaryStats: {
        sma: ModelStats;
        hw: ModelStats;
        conclusion: {
            winner: string;
            mapeDiff: number;
            superiorityPercent: number;
            recommendationText: string;
        };
    };
}

export default function ComparisonPage({
    comparisonRows = [],
    chartData = [],
    smaWindow = 6,
    totalDataCount = 0,
    summaryStats,
}: PageProps) {
    const [copied, setCopied] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterWinner, setFilterWinner] = useState<'ALL' | 'HW' | 'SMA'>('ALL');
    const [activeTab, setActiveTab] = useState<'all' | 'chart' | 'table' | 'theory'>('all');

    // Handler ganti parameter SMA Window (3, 6, 12 bulan)
    const handleWindowChange = (newWindow: number) => {
        router.get(
            '/komparasi',
            { sma_window: newWindow },
            { preserveScroll: true, preserveState: true }
        );
    };

    // Filter baris tabel berdasarkan search & filter
    const filteredRows = useMemo(() => {
        return comparisonRows.filter((row) => {
            const matchSearch = row.periode_label.toLowerCase().includes(searchTerm.toLowerCase());
            const matchWinner =
                filterWinner === 'ALL' ||
                (filterWinner === 'HW' && row.winner === 'HW') ||
                (filterWinner === 'SMA' && row.winner === 'SMA');
            return matchSearch && matchWinner;
        });
    }, [comparisonRows, searchTerm, filterWinner]);

    // Export tabel ke format CSV (Excel)
    const handleExportCSV = () => {
        const headers = [
            'No',
            'Periode',
            'Data Aktual (At)',
            `Prediksi SMA-${smaWindow} (Ft)`,
            `Error SMA (At - Ft)`,
            `Abs Error SMA (|At - Ft|)`,
            `APE SMA (%)`,
            'Prediksi Holt-Winters (Ft)',
            'Error HW (At - Ft)',
            'Abs Error HW (|At - Ft|)',
            'APE HW (%)',
            'Metode Terbaik',
        ];

        const rows = comparisonRows.map((r) => [
            r.no,
            `"${r.periode_label}"`,
            r.aktual,
            r.sma_val ?? '-',
            r.sma_diff ?? '-',
            r.sma_abs_diff ?? '-',
            r.sma_ape !== null ? `${r.sma_ape}%` : '-',
            r.hw_val ?? '-',
            r.hw_diff ?? '-',
            r.hw_abs_diff ?? '-',
            r.hw_ape !== null ? `${r.hw_ape}%` : '-',
            r.winner === 'HW' ? 'Holt-Winters' : r.winner === 'SMA' ? 'SMA' : r.winner === 'EQUAL' ? 'Sama' : '-',
        ]);

        // Tambahkan baris rata-rata
        rows.push([
            '',
            '"RATA-RATA / METRIK GLOBAL"',
            '-',
            '-',
            '-',
            summaryStats?.sma?.mae ?? '-',
            `${summaryStats?.sma?.mape ?? '-'}%`,
            '-',
            '-',
            summaryStats?.hw?.mae ?? '-',
            `${summaryStats?.hw?.mape ?? '-'}%`,
            `Winner: ${summaryStats?.conclusion?.winner ?? '-'}`,
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,\uFEFF' +
            [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Tabel-Komparasi-SMA-vs-HoltWinters-SIMARIN.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Salin tabel teks TSV siap paste langsung ke MS Word / Google Docs
    const handleCopyWordTable = () => {
        let textToCopy = `No\tPeriode\tData Aktual (At)\tPrediksi SMA-${smaWindow}\t|Error SMA|\tAPE SMA (%)\tPrediksi Holt-Winters\t|Error HW|\tAPE HW (%)\tMetode Terbaik\n`;

        comparisonRows.forEach((r) => {
            textToCopy += `${r.no}\t${r.periode_label}\t${r.aktual.toLocaleString('id-ID')}\t${r.sma_val?.toLocaleString('id-ID') ?? '-'}\t${r.sma_abs_diff?.toLocaleString('id-ID') ?? '-'}\t${r.sma_ape !== null ? `${r.sma_ape}%` : '-'}\t${r.hw_val?.toLocaleString('id-ID') ?? '-'}\t${r.hw_abs_diff?.toLocaleString('id-ID') ?? '-'}\t${r.hw_ape !== null ? `${r.hw_ape}%` : '-'}\t${r.winner === 'HW' ? 'Holt-Winters' : r.winner === 'SMA' ? 'SMA' : '-'}\n`;
        });

        textToCopy += `\nRATA-RATA EVALUASI\t\t\t\tMAD: ${summaryStats?.sma?.mae?.toLocaleString('id-ID') ?? '-'}\tMAPE: ${summaryStats?.sma?.mape ?? '-'}%\t\tMAD: ${summaryStats?.hw?.mae?.toLocaleString('id-ID') ?? '-'}\tMAPE: ${summaryStats?.hw?.mape ?? '-'}%\tPemenang: ${summaryStats?.conclusion?.winner ?? '-'}\n`;

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            }).catch(() => fallbackCopyWord(textToCopy));
        } else {
            fallbackCopyWord(textToCopy);
        }
    };

    const fallbackCopyWord = (text: string) => {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            alert('Gagal menyalin tabel.');
        }
    };

    return (
        <>
            <Head title="Komparasi Metode Prediksi (SMA vs Holt-Winters) - SIMARIN" />

            <style>{`
                @media print {
                    header, .no-print { display: none !important; }
                    body, .page-wrapper { background: #ffffff !important; color: #000000 !important; }
                    .card-box { border: 1px solid #cbd5e1 !important; background: #ffffff !important; box-shadow: none !important; }
                    table { color: #000000 !important; border-collapse: collapse !important; }
                    th, td { border: 1px solid #94a3b8 !important; padding: 6px 8px !important; }
                    th { background: #f1f5f9 !important; color: #000000 !important; }
                    .text-emerald-400, .text-amber-400, .text-blue-400 { color: #000000 !important; font-weight: bold; }
                }
            `}</style>

            <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white page-wrapper">
                {/* ── TOPBAR NAVIGATION ── */}
                <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/20 border border-blue-400/30">
                            🚢
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-bold text-white tracking-tight">SIMARIN</h1>
                                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    Modul Skripsi Bab 4
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">Komparasi Evaluasi Metode: SMA vs Holt-Winters</p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap no-print">
                        <Link
                            href="/flowchart"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        >
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            Flowchart
                        </Link>
                        <Link
                            href="/lampiran-pengujian"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition"
                        >
                            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                            Lampiran
                        </Link>
                        <Link
                            href="/rekomendasi-armada"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition"
                        >
                            <span className="text-xs">🚢</span>
                            Rekomendasi Armada
                        </Link>
                        <Link
                            href="/demo-sidang"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 transition"
                        >
                            <span className="text-xs">🛡️</span>
                            Demo Sidang
                        </Link>
                        <button
                            onClick={handleCopyWordTable}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
                            title="Salin tabel ke clipboard agar langsung bisa di-paste ke MS Word"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                            {copied ? 'Tersalin untuk Word!' : 'Salin ke Word'}
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition active:scale-95"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            Unduh Excel (CSV)
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition active:scale-95"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Cetak PDF
                        </button>
                    </div>
                </header>

                {/* ── SUB-HEADER TABS ── */}
                <div className="bg-slate-900 border-b border-slate-800 px-4 lg:px-8 py-2 flex items-center justify-between no-print">
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                activeTab === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            Semua Tampilan
                        </button>
                        <button
                            onClick={() => setActiveTab('chart')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                                activeTab === 'chart'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            Grafik Saja
                        </button>
                        <button
                            onClick={() => setActiveTab('table')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                                activeTab === 'table'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <TableIcon className="w-3.5 h-3.5" />
                            Tabel Kesalahan
                        </button>
                        <button
                            onClick={() => setActiveTab('theory')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                                activeTab === 'theory'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            Rumus & Teori
                        </button>
                    </div>
                </div>

                {/* ── MAIN CONTENT ── */}
                <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
                    {/* BANNER REKOMENDASI SKRIPSI / HASIL AKHIR */}
                    <div className="card-box relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/40 p-6 shadow-xl">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                                    <Award className="w-4 h-4" />
                                    Kesimpulan Hasil Analisis Metode (Bab 4)
                                </div>
                                <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                                    Metode Unggulan: <span className="text-emerald-400">{summaryStats?.conclusion?.winner}</span>
                                </h2>
                                <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                                    {summaryStats?.conclusion?.recommendationText}
                                </p>
                            </div>

                            {/* Win Metric Badge */}
                            <div className="flex sm:flex-col items-center lg:items-end gap-3 bg-slate-900/60 lg:bg-transparent p-4 lg:p-0 rounded-xl border border-slate-800 lg:border-0 shrink-0">
                                <div className="text-right">
                                    <div className="text-xs text-slate-400">Keunggulan Akurasi HW vs SMA</div>
                                    <div className="text-2xl font-black text-emerald-400">
                                        +{summaryStats?.conclusion?.superiorityPercent}% Lebih Akurat
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        Selisih MAPE: {summaryStats?.conclusion?.mapeDiff}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HEAD-TO-HEAD COMPARISON METRIC CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Card 1: SMA */}
                        <div className="card-box rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-lg hover:border-amber-500/40 transition">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-md shadow-amber-500/50" />
                                    <h3 className="font-bold text-white text-base">Simple Moving Average</h3>
                                </div>
                                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    SMA-{smaWindow}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800">
                                <div>
                                    <div className="text-[11px] text-slate-400 uppercase font-medium">MAPE</div>
                                    <div className="text-lg font-extrabold text-amber-400">{summaryStats?.sma?.mape}%</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-slate-400 uppercase font-medium">MAD / MAE</div>
                                    <div className="text-lg font-extrabold text-slate-200">{summaryStats?.sma?.mae?.toLocaleString('id-ID')}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-slate-400 uppercase font-medium">RMSE</div>
                                    <div className="text-lg font-extrabold text-slate-200">{summaryStats?.sma?.rmse?.toLocaleString('id-ID')}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-slate-400">Kategori Lewis:</span>
                                <span className="px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    {summaryStats?.sma?.lewis?.category}
                                </span>
                            </div>
                        </div>

                        {/* Card 2: Holt-Winters */}
                        <div className="card-box rounded-xl bg-slate-900/90 border border-blue-700/50 p-5 space-y-4 shadow-lg ring-1 ring-blue-500/20 hover:border-blue-500 transition">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-md shadow-blue-500/50" />
                                    <h3 className="font-bold text-white text-base">Holt-Winters (Triple Exp.)</h3>
                                </div>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Terbaik 🏆
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800">
                                <div>
                                    <div className="text-[11px] text-slate-400 uppercase font-medium">MAPE</div>
                                    <div className="text-lg font-extrabold text-emerald-400">{summaryStats?.hw?.mape}%</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-slate-400 uppercase font-medium">MAD / MAE</div>
                                    <div className="text-lg font-extrabold text-slate-200">{summaryStats?.hw?.mae?.toLocaleString('id-ID')}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-slate-400 uppercase font-medium">RMSE</div>
                                    <div className="text-lg font-extrabold text-slate-200">{summaryStats?.hw?.rmse?.toLocaleString('id-ID')}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-slate-400">Kategori Lewis:</span>
                                <span className="px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    {summaryStats?.hw?.lewis?.category}
                                </span>
                            </div>
                        </div>

                        {/* Card 3: Dataset Info & Parameter Tool */}
                        <div className="card-box rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-3.5 shadow-lg flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-white font-bold text-base mb-1">
                                    <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                                    Parameter &amp; Dataset Skripsi
                                </div>
                                <p className="text-xs text-slate-400">
                                    Total data historis: <strong className="text-white">{totalDataCount} bulan</strong> ({summaryStats?.hw?.evaluatedPeriods} periode teruji)
                                </p>
                            </div>

                            {/* SMA Window Selector */}
                            <div className="space-y-1.5 no-print">
                                <label className="text-xs text-slate-300 font-medium">Uji Variasi Window SMA:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[3, 6, 12].map((win) => (
                                        <button
                                            key={win}
                                            onClick={() => handleWindowChange(win)}
                                            className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                                                smaWindow === win
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                            }`}
                                        >
                                            {win} Bulan
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── GRAFIK KOMPARASI ── */}
                    {(activeTab === 'all' || activeTab === 'chart') && (
                        <div className="card-box rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-blue-400" />
                                        Grafik Komparasi: Data Aktual vs SMA vs Holt-Winters
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Perbandingan visual fitting model terhadap data riil penumpang per bulan
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-medium">
                                    <span className="flex items-center gap-1.5 text-slate-200">
                                        <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
                                        Aktual
                                    </span>
                                    <span className="flex items-center gap-1.5 text-amber-400">
                                        <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                                        SMA-{smaWindow}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-blue-400">
                                        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                                        Holt-Winters
                                    </span>
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="h-80 w-full pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                        <XAxis dataKey="periode" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                        <YAxis
                                            stroke="#94a3b8"
                                            fontSize={11}
                                            tickLine={false}
                                            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                borderColor: '#334155',
                                                borderRadius: '0.75rem',
                                                color: '#f8fafc',
                                                fontSize: '12px',
                                            }}
                                            formatter={(val: any) => [val ? `${Number(val).toLocaleString('id-ID')} pax` : '-', '']}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                        <Line
                                            type="monotone"
                                            name="Data Aktual"
                                            dataKey="Aktual"
                                            stroke="#e2e8f0"
                                            strokeWidth={2.5}
                                            dot={{ r: 3, fill: '#e2e8f0' }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line
                                            type="monotone"
                                            name={`SMA (${smaWindow} Bulan)`}
                                            dataKey="SMA"
                                            stroke="#f59e0b"
                                            strokeWidth={2}
                                            strokeDasharray="4 4"
                                            dot={{ r: 2, fill: '#f59e0b' }}
                                        />
                                        <Line
                                            type="monotone"
                                            name="Holt-Winters"
                                            dataKey="HoltWinters"
                                            stroke="#3b82f6"
                                            strokeWidth={2.5}
                                            dot={{ r: 3, fill: '#3b82f6' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* ── TABEL KOMPARASI LENGKAP (FORMAT BAB 4) ── */}
                    {(activeTab === 'all' || activeTab === 'table') && (
                        <div className="card-box rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
                            <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <TableIcon className="w-4 h-4 text-emerald-400" />
                                        Tabel Komparasi Kesalahan Peramalan (Format Bab 4 Skripsi)
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Tabel lengkap perhitungan error (At - Ft) dan APE (%) per periode bulanan
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap no-print">
                                    {/* Search input */}
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Cari bulan/tahun..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                                        />
                                    </div>

                                    {/* Winner Filter */}
                                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                                        <button
                                            onClick={() => setFilterWinner('ALL')}
                                            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                                                filterWinner === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400'
                                            }`}
                                        >
                                            Semua
                                        </button>
                                        <button
                                            onClick={() => setFilterWinner('HW')}
                                            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                                                filterWinner === 'HW' ? 'bg-blue-600 text-white' : 'text-slate-400'
                                            }`}
                                        >
                                            HW Menang
                                        </button>
                                        <button
                                            onClick={() => setFilterWinner('SMA')}
                                            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                                                filterWinner === 'SMA' ? 'bg-amber-600 text-white' : 'text-slate-400'
                                            }`}
                                        >
                                            SMA Menang
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleCopyWordTable}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? 'Tersalin!' : 'Salin ke Word'}
                                    </button>
                                    <button
                                        onClick={handleExportCSV}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 flex items-center gap-1.5 transition"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Export CSV
                                    </button>
                                </div>
                            </div>

                            {/* Table Element */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                                            <th className="py-3 px-3 font-semibold text-center w-12">No</th>
                                            <th className="py-3 px-4 font-semibold">Periode</th>
                                            <th className="py-3 px-4 font-semibold text-right text-slate-200">Aktual (At)</th>
                                            <th className="py-3 px-3 font-semibold text-right text-amber-400">Pred. SMA</th>
                                            <th className="py-3 px-3 font-semibold text-right text-amber-300">|Error SMA|</th>
                                            <th className="py-3 px-3 font-semibold text-right text-amber-400">APE SMA (%)</th>
                                            <th className="py-3 px-3 font-semibold text-right text-blue-400">Pred. HW</th>
                                            <th className="py-3 px-3 font-semibold text-right text-blue-300">|Error HW|</th>
                                            <th className="py-3 px-3 font-semibold text-right text-blue-400">APE HW (%)</th>
                                            <th className="py-3 px-3 font-semibold text-center">Metode Terbaik</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                                        {filteredRows.length > 0 ? (
                                            filteredRows.map((r) => (
                                                <tr key={r.no} className="hover:bg-slate-800/40 transition">
                                                    <td className="py-2.5 px-3 text-center text-slate-500">{r.no}</td>
                                                    <td className="py-2.5 px-4 font-sans font-medium text-slate-300 whitespace-nowrap">
                                                        {r.periode_label}
                                                    </td>
                                                    <td className="py-2.5 px-4 text-right font-bold text-slate-100">
                                                        {r.aktual.toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right text-slate-300">
                                                        {r.sma_val?.toLocaleString('id-ID') ?? '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right text-slate-400">
                                                        {r.sma_abs_diff?.toLocaleString('id-ID') ?? '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right text-amber-400 font-semibold">
                                                        {r.sma_ape !== null ? `${r.sma_ape}%` : '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right text-slate-300">
                                                        {r.hw_val?.toLocaleString('id-ID') ?? '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right text-slate-400">
                                                        {r.hw_abs_diff?.toLocaleString('id-ID') ?? '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">
                                                        {r.hw_ape !== null ? `${r.hw_ape}%` : '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        {r.winner === 'HW' ? (
                                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                                Holt-Winters
                                                            </span>
                                                        ) : r.winner === 'SMA' ? (
                                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                                SMA
                                                            </span>
                                                        ) : r.winner === 'EQUAL' ? (
                                                            <span className="text-slate-500 text-[10px]">Sama</span>
                                                        ) : (
                                                            <span className="text-slate-600 text-[10px]">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                                                    Tidak ada data yang sesuai dengan filter pencarian.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-950/90 font-sans font-bold text-xs border-t-2 border-slate-700 text-white">
                                            <td colSpan={2} className="py-3 px-4 text-left">
                                                RATA-RATA EVALUASI:
                                            </td>
                                            <td className="py-3 px-4 text-right">-</td>
                                            <td className="py-3 px-3 text-right text-slate-400">-</td>
                                            <td className="py-3 px-3 text-right text-amber-300 font-mono">
                                                MAD: {summaryStats?.sma?.mae?.toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-3 text-right text-amber-400 font-mono text-sm">
                                                MAPE: {summaryStats?.sma?.mape}%
                                            </td>
                                            <td className="py-3 px-3 text-right text-slate-400">-</td>
                                            <td className="py-3 px-3 text-right text-blue-300 font-mono">
                                                MAD: {summaryStats?.hw?.mae?.toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-3 text-right text-emerald-400 font-mono text-sm">
                                                MAPE: {summaryStats?.hw?.mape}%
                                            </td>
                                            <td className="py-3 px-3 text-center text-emerald-400 text-xs">
                                                Winner: {summaryStats?.conclusion?.winner}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── LANDASAN TEORI & RUMUS SKRIPSI (CHEAT SHEET SIDANG) ── */}
                    {(activeTab === 'all' || activeTab === 'theory') && (
                        <div className="card-box rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-indigo-400" />
                                Referensi Teoretis &amp; Rumus Evaluasi Akurasi (Panduan Sidang)
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                {/* MAPE Formula */}
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                                    <div className="font-bold text-slate-200">1. MAPE (Mean Absolute % Error)</div>
                                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 font-mono text-center text-[12px] text-blue-300">
                                        MAPE = (1/n) × Σ |(At - Ft) / At| × 100%
                                    </div>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Mengukur persentase rata-rata deviasi nilai prediksi terhadap nilai riil. Semakin kecil nilainya (&lt; 10%), semakin akurat modelnya.
                                    </p>
                                </div>

                                {/* MAD Formula */}
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                                    <div className="font-bold text-slate-200">2. MAD / MAE (Mean Absolute Dev.)</div>
                                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 font-mono text-center text-[12px] text-amber-300">
                                        MAD = (1/n) × Σ |At - Ft|
                                    </div>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Mengukur besaran kesalahan absolut rata-rata dalam satuan penumpang tanpa memperhatikan arah deviasi (positif/negatif).
                                    </p>
                                </div>

                                {/* RMSE Formula */}
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                                    <div className="font-bold text-slate-200">3. RMSE (Root Mean Square Error)</div>
                                    <div className="p-2 rounded bg-slate-900 border border-slate-800/80 font-mono text-center text-[12px] text-emerald-300">
                                        RMSE = √[ (1/n) × Σ (At - Ft)² ]
                                    </div>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">
                                        Memberikan bobot penalti lebih besar untuk kesalahan peramalan yang bernilai ekstrem atau lonjakan drastis.
                                    </p>
                                </div>

                                {/* Lewis Scale Criteria */}
                                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                                    <div className="font-bold text-slate-200">4. Kriteria Akurasi Lewis (1982)</div>
                                    <ul className="text-slate-400 space-y-1 text-[11px]">
                                        <li className="flex items-center justify-between">
                                            <span>&lt; 10%</span>
                                            <span className="text-emerald-400 font-semibold">Sangat Baik</span>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            <span>10% - 20%</span>
                                            <span className="text-blue-400 font-semibold">Baik</span>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            <span>20% - 50%</span>
                                            <span className="text-amber-400 font-semibold">Layak</span>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            <span>&gt; 50%</span>
                                            <span className="text-rose-400 font-semibold">Tidak Akurat</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
