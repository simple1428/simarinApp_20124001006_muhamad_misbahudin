import { Anchor, Calendar, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { monthNames } from '../types';

interface HeroBannerProps {
    userName?: string;
    period: {
        bulan: number;
        tahun: number;
    };
    lastInputDate: string | null;
}

export function HeroBanner({ userName, period, lastInputDate }: HeroBannerProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-blue-900/40 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
            {/* Background Decorative Glow */}
            <div className="pointer-events-none absolute -top-16 -right-16 size-80 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-80 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-300 backdrop-blur-md">
                            <Anchor className="size-3.5" />
                            PORT EXECUTIVE INTELLIGENCE
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                            Forecasting Engine Ready
                        </span>
                    </div>

                    <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                        Dashboard Operasional & Prediksi
                    </h1>
                    <p className="max-w-2xl text-sm text-blue-100/80 sm:text-base leading-relaxed">
                        Selamat datang, <span className="font-semibold text-white">{userName}</span>. Pantau tren pergerakan penumpang kapal, proyeksi beban pelayaran masa depan, dan status keterisian armada secara real-time.
                    </p>
                </div>

                {/* Active Period & Quick Actions */}
                <div className="flex flex-col gap-2.5 sm:flex-row md:flex-col lg:flex-row shrink-0">
                    <div className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-xs text-blue-200">
                            <Calendar className="size-3.5 text-cyan-300" />
                            <span>Periode Pelaporan</span>
                        </div>
                        <div className="mt-1 text-base font-bold text-white">
                            {monthNames[period?.bulan]} {period?.tahun}
                        </div>
                        {lastInputDate && (
                            <div className="mt-0.5 text-[11px] text-blue-200/70">
                                Manifest Masuk: {lastInputDate}
                            </div>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="h-auto cursor-pointer border-white/20 bg-white/10 px-4 py-3 text-xs font-medium text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
                    >
                        <Printer className="mr-1.5 size-4 text-cyan-300" />
                        Cetak Laporan
                    </Button>
                </div>
            </div>
        </div>
    );
}
