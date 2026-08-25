import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Lock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { login } from '@/routes';

export default function Register() {
    return (
        <>
            <Head title="Registrasi Tidak Tersedia" />

            <div className="space-y-4 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                    <ShieldAlert className="size-6" />
                </div>

                <div>
                    <h2 className="text-lg font-bold text-white">
                        Registrasi Publik Dinonaktifkan
                    </h2>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                        SIMARIN adalah sistem operasional internal Pelabuhan Jepara &ndash; Karimunjawa. Pembuatan dan pengelolaan hak akses pengguna dikonfigurasi secara terpusat oleh Administrator.
                    </p>
                </div>

                <div className="pt-2">
                    <Button asChild className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-bold text-white">
                        <Link href={login()}>
                            <ArrowLeft className="mr-1.5 size-4" />
                            Kembali ke Halaman Masuk
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

Register.layout = {
    title: 'Akses Terbatas',
    description: 'Sistem Informasi Manajemen Angkutan Laut',
};
