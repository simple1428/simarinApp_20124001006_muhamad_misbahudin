import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    Ship as ShipIcon,
    Sliders,
    TrendingUp,
    Printer,
    Layers,
    BarChart2,
    FileText,
    ShieldCheck,
    Anchor,
    Users,
    Calendar,
    ArrowRight,
    Sparkles,
    RefreshCw,
    FileCheck2,
    Info
} from 'lucide-react';

interface ShipItem {
    id: number;
    nama_kapal: string;
    jenis_kapal: string | null;
    kapasitas: number;
    status: 'aktif' | 'nonaktif';
}

interface SeasonInfo {
    season: 'high' | 'normal' | 'low';
    label: string;
    jumlah: number;
    mean: number;
    std: number;
    batas_atas: number;
    batas_bawah: number;
    selisih: number;
    persentase: number;
    message: string;
}

interface PageProps {
    targetPeriodLabel: string;
    targetMonth: number;
    targetYear: number;
    predictedPassengers: number;
    avgMonthlyTrips: number;
    avgShipCapacity: number;
    activeCapacityPerTrip: number;
    totalProjectedCapacity: number;
    projectedOccupancy: number;
    warningLevel: 'NORMAL' | 'SIAGA' | 'KRITIS';
    warningTitle: string;
    severityColor: 'emerald' | 'amber' | 'rose';
    capacityDeficit: number;
    extraTripsNeeded: number;
    recommendedActions: string[];
    seasonInfo: SeasonInfo | null;
    ships: {
        all: ShipItem[];
        active: ShipItem[];
        inactive: ShipItem[];
    };
    routes: Array<{
        id: number;
        asal: string;
        tujuan: string;
        status: string;
    }>;
}

