import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    Anchor,
    ArrowRight,
    CheckCircle2,
    Compass,
    Edit3,
    Info,
    Lock,
    MapPin,
    Navigation,
    Shield,
    Ship,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RouteItem {
    id: number;
    asal: string;
    tujuan: string;
    route_label: string;
    status: 'aktif' | 'nonaktif';
    total_trips: number;
    total_passengers: number;
    created_at: string;
}

interface Props {
    routes: RouteItem[];
    stats: {
        total_routes: number;
        active_routes: number;
        total_trips: number;
        total_passengers: number;
    };
}

export default function ShippingRouteIndex({
    routes = [],
    stats,
}: Props) {
    return (
        <>
            <Head title="Master Rute Penyeberangan - Operator SIMARIN" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* OPERATOR CONTROL DECK HEADER */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl sm:p-8">
                    <div className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-blue-600/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-300 backdrop-blur-md">
                                    <Compass className="size-3.5" />
                                    MARITIME ROUTE REGISTRY
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                                    <Lock className="size-3" />
                                    Koridor Pelayaran Tetap
                                </span>
                            </div>

                            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                                Master Rute Penyeberangan
                            </h1>
                            <p className="max-w-2xl text-xs text-slate-300 sm:text-sm leading-relaxed">
                                Koridor pelayaran tetap resmi lintas penyeberangan Jepara &harr; Karimunjawa. Rute ini bersifat permanen demi menjaga keutuhan data historis manifes dan peramalan. Anda dapat memperbarui penamaan pelabuhan melalui tombol Edit.
                            </p>
                        </div>
                    </div>
                </div>

                {/* NOTICE PERMANENT ROUTE */}
                <div className="flex items-start gap-3 rounded-xl border border-blue-200/80 bg-blue-50/80 p-4 dark:border-blue-900/50 dark:bg-blue-950/30 text-xs leading-relaxed text-blue-950 dark:text-blue-200">
                    <Shield className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <div>
                        <span className="font-bold text-blue-900 dark:text-blue-100">Integritas Jalur Maritim:</span>
                        <p className="mt-0.5 text-[11px] text-blue-950/80 dark:text-blue-200/80">
                            Rute penyeberangan merupakan jalur krusial yang terhubung langsung ke ribuan catatan manifest dan dataset pelatihan peramalan Holt-Winters. Rute tidak dapat ditambah atau dihapus, namun penamaan pelabuhan asal & tujuan dapat disesuaikan sewaktu-waktu.
                        </p>
                    </div>
                </div>

                {/* 4 STATS CARDS */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Total Koridor Rute
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <Compass className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {stats.total_routes} <span className="text-xs font-normal text-muted-foreground">jalur tetap</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Rute resmi yang terdaftar</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Status Operasional
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                <CheckCircle2 className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {stats.active_routes} <span className="text-xs font-normal text-muted-foreground">jalur aktif</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Siap dilayani armada kapal</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Total Pelayaran (Trip)
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                                <Ship className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {stats.total_trips.toLocaleString('id-ID')}{' '}
                                <span className="text-xs font-normal text-muted-foreground">keberangkatan</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Akumulasi seluruh manifest</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Penumpang Terangkut
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                <Users className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                {stats.total_passengers.toLocaleString('id-ID')}{' '}
                                <span className="text-xs font-normal text-muted-foreground">orang</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Total mobilitas penumpang</p>
                        </CardContent>
                    </Card>
                </div>

                {/* ROUTE CARDS GRID */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {routes.map((r) => (
                        <Card
                            key={r.id}
                            className="relative overflow-hidden border-border/80 shadow-xs transition-all hover:border-slate-400 dark:hover:border-slate-700"
                        >
                            <div className="absolute top-0 left-0 h-1 w-full bg-cyan-500" />

                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
                                            <Compass className="size-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-black text-foreground">
                                                {r.asal} &rarr; {r.tujuan}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Jalur Penyeberangan Laut Jawa
                                            </CardDescription>
                                        </div>
                                    </div>

                                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
                                        <span className="mr-1 size-1.5 rounded-full bg-emerald-500" />
                                        Rute Tetap Aktif
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-0">
                                <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-muted/40 p-3 text-xs">
                                    <div>
                                        <span className="text-muted-foreground text-[11px]">Total Keberangkatan:</span>
                                        <div className="font-mono font-bold text-foreground text-sm mt-0.5">
                                            {r.total_trips.toLocaleString('id-ID')} trip
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-[11px]">Penumpang Terlayani:</span>
                                        <div className="font-mono font-bold text-foreground text-sm mt-0.5">
                                            {r.total_passengers.toLocaleString('id-ID')} orang
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end pt-1 border-t border-border/60">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="w-full sm:w-auto h-8 text-xs font-semibold"
                                    >
                                        <Link href={`/shipping-routes/${r.id}/edit`}>
                                            <Edit3 className="mr-1.5 size-3.5 text-blue-600" />
                                            Edit Nama Rute
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

ShippingRouteIndex.layout = {
    breadcrumbs: [
        {
            title: 'Master Rute Penyeberangan',
            href: '/shipping-routes',
        },
    ],
};
