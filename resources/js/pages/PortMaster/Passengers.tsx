import { useState, FormEvent } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Anchor,
    ArrowLeftRight,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Compass,
    FileSpreadsheet,
    FileText,
    Filter,
    Layers,
    MapPin,
    Navigation,
    Printer,
    RefreshCw,
    Search,
    Ship,
    TrendingDown,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import port from '@/routes/port';
import { formatNumber } from './types';

interface ManifestItem {
    id: number;
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
    load_status: 'high' | 'normal' | 'low';
    load_label: string;
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

interface RouteStat {
    id: number;
    rute: string;
    asal: string;
    tujuan: string;
    total_trip: number;
    total_penumpang: number;
    occupancy: number;
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

interface PassengersPageProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    filters: {
        ship_id: string | number;
        route_id: string | number;
        year: string | number;
        month: string | number;
        search: string;
        start_date: string;
        end_date: string;
    };
    summary: {
        total_trips: number;
        total_passengers: number;
        total_capacity: number;
        avg_occupancy: number;
        high_load_trips: number;
    };
    routeBreakdown: RouteStat[];
    manifests: PaginatedManifests;
    ships: ShipOption[];
    routes: ShippingRouteOption[];
    availableYears: number[];
}

export default function Passengers({
    user,
    filters,
    summary,
    routeBreakdown = [],
    manifests,
    ships = [],
    routes = [],
    availableYears = [],
}: PassengersPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedShip, setSelectedShip] = useState<string | number>(filters.ship_id || 'all');
    const [selectedRoute, setSelectedRoute] = useState<string | number>(filters.route_id || 'all');
    const [selectedYear, setSelectedYear] = useState<string | number>(filters.year || 'all');
    const [selectedMonth, setSelectedMonth] = useState<string | number>(filters.month || 'all');

