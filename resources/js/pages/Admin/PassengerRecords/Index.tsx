import { useState, useMemo, FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Anchor,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Edit3,
    FileSpreadsheet,
    FileText,
    Filter,
    Lock,
    Navigation,
    Plus,
    RefreshCw,
    Search,
    Ship,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ManifestItem {
    id: number;
    ship_id: number;
    shipping_route_id: number;
    tanggal: string;
    tanggal_formatted: string;
    hari: string;
    ship_name: string;
    ship_type: string;
    route_name: string;
    asal: string;
    tujuan: string;
    jumlah_penumpang: number;
    kapasitas: number;
    sisa_kursi: number;
    occupancy: number;
    is_locked?: boolean;
    creator_name: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedManifests {
    data: ManifestItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface ShipOption {
    id: number;
    nama_kapal: string;
    kapasitas: number;
    status: string;
}

interface ShippingRouteOption {
    id: number;
    asal: string;
    tujuan: string;
    status: string;
}

interface Props {
    manifests: PaginatedManifests;
    filters: {
        ship_id: string | number;
        route_id: string | number;
        date: string;
        search: string;
    };
    summary: {
        total_manifests: number;
        total_passengers: number;
        total_capacity: number;
        avg_occupancy: number;
    };
    ships: ShipOption[];
    routes: ShippingRouteOption[];
}

export default function PassengerRecordIndex({
    manifests,
    filters,
    summary,
    ships = [],
    routes = [],
}: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedShip, setSelectedShip] = useState<string | number>(filters.ship_id || 'all');
    const [selectedRoute, setSelectedRoute] = useState<string | number>(filters.route_id || 'all');
    const [selectedDate, setSelectedDate] = useState(filters.date || '');
    const [deletingRecord, setDeletingRecord] = useState<ManifestItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const applyFilters = (newFilters: Partial<typeof filters>) => {
        router.get(
            '/passenger-records',
            {
                ship_id: newFilters.ship_id !== undefined ? newFilters.ship_id : selectedShip,
                route_id: newFilters.route_id !== undefined ? newFilters.route_id : selectedRoute,
                date: newFilters.date !== undefined ? newFilters.date : selectedDate,
                search: newFilters.search !== undefined ? newFilters.search : searchTerm,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        applyFilters({ search: searchTerm });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedShip('all');
        setSelectedRoute('all');
        setSelectedDate('');
        router.get('/passenger-records', {}, { preserveState: true });
    };

    const confirmDelete = () => {
        if (!deletingRecord || deletingRecord.is_locked) return;

        setIsDeleting(true);
        router.delete(`/passenger-records/${deletingRecord.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setDeletingRecord(null);
            },
        });
    };

    return (
        <>
            <Head title="Input Manifest Penumpang - Operator SIMARIN" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* OPERATOR CONTROL DECK HEADER */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl sm:p-8">
                    <div className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-blue-600/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-300 backdrop-blur-md">
                                    <FileSpreadsheet className="size-3.5" />
                                    OPERATOR MANIFEST DECK
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                                    <Activity className="size-3" />
                                    Pencatatan Keberangkatan Kapal
                                </span>
                            </div>

                            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                                Input Manifest Penumpang Kapal
                            </h1>
                            <p className="max-w-2xl text-xs text-slate-300 sm:text-sm leading-relaxed">
                                Rekam data manifes harian jumlah penumpang per jadwal keberangkatan kapal penyeberangan lintas Jepara &ndash; Karimunjawa secara real-time.
                            </p>
                        </div>

                        <Button
                            asChild
                            className="h-auto cursor-pointer border border-cyan-400/30 bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition-all hover:from-cyan-500 hover:to-blue-500 shrink-0"
                        >
                            <Link href="/passenger-records/create">
                                <Plus className="mr-1.5 size-4" />
                                Input Manifest Baru
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 4 SUMMARY METRICS */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Manifests */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Total Manifest Terdata
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <FileSpreadsheet className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {summary.total_manifests.toLocaleString('id-ID')}{' '}
                                <span className="text-xs font-normal text-muted-foreground">keberangkatan</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Seluruh trip manifest terfilter
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Passengers */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Total Penumpang Terangkut
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                                <Users className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {summary.total_passengers.toLocaleString('id-ID')}{' '}
                                <span className="text-xs font-normal text-muted-foreground">orang</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Akumulasi tiket manifest faktual
                            </p>
                        </CardContent>
                    </Card>

                    {/* Average Occupancy */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Rata-rata Keterisian (Load Factor)
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                <Activity className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline justify-between">
                                <div className="text-2xl font-black text-foreground">
                                    {summary.avg_occupancy}%
                                </div>
                                <Badge variant="outline" className="text-[10px] font-mono">
                                    {summary.total_capacity.toLocaleString('id-ID')} Kapasitas
                                </Badge>
                            </div>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-500"
                                    style={{ width: `${Math.min(100, summary.avg_occupancy)}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Ships Available */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Armada Aktif Terdaftar
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                <Ship className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {ships.filter((s) => s.status === 'aktif').length}{' '}
                                <span className="text-xs font-normal text-muted-foreground">unit kapal</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Siap melayani penginputan manifest
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* FILTER BAR */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                <Filter className="size-4 text-cyan-600" />
                                Filter Manifest Pelayaran
                            </CardTitle>
                            {(selectedShip !== 'all' || selectedRoute !== 'all' || selectedDate !== '' || searchTerm !== '') && (
                                <button
                                    onClick={resetFilters}
                                    className="cursor-pointer text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                                >
                                    <RefreshCw className="size-3" />
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Filter Kapal */}
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Armada Kapal</label>
                                <select
                                    value={selectedShip}
                                    onChange={(e) => {
                                        setSelectedShip(e.target.value);
                                        applyFilters({ ship_id: e.target.value });
                                    }}
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground shadow-2xs focus:border-cyan-500 focus:outline-none"
                                >
                                    <option value="all">Semua Kapal</option>
                                    {ships.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.nama_kapal} ({s.kapasitas} kursi)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter Rute */}
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Rute Pelayaran</label>
                                <select
                                    value={selectedRoute}
                                    onChange={(e) => {
                                        setSelectedRoute(e.target.value);
                                        applyFilters({ route_id: e.target.value });
                                    }}
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground shadow-2xs focus:border-cyan-500 focus:outline-none"
                                >
                                    <option value="all">Semua Rute</option>
                                    {routes.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.asal} &rarr; {r.tujuan}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter Tanggal */}
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Tanggal Spesifik</label>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        applyFilters({ date: e.target.value });
                                    }}
                                    className="mt-1 h-9 text-xs"
                                />
                            </div>

                            {/* Search Box */}
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Pencarian</label>
                                <form onSubmit={handleSearchSubmit} className="mt-1 flex gap-1.5">
                                    <Input
                                        type="text"
                                        placeholder="Cari kapal / tgl..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <Button type="submit" size="sm" className="h-9 px-3">
                                        <Search className="size-3.5" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* MANIFEST DATA TABLE */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div>
                            <CardTitle className="text-base font-bold">
                                Log Data Manifest Keberangkatan
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Menampilkan {manifests.from || 0} - {manifests.to || 0} dari total {manifests.total.toLocaleString('id-ID')} riwayat manifest.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-y border-border/80 bg-muted/50 font-bold text-muted-foreground">
                                    <tr>
                                        <th className="py-3 px-4">Tanggal & Hari</th>
                                        <th className="py-3 px-3">Armada Kapal</th>
                                        <th className="py-3 px-3">Rute Pelayaran</th>
                                        <th className="py-3 px-3 text-center">Kapasitas</th>
                                        <th className="py-3 px-3 text-right">Penumpang Faktual</th>
                                        <th className="py-3 px-3 text-center">Okupansi</th>
                                        <th className="py-3 px-3">Petugas Input</th>
                                        <th className="py-3 px-4 text-right">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 font-medium">
                                    {manifests.data.length > 0 ? (
                                        manifests.data.map((item) => (
                                            <tr key={item.id} className="transition-colors hover:bg-muted/30">
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-foreground">{item.tanggal_formatted}</div>
                                                    <div className="text-[11px] text-muted-foreground">{item.hari}</div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="font-bold text-foreground flex items-center gap-1.5">
                                                        <Ship className="size-3.5 text-blue-600" />
                                                        {item.ship_name}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">{item.ship_type}</div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                                                        {item.asal} &rarr; {item.tujuan}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-center font-mono font-semibold">
                                                    {item.kapasitas} kursi
                                                </td>
                                                <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                                                    {item.jumlah_penumpang.toLocaleString('id-ID')} <span className="font-normal text-muted-foreground text-[10px]">org</span>
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <div className="font-mono font-bold text-xs text-foreground">
                                                        {item.occupancy}%
                                                    </div>
                                                    <div className="mx-auto mt-1 h-1.5 w-14 overflow-hidden rounded-full bg-secondary">
                                                        <div
                                                            className={`h-full ${
                                                                item.occupancy >= 90
                                                                    ? 'bg-rose-500'
                                                                    : item.occupancy >= 60
                                                                    ? 'bg-emerald-500'
                                                                    : 'bg-sky-500'
                                                            }`}
                                                            style={{ width: `${Math.min(100, item.occupancy)}%` }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-muted-foreground text-[11px]">
                                                    {item.creator_name}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {item.is_locked ? (
                                                        <span
                                                            className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-muted/60 px-2 py-1 text-[11px] font-semibold text-muted-foreground select-none"
                                                            title="Periode ini telah berstatus FINAL (Terkunci). Buka koreksi di menu Penutupan Periode jika ingin mengubah data."
                                                        >
                                                            <Lock className="size-3 text-amber-500" />
                                                            Terkunci (Final)
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                asChild
                                                                className="h-7 px-2 text-xs"
                                                            >
                                                                <Link href={`/passenger-records/${item.id}/edit`}>
                                                                    <Edit3 className="mr-1 size-3 text-blue-600" />
                                                                    Edit
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setDeletingRecord(item)}
                                                                className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                                                            >
                                                                <Trash2 className="size-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-muted-foreground">
                                                Tidak ada data manifest yang sesuai dengan filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {manifests.links && manifests.links.length > 3 && (
                            <div className="flex flex-col items-center justify-between gap-3 border-t border-border/80 p-4 sm:flex-row">
                                <div className="text-xs text-muted-foreground">
                                    Halaman <span className="font-bold text-foreground">{manifests.current_page}</span> dari{' '}
                                    <span className="font-bold text-foreground">{manifests.last_page}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1">
                                    {manifests.links.map((link, idx) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="rounded-md px-2.5 py-1 text-xs text-muted-foreground opacity-50"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }
                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveScroll
                                                preserveState
                                                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                                                    link.active
                                                        ? 'bg-cyan-600 text-white shadow-xs'
                                                        : 'border border-border/70 bg-card text-foreground hover:bg-muted'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* MODAL CONFIRMATION DELETE */}
                {deletingRecord && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                                    <Trash2 className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">
                                        Hapus Data Manifest?
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {deletingRecord.ship_name} &bull; {deletingRecord.tanggal_formatted}
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Apakah Anda yakin ingin menghapus catatan manifest sebanyak <b>{deletingRecord.jumlah_penumpang} penumpang</b> pada rute <b>{deletingRecord.asal} &rarr; {deletingRecord.tujuan}</b>? Tindakan ini tidak dapat dibatalkan.
                            </p>

                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeletingRecord(null)}
                                    disabled={isDeleting}
                                    className="text-xs"
                                >
                                    Batal
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
                                >
                                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus Manifest'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

PassengerRecordIndex.layout = {
    breadcrumbs: [
        {
            title: 'Input Manifest Penumpang',
            href: '/passenger-records',
        },
    ],
};
