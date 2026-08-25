import { useState, useMemo, FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Anchor,
    ArrowLeft,
    CheckCircle2,
    Compass,
    Edit3,
    FileSpreadsheet,
    Info,
    Save,
    Ship,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

interface ShipItem {
    id: number;
    nama_kapal: string;
    kapasitas: number;
    status: string;
}

interface RouteItem {
    id: number;
    asal: string;
    tujuan: string;
}

interface ManifestRecord {
    id: number;
    ship_id: number;
    shipping_route_id: number;
    tanggal: string;
    jumlah_penumpang: number;
    capacity_snapshot: number;
}

interface Props {
    record: ManifestRecord;
    ships: ShipItem[];
    routes: RouteItem[];
}

export default function PassengerRecordEdit({
    record,
    ships = [],
    routes = [],
}: Props) {
    const form = useForm({
        ship_id: String(record.ship_id),
        shipping_route_id: String(record.shipping_route_id),
        tanggal: record.tanggal,
        jumlah_penumpang: String(record.jumlah_penumpang),
    });

    const selectedShip = useMemo(() => {
        return ships.find((s) => String(s.id) === String(form.data.ship_id));
    }, [ships, form.data.ship_id]);

    const capacity = selectedShip ? selectedShip.kapasitas : record.capacity_snapshot || 0;
    const paxCount = Number(form.data.jumlah_penumpang) || 0;
    const occupancy = capacity > 0 ? Math.round((paxCount / capacity) * 100) : 0;
    const isOverCapacity = capacity > 0 && paxCount > capacity;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.put(`/passenger-records/${record.id}`);
    };

    return (
        <>
            <Head title="Edit Manifest Penumpang - Operator SIMARIN" />

            <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
                {/* HEADER & BACK BUTTON */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                <Edit3 className="size-3.5" />
                                PERBARUI LOG MANIFEST
                            </span>
                        </div>
                        <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                            Edit Manifest Penumpang
                        </h1>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Perbarui rincian log keberangkatan armada penyeberangan.
                        </p>
                    </div>

                    <Button variant="outline" size="sm" asChild className="h-9 text-xs">
                        <Link href="/passenger-records">
                            <ArrowLeft className="mr-1.5 size-3.5" />
                            Kembali ke Daftar
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* FORM INPUT COLUMN (2 COLS) */}
                    <div className="md:col-span-2">
                        <Card className="border-border/80 shadow-xs">
                            <CardHeader className="border-b border-border/60 pb-4">
                                <CardTitle className="flex items-center gap-2 text-base font-bold">
                                    <Anchor className="size-4 text-blue-600" />
                                    Data Pelayaran & Manifes
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Perbarui jadwal, armada kapal penyeberangan, atau jumlah riil penumpang.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="pt-6">
                                <form onSubmit={submit} className="space-y-5">
                                    {/* TANGGAL PELAYARAN */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="tanggal" className="text-xs font-semibold">
                                            Tanggal Keberangkatan <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="tanggal"
                                            type="date"
                                            required
                                            value={form.data.tanggal}
                                            onChange={(e) => form.setData('tanggal', e.target.value)}
                                            className="h-10 text-xs"
                                        />
                                        <InputError message={form.errors.tanggal} />
                                    </div>

                                    {/* PILIHAN ARMADA KAPAL */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ship_id" className="text-xs font-semibold">
                                            Armada Kapal <span className="text-rose-500">*</span>
                                        </Label>
                                        <select
                                            id="ship_id"
                                            required
                                            value={form.data.ship_id}
                                            onChange={(e) => form.setData('ship_id', e.target.value)}
                                            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-2xs focus:border-cyan-500 focus:outline-none"
                                        >
                                            {ships.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.nama_kapal} (Kapasitas: {s.kapasitas} kursi)
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={form.errors.ship_id} />
                                    </div>

                                    {/* PILIHAN RUTE PELAYARAN */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="shipping_route_id" className="text-xs font-semibold">
                                            Rute Penyeberangan <span className="text-rose-500">*</span>
                                        </Label>
                                        <select
                                            id="shipping_route_id"
                                            required
                                            value={form.data.shipping_route_id}
                                            onChange={(e) => form.setData('shipping_route_id', e.target.value)}
                                            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-2xs focus:border-cyan-500 focus:outline-none"
                                        >
                                            {routes.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.asal} &rarr; {r.tujuan}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={form.errors.shipping_route_id} />
                                    </div>

                                    {/* JUMLAH PENUMPANG */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="jumlah_penumpang" className="text-xs font-semibold">
                                            Realisasi Jumlah Penumpang (Orang) <span className="text-rose-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="jumlah_penumpang"
                                                type="number"
                                                min="0"
                                                required
                                                value={form.data.jumlah_penumpang}
                                                onChange={(e) => form.setData('jumlah_penumpang', e.target.value)}
                                                className={`h-10 pr-16 text-xs font-mono font-bold ${
                                                    isOverCapacity ? 'border-rose-500 focus:border-rose-500' : ''
                                                }`}
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground font-medium">
                                                orang
                                            </div>
                                        </div>
                                        <InputError message={form.errors.jumlah_penumpang} />

                                        {isOverCapacity && (
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                                                <AlertCircle className="size-4" />
                                                <span>Peringatan: Jumlah penumpang melebihi kapasitas kapal ({capacity} kursi)!</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                                        <Button variant="outline" size="sm" asChild className="h-9 text-xs">
                                            <Link href="/passenger-records">Batal</Link>
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={form.processing}
                                            className="h-9 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500"
                                        >
                                            <Save className="mr-1.5 size-3.5" />
                                            {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* REALTIME PREVIEW & CAPACITY GUIDELINE (1 COL) */}
                    <div className="space-y-4">
                        <Card className="border-border/80 bg-card shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                                    <Activity className="size-4 text-blue-600" />
                                    Kalkulator Okupansi Trip
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                <div className="rounded-xl border border-border/70 bg-muted/40 p-3 space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Armada:</span>
                                        <span className="font-bold text-foreground">{selectedShip?.nama_kapal || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Batas Kapasitas:</span>
                                        <span className="font-mono font-bold text-foreground">{capacity} kursi</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Penumpang Terisi:</span>
                                        <span className="font-mono font-bold text-foreground">{paxCount} orang</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Sisa Kursi:</span>
                                        <span className={`font-mono font-bold ${isOverCapacity ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {isOverCapacity ? `Lebih ${paxCount - capacity}` : `${capacity - paxCount} kursi`}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-muted-foreground">Tingkat Keterisian:</span>
                                        <span
                                            className={`font-mono font-black ${
                                                occupancy >= 90 ? 'text-rose-600' : occupancy >= 60 ? 'text-emerald-600' : 'text-sky-600'
                                            }`}
                                        >
                                            {occupancy}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                        <div
                                            className={`h-full transition-all duration-300 ${
                                                occupancy >= 90 ? 'bg-rose-500' : occupancy >= 60 ? 'bg-emerald-500' : 'bg-sky-500'
                                            }`}
                                            style={{ width: `${Math.min(100, occupancy)}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

PassengerRecordEdit.layout = {
    breadcrumbs: [
        {
            title: 'Input Manifest Penumpang',
            href: '/passenger-records',
        },
        {
            title: 'Edit Manifest',
            href: '#',
        },
    ],
};