    const months = [
        { value: 1, label: 'Januari' },
        { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' },
        { value: 4, label: 'April' },
        { value: 5, label: 'Mei' },
        { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' },
        { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' },
        { value: 12, label: 'Desember' },
    ];

    const applyFilters = (newFilters: Partial<typeof filters>) => {
        router.get(
            '/kepala-pelabuhan/passengers',
            {
                ship_id: newFilters.ship_id !== undefined ? newFilters.ship_id : selectedShip,
                route_id: newFilters.route_id !== undefined ? newFilters.route_id : selectedRoute,
                year: newFilters.year !== undefined ? newFilters.year : selectedYear,
                month: newFilters.month !== undefined ? newFilters.month : selectedMonth,
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
        setSelectedYear('all');
        setSelectedMonth('all');
        router.get('/kepala-pelabuhan/passengers', {}, { preserveState: true });
    };

    const getLoadStatusBadge = (status: 'high' | 'normal' | 'low', occupancy: number) => {
        switch (status) {
            case 'high':
                return (
                    <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 gap-1 text-[10px] font-bold">
                        <AlertCircle className="size-3" />
                        Penuh ({occupancy}%)
                    </Badge>
                );
            case 'low':
                return (
                    <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 gap-1 text-[10px] font-bold">
                        <TrendingDown className="size-3" />
                        Longgar ({occupancy}%)
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 gap-1 text-[10px] font-bold">
                        <CheckCircle2 className="size-3" />
                        Normal ({occupancy}%)
                    </Badge>
                );
        }
    };

    return (
        <>
            <Head title="Kondisi Operasional & Manifest Penumpang" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* HERO EXECUTIVE BANNER */}
                <div className="relative overflow-hidden rounded-2xl border border-blue-900/40 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl sm:p-8">
                    <div className="pointer-events-none absolute -top-16 -right-16 size-80 rounded-full bg-blue-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 -left-16 size-80 rounded-full bg-cyan-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-300 backdrop-blur-md">
                                    <FileSpreadsheet className="size-3.5" />
                                    VOYAGE MANIFEST & PASSENGER LOGS
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                                    <CheckCircle2 className="size-3" />
                                    Data Lapangan Faktual Terverifikasi
                                </span>
                            </div>

                            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                                Kondisi Operasional & Manifest Penumpang
                            </h1>
                            <p className="max-w-2xl text-sm text-slate-300 sm:text-base leading-relaxed">
                                Monitoring riil log manifest keberangkatan armada, pengawasan muatan rute penyeberangan Jepara &harr; Karimunjawa, serta kepatuhan kapasitas muatan kapal.
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                            className="h-auto cursor-pointer border-white/20 bg-white/10 px-4 py-2.5 text-xs font-medium text-white backdrop-blur-md hover:bg-white/20 hover:text-white shrink-0"
                        >
                            <Printer className="mr-1.5 size-4 text-cyan-300" />
                            Cetak Manifest
                        </Button>
                    </div>
                </div>

                {/* 4 EXECUTIVE KPI CARDS */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Total Trip */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Total Manifest Pelayaran
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <Ship className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {formatNumber(summary.total_trips)}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">keberangkatan</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Total trip pelayaran terfilter
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card 2: Total Penumpang */}
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
                                {formatNumber(summary.total_passengers)}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">orang</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Akumulasi tiket manifest penumpang
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card 3: Rata-rata Okupansi */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Rata-rata Keterisian Muatan
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
                                <span className="text-xs font-semibold text-muted-foreground">
                                    Daya Tampung: {formatNumber(summary.total_capacity)}
                                </span>
                            </div>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-500"
                                    style={{ width: `${Math.min(100, summary.avg_occupancy)}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 4: Trip Padat Penuh */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Trip Muatan Penuh (&ge;90%)
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                                <AlertCircle className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                                {formatNumber(summary.high_load_trips)}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">trip</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Pelayaran berstatus okupansi sangat padat
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ROUTE COMPARISON CARDS */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {routeBreakdown.map((rt) => (
                        <Card key={rt.id} className="border-border/80 shadow-xs">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                            <Navigation className="size-4" />
                                        </div>
                                        <CardTitle className="text-sm font-bold text-foreground">
                                            Rute: {rt.rute}
                                        </CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-xs font-mono">
                                        {rt.occupancy}% Okupansi
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-xs">
                                    <div>
                                        <span className="text-muted-foreground">Total Keberangkatan:</span>
                                        <div className="text-sm font-bold text-foreground">{formatNumber(rt.total_trip)} trip</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Total Penumpang:</span>
                                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            {formatNumber(rt.total_penumpang)} orang
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ADVANCED FILTER & SEARCH BAR */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-sm font-bold">
                                <Filter className="size-4 text-blue-600" />
                                Filter Manifest & Pencarian Pelayaran
                            </CardTitle>
                            {(selectedShip !== 'all' || selectedRoute !== 'all' || selectedYear !== 'all' || selectedMonth !== 'all' || searchTerm !== '') && (
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
                    <CardContent className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {/* Filter Kapal */}
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Armada Kapal</label>
                                <select
                                    value={selectedShip}
                                    onChange={(e) => {
                                        setSelectedShip(e.target.value);
                                        applyFilters({ ship_id: e.target.value });
                                    }}
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground shadow-2xs focus:border-blue-500 focus:outline-none"
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
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground shadow-2xs focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="all">Semua Rute</option>
                                    {routes.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.asal} &rarr; {r.tujuan}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter Tahun */}
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Tahun</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => {
                                        setSelectedYear(e.target.value);
                                        applyFilters({ year: e.target.value });
                                    }}
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground shadow-2xs focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="all">Semua Tahun</option>
                                    {availableYears.map((yr) => (
                                        <option key={yr} value={yr}>
                                            {yr}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter Bulan */}
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Bulan</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => {
                                        setSelectedMonth(e.target.value);
                                        applyFilters({ month: e.target.value });
                                    }}
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground shadow-2xs focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="all">Semua Bulan</option>
                                    {months.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
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
                                        className="h-8.5 text-xs"
                                    />
                                    <Button type="submit" size="sm" className="h-8.5 px-2.5">
                                        <Search className="size-3.5" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* VOYAGE MANIFEST TABLE */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div>
                            <CardTitle className="text-base font-bold">
                                Log Manifest Perjalanan Kapal
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Menampilkan {manifests.from || 0} - {manifests.to || 0} dari total {formatNumber(manifests.total)} catatan manifest pelayaran.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-y border-border/80 bg-muted/50 font-bold text-muted-foreground">
                                    <tr>
                                        <th className="py-3 px-4">Tanggal Pelayaran</th>
                                        <th className="py-3 px-3">Armada Kapal</th>
                                        <th className="py-3 px-3">Rute Pelayaran</th>
                                        <th className="py-3 px-3 text-center">Kapasitas</th>
                                        <th className="py-3 px-3 text-right">Realisasi Penumpang</th>
                                        <th className="py-3 px-3 text-right">Sisa Kursi</th>
                                        <th className="py-3 px-3 text-center">Okupansi Trip</th>
                                        <th className="py-3 px-4 text-center">Status Muatan</th>
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
                                                    {formatNumber(item.jumlah_penumpang)} <span className="font-normal text-muted-foreground text-[10px]">org</span>
                                                </td>
                                                <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                                                    {formatNumber(item.sisa_kursi)}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="font-mono font-bold text-foreground text-xs">
                                                            {item.occupancy}%
                                                        </span>
                                                    </div>
                                                    <div className="mx-auto mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
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
                                                <td className="py-3 px-4 text-center">
                                                    {getLoadStatusBadge(item.load_status, item.occupancy)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-muted-foreground">
                                                Tidak ada data manifest pelayaran yang sesuai dengan filter.
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
                                                        ? 'bg-blue-600 text-white shadow-xs'
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

                {/* MARITIME SAFETY & CAPACITY COMPLIANCE NOTICE */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                        <Anchor className="size-4 text-blue-600" />
                        <span>Kepatuhan Keselamatan Pelayaran & Batas Beban Muatan Kapal (KSOP)</span>
                    </div>
                    <p className="text-xs leading-relaxed text-blue-950/85 dark:text-blue-200/85">
                        Setiap keberangkatan kapal wajib mematuhi batas kapasitas kursi terpasang (*Capacity Snapshot*) yang tertera pada sertifikat keselamatan kapal. Pelanggaran batas kapasitas muatan (&gt;100%) dilarang keras demi menjamin kelaiklautan dan keselamatan seluruh penumpang di perairan Jepara - Karimunjawa.
                    </p>
                </div>
            </div>
        </>
    );
}

Passengers.layout = {
    breadcrumbs: [
        {
            title: 'Kondisi & Manifest',
            href: port.passengers(),
        },
    ],
};
