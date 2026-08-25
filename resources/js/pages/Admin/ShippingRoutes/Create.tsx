import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import {
    Anchor,
    ArrowLeft,
    CheckCircle2,
    Compass,
    MapPin,
    Navigation,
    Plus,
    Save,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

export default function ShippingRouteCreate() {
    const form = useForm({
        asal: '',
        tujuan: '',
        status: 'aktif',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/shipping-routes');
    };

    return (
        <>
            <Head title="Tambah Rute Penyeberangan - Operator SIMARIN" />

            <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
                {/* HEADER & BACK BUTTON */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-0.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                                <Compass className="size-3.5" />
                                KORIDOR JALUR BARU
                            </span>
                        </div>
                        <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                            Tambah Rute Penyeberangan
                        </h1>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Daftarkan koridor pelayaran baru ke dalam sistem registri maritim.
                        </p>
                    </div>

                    <Button variant="outline" size="sm" asChild className="h-9 text-xs">
                        <Link href="/shipping-routes">
                            <ArrowLeft className="mr-1.5 size-3.5" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                {/* FORM CARD */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="border-b border-border/60 pb-4">
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <Navigation className="size-4 text-blue-600" />
                            Parameter Jalur Pelayaran
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Tentukan pelabuhan asal keberangkatan dan pelabuhan tujuan akhir penyeberangan.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="space-y-5">
                            {/* PELABUHAN ASAL */}
                            <div className="space-y-1.5">
                                <Label htmlFor="asal" className="text-xs font-semibold">
                                    Pelabuhan Asal Keberangkatan <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="asal"
                                    type="text"
                                    required
                                    placeholder="Contoh: Jepara, Karimunjawa"
                                    value={form.data.asal}
                                    onChange={(e) => form.setData('asal', e.target.value)}
                                    className="h-10 text-xs"
                                />
                                <InputError message={form.errors.asal} />
                            </div>

                            {/* PELABUHAN TUJUAN */}
                            <div className="space-y-1.5">
                                <Label htmlFor="tujuan" className="text-xs font-semibold">
                                    Pelabuhan Tujuan Akhir <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="tujuan"
                                    type="text"
                                    required
                                    placeholder="Contoh: Karimunjawa, Jepara"
                                    value={form.data.tujuan}
                                    onChange={(e) => form.setData('tujuan', e.target.value)}
                                    className="h-10 text-xs"
                                />
                                <InputError message={form.errors.tujuan} />
                            </div>

                            {/* STATUS */}
                            <div className="space-y-1.5">
                                <Label htmlFor="status" className="text-xs font-semibold">
                                    Status Kelaikan Jalur <span className="text-rose-500">*</span>
                                </Label>
                                <select
                                    id="status"
                                    value={form.data.status}
                                    onChange={(e) => form.setData('status', e.target.value)}
                                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-2xs focus:border-cyan-500 focus:outline-none"
                                >
                                    <option value="aktif">Aktif (Jalur Dibuka untuk Pelayaran)</option>
                                    <option value="nonaktif">Nonaktif (Jalur Ditutup Sementara)</option>
                                </select>
                                <InputError message={form.errors.status} />
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                                <Button variant="outline" size="sm" asChild className="h-9 text-xs">
                                    <Link href="/shipping-routes">Batal</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={form.processing}
                                    className="h-9 cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 px-4 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500"
                                >
                                    <Save className="mr-1.5 size-3.5" />
                                    {form.processing ? 'Menyimpan...' : 'Simpan Rute'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ShippingRouteCreate.layout = {
    breadcrumbs: [
        {
            title: 'Master Rute Penyeberangan',
            href: '/shipping-routes',
        },
        {
            title: 'Tambah Rute',
            href: '/shipping-routes/create',
        },
    ],
};
