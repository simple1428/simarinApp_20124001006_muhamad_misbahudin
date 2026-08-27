import { useState, useMemo } from 'react';
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
import { AlertCircle, CheckCircle2, TrendingDown, Waves } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartDataItem, ForecastItem, SeasonData, formatNumber, monthNames } from '../types';

interface PassengerTrendChartProps {
    forecastChart: ChartDataItem[];
    actualSeason: SeasonData | null;
    forecastSeason: SeasonData | null;
    forecast: ForecastItem | null;
}

export function PassengerTrendChart({
    forecastChart = [],
    actualSeason,
    forecastSeason,
    forecast,
}: PassengerTrendChartProps) {
    const [chartRange, setChartRange] = useState<'all' | '12' | '6'>('all');
    const [chartType, setChartType] = useState<'area' | 'line'>('area');

    // Filter chart data based on range
    const filteredChartData = useMemo(() => {
        if (!forecastChart || forecastChart.length === 0) return [];
        if (chartRange === '6') return forecastChart.slice(-6);
        if (chartRange === '12') return forecastChart.slice(-12);
        return forecastChart;
    }, [forecastChart, chartRange]);

    // Visual styles for season badges
    const getSeasonStyle = (season?: string) => {
        switch (season) {
            case 'high':
                return {
                    bg: 'bg-rose-50/70 dark:bg-rose-950/30',
                    border: 'border-rose-200 dark:border-rose-800/60',
                    badge: 'bg-rose-500 text-white hover:bg-rose-600',
                    icon: AlertCircle,
                };
            case 'low':
                return {
                    bg: 'bg-sky-50/70 dark:bg-sky-950/30',
                    border: 'border-sky-200 dark:border-sky-800/60',
                    badge: 'bg-sky-500 text-white hover:bg-sky-600',
                    icon: TrendingDown,
                };
            default:
                return {
                    bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
                    border: 'border-emerald-200 dark:border-emerald-800/60',
                    badge: 'bg-emerald-600 text-white hover:bg-emerald-700',
                    icon: CheckCircle2,
                };
        }
    };

    const actualSeasonStyle = getSeasonStyle(actualSeason?.season);
    const forecastSeasonStyle = getSeasonStyle(forecastSeason?.season);

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
        <div className="space-y-6">
            {/* CHART CARD */}
            <Card className="border-border/80 shadow-xs">
                <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <Waves className="size-5 text-blue-600" />
                            Tren Volume Penumpang: Aktual vs Prediksi
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Visualisasi pergerakan riil jumlah penumpang dan proyeksi model peramalan Holt-Winters.
                        </CardDescription>
                    </div>

                    {/* Controls: Filter range and Chart type */}
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
                                Semua
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
                    <div className="h-[360px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'area' ? (
                                <AreaChart
                                    data={filteredChartData}
                                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorAktual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
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
                                                {value === 'aktual' ? 'Data Aktual' : 'Prediksi Masa Depan'}
                                            </span>
                                        )}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="aktual"
                                        stroke="#2563eb"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#colorAktual)"
                                        name="aktual"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="forecast"
                                        stroke="#f43f5e"
                                        strokeWidth={2.5}
                                        strokeDasharray="4 4"
                                        fillOpacity={1}
                                        fill="url(#colorForecast)"
                                        name="forecast"
                                    />
                                </AreaChart>
                            ) : (
                                <LineChart
                                    data={filteredChartData}
                                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                                >
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
                                                {value === 'aktual' ? 'Data Aktual' : 'Prediksi Masa Depan'}
                                            </span>
                                        )}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="aktual"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                                        activeDot={{ r: 6 }}
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

            {/* QUICK SEASONALITY COMPARISON CARDS */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Musim Saat Ini */}
                {actualSeason && (
                    <Card className={`border ${actualSeasonStyle.border} ${actualSeasonStyle.bg} shadow-xs`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <Badge className={`${actualSeasonStyle.badge} gap-1.5 px-3 py-1 font-semibold`}>
                                    <actualSeasonStyle.icon className="size-3.5" />
                                    {actualSeason.label}
                                </Badge>
                                <span className="text-xs font-medium text-muted-foreground">Kondisi Berjalan</span>
                            </div>
                            <CardTitle className="mt-2 text-xl font-bold">
                                {formatNumber(actualSeason.jumlah)}{' '}
                                <span className="text-sm font-normal text-muted-foreground">penumpang</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                                {actualSeason.message}
                            </p>
                            <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/50 bg-card p-3 text-center text-xs">
                                <div>
                                    <span className="text-[11px] text-muted-foreground">Mean Historis</span>
                                    <div className="font-bold">{formatNumber(actualSeason.mean)}</div>
                                </div>
                                <div>
                                    <span className="text-[11px] text-muted-foreground">Batas Bawah</span>
                                    <div className="font-bold">{formatNumber(actualSeason.batas_bawah)}</div>
                                </div>
                                <div>
                                    <span className="text-[11px] text-muted-foreground">Batas Atas</span>
                                    <div className="font-bold">{formatNumber(actualSeason.batas_atas)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Prediksi Musim Berikutnya */}
                {forecastSeason && (
                    <Card className={`border ${forecastSeasonStyle.border} ${forecastSeasonStyle.bg} shadow-xs`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <Badge className={`${forecastSeasonStyle.badge} gap-1.5 px-3 py-1 font-semibold`}>
                                    <forecastSeasonStyle.icon className="size-3.5" />
                                    Proyeksi: {forecastSeason.label}
                                </Badge>
                                <span className="text-xs font-medium text-muted-foreground">
                                    Target:{' '}
                                    {forecast
                                        ? `${monthNames[forecast.bulan_prediksi]} ${forecast.tahun_prediksi}`
                                        : '-'}
                                </span>
                            </div>
                            <CardTitle className="mt-2 text-xl font-bold">
                                {formatNumber(forecastSeason.jumlah)}{' '}
                                <span className="text-sm font-normal text-muted-foreground">penumpang</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                                {forecastSeason.message}
                            </p>
                            <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/50 bg-card p-3 text-center text-xs">
                                <div>
                                    <span className="text-[11px] text-muted-foreground">Deviasi Tren</span>
                                    <div
                                        className={`font-bold ${forecastSeason.persentase >= 0 ? 'text-rose-600' : 'text-sky-600'}`}
                                    >
                                        {forecastSeason.persentase > 0
                                            ? `+${forecastSeason.persentase}%`
                                            : `${forecastSeason.persentase}%`}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[11px] text-muted-foreground">Rentang Normal</span>
                                    <div className="font-bold">
                                        {formatNumber(forecastSeason.batas_bawah)} - {formatNumber(forecastSeason.batas_atas)}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[11px] text-muted-foreground">Kesiapan</span>
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400">Siap Operasi</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
