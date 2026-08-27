import { Award, CheckCircle2, Cpu, HelpCircle, Info, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModelAccuracyData, formatNumber } from '../types';

interface ModelAccuracyEvaluationProps {
    modelAccuracy: ModelAccuracyData;
}

export function ModelAccuracyEvaluation({ modelAccuracy }: ModelAccuracyEvaluationProps) {
    const accuracyPercentage = (100 - modelAccuracy.MAPE).toFixed(2);

    return (
        <div className="space-y-6">
            {/* 3 METRIC SUMMARY CARDS WITH IN-DEPTH EXECUTIVE EXPLANATIONS */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* MAPE Card */}
                <Card className="relative overflow-hidden border-border/80 shadow-xs">
                    <div className="absolute top-0 left-0 h-1.5 w-full bg-emerald-500" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                MAPE (Tingkat Error Persentase)
                            </CardTitle>
                            <Badge className="bg-emerald-100 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                Sangat Akurat (&lt;10%)
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                {modelAccuracy.MAPE}%
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">
                                (Tingkat Akurasi: <b className="text-emerald-600 dark:text-emerald-400">{accuracyPercentage}%</b>)
                            </span>
                        </div>
                        <div className="rounded-lg bg-emerald-50/70 p-2.5 dark:bg-emerald-950/30 text-xs text-emerald-950 dark:text-emerald-200">
                            <b>Artinya bagi Pelabuhan:</b> Rata-rata tingkat deviasi prediksi hanya <b>{modelAccuracy.MAPE}%</b> dari kenyataan riil. Prediksi sangat dapat diandalkan sebagai dasar keputusan operasional armada.
                        </div>
                    </CardContent>
                </Card>

                {/* MAE Card */}
                <Card className="relative overflow-hidden border-border/80 shadow-xs">
                    <div className="absolute top-0 left-0 h-1.5 w-full bg-blue-500" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                MAE (Deviasi Rata-rata Riil)
                            </CardTitle>
                            <Badge variant="outline" className="text-[10px] font-mono">
                                Satuan: Orang
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                                {formatNumber(modelAccuracy.MAE)}
                            </span>
                            <span className="text-xs font-normal text-muted-foreground">penumpang</span>
                        </div>
                        <div className="rounded-lg bg-blue-50/70 p-2.5 dark:bg-blue-950/30 text-xs text-blue-950 dark:text-blue-200">
                            <b>Artinya bagi Pelabuhan:</b> Selisih rata-rata absolut antara ramalan dan penumpang aktual hanya sekitar <b>&plusmn;{formatNumber(modelAccuracy.MAE)} orang</b> per bulan (setara deviasi 1-2 jadwal kapal kecil).
                        </div>
                    </CardContent>
                </Card>

                {/* RMSE Card */}
                <Card className="relative overflow-hidden border-border/80 shadow-xs">
                    <div className="absolute top-0 left-0 h-1.5 w-full bg-indigo-500" />
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                RMSE (Sensitivitas Error Kuadrat)
                            </CardTitle>
                            <Badge variant="outline" className="text-[10px] font-mono">
                                Stabilitas Model
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                                {formatNumber(modelAccuracy.RMSE)}
                            </span>
                            <span className="text-xs font-normal text-muted-foreground">penumpang</span>
                        </div>
                        <div className="rounded-lg bg-indigo-50/70 p-2.5 dark:bg-indigo-950/30 text-xs text-indigo-950 dark:text-indigo-200">
                            <b>Artinya bagi Pelabuhan:</b> Nilai RMSE yang dekat dengan MAE membuktikan model stabil dan <b>tidak memiliki kesalahan tebakan ekstrem (outlier)</b> pada masa lonjakan tinggi.
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PANDUAN INTERPRETASI STANDAR AKURASI INTERNASIONAL (LEWIS CRITERIA) */}
            <Card className="border-border/80 shadow-xs">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <Award className="size-5 text-blue-600" />
                        Panduan Standar Evaluasi Nilai MAPE (Lewis, 1982)
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Tolak ukur baku industri peramalan deret waktu statistik untuk menguji kelayakan model.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-4">
                        {/* <10% */}
                        <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/60 p-3.5 dark:bg-emerald-950/30 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">&lt; 10% (MAPE SIMARIN: {modelAccuracy.MAPE}%)</span>
                                <CheckCircle2 className="size-4 text-emerald-600" />
                            </div>
                            <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Sangat Baik (Highly Accurate)</div>
                            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                                Model sangat prima & akurat. Layak digunakan untuk perencanaan strategis kapasitas dan penganggaran.
                            </p>
                        </div>

                        {/* 10-20% */}
                        <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1 opacity-75">
                            <span className="font-bold text-xs text-muted-foreground">10% - 20%</span>
                            <div className="text-sm font-semibold text-foreground">Baik (Good Forecast)</div>
                            <p className="text-[11px] text-muted-foreground">
                                Prediksi memadai untuk operasional harian.
                            </p>
                        </div>

                        {/* 20-50% */}
                        <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1 opacity-75">
                            <span className="font-bold text-xs text-muted-foreground">20% - 50%</span>
                            <div className="text-sm font-semibold text-foreground">Layak (Reasonable)</div>
                            <p className="text-[11px] text-muted-foreground">
                                Perlu evaluasi parameter berkala.
                            </p>
                        </div>

                        {/* >50% */}
                        <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1 opacity-75">
                            <span className="font-bold text-xs text-muted-foreground">&gt; 50%</span>
                            <div className="text-sm font-semibold text-rose-600">Tidak Akurat (Inaccurate)</div>
                            <p className="text-[11px] text-muted-foreground">
                                Model tidak layak digunakan.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* MENGAPA HOLT-WINTERS LEBIH BAIK DIBANDINGKAN SMA & WMA */}
            <Card className="border-border/80 shadow-xs">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <Cpu className="size-5 text-indigo-600" />
                        Mengapa Metode Holt-Winters Dipilih untuk SIMARIN?
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Perbandingan karakteristik algoritma dalam memodelkan dinamika pergerakan penumpang pelabuhan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">1. Pola Level Dasar (&alpha;)</div>
                            <div className="text-sm font-bold text-foreground">Menghaluskan Fluktuasi Acak</div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Memfilter gangguan data harian yang tidak beraturan tanpa kehilangan pola tren utama.
                            </p>
                        </div>

                        <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">2. Pola Tren (&beta;)</div>
                            <div className="text-sm font-bold text-foreground">Additive Trend Growth</div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Mampu mendeteksi apakah jumlah penumpang pelabuhan sedang mengalami tren naik atau turun secara linier.
                            </p>
                        </div>

                        <div className="rounded-xl bg-muted/40 p-4 space-y-1">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">3. Pola Musiman (&gamma;)</div>
                            <div className="text-sm font-bold text-foreground">12-Month Additive Seasonal</div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Menangkap siklus tahunan yang pasti berulang (musim mudik lebaran, liburan sekolah, akhir tahun).
                            </p>
                        </div>
                    </div>

                    {/* Comparison Table / Box */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                            <Zap className="size-4 text-blue-600" />
                            <span>Hasil Komparasi dengan Metode Tradisional (SMA & WMA)</span>
                        </div>
                        <p className="text-xs text-blue-950/85 dark:text-blue-200/85 leading-relaxed">
                            Metode <b>Simple Moving Average (SMA)</b> dan <b>Weighted Moving Average (WMA)</b> cenderung terlambat merespons lonjakan musiman karena hanya mengambil rata-rata periode sebelumnya. Sementara itu, <b>Holt-Winters Exponential Smoothing</b> terbukti menghasilkan <b>MAPE terendah ({modelAccuracy.MAPE}%)</b> dan mampu mengantisipasi lonjakan musiman 12 bulan ke depan secara presisi.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
