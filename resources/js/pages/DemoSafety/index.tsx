import { useState } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import {
    ShieldAlert,
    CheckCircle2,
    LogIn,
    RotateCcw,
    Zap,
    Play,
    Server,
    Database,
    Code,
    Cpu,
    HelpCircle,
    BookOpen,
    Layers,
    BarChart2,
    FileText,
    ArrowRight,
    Sparkles,
    AlertTriangle,
    Terminal,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface HealthCheck {
    database: {
        status: 'READY' | 'EMPTY';
        totalRecords: number;
        totalPeriods: number;
        finalPeriods: number;
    };
    python: {
        status: 'READY' | 'WARNING';
        version: string;
        statsmodels: string;
    };
    forecast: {
        status: 'READY' | 'NEEDS_TRIGGER';
        hwLatest: string;
        smaLatest: string;
    };
}

interface DemoAccount {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface PageProps {
    healthCheck: HealthCheck;
    demoAccounts: {
        operator: DemoAccount | null;
        kepala: DemoAccount | null;
    };
    activePeriodInfo: {
        bulan: number;
        tahun: number;
        status: string;
    } | null;
    summaryStats: {
        totalShips: number;
        totalRoutes: number;
        totalUsers: number;
    };
}

// ──────────────────────────────────────────
// CHEATSHEET PERTANYAAN SIDANG
// ──────────────────────────────────────────
const DEFENSE_QA = [
    {
        q: '1. Mengapa memilih metode Holt-Winters dibanding Simple Moving Average (SMA)?',
        a: 'Data jumlah penumpang penyeberangan kapal memiliki pola tren jangka panjang dan pola musiman (musim liburan/hari raya) yang berulang setiap tahun. Simple Moving Average (SMA) hanya menghitung rata-rata tanpa menangkap efek musiman dan selalu terlambat (lag) mengikuti tren. Holt-Winters Triple Exponential Smoothing mampu memodelkan Level, Trend, dan Seasonal Factor secara bersamaan sehingga menghasilkan akurasi yang jauh lebih tinggi (MAPE < 5%).',
    },
    {
        q: '2. Mengapa sistem memerlukan minimal 24 bulan data historis untuk Holt-Winters?',
        a: 'Metode Holt-Winters dengan musiman tahunan (siklus 12 bulan) membutuhkan minimal 2 siklus musiman penuh (2 × 12 = 24 bulan) untuk menginisialisasi nilai awal level, trend, dan faktor indeks musiman (seasonal indices) untuk masing-masing bulan Januari hingga Desember.',
    },
    {
        q: '3. Apa fungsi status periode "open" dan "final" dalam sistem?',
        a: 'Pemisahan status berfungsi untuk data governance & validity constraint: Periode "open" memungkinkan operator memasukkan dan memperbaiki data harian bulan berjalan. Setelah periode ditutup menjadi "final", data dikunci agar tidak dapat dimanipulasi, sehingga dataset training peramalan terjamin integritas dan validitasnya.',
    },
    {
        q: '4. Bagaimana interpretasi nilai MAPE (Mean Absolute Percentage Error) dalam penelitian ini?',
        a: 'Berdasarkan kriteria standar Lewis (1982), nilai MAPE < 10% dikategorikan sebagai "Kemampuan Peramalan Sangat Baik" (Highly Accurate). Nilai MAPE yang diperoleh sistem SIMARIN menunjukkan bahwa rata-rata deviasi estimasi model terhadap realitas lapangan sangat minim dan layak dijadikan acuan keputusan manajemen pelabuhan.',
    },
    {
        q: '5. Mengapa komputasi peramalan dieksekusi menggunakan Python dari Laravel?',
        a: 'Laravel unggul dalam manajemen transaksi basis data, autentikasi role, dan performa web MVC, sedangkan Python (khususnya library Statsmodels dan Pandas) adalah standar industri untuk komputasi statistika deret waktu (time series). Integrasi melalui Process Pipe memungkinkan Laravel mengeksekusi algoritma statistika tingkat lanjut secara cepat tanpa membebani runtime PHP.',
    },
];

// ──────────────────────────────────────────
// URUTAN DEMO SIDANG (10-15 MENIT)
// ──────────────────────────────────────────
const DEMO_STEPS = [
    {
        step: 1,
        title: 'Pembukaan & Masalah Operasional',
        time: '2 Menit',
        desc: 'Jelaskan latar belakang: lonjakan penumpang penyeberangan yang tidak terduga sering menyebabkan antrean panjang dan krisis kapasitas armada.',
    },
    {
        step: 2,
        title: 'Demo Modul Operator (Pencatatan & Master Data)',
        time: '3 Menit',
        desc: 'Login sebagai Operator → Tunjukkan Master Kapal & Rute → Input perjalanan kapal hari ini → Buktikan bahwa ringkasan bulanan (occupancy rate) terupdate secara otomatis.',
    },
    {
        step: 3,
        title: 'Demo Modul Kepala Pelabuhan (Monitoring & Peramalan)',
        time: '4 Menit',
        desc: 'Login sebagai Kepala Pelabuhan → Tunjukkan Dashboard Monitoring → Buka menu Peramalan Holt-Winters → Tunjukkan hasil prediksi bulan berjalan & bulan depan beserta klasifikasi High/Low Season.',
    },
    {
        step: 4,
        title: 'Pembuktian Ilmiah & Komparasi Model (Bab 4)',
        time: '3 Menit',
        desc: 'Buka menu Komparasi Metode (/komparasi) → Tunjukkan perbandingan kurva grafik dan tabel error MAD/MAPE/RMSE yang membuktikan Holt-Winters lebih unggul dibanding SMA.',
    },
    {
        step: 5,
        title: 'Penutup & Kesimpulan',
        time: '2 Menit',
        desc: 'Tegaskan kesimpulan: SIMARIN berhasil membantu pengambilan keputusan penambahan trip armada kapal saat musim lonjakan penumpang.',
    },
];

export default function DemoSafetyPage({
    healthCheck,
    demoAccounts,
    activePeriodInfo,
    summaryStats,
}: PageProps) {
    const { flash } = usePage().props as any;
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [expandedQA, setExpandedQA] = useState<number | null>(null);

    // 1-Click Instant Login
    const handleQuickLogin = (role: 'operator' | 'kepala_pelabuhan') => {
        setLoadingAction(`login_${role}`);
        router.post('/demo-sidang/quick-login', { role });
    };

    // Trigger Peramalan Ulang
    const handleTriggerForecast = () => {
        setLoadingAction('forecast');
        router.post('/demo-sidang/trigger-forecast', {}, {
            onFinish: () => setLoadingAction(null),
        });
    };

    // Inject Sample Trip Realtime
    const handleInjectTrip = () => {
        setLoadingAction('inject');
        router.post('/demo-sidang/inject-trip', {}, {
            onFinish: () => setLoadingAction(null),
        });
    };

    // Reset Database ke Kondisi Ideal Sidang
    const handleResetDatabase = () => {
        if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh database ke kondisi awal ideal sidang? Semua data hasil latihan akan disetel ulang.')) {
            setLoadingAction('reset');
            router.post('/demo-sidang/reset-database', {}, {
                onFinish: () => setLoadingAction(null),
            });
        }
    };

    return (
        <>
            <Head title="Demo Sidang & Safety Net Presentasi - SIMARIN" />

            <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-600 selection:text-white">
                {/* ── TOPBAR NAVIGATION ── */}
                <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center text-xl shadow-lg shadow-rose-500/20 border border-rose-400/30">
                            🛡️
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-bold text-white tracking-tight">SIMARIN</h1>
                                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    Control Panel Demo Sidang
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">Safety Net Presentasi, 1-Click Login, &amp; Panduan Penguji</p>
                        </div>
                    </div>

                    {/* Navigation links */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            href="/flowchart"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        >
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            Flowchart
                        </Link>
                        <Link
                            href="/komparasi"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        >
                            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                            Komparasi
                        </Link>
                        <Link
                            href="/lampiran-pengujian"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        >
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            Lampiran
                        </Link>
                        <Link
                            href="/rekomendasi-armada"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition"
                        >
                            <span className="text-xs">🚢</span>
                            Rekomendasi Armada
                        </Link>
                    </div>
                </header>

                {/* ── NOTIFICATION FLASH BANNER ── */}
                {flash?.flash_message && (
                    <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-4">
                        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                            flash.flash_message.type === 'success'
                                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                                : 'bg-rose-950/70 border-rose-500/40 text-rose-200'
                        }`}>
                            <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                            <div>
                                <div className="font-bold text-sm text-white">{flash.flash_message.title}</div>
                                <div className="text-xs text-slate-300 mt-0.5">{flash.flash_message.detail}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MAIN CONTENT ── */}
                <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
                    {/* SECTION 1: SYSTEM READINESS (HEALTH CHECK) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Status Database */}
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4.5 space-y-2 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-blue-400" />
                                    <h3 className="font-bold text-white text-sm">Status Database</h3>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {healthCheck.database.status}
                                </span>
                            </div>
                            <div className="text-xs text-slate-300 space-y-1 pt-1">
                                <div>Total Catatan Perjalanan: <strong className="text-white">{healthCheck.database.totalRecords} records</strong></div>
                                <div>Periode Final (Training): <strong className="text-white">{healthCheck.database.finalPeriods} bulan</strong></div>
                            </div>
                        </div>

                        {/* Status Python Statsmodels */}
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4.5 space-y-2 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-emerald-400" />
                                    <h3 className="font-bold text-white text-sm">Engine Python</h3>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {healthCheck.python.status}
                                </span>
                            </div>
                            <div className="text-xs text-slate-300 space-y-1 pt-1">
                                <div>Python Version: <strong className="text-white">{healthCheck.python.version}</strong></div>
                                <div>Statsmodels: <strong className="text-emerald-400">{healthCheck.python.statsmodels}</strong></div>
                            </div>
                        </div>

                        {/* Status Peramalan */}
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4.5 space-y-2 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-400" />
                                    <h3 className="font-bold text-white text-sm">Status Model Prediksi</h3>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3" />
                                    READY
                                </span>
                            </div>
                            <div className="text-xs text-slate-300 space-y-1 pt-1">
                                <div>Holt-Winters: <strong className="text-blue-400">{healthCheck.forecast.hwLatest}</strong></div>
                                <div>SMA: <strong className="text-amber-400">{healthCheck.forecast.smaLatest}</strong></div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: 1-CLICK INSTANT LOGIN (BYPASS LOGIN SAAT SIDANG) */}
                    <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-rose-800/40 p-6 shadow-xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold">
                                    <LogIn className="w-3.5 h-3.5" />
                                    1-Click Instant Login (Bypass Form)
                                </div>
                                <h2 className="text-lg font-bold text-white tracking-tight mt-1">
                                    Pilih Akun untuk Langsung Masuk ke Dashboard
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Tidak perlu mengetik email dan password di depan penguji — klik satu tombol untuk demonstrasi langsung
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            {/* Operator Card */}
                            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xl">
                                            👷
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-base">Operator Pelabuhan</h3>
                                            <p className="text-xs text-slate-400 font-mono">operator@simarin.test</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        Input &amp; Master Data
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Hak akses: Input catatan perjalanan harian, kelola master kapal, rute pelayaran, dan tutup/finalisasi periode bulanan.
                                </p>
                                <button
                                    onClick={() => handleQuickLogin('operator')}
                                    disabled={loadingAction === 'login_operator'}
                                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition active:scale-98"
                                >
                                    <LogIn className="w-4 h-4" />
                                    {loadingAction === 'login_operator' ? 'Memproses Masuk…' : 'Masuk Langsung sebagai Operator'}
                                </button>
                            </div>

                            {/* Kepala Pelabuhan Card */}
                            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xl">
                                            👔
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-base">Kepala Pelabuhan</h3>
                                            <p className="text-xs text-slate-400 font-mono">kepala@simarin.test</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                        Monitoring &amp; Forecast
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Hak akses: Monitoring dashboard eksekutif, analisis peramalan Holt-Winters, evaluasi akurasi MAPE, dan riwayat peramalan.
                                </p>
                                <button
                                    onClick={() => handleQuickLogin('kepala_pelabuhan')}
                                    disabled={loadingAction === 'login_kepala_pelabuhan'}
                                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition active:scale-98"
                                >
                                    <LogIn className="w-4 h-4" />
                                    {loadingAction === 'login_kepala_pelabuhan' ? 'Memproses Masuk…' : 'Masuk Langsung sebagai Kepala Pelabuhan'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: SAFETY ACTIONS & SIMULASI LIVE (ALAT PERAGA PRESENTASI) */}
                    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" />
                                Alat Simulasi Live &amp; Emergency Safety Net
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Gunakan aksi ini untuk mendemonstrasikan kapabilitas reaktif sistem atau mereset data jika terjadi kesalahan
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            {/* Action 1: Inject Live Trip */}
                            <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4.5 space-y-3 flex flex-col justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                                        <Play className="w-3.5 h-3.5" />
                                        Simulasi 1: Input Realtime
                                    </div>
                                    <h4 className="font-bold text-white text-sm">Suntik Data Perjalanan Harian</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Menambahkan 1 record perjalanan kapal acak hari ini untuk membuktikan rekapitulasi dan occupancy langsung tersinkron otomatis.
                                    </p>
                                </div>
                                <button
                                    onClick={handleInjectTrip}
                                    disabled={loadingAction === 'inject'}
                                    className="w-full py-2 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition flex items-center justify-center gap-1.5"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {loadingAction === 'inject' ? 'Menyuntikkan Data…' : 'Suntik 1 Trip Sekarang'}
                                </button>
                            </div>

                            {/* Action 2: Trigger Forecast Python */}
                            <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4.5 space-y-3 flex flex-col justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase">
                                        <Terminal className="w-3.5 h-3.5" />
                                        Simulasi 2: Eksekusi Python
                                    </div>
                                    <h4 className="font-bold text-white text-sm">Hitung Ulang Holt-Winters</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Menjalankan ulang script Python untuk melatih model time-series pada dataset terbaru dan memperbarui in-sample fitted.
                                    </p>
                                </div>
                                <button
                                    onClick={handleTriggerForecast}
                                    disabled={loadingAction === 'forecast'}
                                    className="w-full py-2 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition flex items-center justify-center gap-1.5"
                                >
                                    <Cpu className="w-3.5 h-3.5" />
                                    {loadingAction === 'forecast' ? 'Mengeksekusi Python…' : 'Eksekusi Algoritma Prediksi'}
                                </button>
                            </div>

                            {/* Action 3: Emergency Reset */}
                            <div className="rounded-xl bg-slate-950/60 border border-rose-900/30 p-4.5 space-y-3 flex flex-col justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        Emergency Safety Net
                                    </div>
                                    <h4 className="font-bold text-white text-sm">Reset ke Data Ideal Sidang</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Mengembalikan database ke dataset awal 32 bulan historis yang bersih jika data latihan Anda sebelumnya rusak.
                                    </p>
                                </div>
                                <button
                                    onClick={handleResetDatabase}
                                    disabled={loadingAction === 'reset'}
                                    className="w-full py-2 rounded-lg text-xs font-semibold bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/30 transition flex items-center justify-center gap-1.5"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    {loadingAction === 'reset' ? 'Mereset Database…' : 'Reset ke Kondisi Ideal'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: URUTAN PRESENTASI SIDANG (DEMO FLOW) */}
                    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-indigo-400" />
                                Panduan Urutan Alur Presentasi Sidang (10 - 15 Menit)
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Ikuti tahapan demonstrasi terstruktur ini agar penyampaian fokus dan memukau dosen penguji
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                            {DEMO_STEPS.map((s) => (
                                <div key={s.step} className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-2 flex flex-col justify-between">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-mono font-bold">
                                                {s.step}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-900">
                                                {s.time}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-white text-xs leading-tight">{s.title}</h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 5: CHEATSHEET PERTANYAAN KRITIS PENGUJI */}
                    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-amber-400" />
                                Cheat Sheet: Jawaban Ilmiah Pertanyaan Penguji Sidang
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Klik pada pertanyaan untuk membuka referensi jawaban berlandaskan teori metodologi
                            </p>
                        </div>

                        <div className="space-y-2.5 pt-1">
                            {DEFENSE_QA.map((qa, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden transition"
                                >
                                    <button
                                        onClick={() => setExpandedQA(expandedQA === idx ? null : idx)}
                                        className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-900/50 transition"
                                    >
                                        <span className="font-semibold text-xs text-slate-200">{qa.q}</span>
                                        {expandedQA === idx ? (
                                            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                        )}
                                    </button>
                                    {expandedQA === idx && (
                                        <div className="p-4 pt-0 text-xs text-slate-300 border-t border-slate-800/60 bg-slate-900/30 leading-relaxed font-sans">
                                            {qa.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
