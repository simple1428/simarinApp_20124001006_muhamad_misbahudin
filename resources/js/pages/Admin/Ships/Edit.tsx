import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { index, update } from '@/routes/ships';

interface Ship {
    id: number;
    nama_kapal: string;
    jenis_kapal: string;
    kapasitas: number;
    status: 'aktif' | 'nonaktif';
}

interface Props {
    ship: Ship;
}

export default function ShipEdit({ ship }: Props) {
    const form = useForm({
        nama_kapal: ship.nama_kapal,
        jenis_kapal: ship.jenis_kapal,
        kapasitas: String(ship.kapasitas),
        status: ship.status,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        form.put(update.url(ship.id));
    };

    return (
        <>
            <Head title="Edit Kapal" />

            <div className="min-h-screen bg-gray-100 p-8">

                <div className="mx-auto max-w-2xl">

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold">
                            Edit Kapal
                        </h1>

                        <p className="mt-1 text-gray-600">
                            Perbarui data {ship.nama_kapal}.
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="space-y-6 rounded-xl bg-white p-6 shadow"
                    >

                        <div>
                            <label className="mb-2 block font-medium">
                                Nama Kapal
                            </label>

                            <input
                                type="text"
                                value={form.data.nama_kapal}
                                onChange={(e) =>
                                    form.setData(
                                        'nama_kapal',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border p-3"
                            />

                            {form.errors.nama_kapal && (
                                <p className="mt-1 text-sm text-red-600">
                                    {form.errors.nama_kapal}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">
                                Jenis Kapal
                            </label>

                            <input
                                type="text"
                                value={form.data.jenis_kapal}
                                onChange={(e) =>
                                    form.setData(
                                        'jenis_kapal',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border p-3"
                            />

                            {form.errors.jenis_kapal && (
                                <p className="mt-1 text-sm text-red-600">
                                    {form.errors.jenis_kapal}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">
                                Kapasitas
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={form.data.kapasitas}
                                onChange={(e) =>
                                    form.setData(
                                        'kapasitas',
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-lg border p-3"
                            />

                            {form.errors.kapasitas && (
                                <p className="mt-1 text-sm text-red-600">
                                    {form.errors.kapasitas}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block font-medium">
                                Status
                            </label>

                            <select
                                value={form.data.status}
                                onChange={(e) =>
                                    form.setData(
                                        'status',
                                        e.target.value as
                                        | 'aktif'
                                        | 'nonaktif',
                                    )
                                }
                                className="w-full rounded-lg border p-3"
                            >
                                <option value="aktif">
                                    Aktif
                                </option>

                                <option value="nonaktif">
                                    Nonaktif
                                </option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3">

                            <Link
                                href={index()}
                                className="rounded-lg border px-4 py-2"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </button>

                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}