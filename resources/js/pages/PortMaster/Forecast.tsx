import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    Award,
    Calendar,
    CheckCircle2,
    Compass,
    Cpu,
    Database,
    HelpCircle,
    Info,
    Layers,
    Lightbulb,
    LineChart as LineChartIcon,
    Scale,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import {
    AreaChart,
    Area,
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
import port from '@/routes/port';
import { formatNumber, SeasonData } from './types';

interface ForecastData {
    id?: number;
    nilai_forecast: number;
    bulan_prediksi: number;
    tahun_prediksi: number;
    periodLabel: string;
    metode: string;
    trend_type: string;
    seasonal_type: string;
}

interface ChartItem {
    label: string;
    labelFull?: string;
    aktual: number | null;
    forecast: number | null;
}

interface ForecastPageProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    forecast: ForecastData;
    seasonInfo: SeasonData | null;
    modelAccuracy: {
        MAPE: number;
        MAE: number;
        RMSE: number;
        accuracyScore: number;
    };
    currentMonthForecast?: {
        bulan: number;
        tahun: number;
        label: string;
        nilai_forecast: number;
        aktual_berjalan: number;
    };
    comparison: {
        last_actual_passenger: number;
        last_actual_period: string;
        growth_percentage: number;
        growth_passengers: number;
    };
    trainingMetadata: {
        total_months: number;
        period_range: string;
        total_passengers: number;
    };
    chartData: ChartItem[];
}

