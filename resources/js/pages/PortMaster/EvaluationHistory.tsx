import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import {
    Award,
    CheckCircle2,
    Cpu,
    HelpCircle,
    History,
    LineChart as LineChartIcon,
    Search,
    ShieldAlert,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Zap,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatNumber } from './types';

interface EvaluationRow {
    periode_label: string;
    bulan: number;
    tahun: number;
    aktual: number;
    forecast: number | null;
    diff: number | null;
    abs_diff: number | null;
    error_pct: number | null;
    accuracy_grade: {
        label: string;
        badgeClass: string;
    } | null;
}

interface ChartItem {
    label: string;
    aktual: number;
    forecast: number | null;
}

interface EvaluationHistoryProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    evaluationRows: EvaluationRow[];
    chartData: ChartItem[];
    globalMetrics: {
        MAPE: number;
        MAE: number;
        RMSE: number;
        totalEvaluatedPeriods: number;
        accuracyScore: number;
    };
}

export default function EvaluationHistory({
    user,
    evaluationRows = [],
    chartData = [],
    globalMetrics,
}: EvaluationHistoryProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRows = useMemo(() => {
        if (!searchQuery.trim()) return evaluationRows;
        const q = searchQuery.toLowerCase();
        return evaluationRows.filter(
            (row) =>
                row.periode_label.toLowerCase().includes(q) ||
                row.tahun.toString().includes(q)
        );
    }, [evaluationRows, searchQuery]);

    // Custom Tooltip for Recharts
    const CustomChartTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
                    <p className="mb-2 font-semibold text-slate-800 dark:text-slate-100">{label}</p>
                    <div className="space-y-1.5 text-xs">
                        {payload.map((entry: any, index: number) => {
                            if (entry.value === null || entry.value === undefined) return null;
                            const isForecast = entry.dataKey === 'forecast';
                            return (
                                <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className="inline-block size-2.5 rounded-full"
                                            style={{ backgroundColor: entry.color || entry.stroke }}
                                        />
                                        <span className="font-medium text-slate-600 dark:text-slate-300">
                                            {isForecast ? 'Prediksi Holt-Winters' : 'Realisasi Aktual'}:
                                        </span>
                                    </div>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                                        {formatNumber(entry.value)} <span className="font-normal text-slate-500">org</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <Head title="Riwayat Evaluasi Akurasi Model Holt-Winters" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* HEADER */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                <History className="size-3.5" />
                                MODEL AUDIT & LOG HISTORIS
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                Skor Akurasi Global: {globalMetrics.accuracyScore}%
                            </span>
                        </div>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                            Riwayat Evaluasi Akurasi Model Holt-Winters
                        </h1>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Arsip perbandingan historis antara nilai prediksi model Holt-Winters dengan realisasi faktual di lapangan per periode bulan final.
                        </p>
                    </div>
                </div>

                {/* 3 GLOBAL EVALUATION METRIC CARDS */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {/* Overall MAPE */}
                    <Card className="relative overflow-hidden border-border/80 shadow-xs">
                        <div className="absolute top-0 left-0 h-1.5 w-full bg-emerald-500" />
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Global MAPE (Error Rata-rata)
                                </CardTitle>
                                <Badge className="bg-emerald-100 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                    Sangat Akurat (&lt;10%)
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                {globalMetrics.MAPE}%
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Deviasi prediksi secara kumulatif dari {globalMetrics.totalEvaluatedPeriods} periode evaluasi
                            </p>
                        </CardContent>
                    </Card>

                    {/* Overall MAE */}
                    <Card className="relative overflow-hidden border-border/80 shadow-xs">
                        <div className="absolute top-0 left-0 h-1.5 w-full bg-blue-500" />
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Global MAE (Deviasi Rata-rata)
                                </CardTitle>
                                <Badge variant="outline" className="text-[10px] font-mono">
                                    Satuan Orang
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                                &plusmn;{formatNumber(globalMetrics.MAE)}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">penumpang</span>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Rata-rata selisih penumpang riil vs estimasi per bulan
                            </p>
                        </CardContent>
                    </Card>

                    {/* Overall RMSE */}
                    <Card className="relative overflow-hidden border-border/80 shadow-xs">
                        <div className="absolute top-0 left-0 h-1.5 w-full bg-indigo-500" />
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Global RMSE (Stabilitas Model)
                                </CardTitle>
                                <Badge variant="outline" className="text-[10px] font-mono">
                                    Akar Kuadrat Error
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                                {formatNumber(globalMetrics.RMSE)}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">penumpang</span>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Model stabil tanpa outlier deviasi ekstrem
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* TIMELINE HISTORICAL COMPARISON CHART */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <LineChartIcon className="size-5 text-blue-600" />
                            Grafik Perbandingan: Realisasi Aktual vs Prediksi Model (Sepanjang Waktu)
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Tracking visual konsistensi akurasi model peramalan Holt-Winters terhadap pergerakan riil penumpang.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[340px] w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        stroke="#94a3b8"
                                        tickLine={false}
                                        tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip content={<CustomChartTooltip />} />
                                    <Legend
                                        wrapperStyle={{ paddingTop: 12 }}
                                        formatter={(value) => (
                                            <span className="text-xs font-medium text-foreground">
                                                {value === 'aktual' ? 'Realisasi Aktual' : 'Prediksi Holt-Winters'}
                                            </span>
                                        )}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="aktual"
                                        stroke="#2563eb"
                                        strokeWidth={2.5}
                                        dot={{ r: 3, strokeWidth: 1.5, fill: '#ffffff' }}
                                        activeDot={{ r: 5 }}
                                        name="aktual"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="forecast"
                                        stroke="#f43f5e"
                                        strokeWidth={2.5}
                                        strokeDasharray="4 4"
                                        dot={{ r: 3, strokeWidth: 1.5, fill: '#ffffff' }}
                                        name="forecast"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* HISTORICAL EVALUATION LOG TABLE */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg font-bold">
                                    Log Riwayat Evaluasi Per Periode
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Tabel detail perbandingan deviasi aktual vs ramalan dan klasifikasi akurasi berdasarkan standar Lewis (1982).
                                </CardDescription>
                            </div>

                            {/* Search Filter */}
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari periode (cth: 2025)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8 pl-8 text-xs"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-y border-border/80 bg-muted/50 font-bold text-muted-foreground">
                                    <tr>
                                        <th className="py-3 px-4">Periode Bulan</th>
                                        <th className="py-3 px-3 text-right">Realisasi Aktual</th>
                                        <th className="py-3 px-3 text-right">Prediksi Holt-Winters</th>
                                        <th className="py-3 px-3 text-right">Deviasi &plusmn;</th>
                                        <th className="py-3 px-3 text-right">Error Mutlak (MAE)</th>
                                        <th className="py-3 px-3 text-right">Error % (MAPE)</th>
                                        <th className="py-3 px-4 text-center">Kategori Akurasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 font-medium">
                                    {filteredRows.length > 0 ? (
                                        filteredRows.map((row, idx) => (
                                            <tr
                                                key={idx}
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                <td className="py-3 px-4 font-bold text-foreground">
                                                    {row.periode_label}
                                                </td>
                                                <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                                                    {formatNumber(row.aktual)}{' '}
                                                    <span className="font-normal text-muted-foreground">org</span>
                                                </td>
                                                <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                                                    {row.forecast ? `${formatNumber(row.forecast)} org` : '-'}
                                                </td>
                                                <td className="py-3 px-3 text-right font-mono">
                                                    {row.diff !== null ? (
                                                        <span
                                                            className={
                                                                row.diff >= 0
                                                                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                                                                    : 'text-sky-600 dark:text-sky-400 font-bold'
                                                            }
                                                        >
                                                            {row.diff > 0 ? `+${formatNumber(row.diff)}` : formatNumber(row.diff)}
                                                        </span>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-right font-mono font-semibold">
                                                    {row.abs_diff !== null ? `${formatNumber(row.abs_diff)} org` : '-'}
                                                </td>
                                                <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                    {row.error_pct !== null ? `${row.error_pct}%` : '-'}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {row.accuracy_grade ? (
                                                        <span
                                                            className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${row.accuracy_grade.badgeClass}`}
                                                        >
                                                            {row.accuracy_grade.label}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                                Tidak ada data evaluasi yang sesuai dengan pencarian.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EvaluationHistory.layout = {
    breadcrumbs: [
        {
            title: 'Riwayat Evaluasi Model',
            href: '/kepala-pelabuhan/evaluation-history',
        },
    ],
};
