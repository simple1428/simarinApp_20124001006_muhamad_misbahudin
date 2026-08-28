import { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, Gauge, Ship, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ForecastItem, formatNumber, monthNames } from '../types';

interface KpiCardsProps {
    summary: {
        total_penumpang: number;
        jumlah_trip: number;
        occupancy: number;
    };
    period: {
        bulan: number;
        tahun: number;
    };
    forecast: ForecastItem | null;
    previousComparison?: {
        periode: string;
        aktual: number;
        forecast: number;
        difference: number;
        percentage: number;
    } | null;
}

export function KpiCards({ summary, period, forecast, previousComparison }: KpiCardsProps) {
    // Calculate passenger per trip
    const avgPassengerPerTrip = useMemo(() => {
        if (!summary || !summary.jumlah_trip || summary.jumlah_trip === 0) return 0;
        return Math.round(summary.total_penumpang / summary.jumlah_trip);
    }, [summary]);

    // Calculate Growth/Change percentage between forecast and baseline
    const forecastGrowth = useMemo(() => {
        if (previousComparison && typeof previousComparison.percentage === 'number') {
            return previousComparison.percentage;
        }
        if (!forecast || !summary || summary.total_penumpang === 0) return 0;
        const diff = forecast.nilai_forecast - summary.total_penumpang;
        return Number(((diff / summary.total_penumpang) * 100).toFixed(1));
    }, [forecast, summary, previousComparison]);


    // Occupancy Status Helper
    const getOccupancyInfo = (occ: number) => {
        if (occ >= 85) {
            return {
                label: 'Tinggi (Padat)',
                barColor: 'bg-rose-500',
                badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
            };
        }
        if (occ >= 65) {
            return {
                label: 'Optimal / Baik',
                barColor: 'bg-emerald-500',
                badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
            };
        }
        return {
            label: 'Rendah / Longgar',
            barColor: 'bg-sky-500',
            badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
        };
    };

    const occupancyInfo = getOccupancyInfo(summary?.occupancy || 0);

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Total Penumpang */}
            <Card className="relative overflow-hidden border-border/80 shadow-xs transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Total Penumpang
                    </CardTitle>
                    <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                        <Users className="size-4.5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                        {formatNumber(summary?.total_penumpang)}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">orang</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Periode Aktif</span>
                        <span className="font-medium text-foreground">
                            {monthNames[period?.bulan]} {period?.tahun}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Jumlah Trip */}
            <Card className="relative overflow-hidden border-border/80 shadow-xs transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Frekuensi Trip Kapal
                    </CardTitle>
                    <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        <Ship className="size-4.5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                        {formatNumber(summary?.jumlah_trip)}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">keberangkatan</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Rata-rata/Trip</span>
                        <span className="font-semibold text-foreground">
                            ~{formatNumber(avgPassengerPerTrip)} org
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Card 3: Okupansi Armada */}
            <Card className="relative overflow-hidden border-border/80 shadow-xs transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Tingkat Okupansi
                    </CardTitle>
                    <div className="flex size-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                        <Gauge className="size-4.5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                            {summary?.occupancy ?? 0}%
                        </div>
                        <Badge
                            variant="secondary"
                            className={`text-[11px] font-semibold ${occupancyInfo.badgeClass}`}
                        >
                            {occupancyInfo.label}
                        </Badge>
                    </div>
                    <div className="mt-3">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                                className={`h-full transition-all duration-500 ${occupancyInfo.barColor}`}
                                style={{
                                    width: `${Math.min(100, summary?.occupancy ?? 0)}%`,
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 4: Prediksi Holt-Winters */}
            <Card className="relative overflow-hidden border-blue-200/80 bg-gradient-to-br from-card to-blue-50/40 shadow-xs transition-all hover:shadow-md dark:border-blue-900/40 dark:from-card dark:to-blue-950/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-semibold tracking-wider text-blue-900 uppercase dark:text-blue-200">
                        Proyeksi Bulan Depan
                    </CardTitle>
                    <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                        <TrendingUp className="size-4.5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-black tracking-tight text-blue-950 sm:text-3xl dark:text-white">
                            {forecast ? formatNumber(forecast.nilai_forecast) : '-'}
                            <span className="ml-1 text-xs font-normal text-muted-foreground">orang</span>
                        </div>
                        {forecastGrowth !== 0 && (
                            <span
                                className={`inline-flex items-center text-xs font-bold ${
                                    forecastGrowth > 0
                                        ? 'text-rose-600 dark:text-rose-400'
                                        : 'text-sky-600 dark:text-sky-400'
                                }`}
                            >
                                {forecastGrowth > 0 ? (
                                    <ArrowUpRight className="size-3.5" />
                                ) : (
                                    <ArrowDownRight className="size-3.5" />
                                )}
                                {forecastGrowth > 0 ? `+${forecastGrowth}%` : `${forecastGrowth}%`}
                            </span>
                        )}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Target Waktu</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-300">
                            {forecast
                                ? `${monthNames[forecast.bulan_prediksi]} ${forecast.tahun_prediksi}`
                                : '-'}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
