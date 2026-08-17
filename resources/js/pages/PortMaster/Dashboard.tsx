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
        <>
            <Head title="Port Master Dashboard" />

            <div className="min-h-screen bg-gray-100 p-8">
                <div className="mx-auto max-w-7xl">
                    <h1 className="text-3xl font-bold text-gray-900">
                        SIMARIN
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Kepala Pelabuhan Dashboard
                    </p>

                    <div className="mt-8 rounded-xl bg-white p-6 shadow">
                        <p className="text-gray-600">
                            Selamat datang,
                        </p>

                        <h2 className="mt-1 text-2xl font-semibold">
                            {user.name}
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Role: Kepala Pelabuhan
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}