import { Link } from '@inertiajs/react';
import { Anchor, ShieldCheck, Ship, Waves } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-[#07172b] to-[#020b17] p-4 sm:p-6 lg:p-8 selection:bg-cyan-500 selection:text-white">
            {/* AMBIENT BACKGROUND GLOW EFFECTS */}
            <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-cyan-500/15 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-blue-600/15 blur-[120px]" />
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-indigo-500/5 blur-[150px]" />

            {/* SUBTLE MARITIME GRID / PATTERN */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                }}
            />

            {/* MAIN CARD CONTAINER */}
            <div className="relative z-10 w-full max-w-md">
                <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                    {/* Top Glowing Gradient Line */}
                    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

                    <div className="flex flex-col gap-6">
                        {/* BRANDING HEADER */}
                        <div className="flex flex-col items-center text-center">
                            <Link
                                href={home()}
                                className="group mb-3 flex flex-col items-center gap-2 transition-transform hover:scale-105"
                            >
                                <div className="relative flex size-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-2 shadow-lg shadow-cyan-500/10 backdrop-blur-md">
                                    <AppLogoIcon className="size-10" />
                                </div>
                            </Link>

                            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-[11px] font-semibold tracking-wider text-cyan-300 uppercase backdrop-blur-md">
                                <Anchor className="size-3" />
                                PORT MARITIME INTELLIGENCE
                            </div>

                            <h1 className="mt-2.5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                                SIMARIN
                            </h1>
                            <p className="mt-1 text-xs text-slate-300 sm:text-sm font-medium">
                                Sistem Informasi & Peramalan Penumpang Pelabuhan
                            </p>
                            <p className="text-[11px] text-cyan-400/80 font-mono mt-0.5">
                                Lintas Penyeberangan Jepara &ndash; Karimunjawa
                            </p>
                        </div>

                        {/* AUTH CONTENT (LOGIN FORM / ETC) */}
                        {children}
                    </div>
                </div>

                {/* FOOTER NOTICE WITH COPYRIGHT */}
                <div className="mt-6 flex flex-col items-center gap-1.5 text-center text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <ShieldCheck className="size-3.5 text-emerald-400" />
                        <span>Aplikasi Internal Terbatas &bull; KSOP Pelabuhan Jepara</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                        Dikembangkan oleh: <span className="font-bold text-cyan-300">Muhamad Misbahudin</span> (NIM: <b>201240001006</b>)
                    </div>
                    <p className="text-[10px] text-slate-500">
                        Hak Cipta &copy; {new Date().getFullYear()} SIMARIN &bull; All Rights Reserved
                    </p>
                </div>
            </div>
        </div>
    );
}
