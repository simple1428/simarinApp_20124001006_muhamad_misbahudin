import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Anchor,
    Award,
    Calendar,
    CheckCircle2,
    FileSpreadsheet,
    FileText,
    Filter,
    Gauge,
    Printer,
    Ship,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from './types';

interface ReportRow {
    id: number;
    bulan_angka: number;
    bulan_nama: string;
    tahun: number;
    status: string;
    total_penumpang: number;
    jumlah_trip: number;
    avg_per_trip: number;
    occupancy: number;
    season: string;
    season_label: string;
    forecast: number | null;
    variance: number | null;
    variance_pct: number | null;
}

interface ReportsProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    selectedYear: number;
    availableYears: number[];
    reportData: ReportRow[];
    annualSummary: {
        total_penumpang: number;
        total_trip: number;
        avg_occupancy: number;
        peak_month: string;
        peak_passenger: number;
        lowest_month: string;
        lowest_passenger: number;
    };
    generatedAt: string;
}

export default function Reports({
    user,
    selectedYear,
    availableYears,
    reportData,
    annualSummary,
    generatedAt,
}: ReportsProps) {
    const handleYearChange = (year: number) => {
        router.get(
            '/kepala-pelabuhan/reports',
            { year },
            { preserveState: true, preserveScroll: true }
        );
    };

    const getSeasonBadge = (season: string, label: string) => {
        if (season === 'high') {
            return (
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                    <TrendingUp className="size-3" />
                    {label}
                </span>
            );
        }
        if (season === 'low') {
            return (
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                    <TrendingDown className="size-3" />
                    {label}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="size-3" />
                {label}
            </span>
        );
    };

    return (
        <>
            <Head title={`Laporan Rekapitulasi Operasional Tahun ${selectedYear}`} />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* HEADER / BANNER WITH PRINT BUTTON */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center print:hidden">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                <FileText className="size-3.5" />
                                EXECUTIVE SUMMARY REPORT
                            </span>
                        </div>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                            Laporan Rekapitulasi Tahunan Pelabuhan
                        </h1>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Arsip komprehensif data operasional penumpang, frekuensi pelayaran armada, dan perbandingan realisasi terhadap proyeksi model Holt-Winters.
                        </p>
                    </div>

                    {/* ACTIONS: YEAR FILTER & PRINT */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1 shadow-xs">
                            <Filter className="ml-2 size-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Tahun:</span>
                            <div className="flex gap-1">
                                {availableYears.map((yr) => (
                                    <button
                                        key={yr}
                                        onClick={() => handleYearChange(yr)}
                                        className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                            selectedYear === yr
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                    >
                                        {yr}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={() => window.print()}
                            className="cursor-pointer gap-2 bg-slate-900 text-xs font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                        >
                            <Printer className="size-4" />
                            Cetak Laporan Resmi
                        </Button>
                    </div>
                </div>

                {/* OFFICIAL MARITIME LETTERHEAD (VISIBLE ONLY IN PRINT / PREVIEW) */}
                <div className="hidden border-b-2 border-slate-900 pb-4 text-center print:block">
                    <div className="text-xs tracking-widest uppercase text-slate-500">
                        KEMENTERIAN PERHUBUNGAN REPUBLIK INDONESIA
                    </div>
                    <div className="text-base font-black tracking-wider uppercase text-slate-900">
                        DIREKTORAT JENDERAL PERHUBUNGAN LAUT
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                        KANTOR KESYAHBANDARAN DAN OTORITAS PELABUHAN
                    </div>
                    <div className="text-[11px] text-slate-600">
                        Sistem Informasi Manajemen & Rekapitulasi Maritim (SIMARIN)
                    </div>
                    <div className="mt-2 text-xs font-bold text-slate-900 underline">
                        LAPORAN EKSEKUTIF REKAPITULASI PENUMPANG & OPERASIONAL TAHUN {selectedYear}
                    </div>
                </div>

                {/* ANNUAL SUMMARY KPI CARDS */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Penumpang */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Total Penumpang {selectedYear}
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <Users className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {formatNumber(annualSummary.total_penumpang)}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">orang</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Akumulasi 12 bulan operasional
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Trip */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Frekuensi Pelayaran
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                <Ship className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {formatNumber(annualSummary.total_trip)}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">keberangkatan</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Total trip armada kapal
                            </p>
                        </CardContent>
                    </Card>

                    {/* Rata-rata Okupansi */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Rata-rata Okupansi
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                                <Gauge className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {annualSummary.avg_occupancy}%
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Keterisian kapasitas armada
                            </p>
                        </CardContent>
                    </Card>

                    {/* Bulan Puncak */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Periode Terpadat
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                                <TrendingUp className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
                                {annualSummary.peak_month}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {formatNumber(annualSummary.peak_passenger)} penumpang
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* DETAILED MONTHLY REPORT TABLE */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-lg font-bold">
                                    Tabel Rekapitulasi Data Manifes Bulanan ({selectedYear})
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Rincian riil pergerakan penumpang, frekuensi trip, okupansi, klasifikasi musim, dan evaluasi terhadap prediksi Holt-Winters.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs font-mono self-start sm:self-auto">
                                Total {reportData.length} Bulan Terdata
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-y border-border/80 bg-muted/50 font-bold text-muted-foreground">
                                    <tr>
                                        <th className="py-3.5 px-4">Bulan</th>
                                        <th className="py-3.5 px-3 text-right">Realisasi Penumpang</th>
                                        <th className="py-3.5 px-3 text-right">Trip Kapal</th>
                                        <th className="py-3.5 px-3 text-right">Rata-rata/Trip</th>
                                        <th className="py-3.5 px-3 text-center">Okupansi</th>
                                        <th className="py-3.5 px-3 text-center">Klasifikasi Musim</th>
                                        <th className="py-3.5 px-3 text-right">Prediksi Holt-Winters</th>
                                        <th className="py-3.5 px-4 text-right">Deviasi &plusmn;</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 font-medium">
                                    {reportData.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <td className="py-3 px-4 font-bold text-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <span>{row.bulan_nama}</span>
                                                    {row.status === 'open' && (
                                                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                                            Berjalan
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                                                {formatNumber(row.total_penumpang)}{' '}
                                                <span className="font-normal text-muted-foreground">org</span>
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono">
                                                {formatNumber(row.jumlah_trip)}
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                                                ~{formatNumber(row.avg_per_trip)}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span
                                                    className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${
                                                        row.occupancy >= 85
                                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                                            : row.occupancy >= 65
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                            : 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                                                    }`}
                                                >
                                                    {row.occupancy}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                {getSeasonBadge(row.season, row.season_label)}
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono font-medium text-foreground">
                                                {row.forecast ? formatNumber(row.forecast) : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono">
                                                {row.status === 'open' ? (
                                                    <span className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                                                        Akumulasi Berjalan
                                                    </span>
                                                ) : row.variance !== null ? (
                                                    <span
                                                        className={
                                                            row.variance >= 0
                                                                ? 'text-rose-600 dark:text-rose-400 font-bold'
                                                                : 'text-sky-600 dark:text-sky-400 font-bold'
                                                        }
                                                    >
                                                        {row.variance > 0
                                                            ? `+${formatNumber(row.variance)}`
                                                            : formatNumber(row.variance)}{' '}
                                                        <span className="text-[10px] font-normal">
                                                            {row.variance_pct !== null && (
                                                                <>({row.variance_pct > 0 ? `+${row.variance_pct}%` : `${row.variance_pct}%`})</>
                                                            )}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t-2 border-border/80 bg-muted/40 font-bold text-foreground">
                                    <tr>
                                        <td className="py-3 px-4 uppercase">Total / Rata-rata</td>
                                        <td className="py-3 px-3 text-right font-mono text-blue-600 dark:text-blue-400">
                                            {formatNumber(annualSummary.total_penumpang)} org
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono">
                                            {formatNumber(annualSummary.total_trip)} trip
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                                            -
                                        </td>
                                        <td className="py-3 px-3 text-center font-mono">
                                            {annualSummary.avg_occupancy}%
                                        </td>
                                        <td colSpan={3} className="py-3 px-4 text-right text-xs text-muted-foreground font-normal">
                                            Laporan di-generate pada: {generatedAt}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* OFFICIAL SIGNATURE BLOCK FOR PRINT */}
                <div className="hidden pt-8 print:block">
                    <div className="flex justify-between text-xs">
                        <div className="text-slate-600">
                            <div>Catatan:</div>
                            <div>- Dokumen sah diekspor dari Sistem SIMARIN.</div>
                            <div>- Data di atas adalah hasil final verifikasi manifes.</div>
                        </div>
                        <div className="w-64 text-center">
                            <div>Ditetapkan di Pelabuhan, {generatedAt.split(' ')[0]} {generatedAt.split(' ')[1]} {selectedYear}</div>
                            <div className="font-bold">KEPALA KANTOR KESYAHBANDARAN DAN OTORITAS PELABUHAN</div>
                            <div className="h-20" />
                            <div className="font-bold underline text-slate-900">{user?.name || 'Kepala Pelabuhan'}</div>
                            <div className="text-[11px] text-slate-600">NIP. 19780512 200312 1 002</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Reports.layout = {
    breadcrumbs: [
        {
            title: 'Laporan & Rekapitulasi',
            href: '/kepala-pelabuhan/reports',
        },
    ],
};
