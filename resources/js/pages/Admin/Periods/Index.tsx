import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Anchor,
    ArrowRight,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    Clock,
    Cpu,
    Database,
    History,
    Info,
    Lock,
    Plus,
    RefreshCw,
    Shield,
    TrendingUp,
    Unlock,
    Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PeriodItem {
    id: number;
    bulan: number;
    tahun: number;
    periode_label: string;
    status: 'open' | 'final';
    total_penumpang: number;
    jumlah_trip: number;
    total_kapasitas: number;
    occupancy: number;
    finalized_by: string | null;
    finalized_at: string | null;
}

interface Props {
    periods: PeriodItem[];
    activePeriod: PeriodItem | null;
    stats: {
        total_periods: number;
        finalized_count: number;
        open_count: number;
        total_final_passengers: number;
    };
}

export default function PeriodIndex({
    periods = [],
    activePeriod,
    stats,
}: Props) {
    const [selectedPeriodForFinalize, setSelectedPeriodForFinalize] = useState<PeriodItem | null>(null);
    const [selectedPeriodForReopen, setSelectedPeriodForReopen] = useState<PeriodItem | null>(null);
    const [showNewPeriodModal, setShowNewPeriodModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [newMonth, setNewMonth] = useState<number>(new Date().getMonth() + 1);
    const [newYear, setNewYear] = useState<number>(new Date().getFullYear());

    const handleConfirmFinalize = () => {
        if (!selectedPeriodForFinalize) return;

        setIsProcessing(true);
        router.patch(`/periods/${selectedPeriodForFinalize.id}/finalize`, {}, {
            preserveScroll: true,
            onFinish: () => {
                setIsProcessing(false);
                setSelectedPeriodForFinalize(null);
            },
        });
    };

    const handleConfirmReopen = () => {
        if (!selectedPeriodForReopen) return;

        setIsProcessing(true);
        router.patch(`/periods/${selectedPeriodForReopen.id}/reopen`, {}, {
            preserveScroll: true,
            onFinish: () => {
                setIsProcessing(false);
                setSelectedPeriodForReopen(null);
            },
        });
    };

    const handleCreatePeriod = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        router.post('/periods', { bulan: newMonth, tahun: newYear }, {
            onFinish: () => {
                setIsProcessing(false);
                setShowNewPeriodModal(false);
            },
        });
    };

    return (
        <>
            <Head title="Rekapitulasi & Penutupan Periode - Operator SIMARIN" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* OPERATOR CONTROL DECK HEADER */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl sm:p-8">
                    <div className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-blue-600/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-300 backdrop-blur-md">
                                    <Lock className="size-3.5" />
                                    MONTHLY CLOSING & PIPELINE
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                                    <Database className="size-3" />
                                    Data Training Holt-Winters
                                </span>
                            </div>

                            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                                Rekapitulasi & Penutupan Periode Bulanan
                            </h1>
                            <p className="max-w-2xl text-xs text-slate-300 sm:text-sm leading-relaxed">
                                Validasi data manifes bulanan dan lakukan finalisasi (*Closing Period*). Data periode yang ditutup otomatis dikunci dan dijadikan basis pelatihan model peramalan penumpang di pelabuhan.
                            </p>
                        </div>

                        <Button
                            onClick={() => setShowNewPeriodModal(true)}
                            className="h-auto cursor-pointer border border-cyan-400/30 bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition-all hover:from-cyan-500 hover:to-blue-500 shrink-0"
                        >
                            <Plus className="mr-1.5 size-4" />
                            Buka Periode Baru
                        </Button>
                    </div>
                </div>

                {/* ACTIVE PERIOD HIGHLIGHT CARD */}
                {activePeriod ? (
                    <Card className="border-cyan-500/40 bg-gradient-to-br from-cyan-950/20 via-card to-card shadow-md">
                        <CardHeader className="border-b border-border/60 pb-4">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                        <Clock className="size-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                Periode Berjalan (Aktif)
                                            </span>
                                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-bold">
                                                <span className="mr-1 size-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                STATUS: OPEN (Penginputan Berlangsung)
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl font-black text-foreground sm:text-2xl mt-0.5">
                                            {activePeriod.periode_label}
                                        </CardTitle>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setSelectedPeriodForFinalize(activePeriod)}
                                    className="cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500"
                                >
                                    <Lock className="mr-1.5 size-4" />
                                    Finalisasi & Tutup Periode Ini
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-4">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1">
                                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Akumulasi Penumpang Faktual</span>
                                    <div className="text-xl font-black text-foreground font-mono">
                                        {activePeriod.total_penumpang.toLocaleString('id-ID')}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">orang</span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1">
                                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Total Keberangkatan (Trip)</span>
                                    <div className="text-xl font-black text-foreground font-mono">
                                        {activePeriod.jumlah_trip.toLocaleString('id-ID')}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">pelayaran</span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1">
                                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Total Kapasitas Kursi</span>
                                    <div className="text-xl font-black text-foreground font-mono">
                                        {activePeriod.total_kapasitas.toLocaleString('id-ID')}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">kursi</span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-1">
                                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Rata-rata Keterisian</span>
                                    <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                                        {activePeriod.occupancy}%
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-start gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-muted-foreground">
                                <Info className="size-4 shrink-0 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                                <span>
                                    Ketika Anda menekan <b>Finalisasi & Tutup Periode Ini</b>, seluruh data manifest faktual bulan {activePeriod.periode_label} akan direkap secara permanen dan sistem akan langsung memperbarui model peramalan Holt-Winters untuk bulan berikutnya.
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-emerald-500/40 bg-emerald-50/20 p-6 text-center dark:bg-emerald-950/10">
                        <CheckCircle2 className="mx-auto size-8 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="mt-2 text-base font-bold text-foreground">Semua Periode Bulanan Telah Ditutup</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Tidak ada periode berstatus OPEN saat ini. Anda dapat membuka periode baru untuk bulan berikutnya.
                        </p>
                        <Button
                            size="sm"
                            onClick={() => setShowNewPeriodModal(true)}
                            className="mt-3 text-xs"
                        >
                            <Plus className="mr-1.5 size-3.5" />
                            Buka Periode Baru
                        </Button>
                    </Card>
                )}

                {/* 4 SUMMARY STATS */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Total Periode Terarsip
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <History className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {stats.total_periods} <span className="text-xs font-normal text-muted-foreground">bulan</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Total database time-series</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Periode Final (Terkunci)
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                <Lock className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {stats.finalized_count} <span className="text-xs font-normal text-muted-foreground">bulan</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Data pelatihan resmi Holt-Winters</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Periode Terbuka (Open)
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                                <Unlock className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                                {stats.open_count} <span className="text-xs font-normal text-muted-foreground">bulan</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Sedang menerima input manifest</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Akumulasi Data Penumpang
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                <Users className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                {stats.total_final_passengers.toLocaleString('id-ID')}{' '}
                                <span className="text-xs font-normal text-muted-foreground">orang</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Total volume periode final</p>
                        </CardContent>
                    </Card>
                </div>

                {/* PERIODS HISTORY TABLE */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">
                            Riwayat Arsip Periode Bulanan
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Seluruh daftar rekapitulasi data bulanan pelabuhan dari masa ke masa.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-y border-border/80 bg-muted/50 font-bold text-muted-foreground">
                                    <tr>
                                        <th className="py-3 px-4">No</th>
                                        <th className="py-3 px-4">Periode Bulan</th>
                                        <th className="py-3 px-3 text-center">Status</th>
                                        <th className="py-3 px-3 text-right">Keberangkatan (Trip)</th>
                                        <th className="py-3 px-3 text-right">Total Penumpang</th>
                                        <th className="py-3 px-3 text-right">Kapasitas Kursi</th>
                                        <th className="py-3 px-3 text-center">Okupansi</th>
                                        <th className="py-3 px-4">Waktu Finalisasi & Petugas</th>
                                        <th className="py-3 px-4 text-right">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 font-medium">
                                    {periods.map((item, idx) => (
                                        <tr key={item.id} className="transition-colors hover:bg-muted/30">
                                            <td className="py-3.5 px-4 text-muted-foreground">{idx + 1}</td>
                                            <td className="py-3.5 px-4 font-bold text-foreground">
                                                {item.periode_label}
                                            </td>
                                            <td className="py-3.5 px-3 text-center">
                                                <Badge
                                                    className={
                                                        item.status === 'final'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-bold'
                                                    }
                                                >
                                                    {item.status === 'final' ? 'Final (Terkunci)' : 'Open (Aktif)'}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-3 text-right font-mono">
                                                {item.jumlah_trip.toLocaleString('id-ID')} trip
                                            </td>
                                            <td className="py-3.5 px-3 text-right font-mono font-bold text-foreground">
                                                {item.total_penumpang.toLocaleString('id-ID')} <span className="font-normal text-muted-foreground text-[10px]">pax</span>
                                            </td>
                                            <td className="py-3.5 px-3 text-right font-mono text-muted-foreground">
                                                {item.total_kapasitas.toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3.5 px-3 text-center font-mono font-bold">
                                                {item.occupancy}%
                                            </td>
                                            <td className="py-3.5 px-4 text-[11px] text-muted-foreground">
                                                {item.finalized_at ? (
                                                    <div>
                                                        <div className="font-semibold text-foreground">{item.finalized_at}</div>
                                                        <div className="text-muted-foreground">Oleh: {item.finalized_by || 'Operator'}</div>
                                                    </div>
                                                ) : item.status === 'final' ? (
                                                    <div>
                                                        <div className="font-semibold text-foreground">Data Historis Faktual</div>
                                                        <div className="text-muted-foreground">Oleh: Sistem Pelabuhan</div>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                                        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                        Sedang Berjalan (Open)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                {item.status === 'open' ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setSelectedPeriodForFinalize(item)}
                                                        className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white"
                                                    >
                                                        <Lock className="size-3 mr-1" />
                                                        Finalisasi
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedPeriodForReopen(item)}
                                                        className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                                                        title="Buka kembali periode jika ada perbaikan data"
                                                    >
                                                        <Unlock className="size-3 mr-1" />
                                                        Buka Koreksi
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* MODAL FINALIZE CONFIRMATION */}
                {selectedPeriodForFinalize && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                    <Lock className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">
                                        Konfirmasi Penutupan Periode
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Periode: {selectedPeriodForFinalize.periode_label}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Penumpang:</span>
                                    <span className="font-mono font-bold text-foreground">{selectedPeriodForFinalize.total_penumpang.toLocaleString('id-ID')} orang</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Keberangkatan:</span>
                                    <span className="font-mono font-bold text-foreground">{selectedPeriodForFinalize.jumlah_trip} trip</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Rata-rata Okupansi:</span>
                                    <span className="font-mono font-bold text-cyan-600">{selectedPeriodForFinalize.occupancy}%</span>
                                </div>
                            </div>

                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Setelah ditutup, status periode akan menjadi <b>FINAL (Terkunci)</b>. Sistem otomatis memperbarui model data deret waktu Holt-Winters untuk Kepala Pelabuhan dan membuka periode bulan berikutnya.
                            </p>

                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedPeriodForFinalize(null)}
                                    disabled={isProcessing}
                                    className="text-xs"
                                >
                                    Batal
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleConfirmFinalize}
                                    disabled={isProcessing}
                                    className="bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                                >
                                    {isProcessing ? 'Memproses...' : 'Ya, Tutup & Finalisasi'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL REOPEN CONFIRMATION */}
                {selectedPeriodForReopen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                                    <Unlock className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">
                                        Buka Kembali Periode?
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Periode: {selectedPeriodForReopen.periode_label}
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Membuka kembali periode ini akan mengubah statusnya menjadi <b>OPEN</b> sehingga Anda dapat memperbaiki atau menambahkan catatan manifest penumpang yang tertinggal.
                            </p>

                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedPeriodForReopen(null)}
                                    disabled={isProcessing}
                                    className="text-xs"
                                >
                                    Batal
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleConfirmReopen}
                                    disabled={isProcessing}
                                    className="bg-amber-600 text-xs font-bold text-white hover:bg-amber-700"
                                >
                                    {isProcessing ? 'Memproses...' : 'Ya, Buka Koreksi'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL CREATE NEW PERIOD */}
                {showNewPeriodModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
                                    <Plus className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">
                                        Buka Periode Pelaporan Baru
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Inisialisasi bulan operasional baru
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleCreatePeriod} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Bulan</Label>
                                    <select
                                        value={newMonth}
                                        onChange={(e) => setNewMonth(Number(e.target.value))}
                                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-2xs focus:border-cyan-500 focus:outline-none"
                                    >
                                        {[
                                            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                                            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                                        ].map((m, idx) => (
                                            <option key={idx + 1} value={idx + 1}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Tahun</Label>
                                    <Input
                                        type="number"
                                        min="2020"
                                        max="2050"
                                        value={newYear}
                                        onChange={(e) => setNewYear(Number(e.target.value))}
                                        className="h-10 text-xs font-mono"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowNewPeriodModal(false)}
                                        disabled={isProcessing}
                                        className="text-xs"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={isProcessing}
                                        className="bg-cyan-600 text-xs font-bold text-white hover:bg-cyan-700"
                                    >
                                        {isProcessing ? 'Menyimpan...' : 'Buka Periode'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

PeriodIndex.layout = {
    breadcrumbs: [
        {
            title: 'Penutupan Periode Bulanan',
            href: '/periods',
        },
    ],
};
