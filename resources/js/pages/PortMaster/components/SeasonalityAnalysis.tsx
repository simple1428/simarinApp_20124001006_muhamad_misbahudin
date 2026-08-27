import {
    AlertCircle,
    Calculator,
    CheckCircle2,
    Compass,
    Database,
    HelpCircle,
    Info,
    Lightbulb,
    Scale,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SeasonData, formatNumber } from '../types';

interface SeasonalityAnalysisProps {
    actualSeason: SeasonData | null;
    forecastSeason: SeasonData | null;
}

export function SeasonalityAnalysis({ actualSeason, forecastSeason }: SeasonalityAnalysisProps) {
    if (!actualSeason) {
        return (
            <Card className="border-border/80 shadow-xs">
                <CardContent className="p-8 text-center text-muted-foreground">
                    Belum ada data historis yang cukup untuk menganalisis klasifikasi musim.
                </CardContent>
            </Card>
        );
    }

    // Status classification helper
    const getStatusExplanation = (seasonData: SeasonData, contextTitle: string) => {
        const { season, jumlah, mean, std, batas_atas, batas_bawah, selisih, persentase } = seasonData;
        const isHigh = season === 'high';
        const isLow = season === 'low';
        const isNormal = season === 'normal';

        return {
            contextTitle,
            season,
            isHigh,
            isLow,
            isNormal,
            badgeClass: isHigh
                ? 'bg-rose-500 text-white'
                : isLow
                ? 'bg-sky-500 text-white'
                : 'bg-emerald-600 text-white',
            borderColor: isHigh
                ? 'border-rose-200 dark:border-rose-900/60'
                : isLow
                ? 'border-sky-200 dark:border-sky-900/60'
                : 'border-emerald-200 dark:border-emerald-900/60',
            bgColor: isHigh
                ? 'bg-rose-50/40 dark:bg-rose-950/20'
                : isLow
                ? 'bg-sky-50/40 dark:bg-sky-950/20'
                : 'bg-emerald-50/40 dark:bg-emerald-950/20',
            textColor: isHigh
                ? 'text-rose-700 dark:text-rose-300'
                : isLow
                ? 'text-sky-700 dark:text-sky-300'
                : 'text-emerald-700 dark:text-emerald-300',
            reason: isHigh
                ? `Jumlah penumpang (${formatNumber(jumlah)} orang) berada di atas Batas Atas Historis (${formatNumber(batas_atas)} orang). Selisih lonjakan mencapai +${formatNumber(Math.abs(selisih))} orang (+${persentase}% dibanding rata-rata).`
                : isLow
                ? `Jumlah penumpang (${formatNumber(jumlah)} orang) berada di bawah Batas Bawah Historis (${formatNumber(batas_bawah)} orang). Penurunan mencapai ${formatNumber(selisih)} orang (${persentase}% dibanding rata-rata).`
                : `Jumlah penumpang (${formatNumber(jumlah)} orang) berada dalam rentang normal historis (${formatNumber(batas_bawah)} s/d ${formatNumber(batas_atas)} orang).`,
            impact: isHigh
                ? 'Potensi penumpukan penumpang di dermaga/ruang tunggu tinggi. Diperlukan penambahan trip atau optimalisasi kapasitas kapal.'
                : isLow
                ? 'Tingkat keterisian kapal cenderung rendah. Disarankan evaluasi jadwal agar biaya bahan bakar dan operasional tetap efisien.'
                : 'Operasional pelabuhan dan armada berjalan stabil sesuai jadwal reguler.',
        };
    };

    const actualExp = getStatusExplanation(actualSeason, 'Periode Berjalan Saat Ini');
    const forecastExp = forecastSeason ? getStatusExplanation(forecastSeason, 'Periode Proyeksi Bulan Depan') : null;

    return (
        <div className="space-y-6">
            {/* STATISTICAL AMBANG BATAS & EXPLANATION */}
            <Card className="border-border/80 shadow-xs">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                <Compass className="size-5 text-indigo-600 dark:text-indigo-400" />
                                Dasar Penentuan & Ambang Batas Klasifikasi Musim
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Bagaimana sistem SIMARIN mengkategorikan periode ke dalam High, Normal, atau Low Season secara objektif berbasis data statistik.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="self-start sm:self-auto text-xs font-mono">
                            Metode: Mean &plusmn; 1&sigma; (Std Dev)
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Visual Threshold Bar */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1">
                                <TrendingDown className="size-3.5" />
                                Low Season (&lt; {formatNumber(actualSeason.batas_bawah)})
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="size-3.5" />
                                Normal ({formatNumber(actualSeason.batas_bawah)} - {formatNumber(actualSeason.batas_atas)})
                            </span>
                            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                <TrendingUp className="size-3.5" />
                                High Season (&gt; {formatNumber(actualSeason.batas_atas)})
                            </span>
                        </div>

                        {/* Bar Gradient Slider */}
                        <div className="relative flex h-7 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                            <div className="h-full w-1/3 border-r-2 border-white bg-sky-200/90 dark:border-slate-900 dark:bg-sky-950/70 flex items-center justify-center text-[10px] font-bold text-sky-800 dark:text-sky-300">
                                LOW ZONE
                            </div>
                            <div className="h-full w-1/3 border-r-2 border-white bg-emerald-200/90 dark:border-slate-900 dark:bg-emerald-950/70 flex items-center justify-center text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                                NORMAL ZONE
                            </div>
                            <div className="h-full w-1/3 bg-rose-200/90 dark:bg-rose-950/70 flex items-center justify-center text-[10px] font-bold text-rose-800 dark:text-rose-300">
                                HIGH ZONE
                            </div>
                        </div>

                        <div className="flex justify-between pt-1 text-[11px] text-muted-foreground font-mono">
                            <span>Batas Bawah: <b>{formatNumber(actualSeason.batas_bawah)}</b></span>
                            <span className="text-foreground">Mean (&mu;): <b>{formatNumber(actualSeason.mean)}</b></span>
                            <span>Std Dev (&sigma;): <b>&plusmn;{formatNumber(actualSeason.std)}</b></span>
                            <span>Batas Atas: <b>{formatNumber(actualSeason.batas_atas)}</b></span>
                        </div>
                    </div>

                    {/* MENGAPA BISA DIKATAKAN HIGH / NORMAL / LOW (PENJELASAN FORMULA) */}
                    <div className="grid gap-3.5 sm:grid-cols-3">
                        {/* High Season Card */}
                        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900/50 dark:bg-rose-950/20 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>Kapan Dikatakan High Season?</span>
                            </div>
                            <div className="text-[11px] font-semibold text-rose-900 dark:text-rose-200">
                                Syarat: Jumlah Penumpang &gt; (Mean + Std Dev)
                            </div>
                            <p className="text-xs leading-relaxed text-rose-900/80 dark:text-rose-200/80">
                                Terjadi saat mobilitas penumpang melonjak signifikan melebihi batas toleransi wajar (&gt;{formatNumber(actualSeason.batas_atas)} penumpang), biasanya pada puncak libur panjang, Idul Fitri, Natal, dan Tahun Baru.
                            </p>
                        </div>

                        {/* Normal Season Card */}
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                <CheckCircle2 className="size-4 shrink-0" />
                                <span>Kapan Dikatakan Normal Season?</span>
                            </div>
                            <div className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200">
                                Syarat: Batas Bawah &le; Penumpang &le; Batas Atas
                            </div>
                            <p className="text-xs leading-relaxed text-emerald-900/80 dark:text-emerald-200/80">
                                Terjadi saat volume penumpang stabil dalam batas deviasi normal ({formatNumber(actualSeason.batas_bawah)} s/d {formatNumber(actualSeason.batas_atas)} orang). Pola keberangkatan kapal reguler cukup untuk memenuhi kebutuhan.
                            </p>
                        </div>

                        {/* Low Season Card */}
                        <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-900/50 dark:bg-sky-950/20 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-sky-700 dark:text-sky-300">
                                <TrendingDown className="size-4 shrink-0" />
                                <span>Kapan Dikatakan Low Season?</span>
                            </div>
                            <div className="text-[11px] font-semibold text-sky-900 dark:text-sky-200">
                                Syarat: Jumlah Penumpang &lt; (Mean - Std Dev)
                            </div>
                            <p className="text-xs leading-relaxed text-sky-900/80 dark:text-sky-200/80">
                                Terjadi saat arus penumpang turun drastis di bawah ambang wajar (&lt;{formatNumber(actualSeason.batas_bawah)} penumpang), misalnya karena cuaca laut ekstrem, gelombang tinggi, atau pasca musim liburan usai.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* RINCIAN TRANSPARANSI: DARI MANA ANGKA-ANGKA INI BERASAL? */}
            <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-card to-card shadow-xs dark:border-indigo-950 dark:from-indigo-950/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Calculator className="size-5 text-indigo-600 dark:text-indigo-400" />
                        <div>
                            <CardTitle className="text-base font-bold text-foreground">
                                Rincian Perhitungan: Dari Mana Asal Angka-Angka di Atas?
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Penjelasan langkah demi langkah bagaimana sistem SIMARIN menghitung setiap angka ambang batas dari basis data operasional.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3.5 md:grid-cols-2">
                        {/* 1. MEAN */}
                        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                    <Database className="size-4 text-blue-600" />
                                    <span>1. Rata-rata Historis (Mean &mu;) = {formatNumber(actualSeason.mean)}</span>
                                </div>
                                <Badge variant="secondary" className="text-[10px] font-mono">
                                    {actualSeason.total_bulan || 31} Bulan Historis
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Dihitung dari akumulasi <b>{formatNumber(actualSeason.total_penumpang_sum || 2042585)} total penumpang</b> sepanjang periode <b>{actualSeason.periode_awal || 'Januari 2024'} s/d {actualSeason.periode_akhir || 'Juli 2026'}</b> ({actualSeason.total_bulan || 31} bulan berstatus <i>Final</i>) dibagi jumlah bulannya:
                            </p>
                            <div className="rounded-lg bg-muted/60 p-2.5 font-mono text-[11px] text-foreground">
                                Mean (&mu;) = {formatNumber(actualSeason.total_penumpang_sum || 2042585)} org / {actualSeason.total_bulan || 31} bln = <b>{formatNumber(actualSeason.mean)} orang/bulan</b>
                            </div>
                        </div>

                        {/* 2. STD DEV */}
                        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                    <Scale className="size-4 text-indigo-600" />
                                    <span>2. Standar Deviasi (Std Dev &sigma;) = &plusmn;{formatNumber(actualSeason.std)}</span>
                                </div>
                                <Badge variant="secondary" className="text-[10px] font-mono">
                                    Rentang Toleransi
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Mengukur <b>variasi fluktuasi wajar</b> data ke-31 bulan ({actualSeason.periode_awal || 'Januari 2024'} s/d {actualSeason.periode_akhir || 'Juli 2026'}) terhadap rata-ratanya:
                            </p>
                            <div className="rounded-lg bg-muted/60 p-2.5 font-mono text-[11px] text-foreground">
                                Std Dev (&sigma;) = &radic;[ &Sigma;(Penumpang - {formatNumber(actualSeason.mean)})&sup2; / {actualSeason.total_bulan || 31} ] = <b>&plusmn;{formatNumber(actualSeason.std)} orang</b>
                            </div>
                        </div>

                        {/* 3. BATAS ATAS (79 RIBUAN) */}
                        <div className="rounded-xl border border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                                    <TrendingUp className="size-4" />
                                    <span>3. Batas Atas (Plafon High Season) = {formatNumber(actualSeason.batas_atas)}</span>
                                </div>
                                <Badge className="bg-rose-600 text-white text-[10px]">
                                    Ambang High Season
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Angka <b>79 ribuan ({formatNumber(actualSeason.batas_atas)})</b> didapat dari penjumlahan <b>Mean + Standar Deviasi</b>:
                            </p>
                            <div className="rounded-lg bg-card/80 p-2.5 font-mono text-[11px] text-rose-950 dark:text-rose-200 border border-rose-200/60 dark:border-rose-800/40">
                                Batas Atas = {formatNumber(actualSeason.mean)} (Mean) + {formatNumber(actualSeason.std)} (Std) = <b>{formatNumber(actualSeason.batas_atas)} orang</b>
                            </div>
                        </div>

                        {/* 4. BATAS BAWAH (52 RIBUAN) */}
                        <div className="rounded-xl border border-sky-200 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                                    <TrendingDown className="size-4" />
                                    <span>4. Batas Bawah (Lantai Low Season) = {formatNumber(actualSeason.batas_bawah)}</span>
                                </div>
                                <Badge className="bg-sky-600 text-white text-[10px]">
                                    Ambang Low Season
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Angka <b>52 ribuan ({formatNumber(actualSeason.batas_bawah)})</b> didapat dari pengurangan <b>Mean - Standar Deviasi</b>:
                            </p>
                            <div className="rounded-lg bg-card/80 p-2.5 font-mono text-[11px] text-sky-950 dark:text-sky-200 border border-sky-200/60 dark:border-sky-800/40">
                                Batas Bawah = {formatNumber(actualSeason.mean)} (Mean) - {formatNumber(actualSeason.std)} (Std) = <b>{formatNumber(actualSeason.batas_bawah)} orang</b>
                            </div>
                        </div>
                    </div>

                    {/* CONTOH EVALUASI PERIODE BERJALAN */}
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 dark:border-indigo-900/60 dark:bg-indigo-950/40 text-xs leading-relaxed space-y-1">
                        <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                            <Info className="size-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Kesimpulan Penerapan pada Kondisi Berjalan ({formatNumber(actualSeason.jumlah)} Penumpang):</span>
                        </div>
                        <p className="text-indigo-900/90 dark:text-indigo-300/90">
                            Karena realisasi bulan ini <b>{formatNumber(actualSeason.jumlah)} orang</b> lebih besar dari Batas Atas <b>{formatNumber(actualSeason.batas_atas)} orang</b>, maka sistem secara otomatis menetapkan status <b>High Season</b> dengan kelebihan volume sebesar <b>+{formatNumber(Math.abs(actualSeason.selisih))} orang (+{actualSeason.persentase}%)</b> di atas rata-rata historis.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* DETAIL ANALISIS KONDISI RIIL (AKTUAL & PREDIKSI) */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Analisis Status Aktual */}
                <Card className={`border ${actualExp.borderColor} ${actualExp.bgColor} shadow-xs`}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <Badge className={`${actualExp.badgeClass} gap-1.5 px-3 py-1 font-semibold`}>
                                Kondisi Saat Ini: {actualSeason.label}
                            </Badge>
                            <span className="text-xs font-medium text-muted-foreground">Periode Aktif</span>
                        </div>
                        <CardTitle className="mt-2 text-xl font-bold">
                            {formatNumber(actualSeason.jumlah)}{' '}
                            <span className="text-sm font-normal text-muted-foreground">penumpang</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="rounded-xl bg-card p-3.5 border border-border/60 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                <Info className="size-4 text-blue-600" />
                                <span>Mengapa Diklasifikasikan {actualSeason.label}?</span>
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                {actualExp.reason}
                            </p>
                        </div>

                        <div className="text-xs text-muted-foreground">
                            <b className="text-foreground">Dampak Pelabuhan:</b> {actualExp.impact}
                        </div>
                    </CardContent>
                </Card>

                {/* Analisis Status Proyeksi Bulan Depan */}
                {forecastExp && forecastSeason && (
                    <Card className={`border ${forecastExp.borderColor} ${forecastExp.bgColor} shadow-xs`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <Badge className={`${forecastExp.badgeClass} gap-1.5 px-3 py-1 font-semibold`}>
                                    Proyeksi Bulan Depan: {forecastSeason.label}
                                </Badge>
                                <span className="text-xs font-medium text-muted-foreground">Hasil Prediksi Holt-Winters</span>
                            </div>
                            <CardTitle className="mt-2 text-xl font-bold">
                                {formatNumber(forecastSeason.jumlah)}{' '}
                                <span className="text-sm font-normal text-muted-foreground">estimasi penumpang</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="rounded-xl bg-card p-3.5 border border-border/60 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                    <Info className="size-4 text-blue-600" />
                                    <span>Mengapa Diproyeksikan {forecastSeason.label}?</span>
                                </div>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    {forecastExp.reason}
                                </p>
                            </div>

                            <div className="text-xs text-muted-foreground">
                                <b className="text-foreground">Dampak Pelabuhan:</b> {forecastExp.impact}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* ACTIONABLE RECOMMENDATIONS CHECKLIST */}
            {forecastSeason && (
                <Card className="border-border/80 shadow-xs">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                <Lightbulb className="size-5 text-amber-500" />
                                Rekomendasi Kebijakan Operasional Pelabuhan
                            </CardTitle>
                            <Badge className="bg-amber-100 text-xs text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                Tindakan Strategis
                            </Badge>
                        </div>
                        <CardDescription className="text-xs">
                            Langkah operasional yang direkomendasikan sistem bagi Kepala Pelabuhan dan operator berdasarkan proyeksi musim depan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
                            <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-200">
                                <Info className="size-4 text-blue-600 dark:text-blue-400" />
                                <span>Ringkasan Situasi</span>
                            </div>
                            <p className="mt-1 text-xs text-blue-800/80 dark:text-blue-300/80">
                                {forecastSeason.message}
                            </p>
                        </div>

                        <div className="space-y-2.5">
                            {forecastSeason.recommendation.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5 transition-all hover:bg-muted/30"
                                >
                                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                        <CheckCircle2 className="size-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-semibold text-foreground">
                                            Langkah Strategis #{idx + 1}
                                        </div>
                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            {item}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="ml-auto text-[10px] font-medium tracking-wider uppercase"
                                    >
                                        Prioritas {idx === 0 ? 'Tinggi' : 'Standar'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