export default function Forecast({
    user,
    forecast,
    currentMonthForecast,
    seasonInfo,
    modelAccuracy,
    comparison,
    trainingMetadata,
    chartData = [],
}: ForecastPageProps) {
    const [chartRange, setChartRange] = useState<'all' | '12' | '6'>('all');
    const [chartType, setChartType] = useState<'area' | 'line'>('area');

    const filteredChartData = useMemo(() => {
        if (!chartData || chartData.length === 0) return [];
        if (chartRange === '6') return chartData.slice(-6);
        if (chartRange === '12') return chartData.slice(-12);
        return chartData;
    }, [chartData, chartRange]);

    const getSeasonStyle = (season?: string) => {
        switch (season) {
            case 'high':
                return {
                    badge: 'bg-rose-500 text-white',
                    cardBg: 'bg-rose-50/40 dark:bg-rose-950/20',
                    border: 'border-rose-200 dark:border-rose-900/60',
                    text: 'text-rose-700 dark:text-rose-300',
                    icon: AlertCircle,
                };
            case 'low':
                return {
                    badge: 'bg-sky-500 text-white',
                    cardBg: 'bg-sky-50/40 dark:bg-sky-950/20',
                    border: 'border-sky-200 dark:border-sky-900/60',
                    text: 'text-sky-700 dark:text-sky-300',
                    icon: TrendingDown,
                };
            default:
                return {
                    badge: 'bg-emerald-600 text-white',
                    cardBg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
                    border: 'border-emerald-200 dark:border-emerald-900/60',
                    text: 'text-emerald-700 dark:text-emerald-300',
                    icon: CheckCircle2,
                };
        }
    };

    const seasonStyle = getSeasonStyle(seasonInfo?.season);

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
                                            {isForecast ? 'Proyeksi Holt-Winters' : 'Realisasi Aktual'}:
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
            <Head title={`Prediksi Penumpang Holt-Winters (${forecast.periodLabel})`} />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* HERO EXECUTIVE BANNER */}
                <div className="relative overflow-hidden rounded-2xl border border-indigo-900/40 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 p-6 text-white shadow-xl sm:p-8">
                    <div className="pointer-events-none absolute -top-16 -right-16 size-80 rounded-full bg-indigo-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 -left-16 size-80 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-300 backdrop-blur-md">
                                    <Cpu className="size-3.5" />
                                    HOLT-WINTERS EXPONENTIAL SMOOTHING
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                                    <Sparkles className="size-3" />
                                    Akurasi Model: {modelAccuracy.accuracyScore}% (MAPE {modelAccuracy.MAPE}%)
                                </span>
                            </div>

                            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                                Prediksi & Forecasting Penumpang Kapal
                            </h1>
                            <p className="max-w-2xl text-sm text-indigo-100/80 sm:text-base leading-relaxed">
                                Sistem peramalan cerdas berbasis kecerdasan statistik yang memodelkan tren pertumbuhan linier dan siklus musiman 12 bulan berulang untuk mengantisipasi lonjakan penumpang pelabuhan.
                            </p>
                        </div>

                        {/* TARGET PERIOD BADGE */}
                        <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-md text-right shrink-0">
                            <div className="text-xs text-indigo-200 flex items-center justify-end gap-1.5">
                                <Calendar className="size-3.5 text-cyan-300" />
                                <span>Target Bulan Prediksi</span>
                            </div>
                            <div className="mt-1 text-xl font-extrabold text-white">
                                {forecast.periodLabel}
                            </div>
                            <div className="mt-0.5 text-[11px] text-cyan-300 font-mono">
                                Proyeksi: {formatNumber(forecast.nilai_forecast)} orang
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACTIVE MONTH RUNNING PROJECTION STRIP */}
                {currentMonthForecast && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                                <Activity className="size-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                                        Bulan Berjalan ({currentMonthForecast.label})
                                    </span>
                                    <Badge variant="outline" className="bg-emerald-100/80 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] py-0">
                                        Data Masuk: {formatNumber(currentMonthForecast.aktual_berjalan)} orang
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Proyeksi Holt-Winters bulan ini sebesar <strong className="text-foreground">{formatNumber(currentMonthForecast.nilai_forecast)} orang</strong>. Realisasi manifest harian terus diakumulasi hingga penutupan periode.
                                </p>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <span className="text-[11px] text-muted-foreground">Proyeksi Model {currentMonthForecast.label}</span>
                            <div className="text-lg font-black text-indigo-950 dark:text-indigo-200">
                                {formatNumber(currentMonthForecast.nilai_forecast)} <span className="text-xs font-normal text-muted-foreground">org</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4 EXECUTIVE KPI CARDS */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Periode Prediksi */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Target Periode Depan
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <Calendar className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {forecast.periodLabel}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Target Peramalan Berikutnya
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card 2: Nilai Prediksi Holt-Winters */}
                    <Card className="border-blue-200 bg-gradient-to-br from-card to-blue-50/40 dark:border-blue-900/40 dark:to-blue-950/20 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-blue-900 dark:text-blue-200 uppercase">
                                Hasil Proyeksi Holt-Winters
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                                <TrendingUp className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline justify-between">
                                <div className="text-2xl font-black text-blue-950 dark:text-white">
                                    {formatNumber(forecast.nilai_forecast)}
                                    <span className="ml-1 text-xs font-normal text-muted-foreground">org</span>
                                </div>
                                {comparison.growth_percentage !== 0 && (
                                    <span
                                        className={`inline-flex items-center text-xs font-bold ${
                                            comparison.growth_percentage > 0
                                                ? 'text-rose-600 dark:text-rose-400'
                                                : 'text-sky-600 dark:text-sky-400'
                                        }`}
                                    >
                                        {comparison.growth_percentage > 0 ? (
                                            <ArrowUpRight className="size-3.5" />
                                        ) : (
                                            <ArrowDownRight className="size-3.5" />
                                        )}
                                        {comparison.growth_percentage > 0
                                            ? `+${comparison.growth_percentage}%`
                                            : `${comparison.growth_percentage}%`}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                vs {comparison.last_actual_period} ({formatNumber(comparison.last_actual_passenger)} org)
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card 3: Klasifikasi Musim Proyeksi */}
                    <Card className={`border ${seasonStyle.border} ${seasonStyle.cardBg} shadow-xs`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Status Klasifikasi Musim
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-card text-foreground shadow-2xs">
                                <Compass className="size-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Badge className={`${seasonStyle.badge} gap-1 px-2.5 py-0.5 text-xs font-bold`}>
                                    <seasonStyle.icon className="size-3.5" />
                                    {seasonInfo?.label || 'Normal Season'}
                                </Badge>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Ambang: {formatNumber(seasonInfo?.batas_bawah)} - {formatNumber(seasonInfo?.batas_atas)} org
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card 4: Akurasi Model */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Kehandalan Model
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                <Award className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                    {modelAccuracy.accuracyScore}%
                                </span>
                                <span className="text-xs text-muted-foreground font-mono">
                                    (MAPE {modelAccuracy.MAPE}%)
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Deviasi rata-rata: &plusmn;{formatNumber(modelAccuracy.MAE)} org
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* INTERACTIVE FORECASTING TIMELINE CHART */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                <LineChartIcon className="size-5 text-indigo-600 dark:text-indigo-400" />
                                Visualisasi Tren Penumpang: Data Riil vs Model Holt-Winters
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Garis biru menunjukkan data riil penumpang, dan garis putus-putus merah menunjukkan hasil kurva estimasi model Holt-Winters hingga periode masa depan.
                            </CardDescription>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="inline-flex rounded-lg border border-border/70 bg-muted/40 p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setChartRange('all')}
                                    className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                        chartRange === 'all'
                                            ? 'bg-background font-semibold text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Semua ({trainingMetadata.total_months} Bln)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChartRange('12')}
                                    className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                        chartRange === '12'
                                            ? 'bg-background font-semibold text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    12 Bulan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChartRange('6')}
                                    className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                        chartRange === '6'
                                            ? 'bg-background font-semibold text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    6 Bulan
                                </button>
                            </div>

                            <div className="inline-flex rounded-lg border border-border/70 bg-muted/40 p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setChartType('area')}
                                    className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                        chartType === 'area'
                                            ? 'bg-background font-semibold text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Area
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChartType('line')}
                                    className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                        chartType === 'line'
                                            ? 'bg-background font-semibold text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Garis
                                </button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="h-[360px] w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'area' ? (
                                    <AreaChart data={filteredChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAktualForecast" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                                            </linearGradient>
                                            <linearGradient id="colorHwForecast" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
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
                                                    {value === 'aktual' ? 'Data Riil Aktual' : 'Estimasi & Proyeksi Holt-Winters'}
                                                </span>
                                            )}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="aktual"
                                            stroke="#2563eb"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#colorAktualForecast)"
                                            name="aktual"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="forecast"
                                            stroke="#f43f5e"
                                            strokeWidth={2.5}
                                            strokeDasharray="4 4"
                                            fillOpacity={1}
                                            fill="url(#colorHwForecast)"
                                            name="forecast"
                                        />
                                    </AreaChart>
                                ) : (
                                    <LineChart data={filteredChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                                                    {value === 'aktual' ? 'Data Riil Aktual' : 'Estimasi & Proyeksi Holt-Winters'}
                                                </span>
                                            )}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="aktual"
                                            stroke="#2563eb"
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                                            name="aktual"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="forecast"
                                            stroke="#f43f5e"
                                            strokeWidth={3}
                                            strokeDasharray="5 5"
                                            dot={{ r: 5, strokeWidth: 2, fill: '#ffffff' }}
                                            name="forecast"
                                        />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* METODOLOGI & ARSITEKTUR HOLT-WINTERS */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Mengapa Holt-Winters */}
                    <Card className="border-border/80 shadow-xs space-y-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-bold">
                                <Cpu className="size-5 text-indigo-600" />
                                Karakteristik Algoritma Holt-Winters (Triple Exponential Smoothing)
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Model statistik multi-komponen yang dirancang khusus untuk memproyeksikan deret waktu pelayaran.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3.5">
                            <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                                <div className="rounded-lg bg-muted/50 p-3">
                                    <b className="text-foreground">1. Komponen Level (&alpha;):</b> Menghaluskan fluktuasi penumpang secara adaptif tanpa menghilangkan pola dasar mobilitas.
                                </div>
                                <div className="rounded-lg bg-muted/50 p-3">
                                    <b className="text-foreground">2. Komponen Tren Additive (&beta;):</b> Mengukur laju kenaikan/penurunan jumlah penumpang dari tahun ke tahun secara linier.
                                </div>
                                <div className="rounded-lg bg-muted/50 p-3">
                                    <b className="text-foreground">3. Komponen Musiman 12-Bulan Additive (&gamma;):</b> Menangkap siklus musiman tahunan (lonjakan mudik lebaran, libur sekolah, akhir tahun).
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Training & Keunggulan vs SMA */}
                    <Card className="border-border/80 shadow-xs space-y-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-bold">
                                <Database className="size-5 text-blue-600" />
                                Basis Data Pembelajaran & Perbandingan vs SMA
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Ringkasan dataset historis yang digunakan model untuk pelatihan (*training*).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3.5 text-xs">
                            <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Jumlah Periode Training:</span>
                                    <span className="font-bold text-foreground">{trainingMetadata.total_months} Bulan Final</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Rentang Waktu:</span>
                                    <span className="font-bold text-foreground">{trainingMetadata.period_range}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Penumpang Dipelajari:</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                        {formatNumber(trainingMetadata.total_passengers)} orang
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 dark:border-indigo-950 dark:bg-indigo-950/20 space-y-1">
                                <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                                    <Zap className="size-4 text-indigo-600" />
                                    <span>Keunggulan Utama Dibanding SMA (Simple Moving Average):</span>
                                </div>
                                <p className="text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed">
                                    Metode SMA 12 Bulan hanya merata-ratakan masa lalu sehingga selalu terlambat (*lagging*) saat terjadi lonjakan mendadak. Holt-Winters mampu memproyeksikan lonjakan 12 bulan ke depan secara presisi dengan tingkat kesalahan hanya <b>{modelAccuracy.MAPE}%</b>.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ACTIONABLE RECOMMENDATIONS BASED ON FORECAST */}
                {seasonInfo && (
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                    <Lightbulb className="size-5 text-amber-500" />
                                    Rekomendasi Tindakan Operasional untuk Periode {forecast.periodLabel}
                                </CardTitle>
                                <Badge className="bg-amber-100 text-xs text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                    Arahan Kebijakan Operasional
                                </Badge>
                            </div>
                            <CardDescription className="text-xs">
                                Langkah strategis bagi Kepala Pelabuhan dan operator kapal berdasarkan proyeksi beban {formatNumber(forecast.nilai_forecast)} penumpang ({seasonInfo.label}).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
                                <b>Ringkasan Sistem:</b> {seasonInfo.message}
                            </div>

                            <div className="grid gap-2.5 sm:grid-cols-3">
                                {seasonInfo.recommendation.map((rec, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-card p-3 text-xs"
                                    >
                                        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[10px]">
                                            {idx + 1}
                                        </div>
                                        <span className="text-muted-foreground">{rec}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

Forecast.layout = {
    breadcrumbs: [
        {
            title: 'Prediksi & Forecasting',
            href: port.forecast(),
        },
    ],
};
