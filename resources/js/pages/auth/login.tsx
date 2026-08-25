import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Compass,
    KeyRound,
    Lock,
    Mail,
    Shield,
    ShieldAlert,
    UserCheck,
} from 'lucide-react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword?: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk ke Sistem SIMARIN" />

            <PasskeyVerify />

            {status && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs font-semibold text-emerald-300 backdrop-blur-md">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            {/* EMAIL INPUT */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-semibold text-slate-200"
                                >
                                    Email Kedinasan / Akun
                                </Label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Mail className="size-4" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="nama@pelabuhan.go.id"
                                        className="h-10 border-slate-700 bg-slate-950/60 pl-9.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* PASSWORD INPUT */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-xs font-semibold text-slate-200"
                                    >
                                        Kata Sandi
                                    </Label>
                                </div>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-slate-400">
                                        <Lock className="size-4" />
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="h-10 border-slate-700 bg-slate-950/60 pl-9.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* SUBMIT BUTTON */}
                            <Button
                                type="submit"
                                className="mt-2 h-10 w-full cursor-pointer bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition-all hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 active:scale-[0.98]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="mr-2 size-4" />
                                        Memverifikasi Akun...
                                    </>
                                ) : (
                                    <>
                                        Masuk ke Portal SIMARIN
                                        <ArrowRight className="ml-1.5 size-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {/* ROLE AUTO-DETECTION NOTICE */}
            <div className="space-y-1.5 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                    <UserCheck className="size-3.5 text-cyan-400" />
                    <span>Otentikasi Berbasis Peran (RBAC)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                    Sistem secara otomatis mengarahkan akses ke{' '}
                    <b>Dashboard Kepala Pelabuhan</b> atau{' '}
                    <b>Portal Operator Armada</b> sesuai kewenangan akun
                    terdaftar.
                </p>
            </div>

            {/* INTERNAL APPLICATION REGISTRATION NOTICE */}
            <div className="flex items-start gap-2 rounded-lg border border-cyan-900/30 bg-cyan-950/20 p-2.5 text-[11px] leading-relaxed text-cyan-300/90">
                <Shield className="mt-0.5 size-3.5 shrink-0 text-cyan-400" />
                <span>
                    Aplikasi internal pelabuhan. Pembuatan dan pengelolaan akun
                    staf dikonfigurasi langsung oleh Administrator.
                </span>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke Sistem SIMARIN',
    description:
        'Sistem Informasi & Analisis Penumpang Pelabuhan Jepara–Karimunjawa',
};
