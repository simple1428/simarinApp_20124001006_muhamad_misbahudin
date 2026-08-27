import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Anchor,
    Award,
    Calendar,
    CheckCircle2,
    Compass,
    Filter,
    Gauge,
    Info,
    Layers,
    Lightbulb,
    LineChart as LineChartIcon,
    Percent,
    Printer,
    Ship,
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
    ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import port from '@/routes/port';
import { formatNumber } from './types';

interface ShipStat {
    id: number;
    nama_kapal: string;
    jenis_kapal: string;
    kapasitas_per_trip: number;
    status_armada: string;
    total_trip: number;
    total_penumpang: number;
    total_kapasitas: number;
    kursi_kosong: number;
    avg_per_trip: number;
    occupancy: number;
    status_class: 'high' | 'optimal' | 'low';
    status_label: string;
}

interface MonthlyOccupancyItem {
    label: string;
    labelFull: string;
    occupancy: number;
    total_penumpang: number;
    jumlah_trip: number;
}

interface OccupancyPageProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    selectedYear: string | number;
    availableYears: number[];
    shipStats: ShipStat[];
    globalSummary: {
        occupancy: number;
        total_penumpang: number;
        total_kapasitas: number;
        total_trip: number;
        kursi_kosong: number;
        active_ships_count: number;
    };
    occupancyChart: MonthlyOccupancyItem[];
}

