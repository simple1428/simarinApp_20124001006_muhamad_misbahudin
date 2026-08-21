import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Props {
    user: User;
}

export default function Dashboard({ user }: Props) {
    return (
        <AppLayout>
            <Head title="Kepala Pelabuhan Dashboard" />

            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Dashboard
                </h1>

                <p className="mt-2 text-gray-600">
                    Selamat datang, {user.name}.
                </p>

                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Keberangkatan
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            0
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Penumpang
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            0
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Occupancy
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            0%
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}