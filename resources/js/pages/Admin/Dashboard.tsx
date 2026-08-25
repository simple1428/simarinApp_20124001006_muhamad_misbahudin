import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Anchor,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    Compass,
    FileSpreadsheet,
    FileText,
    History,
    Lock,
    Navigation,
    Plus,
    Ship,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface ActivePeriod {
    id: number;
    bulan: number;
    tahun: number;
    label: string;
    total_penumpang: number;
    jumlah_trip: number;
    total_kapasitas: number;
    occupancy: number;
}

interface DailyTrendItem {
    date: string;
    label: string;
    hari: string;
    penumpang: number;
    trip: number;
}

interface FleetItem {
    id: number;
    nama_kapal: string;
    jenis_kapal: string;
    kapasitas: number;
    status: string;
    trips_this_month: number;
    pax_this_month: number;
    occupancy_this_month: number;
}

interface ManifestItem {
    id: number;
    tanggal: string;
    tanggal_formatted: string;
    hari: string;
    ship_name: string;
    route_name: string;
    jumlah_penumpang: number;
    kapasitas: number;
    occupancy: number;
    creator_name: string;
}

interface Props {
    user: User;
    activePeriod: ActivePeriod | null;
    kpis: {
        total_ships: number;
        active_ships: number;
        total_routes: number;
        open_period_pax: number;
        open_period_trips: number;
        open_period_occupancy: number;
        total_historical_pax: number;
    };
    dailyTrend: DailyTrendItem[];
    fleetPerformance: FleetItem[];
    latestManifests: ManifestItem[];
}