export default function Occupancy({
    user,
    selectedYear,
    availableYears = [],
    shipStats = [],
    globalSummary,
    occupancyChart = [],
}: OccupancyPageProps) {
    const [chartView, setChartView] = useState<'area' | 'line'>('area');

    const handleYearFilter = (yr: string | number) => {
        router.get(
            '/kepala-pelabuhan/occupancy',
            { year: yr },
            { preserveState: true, preserveScroll: true }
        );
    };

    const getOccupancyBadge = (occupancy: number) => {
        if (occupancy >= 80) {
            return (
                <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 gap-1 text-[11px] font-semibold">
                    <TrendingUp className="size-3" />
                    Sangat Tinggi ({occupancy}%)
                </Badge>
            );
        }
        if (occupancy >= 65) {
            return (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 gap-1 text-[11px] font-semibold">
                    <CheckCircle2 className="size-3" />
                    Optimal ({occupancy}%)
                </Badge>
            );
        }
        return (
            <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 gap-1 text-[11px] font-semibold">
                <TrendingDown className="size-3" />
                Longgar ({occupancy}%)
            </Badge>
        );
    };

    // Custom Tooltip for Recharts
    const CustomChartTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
                    <p className="mb-2 font-semibold text-slate-800 dark:text-slate-100">{data.labelFull || label}</p>
                    <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Tingkat Okupansi:</span>
                            <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                                {data.occupancy}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Total Penumpang:</span>
                            <span className="font-mono font-bold text-foreground">
                                {formatNumber(data.total_penumpang)} org
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Total Keberangkatan:</span>
                            <span className="font-mono font-bold text-foreground">
                                {formatNumber(data.jumlah_trip)} trip
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <Head title="Analisis Tingkat Okupansi & Utilisasi Armada Kapal" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* HERO HEADER */}
                <div className="relative overflow-hidden rounded-2xl border border-teal-900/40 bg-gradient-to-br from-slate-950 via-teal-950 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
                    <div className="pointer-events-none absolute -top-16 -right-16 size-80 rounded-full bg-teal-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 -left-16 size-80 rounded-full bg-cyan-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-teal-300 backdrop-blur-md">
                                    <Gauge className="size-3.5" />
                                    FLEET CAPACITY & LOAD FACTOR
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                                    <Ship className="size-3" />
                                    {globalSummary.active_ships_count} Armada Kapal Aktif
                                </span>
                            </div>

                            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                                Analisis Tingkat Okupansi & Utilisasi Armada
                            </h1>
                            <p className="max-w-2xl text-sm text-teal-100/80 sm:text-base leading-relaxed">
                                Pantau efisiensi rasio keterisian kursi (*load factor*), sebaran kapasitas muatan per kapal, dan sisa daya tampung pelayaran untuk optimalisasi jadwal operasional.
                            </p>
                        </div>

                        {/* FILTER & ACTIONS */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <div className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 p-1 backdrop-blur-md shadow-xs">
                                <Filter className="ml-2 size-3.5 text-teal-200" />
                                <span className="text-xs font-medium text-teal-200">Tahun:</span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleYearFilter('all')}
                                        className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                                            selectedYear === 'all'
                                                ? 'bg-teal-500 text-white shadow-xs'
                                                : 'text-teal-200 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        Semua
                                    </button>
                                    {availableYears.map((yr) => (
                                        <button
                                            key={yr}
                                            onClick={() => handleYearFilter(yr)}
                                            className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                                                selectedYear == yr
                                                    ? 'bg-teal-500 text-white shadow-xs'
                                                    : 'text-teal-200 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            {yr}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => window.print()}
                                className="h-auto cursor-pointer border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
                            >
                                <Printer className="mr-1.5 size-3.5 text-teal-300" />
                                Cetak
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 4 EXECUTIVE KPI CARDS */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Okupansi Global */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Rata-rata Okupansi Armada
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                                <Gauge className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline justify-between">
                                <div className="text-3xl font-black text-foreground">
                                    {globalSummary.occupancy}%
                                </div>
                                {getOccupancyBadge(globalSummary.occupancy)}
                            </div>
                            <div className="mt-3">
                                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full bg-teal-500 transition-all duration-500"
                                        style={{ width: `${Math.min(100, globalSummary.occupancy)}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Penumpang */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Total Penumpang Terlayani
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <Users className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {formatNumber(globalSummary.total_penumpang)}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">orang</span>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Dari {formatNumber(globalSummary.total_trip)} total keberangkatan trip
                            </p>
                        </CardContent>
                    </Card>

                    {/* Kapasitas Tersedia */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Total Kapasitas Kursi
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                <Ship className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {formatNumber(globalSummary.total_kapasitas)}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">kursi</span>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Total daya angkut maksimal armada
                            </p>
                        </CardContent>
                    </Card>

                    {/* Sisa Kursi Kosong */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Kursi Kosong (Unused)
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                                <Percent className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {formatNumber(globalSummary.kursi_kosong)}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">kursi</span>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Ruang sisa kapasitas kapal
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* MONTHLY OCCUPANCY TREND CHART */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                <LineChartIcon className="size-5 text-teal-600 dark:text-teal-400" />
                                Grafik Tren Okupansi Armada Bulanan (%)
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Perkembangan rasio keterisian armada dari waktu ke waktu terhadap garis batas optimal maritim (65% - 80%).
                            </CardDescription>
                        </div>

                        <div className="inline-flex rounded-lg border border-border/70 bg-muted/40 p-0.5">
                            <button
                                type="button"
                                onClick={() => setChartView('area')}
                                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                    chartView === 'area'
                                        ? 'bg-background font-semibold text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Area
                            </button>
                            <button
                                type="button"
                                onClick={() => setChartView('line')}
                                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                    chartView === 'line'
                                        ? 'bg-background font-semibold text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Garis
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="h-[340px] w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartView === 'area' ? (
                                    <AreaChart data={occupancyChart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                                        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} />
                                        <YAxis
                                            tick={{ fontSize: 11 }}
                                            stroke="#94a3b8"
                                            tickLine={false}
                                            domain={[0, 100]}
                                            tickFormatter={(val) => `${val}%`}
                                        />
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <ReferenceLine y={80} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Batas Padat (80%)', fill: '#f43f5e', fontSize: 10 }} />
                                        <ReferenceLine y={65} stroke="#0ea5e9" strokeDasharray="3 3" label={{ value: 'Batas Minimum Optimal (65%)', fill: '#0ea5e9', fontSize: 10 }} />
                                        <Area
                                            type="monotone"
                                            dataKey="occupancy"
                                            stroke="#0d9488"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#colorOcc)"
                                            name="Okupansi (%)"
                                        />
                                    </AreaChart>
                                ) : (
                                    <LineChart data={occupancyChart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                                        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} />
                                        <YAxis
                                            tick={{ fontSize: 11 }}
                                            stroke="#94a3b8"
                                            tickLine={false}
                                            domain={[0, 100]}
                                            tickFormatter={(val) => `${val}%`}
                                        />
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <ReferenceLine y={80} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Batas Padat (80%)', fill: '#f43f5e', fontSize: 10 }} />
                                        <ReferenceLine y={65} stroke="#0ea5e9" strokeDasharray="3 3" label={{ value: 'Batas Minimum Optimal (65%)', fill: '#0ea5e9', fontSize: 10 }} />
                                        <Line
                                            type="monotone"
                                            dataKey="occupancy"
                                            stroke="#0d9488"
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                                            name="Okupansi (%)"
                                        />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* FLEET UTILIZATION CARDS BREAKDOWN */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Utilisasi & Keterisian Per Armada Kapal</h2>
                            <p className="text-xs text-muted-foreground">
                                Rincian beban penumpang dan persentase keterisian per kapal yang beroperasi di pelabuhan.
                            </p>
                        </div>
                        <Badge variant="outline" className="text-xs font-mono">
                            {shipStats.length} Kapal Terdata
                        </Badge>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {shipStats.map((ship) => (
                            <Card key={ship.id} className="relative overflow-hidden border-border/80 shadow-xs transition-all hover:shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-7 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                                                <Ship className="size-4" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-bold text-foreground">
                                                    {ship.nama_kapal}
                                                </CardTitle>
                                                <CardDescription className="text-[11px]">
                                                    {ship.jenis_kapal}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <span className="flex size-2 rounded-full bg-emerald-500" title="Aktif Beroperasi" />
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3 pt-0">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-2xl font-black text-foreground">
                                            {ship.occupancy}%
                                        </span>
                                        {getOccupancyBadge(ship.occupancy)}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                        <div
                                            className={`h-full transition-all duration-500 ${
                                                ship.occupancy >= 80
                                                    ? 'bg-rose-500'
                                                    : ship.occupancy >= 65
                                                    ? 'bg-emerald-500'
                                                    : 'bg-sky-500'
                                            }`}
                                            style={{ width: `${Math.min(100, ship.occupancy)}%` }}
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-2 text-[11px]">
                                        <div>
                                            <span className="text-muted-foreground">Kapasitas/Trip:</span>
                                            <div className="font-bold text-foreground">{ship.kapasitas_per_trip} kursi</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Rata-rata/Trip:</span>
                                            <div className="font-bold text-foreground">~{ship.avg_per_trip} org</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Total Penumpang:</span>
                                            <div className="font-bold text-foreground">{formatNumber(ship.total_penumpang)}</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Total Trip:</span>
                                            <div className="font-bold text-foreground">{formatNumber(ship.total_trip)} trip</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* DETAILED FLEET UTILIZATION TABLE */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">
                            Tabel Rekapitulasi Efisiensi Daya Angkut Armada
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Matriks komparasi kapasitas kursi terpasang, realisasi angkutan penumpang, dan sisa daya tampung per kapal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-y border-border/80 bg-muted/50 font-bold text-muted-foreground">
                                    <tr>
                                        <th className="py-3 px-4">Nama Armada Kapal</th>
                                        <th className="py-3 px-3 text-center">Kapasitas/Trip</th>
                                        <th className="py-3 px-3 text-right">Total Keberangkatan</th>
                                        <th className="py-3 px-3 text-right">Total Kapasitas Kursi</th>
                                        <th className="py-3 px-3 text-right">Realisasi Penumpang</th>
                                        <th className="py-3 px-3 text-right">Kursi Kosong</th>
                                        <th className="py-3 px-3 text-center">Rasio Okupansi</th>
                                        <th className="py-3 px-4 text-center">Status Efisiensi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 font-medium">
                                    {shipStats.map((ship) => (
                                        <tr key={ship.id} className="transition-colors hover:bg-muted/30">
                                            <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                                                <Ship className="size-3.5 text-teal-600" />
                                                {ship.nama_kapal}
                                            </td>
                                            <td className="py-3 px-3 text-center font-mono font-semibold">
                                                {ship.kapasitas_per_trip} kursi
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono">
                                                {formatNumber(ship.total_trip)} trip
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono">
                                                {formatNumber(ship.total_kapasitas)}
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                                                {formatNumber(ship.total_penumpang)} org
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                                                {formatNumber(ship.kursi_kosong)}
                                            </td>
                                            <td className="py-3 px-3 text-center font-mono font-bold text-teal-600 dark:text-teal-400">
                                                {ship.occupancy}%
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {getOccupancyBadge(ship.occupancy)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t-2 border-border/80 bg-muted/40 font-bold text-foreground">
                                    <tr>
                                        <td className="py-3 px-4 uppercase">Total Akumulasi</td>
                                        <td className="py-3 px-3 text-center font-mono text-muted-foreground">-</td>
                                        <td className="py-3 px-3 text-right font-mono">
                                            {formatNumber(globalSummary.total_trip)} trip
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono">
                                            {formatNumber(globalSummary.total_kapasitas)}
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono text-teal-600 dark:text-teal-400">
                                            {formatNumber(globalSummary.total_penumpang)} org
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                                            {formatNumber(globalSummary.kursi_kosong)}
                                        </td>
                                        <td className="py-3 px-3 text-center font-mono text-teal-600 dark:text-teal-400">
                                            {globalSummary.occupancy}%
                                        </td>
                                        <td className="py-3 px-4 text-center font-normal text-xs text-muted-foreground">
                                            Rata-rata Gabungan
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* OPERATIONAL CAPACITY GUIDELINES */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                            <AlertCircle className="size-4" />
                            <span>Zona Padat (&ge; 80%)</span>
                        </div>
                        <p className="text-xs leading-relaxed text-rose-900/80 dark:text-rose-200/80">
                            Tingkat keterisian sangat tinggi mendekati kapasitas maksimum. Disarankan penyiapan armada cadangan atau penambahan jadwal trip pelayaran untuk mencegah penumpukan di pelabuhan.
                        </p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="size-4" />
                            <span>Zona Optimal (65% - 80%)</span>
                        </div>
                        <p className="text-xs leading-relaxed text-emerald-900/80 dark:text-emerald-200/80">
                            Tingkat keterisian ideal di mana biaya operasional bahan bakar seimbang dengan kenyamanan penumpang dan kapasitas kapal termanfaatkan secara efisien.
                        </p>
                    </div>

                    <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/40 dark:bg-sky-950/20 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                            <TrendingDown className="size-4" />
                            <span>Zona Longgar (&lt; 65%)</span>
                        </div>
                        <p className="text-xs leading-relaxed text-sky-900/80 dark:text-sky-200/80">
                            Tingkat keterisian rendah dengan banyak kursi kosong. Disarankan evaluasi frekuensi jadwal keberangkatan untuk efisiensi bahan bakar dan perawatan mesin kapal.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

Occupancy.layout = {
    breadcrumbs: [
        {
            title: 'Tingkat Okupansi',
            href: port.occupancy(),
        },
    ],
};
