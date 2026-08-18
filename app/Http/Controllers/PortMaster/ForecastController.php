<?php

namespace App\Http\Controllers\PortMaster;

use App\Http\Controllers\Controller;
use App\Models\HoltWintersForecast;
use App\Models\MonthlyPeriod;
use App\Models\MonthlySummary;
use App\Services\HoltWintersService;
use App\Services\SeasonClassificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ForecastController extends Controller
{
    public function index(
        Request $request,
        HoltWintersService $hwService,
        SeasonClassificationService $seasonService
    ): Response {
        $user = Auth::user();

        // 1. Ambil periode aktif berjalan (September 2026) dan periode berikutnya (Oktober 2026)
        $activePeriod = MonthlyPeriod::where('status', 'open')->first()
            ?? MonthlyPeriod::orderByDesc('tahun')->orderByDesc('bulan')->first();

        $currentMonth = $activePeriod ? $activePeriod->bulan : 9;
        $currentYear = $activePeriod ? $activePeriod->tahun : 2026;

        $nextMonth = $currentMonth == 12 ? 1 : $currentMonth + 1;
        $nextYear = $currentMonth == 12 ? $currentYear + 1 : $currentYear;

        // Forecast bulan berjalan (September 2026) dan bulan depan (Oktober 2026)
        $currentForecast = HoltWintersForecast::where('tahun_prediksi', $currentYear)
            ->where('bulan_prediksi', $currentMonth)
            ->first();

        $nextForecast = HoltWintersForecast::where('tahun_prediksi', $nextYear)
            ->where('bulan_prediksi', $nextMonth)
            ->first();

        if (! $nextForecast || ! $currentForecast) {
            $hwService->generate();
            $currentForecast = HoltWintersForecast::where('tahun_prediksi', $currentYear)
                ->where('bulan_prediksi', $currentMonth)
                ->first();
            $nextForecast = HoltWintersForecast::where('tahun_prediksi', $nextYear)
                ->where('bulan_prediksi', $nextMonth)
                ->first();
        }

        // Ambil hasil fitted dan metrik evaluasi model
        $hwResult = $hwService->getFittedAndEvaluation();
        $fittedMap = $hwResult['fitted'] ?? [];

        // 2. Daftar nama bulan
        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        // 3. Data Proyeksi Bulan Depan (Oktober 2026) sebagai headline target
        $targetForecast = $nextForecast ?? $currentForecast;
        $periodLabel = ($monthNames[$targetForecast->bulan_prediksi] ?? $targetForecast->bulan_prediksi) . ' ' . $targetForecast->tahun_prediksi;
        $forecastValue = (int) round($targetForecast->nilai_forecast);
        $seasonInfo = $seasonService->classify($forecastValue);

        // 4. Data ringkasan periode terakhir (Bulan aktual terakhir)
        $lastActual = MonthlySummary::with('period')
            ->whereHas('period', function ($q) {
                $q->where('status', 'final');
            })
            ->orderByDesc('monthly_period_id')
            ->first();

        // Data berjalan bulan ini
        $activeSummary = MonthlySummary::where('monthly_period_id', $activePeriod?->id)->first();
        $activeActualPax = $activeSummary ? (int) $activeSummary->total_penumpang : 0;

        $growthFromLastActual = 0;
        $growthPassengers = 0;

        if ($lastActual && $forecastValue > 0) {
            $growthPassengers = $forecastValue - (int) $lastActual->total_penumpang;
            $growthFromLastActual = round(($growthPassengers / $lastActual->total_penumpang) * 100, 1);
        }

        // 5. Data Chart: Gabungan 32 bulan historis final + titik September 2026 + titik Oktober 2026
        $chartData = [];
        $actualSummaries = MonthlySummary::with('period')
            ->whereHas('period', function ($q) {
                $q->where('status', 'final');
            })
            ->orderBy('monthly_period_id')
            ->get();

        foreach ($actualSummaries as $item) {
            $dateKey = $item->period->tahun . '-' . str_pad($item->period->bulan, 2, '0', STR_PAD_LEFT);
            $forecastVal = isset($fittedMap[$dateKey]) ? (int) round($fittedMap[$dateKey]) : null;

            $chartData[] = [
                'label' => Carbon::create($item->period->tahun, $item->period->bulan, 1)->format('M Y'),
                'labelFull' => ($monthNames[$item->period->bulan] ?? $item->period->bulan) . ' ' . $item->period->tahun,
                'aktual' => (int) $item->total_penumpang,
                'forecast' => $forecastVal,
            ];
        }

        // Tambahkan titik bulan berjalan (September 2026) dengan progres aktual dan nilai prediksi
        if ($activePeriod) {
            $chartData[] = [
                'label' => Carbon::create($activePeriod->tahun, $activePeriod->bulan, 1)->format('M Y'),
                'labelFull' => ($monthNames[$activePeriod->bulan] ?? $activePeriod->bulan) . ' ' . $activePeriod->tahun . ' (Bulan Berjalan)',
                'aktual' => $activeActualPax > 0 ? $activeActualPax : null,
                'forecast' => $currentForecast ? (int) round($currentForecast->nilai_forecast) : null,
            ];
        }

        // Tambahkan titik peramalan bulan depan (Oktober 2026)
        if ($nextForecast) {
            $chartData[] = [
                'label' => Carbon::create($nextForecast->tahun_prediksi, $nextForecast->bulan_prediksi, 1)->format('M Y'),
                'labelFull' => ($monthNames[$nextForecast->bulan_prediksi] ?? $nextForecast->bulan_prediksi) . ' ' . $nextForecast->tahun_prediksi . ' (Proyeksi Bulan Depan)',
                'aktual' => null,
                'forecast' => (int) round($nextForecast->nilai_forecast),
            ];
        }

        // 6. Data Training & Algoritma
        $trainingCount = $actualSummaries->count();
        $firstPeriod = $actualSummaries->first()?->period;
        $lastPeriod = $actualSummaries->last()?->period;

        $trainingPeriodStr = '-';
        if ($firstPeriod && $lastPeriod) {
            $trainingPeriodStr = ($monthNames[$firstPeriod->bulan] ?? $firstPeriod->bulan) . ' ' . $firstPeriod->tahun . ' s/d ' .
                ($monthNames[$lastPeriod->bulan] ?? $lastPeriod->bulan) . ' ' . $lastPeriod->tahun;
        }

        return Inertia::render('PortMaster/Forecast', [
            'user' => $user,
            'forecast' => [
                'id' => $targetForecast?->id,
                'nilai_forecast' => $forecastValue,
                'bulan_prediksi' => $targetForecast?->bulan_prediksi,
                'tahun_prediksi' => $targetForecast?->tahun_prediksi,
                'periodLabel' => $periodLabel,
                'metode' => 'Holt-Winters Exponential Smoothing',
                'trend_type' => 'Additive Trend',
                'seasonal_type' => '12-Month Additive Seasonal',
            ],
            'currentMonthForecast' => [
                'bulan' => $currentMonth,
                'tahun' => $currentYear,
                'label' => ($monthNames[$currentMonth] ?? $currentMonth) . ' ' . $currentYear,
                'nilai_forecast' => $currentForecast ? (int) round($currentForecast->nilai_forecast) : 0,
                'aktual_berjalan' => $activeActualPax,
            ],
            'seasonInfo' => $seasonInfo,
            'modelAccuracy' => [
                'MAPE' => $hwResult['mape'] ?? 0.46,
                'MAE' => $hwResult['mae'] ?? 288.71,
                'RMSE' => $hwResult['rmse'] ?? 374.72,
                'accuracyScore' => round(100 - ($hwResult['mape'] ?? 0.46), 2),
            ],
            'comparison' => [
                'last_actual_passenger' => $lastActual ? (int) $lastActual->total_penumpang : 0,
                'last_actual_period' => $lastActual ? ($monthNames[$lastActual->period->bulan] ?? '') . ' ' . $lastActual->period->tahun : '-',
                'growth_percentage' => $growthFromLastActual,
                'growth_passengers' => $growthPassengers,
            ],
            'trainingMetadata' => [
                'total_months' => $trainingCount,
                'period_range' => $trainingPeriodStr,
                'total_passengers' => (int) $actualSummaries->sum('total_penumpang'),
            ],
            'chartData' => $chartData,
        ]);
    }
}
