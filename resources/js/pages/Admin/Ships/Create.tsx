import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import {
    Anchor,
    ArrowLeft,
    CheckCircle2,
    Info,
    Plus,
    Save,
    Ship,
    Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { index, store } from '@/routes/ships';
import shipsRoute from '@/routes/ships';

export default function ShipCreate() {
    const form = useForm({
        nama_kapal: '',
        jenis_kapal: '',
        kapasitas: '',
        status: 'aktif',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(store.url());
    };

    return (
        <>
            <Head title="Tambah Armada Kapal - Operator SIMARIN" />

            <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
                {/* HEADER & BACK BUTTON */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-0.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                                <Ship className="size-3.5" />
                                REGISTRASI ARMADA BARU
                            </span>
                        </div>
                        <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                            Tambah Data Kapal
                        </h1>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Daftarkan unit kapal baru ke dalam sistem registri pelabuhan Jepara &ndash; Karimunjawa.
                        </p>
                    </div>

                    <Button variant="outline" size="sm" asChild className="h-9 text-xs">
                        <Link href={index()}>
                            <ArrowLeft className="mr-1.5 size-3.5" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                {/* FORM CARD */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="border-b border-border/60 pb-4">
                        <CardTitle className="flex items-center gap-2 text-base font-bold">
                            <Anchor className="size-4 text-blue-600" />
                            Formulir Spesifikasi Armada
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Isi parameter identitas kapal dan daya tampung penumpang sesuai sertifikat resmi kelaiklautan kapal.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="space-y-5">
                            {/* NAMA KAPAL */}
                            <div className="space-y-1.5">
                                <Label htmlFor="nama_kapal" className="text-xs font-semibold">
                                    Nama Armada Kapal <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="nama_kapal"
                                    type="text"
                                    required
                                    placeholder="Contoh: Express Bahari 9C, KMP. Siginjai"
                                    value={form.data.nama_kapal}
                                    onChange={(e) => form.setData('nama_kapal', e.target.value)}
                                    className="h-10 text-xs"
                                />
                                <InputError message={form.errors.nama_kapal} />
                            </div>

                            {/* JENIS KAPAL */}
                            <div className="space-y-1.5">
                                <Label htmlFor="jenis_kapal" className="text-xs font-semibold">
                                    Jenis / Tipe Kapal <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="jenis_kapal"
                                    type="text"
                                    required
                                    placeholder="Contoh: Kapal Cepat Penumpang (Ferry Express), Kapal Ro-Ro"
                                    value={form.data.jenis_kapal}
                                    onChange={(e) => form.setData('jenis_kapal', e.target.value)}
                                    className="h-10 text-xs"
                                />
                                <InputError message={form.errors.jenis_kapal} />
                            </div>

                            {/* KAPASITAS */}
                            <div className="space-y-1.5">
                                <Label htmlFor="kapasitas" className="text-xs font-semibold">
                                    Kapasitas Kursi Maksimal (Pax) <span className="text-rose-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="kapasitas"
                                        type="number"
                                        min="1"
                                        required
                                        placeholder="Contoh: 350"
                                        value={form.data.kapasitas}
                                        onChange={(e) => form.setData('kapasitas', e.target.value)}
                                        className="h-10 pr-16 text-xs font-mono"
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground font-medium">
                                        kursi/trip
                                    </div>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Nilai ini akan dijadikan *Capacity Snapshot* saat manifest trip diinput.
                                </p>
                                <InputError message={form.errors.kapasitas} />
                            </div>

                            {/* STATUS OPERASIONAL */}
                            <div className="space-y-1.5">
                                <Label htmlFor="status" className="text-xs font-semibold">
                                    Status Kesiapan Operasional <span className="text-rose-500">*</span>
                                </Label>
                                <select
                                    id="status"
                                    value={form.data.status}
                                    onChange={(e) => form.setData('status', e.target.value)}
                                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-2xs focus:border-cyan-500 focus:outline-none"
                                >
                                    <option value="aktif">Aktif (Siap Berlayar & Menerima Manifest)</option>
                                    <option value="nonaktif">Nonaktif (Docking / Pemeliharaan / Cadangan)</option>
                                </select>
                                <InputError message={form.errors.status} />
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                                <Button variant="outline" size="sm" asChild className="h-9 text-xs">
                                    <Link href={index()}>Batal</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={form.processing}
                                    className="h-9 cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 px-4 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500"
                                >
                                    <Save className="mr-1.5 size-3.5" />
                                    {form.processing ? 'Menyimpan...' : 'Simpan Data Armada'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ShipCreate.layout = {
    breadcrumbs: [
        {
            title: 'Master Armada Kapal',
            href: shipsRoute.index(),
        },
        {
            title: 'Tambah Kapal',
            href: shipsRoute.create(),
        },
    ],
};