export default function OperatorDashboard({
    user,
    activePeriod,
    kpis,
    dailyTrend = [],
    fleetPerformance = [],
    latestManifests = [],
}: Props) {
    return (
        <>
            <Head title="Dashboard Operator - SIMARIN" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* OPERATOR HERO BANNER */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl sm:p-8">
                    <div className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-blue-600/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-300 backdrop-blur-md">
                                    <Anchor className="size-3.5" />
                                    PORT OPERATIONS DESK
                                </span>
                                {activePeriod && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Periode Aktif: {activePeriod.label}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                                Selamat Bertugas, {user.name}
                            </h1>
                            <p className="max-w-2xl text-xs text-slate-300 sm:text-sm leading-relaxed">
                                Pusat kendali pencatatan manifest harian, pemantauan kapasitas armada kapal penyeberangan, dan validasi periode bulanan pelabuhan Jepara &ndash; Karimunjawa.
                            </p>
                        </div>

                        {/* QUICK ACTION SHORTCUTS */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <Button
                                asChild
                                className="h-auto cursor-pointer border border-cyan-400/30 bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition-all hover:from-cyan-500 hover:to-blue-500"
                            >
                                <Link href="/passenger-records/create">
                                    <Plus className="mr-1.5 size-4" />
                                    Input Manifest Baru
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                asChild
                                className="h-auto border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white"
                            >
                                <Link href="/ships">
                                    <Ship className="mr-1.5 size-4 text-cyan-400" />
                                    Armada Kapal
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                asChild
                                className="h-auto border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white"
                            >
                                <Link href="/periods">
                                    <Lock className="mr-1.5 size-4 text-emerald-400" />
                                    Penutupan Periode
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 4 OPERATIONAL KPI CARDS */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Penumpang Bulan Berjalan */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Penumpang Bulan Ini
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
                                <Users className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {kpis.open_period_pax.toLocaleString('id-ID')}{' '}
                                <span className="text-xs font-normal text-muted-foreground">orang</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Periode {activePeriod?.label || 'Berjalan'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Keberangkatan Bulan Berjalan */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Total Trip Bulan Ini
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <FileSpreadsheet className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {kpis.open_period_trips.toLocaleString('id-ID')}{' '}
                                <span className="text-xs font-normal text-muted-foreground">keberangkatan</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Okupansi rata-rata: {kpis.open_period_occupancy}%
                            </p>
                        </CardContent>
                    </Card>

                    {/* Armada Siap Operasi */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Armada Siap Berlayar
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                <Ship className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {kpis.active_ships} <span className="text-xs font-normal text-muted-foreground">/ {kpis.total_ships} unit aktif</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {kpis.total_routes} koridor rute tetap
                            </p>
                        </CardContent>
                    </Card>

                    {/* Akumulasi Data Time-Series */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Database Historis Final
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                <History className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                {kpis.total_historical_pax.toLocaleString('id-ID')}{' '}
                                <span className="text-xs font-normal text-muted-foreground">penumpang</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Terverifikasi dalam sistem
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* DAILY ACTIVITY CHART & FLEET READINESS GRID */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* 1. DAILY PASSENGER VOLUME CHART (2 COLS) */}
                    <Card className="border-border/80 shadow-xs lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-base font-bold">
                                    Aktivitas Penumpang Harian Terakhir
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Volume penumpang faktual per hari pelayaran pada 14 hari catatan terakhir.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-[11px] font-medium">
                                <Activity className="mr-1 size-3 text-cyan-600" />
                                Tren Harian
                            </Badge>
                        </CardHeader>

                        <CardContent className="pt-4">
                            <div className="h-[260px] w-full">
                                {dailyTrend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={dailyTrend}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                            <XAxis
                                                dataKey="label"
                                                stroke="#888888"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="#888888"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                    borderColor: '#334155',
                                                    borderRadius: '0.75rem',
                                                    color: '#fff',
                                                    fontSize: '12px',
                                                }}
                                                formatter={(value: any) => [
                                                    `${Number(value).toLocaleString('id-ID')} orang`,
                                                    'Penumpang',
                                                ]}
                                                labelFormatter={(label) => `Tanggal: ${label}`}
                                            />
                                            <Bar
                                                dataKey="penumpang"
                                                fill="#0891b2"
                                                radius={[6, 6, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                        Belum ada aktivitas manifest harian.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. FLEET READINESS CARD (1 COL) */}
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-bold">
                                    Kesiapan Armada Kapal
                                </CardTitle>
                                <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-cyan-600">
                                    <Link href="/ships">Lihat Semua &rarr;</Link>
                                </Button>
                            </div>
                            <CardDescription className="text-xs">
                                Kapasitas & kinerja armada bulan ini.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3 pt-0">
                            {fleetPerformance.map((ship) => (
                                <div
                                    key={ship.id}
                                    className="rounded-xl border border-border/70 bg-muted/30 p-3 space-y-1.5 transition-all hover:bg-muted/60"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Ship className="size-4 text-blue-600" />
                                            <span className="font-bold text-xs text-foreground">
                                                {ship.nama_kapal}
                                            </span>
                                        </div>
                                        <Badge
                                            className={
                                                ship.status === 'aktif'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px]'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px]'
                                            }
                                        >
                                            {ship.status === 'aktif' ? 'Aktif' : 'Docking'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                        <span>Kapasitas: <b className="text-foreground">{ship.kapasitas} kursi</b></span>
                                        <span>Bulan Ini: <b className="text-foreground">{ship.trips_this_month} trip</b></span>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-muted-foreground">Total Angkut:</span>
                                        <span className="font-mono font-bold text-foreground">
                                            {ship.pax_this_month.toLocaleString('id-ID')} pax ({ship.occupancy_this_month}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* RECENT MANIFEST ENTRIES TABLE */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div>
                            <CardTitle className="text-base font-bold">
                                6 Manifest Pelayaran Terakhir yang Diinput
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Catatan terbaru penginputan manifest keberangkatan armada kapal.
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                            <Link href="/passenger-records">
                                Lihat Semua Manifest &rarr;
                            </Link>
                        </Button>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-y border-border/80 bg-muted/50 font-bold text-muted-foreground">
                                    <tr>
                                        <th className="py-3 px-4">Tanggal & Hari</th>
                                        <th className="py-3 px-3">Armada Kapal</th>
                                        <th className="py-3 px-3">Rute Pelayaran</th>
                                        <th className="py-3 px-3 text-right">Kapasitas</th>
                                        <th className="py-3 px-3 text-right">Penumpang Faktual</th>
                                        <th className="py-3 px-3 text-center">Okupansi</th>
                                        <th className="py-3 px-3">Petugas Input</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 font-medium">
                                    {latestManifests.map((item) => (
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
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                                                    {item.route_name}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono">
                                                {item.kapasitas} kursi
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                                                {item.jumlah_penumpang.toLocaleString('id-ID')} pax
                                            </td>
                                            <td className="py-3 px-3 text-center font-mono font-bold text-cyan-600 dark:text-cyan-400">
                                                {item.occupancy}%
                                            </td>
                                            <td className="py-3 px-3 text-muted-foreground text-[11px]">
                                                {item.creator_name}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

OperatorDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Operator',
            href: dashboard(),
        },
    ],
};
