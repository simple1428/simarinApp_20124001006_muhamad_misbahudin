import { Head, Link, router } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { create, edit, toggleStatus } from '@/routes/ships';
import { useState } from 'react';

interface Ship {
    id: number;
    nama_kapal: string;
    jenis_kapal: string;
    kapasitas: number;
    status: 'aktif' | 'nonaktif';
}

interface Props {
    ships: Ship[];
}

export default function ShipIndex({ ships }: Props) {
    // const toggleStatusShip = (ship: Ship) => {
    //     const message =
    //         ship.status === 'aktif'
    //             ? `Nonaktifkan ${ship.nama_kapal}?`
    //             : `Aktifkan kembali ${ship.nama_kapal}?`;

    //     if (!confirm(message)) {
    //         return;
    //     }

    //     router.patch(toggleStatus.url(ship.id));
    // };
    const [selectedShip, setSelectedShip] = useState<Ship | null>(null);

    const [showModal, setShowModal] = useState(false);
    const openStatusModal = (ship: Ship) => {
        setSelectedShip(ship);
        setShowModal(true);
    };
    const confirmToggleStatus = () => {

        if (!selectedShip) {
            return;
        }

        router.patch(
            toggleStatus.url(selectedShip.id),
            {},
            {
                onSuccess: () => {
                    setShowModal(false);
                    setSelectedShip(null);
                }
            }
        );

    };
    return (
        <>
            <Head title="Data Kapal" />

            <div className="min-h-screen bg-gray-100 p-8">
                <div className="mx-auto max-w-7xl">

                    <div className="mb-6 flex items-center justify-between">

                        <div>
                            <h1 className="text-3xl font-bold">
                                Data Kapal
                            </h1>

                            <p className="mt-1 text-gray-600">
                                Kelola kapal penyeberangan
                                Jepara–Karimunjawa.
                            </p>
                        </div>

                        <Link
                            href={create()}
                            className="rounded-lg bg-black px-4 py-2 text-white"
                        >
                            Tambah Kapal
                        </Link>

                    </div>

                    <div className="overflow-hidden rounded-xl bg-white shadow">

                        <table className="w-full">

                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-left">
                                        No
                                    </th>

                                    <th className="p-4 text-left">
                                        Nama Kapal
                                    </th>

                                    <th className="p-4 text-left">
                                        Jenis
                                    </th>

                                    <th className="p-4 text-left">
                                        Kapasitas
                                    </th>

                                    <th className="p-4 text-left">
                                        Status
                                    </th>

                                    <th className="p-4 text-left">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {ships.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-8 text-center text-gray-500"
                                        >
                                            Belum ada data kapal.
                                        </td>
                                    </tr>
                                )}

                                {ships.map((ship, index) => (
                                    <tr
                                        key={ship.id}
                                        className="border-t"
                                    >
                                        <td className="p-4">
                                            {index + 1}
                                        </td>

                                        <td className="p-4 font-medium">
                                            {ship.nama_kapal}
                                        </td>

                                        <td className="p-4">
                                            {ship.jenis_kapal}
                                        </td>

                                        <td className="p-4">
                                            {ship.kapasitas} penumpang
                                        </td>

                                        <td className="p-4">
                                            <span
                                                className={
                                                    ship.status === 'aktif'
                                                        ? 'rounded-full bg-green-100 px-3 py-1 text-sm text-green-700 capitalize'
                                                        : 'rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-600 capitalize'
                                                }
                                            >
                                                {ship.status}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex gap-2">

                                                <Link
                                                    href={edit(ship.id)}
                                                    className="rounded border px-3 py-1"
                                                >
                                                    Edit
                                                </Link>

                                                {/* <button
                                                    type="button"
                                                    onClick={() =>
                                                        openStatusModal(ship)
                                                    }
                                                    className="rounded border px-3 py-1"
                                                >
                                                    {ship.status === 'aktif'
                                                        ? 'Nonaktifkan'
                                                        : 'Aktifkan'}
                                                </button> */}
                                                {showModal && selectedShip && (

                                                    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/10">

                                                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

                                                            <h2 className="text-xl font-bold">
                                                                Konfirmasi Perubahan Status
                                                            </h2>


                                                            <p className="mt-3 text-gray-600">

                                                                Apakah Anda yakin ingin

                                                                {' '}

                                                                {selectedShip.status === 'aktif'
                                                                    ? 'menonaktifkan'
                                                                    : 'mengaktifkan kembali'}

                                                                {' '}

                                                                kapal:

                                                                <span className="font-semibold">
                                                                    {' '}
                                                                    {selectedShip.nama_kapal}
                                                                </span>

                                                                ?

                                                            </p>


                                                            <div className="mt-6 flex justify-end gap-3">

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setShowModal(false);
                                                                        setSelectedShip(null);
                                                                    }}
                                                                    className="rounded-lg border px-4 py-2"
                                                                >
                                                                    Batal
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    onClick={confirmToggleStatus}
                                                                    className="rounded-lg bg-primary px-4 py-2 text-white"
                                                                >
                                                                    Konfirmasi
                                                                </button>

                                                            </div>


                                                        </div>

                                                    </div>

                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>

                    </div>

                    <div className="mt-6">
                        <Link
                            href={dashboard()}
                            className="text-sm underline"
                        >
                            Kembali ke Dashboard
                        </Link>
                    </div>

                </div>
            </div>
        </>
    );
}