export default function DecisionSupportPage({
    targetPeriodLabel,
    targetMonth,
    targetYear,
    predictedPassengers,
    avgMonthlyTrips,
    avgShipCapacity,
    activeCapacityPerTrip,
    totalProjectedCapacity,
    projectedOccupancy,
    warningLevel,
    warningTitle,
    severityColor,
    capacityDeficit,
    extraTripsNeeded,
    recommendedActions,
    seasonInfo,
    ships,
    routes,
}: PageProps) {
    // ──────────────────────────────────────────
    // WHAT-IF SIMULATOR STATE (LIVE INTERAKTIF)
    // ──────────────────────────────────────────
    const [surgeMultiplier, setSurgeMultiplier] = useState(0); // +0% s/d +50%
    const [extraDailyTrips, setExtraDailyTrips] = useState(0); // +0 s/d +6 trip/hari
    const [simulatedDisabledShips, setSimulatedDisabledShips] = useState<number[]>([]); // kapal yang di-docking
    const [isSimulating, setIsSimulating] = useState(false);

    // Toggle simulasi kapal docking
    const toggleShipDocking = (shipId: number) => {
        setSimulatedDisabledShips((prev) =>
            prev.includes(shipId) ? prev.filter((id) => id !== shipId) : [...prev, shipId]
        );
        setIsSimulating(true);
    };

    // Reset simulasi ke kondisi baseline
    const resetSimulation = () => {
        setSurgeMultiplier(0);
        setExtraDailyTrips(0);
        setSimulatedDisabledShips([]);
        setIsSimulating(false);
    };

    // Kalkulasi Realtime Hasil Simulasi What-If
    const simResults = useMemo(() => {
        // 1. Hitung penumpang simulasi
        const simPassengers = Math.round(predictedPassengers * (1 + surgeMultiplier / 100));

        // 2. Hitung armada aktif yang tersisa di simulasi
        const activeSimShips = ships.active.filter((s) => !simulatedDisabledShips.includes(s.id));
        const simCapacityPerTrip = activeSimShips.reduce((acc, curr) => acc + curr.kapasitas, 0);
        const simAvgCap = activeSimShips.length > 0 ? simCapacityPerTrip / activeSimShips.length : avgShipCapacity;

        // 3. Hitung total trip simulasi bulanan
        const totalSimTrips = avgMonthlyTrips + (extraDailyTrips * 30);

        // 4. Hitung total kapasitas simulasi
        const totalSimCapacity = Math.round(totalSimTrips * simAvgCap);

        // 5. Hitung Occupancy Simulasi
        const simOccupancy = totalSimCapacity > 0 ? Math.round((simPassengers / totalSimCapacity) * 1000) / 10 : 0;

        // Status Simulasi
        let simStatus: 'NORMAL' | 'SIAGA' | 'KRITIS' = 'NORMAL';
        let simColor = 'emerald';
        let simLabel = 'Aman & Terkendali';

        if (simOccupancy >= 85) {
            simStatus = 'KRITIS';
            simColor = 'rose';
            simLabel = 'Overcapacity Kritis!';
        } else if (simOccupancy >= 70) {
            simStatus = 'SIAGA';
            simColor = 'amber';
            simLabel = 'Siaga Peningkatan';
        }

        return {
            simPassengers,
            activeSimShipsCount: activeSimShips.length,
            totalSimCapacity,
            simOccupancy,
            simStatus,
            simColor,
            simLabel,
            disabledCount: simulatedDisabledShips.length,
        };
    }, [
        predictedPassengers,
        surgeMultiplier,
        extraDailyTrips,
        simulatedDisabledShips,
        ships.active,
        avgMonthlyTrips,
        avgShipCapacity,
    ]);

    return (
        <>
            <Head title="Early Warning & Rekomendasi Kapasitas Armada (DSS) - SIMARIN" />

            <style>{`
                @media print {
                    header, .no-print, .interactive-panel { display: none !important; }
                    body, .dss-wrapper { background: #ffffff !important; color: #000000 !important; }
                    .print-document { display: block !important; border: none !important; }
                    table { color: #000000 !important; border-collapse: collapse !important; width: 100% !important; }
                    th, td { border: 1px solid #94a3b8 !important; padding: 6px 8px !important; }
                    th { background: #f1f5f9 !important; color: #000000 !important; }
                }
                .print-document { display: block; }
            `}</style>

            <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-600 selection:text-white dss-wrapper">
                {/* ── TOPBAR NAVIGATION ── */}
                <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
                            🚢
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-bold text-white tracking-tight">SIMARIN</h1>
                                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Decision Support System (DSS)
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">Early Warning &amp; Rekomendasi Kapasitas Armada Kapal</p>
                        </div>
                    </div>

                    {/* Navigation links */}
                    <div className="flex items-center gap-2 flex-wrap no-print">
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
                            Lampiran Uji
                        </Link>
                        <Link
                            href="/demo-sidang"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                            Demo Sidang
                        </Link>
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition active:scale-95"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Cetak Rekomendasi Resmi
                        </button>
                    </div>
                </header>

                {/* ── MAIN CONTENT ── */}
                <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
                    {/* SECTION 1: EARLY WARNING BANNER */}
                    <div className={`relative overflow-hidden rounded-2xl border p-6 shadow-xl transition-all ${
                        warningLevel === 'KRITIS'
                            ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950/80 border-rose-600/50'
                            : warningLevel === 'SIAGA'
                            ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950/80 border-amber-600/50'
                            : 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-emerald-600/50'
                    }`}>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                        warningLevel === 'KRITIS'
                                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                            : warningLevel === 'SIAGA'
                                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    }`}>
                                        <AlertTriangle className="w-4 h-4" />
                                        Status: {warningLevel} ({seasonInfo ? seasonInfo.label : 'Analisis'})
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        Target Evaluasi: <strong className="text-white">{targetPeriodLabel}</strong>
                                    </span>
                                </div>

                                <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight">
                                    {warningTitle}
                                </h2>
                                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                                    Berdasarkan peramalan <strong>Holt-Winters</strong>, estimasi volume penumpang adalah{' '}
                                    <strong className="text-white">{predictedPassengers.toLocaleString('id-ID')} pax</strong> dengan tingkat keterisian armada (Occupancy Rate){' '}
                                    <strong className={warningLevel === 'KRITIS' ? 'text-rose-400' : 'text-emerald-400'}>{projectedOccupancy}%</strong> dari total kapasitas tersedia ({totalProjectedCapacity.toLocaleString('id-ID')} pax).
                                </p>
                            </div>

                            {/* Key Indicators */}
                            <div className="flex sm:flex-col items-center lg:items-end gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 shrink-0">
                                <div className="text-right">
                                    <div className="text-[11px] text-slate-400 uppercase font-medium">Proyeksi Occupancy</div>
                                    <div className={`text-3xl font-black ${
                                        warningLevel === 'KRITIS' ? 'text-rose-400' : warningLevel === 'SIAGA' ? 'text-amber-400' : 'text-emerald-400'
                                    }`}>
                                        {projectedOccupancy}%
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        {warningLevel === 'KRITIS' ? `Kekurangan ±${capacityDeficit.toLocaleString('id-ID')} pax` : 'Beban Normal'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: METRIC CARDS & REKOMENDASI SOLUSI */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Card 1: Demand & Capacity Overview */}
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-3.5 shadow-lg">
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <Users className="w-4 h-4 text-blue-400" />
                                1. Analisis Kebutuhan Penumpang
                            </div>
                            <div className="space-y-2 text-xs divide-y divide-slate-800/60">
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-slate-400">Prediksi Penumpang ($F_t$):</span>
                                    <span className="font-bold text-white text-sm">{predictedPassengers.toLocaleString('id-ID')} pax</span>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-slate-400">Kapasitas Armada Siap:</span>
                                    <span className="font-bold text-slate-200">{totalProjectedCapacity.toLocaleString('id-ID')} pax</span>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-slate-400">Rata-rata Trip Bulanan:</span>
                                    <span className="font-bold text-slate-200">{avgMonthlyTrips} trip/bulan</span>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-slate-400">Kategori Musiman:</span>
                                    <span className="font-semibold text-emerald-400">{seasonInfo ? seasonInfo.label : 'Normal'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Fleet Status */}
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-3.5 shadow-lg">
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <Anchor className="w-4 h-4 text-emerald-400" />
                                2. Kesiapan Armada Kapal
                            </div>
                            <div className="space-y-2 text-xs divide-y divide-slate-800/60">
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-slate-400">Armada Beroperasi:</span>
                                    <span className="font-bold text-emerald-400">{ships.active.length} Kapal Aktif</span>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-slate-400">Armada Cadangan / Standby:</span>
                                    <span className="font-bold text-amber-400">{ships.inactive.length} Kapal</span>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-slate-400">Daya Angkut / Trip Gabungan:</span>
                                    <span className="font-bold text-white">{activeCapacityPerTrip.toLocaleString('id-ID')} pax/trip</span>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-slate-400">Rata-rata Kapasitas / Kapal:</span>
                                    <span className="font-bold text-slate-300">{avgShipCapacity.toLocaleString('id-ID')} pax</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Actionable Recommendation Summary */}
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-3 shadow-lg">
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                3. Rekomendasi Solusi Kapasitas
                            </div>
                            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                                {recommendedActions.map((act, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-emerald-400 font-bold shrink-0">•</span>
                                        <span>{act}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* SECTION 3: WHAT-IF SCENARIO SIMULATOR (INTERAKTIF LIVE DEMO) */}
                    <div className="interactive-panel rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-indigo-700/50 p-6 shadow-xl space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <div className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-semibold uppercase">
                                    <Sliders className="w-4 h-4" />
                                    Simulasi Kebijakan Manajerial (What-If Analysis)
                                </div>
                                <h3 className="text-base font-bold text-white mt-1">
                                    Uji Coba Skenario Operasional &amp; Dampak terhadap Okupansi
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Geser slider atau klik kapal untuk melihat perubahan tingkat keterisian penumpang secara real-time
                                </p>
                            </div>
                            {isSimulating && (
                                <button
                                    onClick={resetSimulation}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 self-start sm:self-auto transition"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Reset Simulasi
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                            {/* Controls Column */}
                            <div className="lg:col-span-2 space-y-5 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                                {/* Control 1: Lonjakan Penumpang Tak Terduga */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-slate-200">
                                            1. Simulasi Lonjakan Penumpang Tambahan:
                                        </span>
                                        <span className="font-mono font-bold text-amber-400">
                                            +{surgeMultiplier}% ({simResults.simPassengers.toLocaleString('id-ID')} pax)
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        step="5"
                                        value={surgeMultiplier}
                                        onChange={(e) => {
                                            setSurgeMultiplier(Number(e.target.value));
                                            setIsSimulating(true);
                                        }}
                                        className="w-full accent-amber-500 cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                        <span>0% (Sesuai Prediksi)</span>
                                        <span>+25%</span>
                                        <span>+50% (Puncak Liburan)</span>
                                    </div>
                                </div>

                                {/* Control 2: Penambahan Trip Harian */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-slate-200">
                                            2. Simulasi Penambahan Trip Keberangkatan:
                                        </span>
                                        <span className="font-mono font-bold text-emerald-400">
                                            +{extraDailyTrips} Trip Ekstra/Hari (+{extraDailyTrips * 30} trip/bulan)
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="6"
                                        step="1"
                                        value={extraDailyTrips}
                                        onChange={(e) => {
                                            setExtraDailyTrips(Number(e.target.value));
                                            setIsSimulating(true);
                                        }}
                                        className="w-full accent-emerald-500 cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                        <span>Jadwal Normal (0 trip)</span>
                                        <span>+3 Trip/Hari</span>
                                        <span>+6 Trip Ekstra/Hari</span>
                                    </div>
                                </div>

                                {/* Control 3: Kapal Docking / Rusak */}
                                <div className="space-y-2">
                                    <div className="text-xs font-semibold text-slate-200">
                                        3. Simulasi Kapal Docking / Masuk Galangan (Klik untuk Menonaktifkan):
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                        {ships.all.map((ship) => {
                                            const isCurrentlyDisabled =
                                                ship.status === 'nonaktif' || simulatedDisabledShips.includes(ship.id);
                                            return (
                                                <button
                                                    key={ship.id}
                                                    onClick={() => toggleShipDocking(ship.id)}
                                                    className={`p-2.5 rounded-lg text-left text-xs border transition ${
                                                        !isCurrentlyDisabled
                                                            ? 'bg-slate-900 border-emerald-500/40 text-slate-200 hover:border-rose-500/50'
                                                            : 'bg-rose-950/40 border-rose-600/50 text-rose-300 opacity-80'
                                                    }`}
                                                >
                                                    <div className="font-bold truncate">{ship.nama_kapal}</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                                        {ship.kapasitas} pax • {!isCurrentlyDisabled ? '🟢 Aktif' : '🔴 Docking'}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Result Gauge Column */}
                            <div className="rounded-xl bg-slate-950 p-5 flex flex-col justify-between border border-slate-800 space-y-4">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Hasil Simulasi Realtime
                                    </div>
                                    <div className="mt-3 text-center space-y-1">
                                        <div className="text-xs text-slate-400">Okupansi Simulasi</div>
                                        <div className={`text-4xl font-black ${
                                            simResults.simStatus === 'KRITIS'
                                                ? 'text-rose-400'
                                                : simResults.simStatus === 'SIAGA'
                                                ? 'text-amber-400'
                                                : 'text-emerald-400'
                                        }`}>
                                            {simResults.simOccupancy}%
                                        </div>
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-1 ${
                                            simResults.simStatus === 'KRITIS'
                                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                                : simResults.simStatus === 'SIAGA'
                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        }`}>
                                            {simResults.simLabel}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Total Daya Angkut:</span>
                                        <span className="font-bold text-white">{simResults.totalSimCapacity.toLocaleString('id-ID')} pax</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Estimasi Penumpang:</span>
                                        <span className="font-bold text-slate-200">{simResults.simPassengers.toLocaleString('id-ID')} pax</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Kapal Beroperasi:</span>
                                        <span className="font-bold text-emerald-400">{simResults.activeSimShipsCount} armada</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: EXECUTIVE RECOMMENDATION SHEET (FORMAT CETAK RESMI) */}
                    <div className="print-document card-box rounded-2xl bg-white text-slate-900 p-8 shadow-xl border border-slate-200 space-y-6">
                        {/* Kop Surat Resmi */}
                        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                            <h3 className="text-base font-bold uppercase tracking-wider text-slate-900">
                                KANTOR UNIT PENYELENGGARA PELABUHAN (KUPP)
                            </h3>
                            <h4 className="text-xs font-semibold uppercase text-slate-700">
                                SISTEM INFORMASI MANAJEMEN ANGKUTAN PENYEBERANGAN MARITIM (SIMARIN)
                            </h4>
                            <p className="text-[11px] text-slate-500">
                                Lembar Rekomendasi Kebijakan &amp; Alokasi Kapasitas Armada Pelayaran
                            </p>
                        </div>

                        {/* Metadata Surat */}
                        <div className="grid grid-cols-2 text-xs text-slate-700">
                            <div>
                                <div>Nomor Dokumen : <strong className="text-slate-900 font-mono">SIMARIN/DSS/{targetYear}/{String(targetMonth).padStart(2, '0')}</strong></div>
                                <div>Perihal : <strong>Rekomendasi Kapasitas Armada Periode {targetPeriodLabel}</strong></div>
                            </div>
                            <div className="text-right">
                                <div>Tanggal Terbit : <strong>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
                                <div>Status Rekomendasi : <strong className="text-slate-900 uppercase">Resmi (Sistem Terverifikasi)</strong></div>
                            </div>
                        </div>

                        {/* Rangkuman Analisis Tabel */}
                        <div className="space-y-2">
                            <h5 className="text-xs font-bold uppercase text-slate-800">I. Hasil Analisis Beban &amp; Kapasitas</h5>
                            <table className="w-full text-xs text-left border-collapse border border-slate-300">
                                <thead className="bg-slate-100 font-semibold text-slate-700">
                                    <tr>
                                        <th className="p-2 border border-slate-300">Indikator Parameter</th>
                                        <th className="p-2 border border-slate-300 text-right">Nilai / Estimasi</th>
                                        <th className="p-2 border border-slate-300">Keterangan Manajerial</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="p-2 border border-slate-300 font-medium">Prediksi Volume Penumpang (Holt-Winters)</td>
                                        <td className="p-2 border border-slate-300 text-right font-bold">{predictedPassengers.toLocaleString('id-ID')} pax</td>
                                        <td className="p-2 border border-slate-300">Estimasi permintaan perjalanan periode {targetPeriodLabel}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 border border-slate-300 font-medium">Kapasitas Armada Reguler Tersedia</td>
                                        <td className="p-2 border border-slate-300 text-right">{totalProjectedCapacity.toLocaleString('id-ID')} pax</td>
                                        <td className="p-2 border border-slate-300">Daya angkut {ships.active.length} kapal aktif ({avgMonthlyTrips} trip reguler)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 border border-slate-300 font-medium">Proyeksi Occupancy Rate</td>
                                        <td className="p-2 border border-slate-300 text-right font-bold text-slate-900">{projectedOccupancy}%</td>
                                        <td className="p-2 border border-slate-300 font-semibold">
                                            Status: {warningLevel} ({seasonInfo?.label ?? 'Normal'})
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Poin Rekomendasi */}
                        <div className="space-y-2">
                            <h5 className="text-xs font-bold uppercase text-slate-800">II. Poin Rekomendasi Kebijakan Operasional</h5>
                            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-5">
                                {recommendedActions.map((act, idx) => (
                                    <li key={idx}><strong>Poin {idx + 1}:</strong> {act}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Kolom Tanda Tangan */}
                        <div className="pt-6 grid grid-cols-2 text-xs text-center text-slate-800">
                            <div>
                                <div>Diverifikasi oleh,</div>
                                <div className="font-semibold text-slate-900 mt-1">Operator Pelabuhan</div>
                                <div className="h-16" />
                                <div className="font-bold underline">( Operator SIMARIN )</div>
                                <div className="text-[10px] text-slate-500">NIP. 19850315 201001 1 002</div>
                            </div>
                            <div>
                                <div>Mengetahui &amp; Menyetujui,</div>
                                <div className="font-semibold text-slate-900 mt-1">Kepala Kantor Pelabuhan</div>
                                <div className="h-16" />
                                <div className="font-bold underline">( Kepala Pelabuhan )</div>
                                <div className="text-[10px] text-slate-500">NIP. 19780820 200502 1 001</div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
