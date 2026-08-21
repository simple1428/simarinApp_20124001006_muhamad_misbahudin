import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';

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


            <Head title="Operator Dashboard" />

            <div className='flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4'>
                <h1 className="text-3xl font-bold text-gray-900">
                    Dashboard
                </h1>

                <p className="mt-2 text-gray-600">
                    Selamat datang, {user.name}.
                </p>

                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Kapal
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            0
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Manifest
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            0
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Rute
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            0
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};