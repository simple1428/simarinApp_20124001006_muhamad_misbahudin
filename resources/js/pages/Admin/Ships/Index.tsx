import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Anchor,
    CheckCircle2,
    Edit3,
    Filter,
    LayoutGrid,
    List,
    Plus,
    Power,
    RefreshCw,
    Search,
    Shield,
    Ship,
    SlidersHorizontal,
    Users,
    X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { create, edit, toggleStatus } from '@/routes/ships';
import shipsRoute from '@/routes/ships';

interface ShipItem {
    id: number;
    nama_kapal: string;
    jenis_kapal: string;
    kapasitas: number;
    status: 'aktif' | 'nonaktif';
    created_at?: string;
    updated_at?: string;
}

interface Props {
    ships: ShipItem[];
}

export default function ShipIndex({ ships = [] }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'nonaktif'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [selectedShipForToggle, setSelectedShipForToggle] = useState<ShipItem | null>(null);
    const [isToggling, setIsToggling] = useState(false);

    // Filtered ships
    const filteredShips = useMemo(() => {
        return ships.filter((ship) => {
            const matchesSearch =
                ship.nama_kapal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (ship.jenis_kapal && ship.jenis_kapal.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === 'all' || ship.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [ships, searchTerm, statusFilter]);

    // Operational Summary
    const stats = useMemo(() => {
        const total = ships.length;
        const active = ships.filter((s) => s.status === 'aktif').length;
        const inactive = ships.filter((s) => s.status === 'nonaktif').length;
        const totalCapacity = ships
            .filter((s) => s.status === 'aktif')
            .reduce((sum, s) => sum + Number(s.kapasitas || 0), 0);

        return { total, active, inactive, totalCapacity };
    }, [ships]);

    const handleConfirmToggle = () => {
        if (!selectedShipForToggle) return;

        setIsToggling(true);
        router.patch(
            toggleStatus.url(selectedShipForToggle.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsToggling(false);
                    setSelectedShipForToggle(null);
                },
            }
        );
    };

    return (
        <>
            <Head title="Master Armada Kapal - Operator SIMARIN" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* OPERATOR CONTROL DECK HEADER */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl sm:p-8">
                    <div className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-blue-600/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-300 backdrop-blur-md">
                                    <Anchor className="size-3.5" />
                                    OPERATOR CONTROL DECK
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                                    <Activity className="size-3" />
                                    Registri Armada Penyeberangan
                                </span>
                            </div>

                            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                                Master Data Armada Kapal
                            </h1>
                            <p className="max-w-2xl text-xs text-slate-300 sm:text-sm leading-relaxed">
                                Kelola registrasi kapal, kapasitas kursi terpasang (*Capacity Snapshot*), dan kontrol status kelaiklautan operasional lintas penyeberangan Jepara &ndash; Karimunjawa.
                            </p>
                        </div>

                        <Button
                            asChild
                            className="h-auto cursor-pointer border border-cyan-400/30 bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition-all hover:from-cyan-500 hover:to-blue-500 shrink-0"
                        >
                            <Link href={create()}>
                                <Plus className="mr-1.5 size-4" />
                                Tambah Armada Kapal
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 4 FLEET STATUS SUMMARY CARDS */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Ships */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Total Armada Terdaftar
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <Ship className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {stats.total} <span className="text-xs font-normal text-muted-foreground">unit kapal</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Registrasi resmi armada pelabuhan
                            </p>
                        </CardContent>
                    </Card>

                    {/* Active Ships */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Armada Siap Operasi
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                <CheckCircle2 className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {stats.active} <span className="text-xs font-normal text-muted-foreground">unit aktif</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Siap melayani jadwal pelayaran
                            </p>
                        </CardContent>
                    </Card>

                    {/* Inactive Ships */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Nonaktif / Docking
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                                <AlertCircle className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                                {stats.inactive} <span className="text-xs font-normal text-muted-foreground">unit</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Pemeliharaan rutin / cadangan
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Active Capacity */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Kapasitas Siap Angkut
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                <Users className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                {stats.totalCapacity.toLocaleString('id-ID')} <span className="text-xs font-normal text-muted-foreground">kursi/trip</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Daya angkut simultan armada aktif
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* FILTER & VIEW TOGGLE BAR */}
                <div className="flex flex-col justify-between gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-xs sm:flex-row sm:items-center">
                    {/* Search & Status Filters */}
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Cari nama atau jenis kapal..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-9 pl-9 text-xs"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Status Filter Buttons */}
                        <div className="inline-flex rounded-lg border border-border/70 bg-muted/40 p-0.5">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all ${
                                    statusFilter === 'all'
                                        ? 'bg-background font-semibold text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Semua ({ships.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('aktif')}
                                className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all ${
                                    statusFilter === 'aktif'
                                        ? 'bg-background font-semibold text-emerald-600 dark:text-emerald-400 shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Aktif ({stats.active})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('nonaktif')}
                                className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all ${
                                    statusFilter === 'nonaktif'
                                        ? 'bg-background font-semibold text-amber-600 dark:text-amber-400 shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Nonaktif ({stats.inactive})
                            </button>
                        </div>
                    </div>

                    {/* View Switcher */}
                    <div className="inline-flex rounded-lg border border-border/70 bg-muted/40 p-0.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`cursor-pointer rounded-md p-1.5 transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            title="Tampilan Grid Kartu"
                        >
                            <LayoutGrid className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`cursor-pointer rounded-md p-1.5 transition-all ${
                                viewMode === 'table'
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            title="Tampilan Tabel Data"
                        >
                            <List className="size-4" />
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA: GRID OR TABLE VIEW */}
                {filteredShips.length === 0 ? (
                    <Card className="border-dashed p-12 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Ship className="size-6" />
                        </div>
                        <h3 className="mt-4 text-base font-bold text-foreground">Tidak Ada Data Kapal Ditemukan</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Coba sesuaikan kata kunci pencarian atau reset filter status.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                            }}
                            className="mt-4 text-xs"
                        >
                            <RefreshCw className="mr-1.5 size-3.5" />
                            Reset Pencarian
                        </Button>
                    </Card>
                ) : viewMode === 'grid' ? (
                    /* 1. GRID CARDS VIEW */
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredShips.map((ship) => (
                            <Card
                                key={ship.id}
                                className="group relative overflow-hidden border-border/80 shadow-xs transition-all hover:border-slate-400 hover:shadow-md dark:hover:border-slate-700"
                            >
                                {/* Top status accent line */}
                                <div
                                    className={`absolute top-0 left-0 h-1 w-full ${
                                        ship.status === 'aktif' ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                                />

                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className={`flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                                                    ship.status === 'aktif'
                                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                                                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                                                }`}
                                            >
                                                <Ship className="size-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-bold text-foreground">
                                                    {ship.nama_kapal}
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    {ship.jenis_kapal || 'Kapal Penumpang'}
                                                </CardDescription>
                                            </div>
                                        </div>

                                        <Badge
                                            className={
                                                ship.status === 'aktif'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-bold'
                                            }
                                        >
                                            <span
                                                className={`mr-1 size-1.5 rounded-full ${
                                                    ship.status === 'aktif' ? 'bg-emerald-500' : 'bg-amber-500'
                                                }`}
                                            />
                                            {ship.status === 'aktif' ? 'Aktif Beroperasi' : 'Nonaktif'}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 pt-0">
                                    {/* Capacity Snapshot Box */}
                                    <div className="rounded-xl border border-border/70 bg-muted/40 p-3 space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Kapasitas Muatan:</span>
                                            <span className="font-mono font-bold text-foreground text-sm">
                                                {ship.kapasitas.toLocaleString('id-ID')}{' '}
                                                <span className="text-xs font-normal text-muted-foreground">kursi</span>
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            Batas resmi sesuai sertifikat keselamatan kapal KSOP
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="flex-1 h-8 text-xs font-semibold"
                                        >
                                            <Link href={edit(ship.id)}>
                                                <Edit3 className="mr-1.5 size-3.5 text-blue-600" />
                                                Edit Data
                                            </Link>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedShipForToggle(ship)}
                                            className={`h-8 px-2.5 text-xs font-medium ${
                                                ship.status === 'aktif'
                                                    ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40'
                                                    : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40'
                                            }`}
                                            title={ship.status === 'aktif' ? 'Nonaktifkan Kapal' : 'Aktifkan Kapal'}
                                        >
                                            <Power className="size-3.5 mr-1" />
                                            {ship.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    /* 2. DATA TABLE VIEW */
                    <Card className="border-border/80 shadow-xs">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-border/80 bg-muted/50 font-bold text-muted-foreground">
                                        <tr>
                                            <th className="py-3.5 px-4">No</th>
                                            <th className="py-3.5 px-4">Nama Armada Kapal</th>
                                            <th className="py-3.5 px-4">Jenis Kapal</th>
                                            <th className="py-3.5 px-4 text-right">Kapasitas Kursi</th>
                                            <th className="py-3.5 px-4 text-center">Status Operasional</th>
                                            <th className="py-3.5 px-4 text-right">Tindakan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60 font-medium">
                                        {filteredShips.map((ship, index) => (
                                            <tr key={ship.id} className="transition-colors hover:bg-muted/30">
                                                <td className="py-3.5 px-4 text-muted-foreground">{index + 1}</td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-foreground flex items-center gap-2">
                                                        <Ship className="size-4 text-blue-600" />
                                                        {ship.nama_kapal}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-muted-foreground">
                                                    {ship.jenis_kapal || 'Kapal Penumpang'}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                                                    {ship.kapasitas.toLocaleString('id-ID')}{' '}
                                                    <span className="font-normal text-muted-foreground text-[11px]">penumpang</span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <Badge
                                                        className={
                                                            ship.status === 'aktif'
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold'
                                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-bold'
                                                        }
                                                    >
                                                        {ship.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                            className="h-7 px-2.5 text-xs"
                                                        >
                                                            <Link href={edit(ship.id)}>
                                                                <Edit3 className="mr-1 size-3 text-blue-600" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedShipForToggle(ship)}
                                                            className={`h-7 px-2 text-xs ${
                                                                ship.status === 'aktif'
                                                                    ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                                                                    : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                                                            }`}
                                                        >
                                                            <Power className="size-3 mr-1" />
                                                            {ship.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* MODAL CONFIRMATION FOR STATUS TOGGLE */}
                {selectedShipForToggle && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex size-11 items-center justify-center rounded-xl ${
                                        selectedShipForToggle.status === 'aktif'
                                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                                            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                                    }`}
                                >
                                    <Power className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">
                                        {selectedShipForToggle.status === 'aktif'
                                            ? 'Konfirmasi Nonaktifkan Kapal'
                                            : 'Konfirmasi Aktifkan Kapal'}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedShipForToggle.nama_kapal}
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs leading-relaxed text-muted-foreground">
                                {selectedShipForToggle.status === 'aktif'
                                    ? `Apakah Anda yakin ingin menonaktifkan status armada ${selectedShipForToggle.nama_kapal}? Kapal yang dinonaktifkan tidak akan disertakan dalam estimasi muatan aktif.`
                                    : `Apakah Anda yakin ingin mengaktifkan kembali armada ${selectedShipForToggle.nama_kapal}? Kapal akan siap dipilih untuk penginputan manifest baru.`}
                            </p>

                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedShipForToggle(null)}
                                    disabled={isToggling}
                                    className="text-xs"
                                >
                                    Batal
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleConfirmToggle}
                                    disabled={isToggling}
                                    className={`text-xs font-bold text-white ${
                                        selectedShipForToggle.status === 'aktif'
                                            ? 'bg-amber-600 hover:bg-amber-700'
                                            : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                                >
                                    {isToggling
                                        ? 'Memproses...'
                                        : selectedShipForToggle.status === 'aktif'
                                        ? 'Ya, Nonaktifkan'
                                        : 'Ya, Aktifkan'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ShipIndex.layout = {
    breadcrumbs: [
        {
            title: 'Master Armada Kapal',
            href: shipsRoute.index(),
        },
    ],
};
