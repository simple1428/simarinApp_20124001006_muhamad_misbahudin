<?php

namespace App\Http\Controllers\PortMaster;

use App\Http\Controllers\Controller;
use App\Models\MonthlyPeriod;
use App\Models\MonthlySummary;
use App\Services\HoltWintersService;
use App\Services\SeasonClassificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request, SeasonClassificationService $seasonService, HoltWintersService $hwService): Response
    {
        $user = Auth::user();
        $selectedYear = (int) $request->input('year', date('Y'));

        // Get available years for filtering
        $availableYears = MonthlyPeriod::select('tahun')
            ->distinct()
            ->orderByDesc('tahun')
            ->pluck('tahun')
            ->toArray();

        if (empty($availableYears)) {
            $availableYears = [(int) date('Y')];
        }

        if (!in_array($selectedYear, $availableYears)) {
            $selectedYear = $availableYears[0];
        }

        // Get summaries for the selected year
        $summaries = MonthlySummary::with('period')
            ->whereHas('period', function ($q) use ($selectedYear) {
                $q->where('tahun', $selectedYear);
            })
            ->get()
            ->sortBy(function ($item) {
                return $item->period->bulan;
            })
            ->values();

        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        // Get in-sample fitted predictions from Holt-Winters model
        $hwResult = $hwService->getFittedAndEvaluation();
        $fittedMap = $hwResult['fitted'] ?? [];

        // Get saved/future forecasts from database
        $forecastDbMap = \App\Models\HoltWintersForecast::all()
            ->keyBy(function ($f) {
                return $f->tahun_prediksi . '-' . str_pad($f->bulan_prediksi, 2, '0', STR_PAD_LEFT);
            });

        // Format data rows with season classification & forecast comparison
        $reportData = $summaries->map(function ($item) use ($monthNames, $seasonService, $fittedMap, $forecastDbMap) {
            $dateKey = $item->period->tahun . '-' . str_pad($item->period->bulan, 2, '0', STR_PAD_LEFT);
            $forecastVal = isset($fittedMap[$dateKey]) 
                ? (int) round($fittedMap[$dateKey]) 
                : ($forecastDbMap->has($dateKey) ? (int) round($forecastDbMap->get($dateKey)->nilai_forecast) : null);

            // Untuk bulan final gunakan aktual, untuk bulan berjalan (open) gunakan target proyeksi bulanan
            $evalPax = ($item->period->status === 'final') ? $item->total_penumpang : ($forecastVal ?? $item->total_penumpang);
            $seasonResult = $seasonService->classify($evalPax);

            $diff = $forecastVal !== null ? ($item->total_penumpang - $forecastVal) : null;
            $diffPct = ($forecastVal !== null && $forecastVal > 0) 
                ? round((($item->total_penumpang - $forecastVal) / $forecastVal) * 100, 1) 
                : null;

            return [
                'id' => $item->id,
                'bulan_angka' => $item->period->bulan,
                'bulan_nama' => $monthNames[$item->period->bulan] ?? 'Bulan ' . $item->period->bulan,
                'tahun' => $item->period->tahun,
                'status' => $item->period->status,
                'total_penumpang' => (int) $item->total_penumpang,
                'jumlah_trip' => (int) $item->jumlah_trip,
                'avg_per_trip' => $item->jumlah_trip > 0 ? (int) round($item->total_penumpang / $item->jumlah_trip) : 0,
                'occupancy' => round($item->occupancy, 1),
                'season' => $seasonResult['season'] ?? 'normal',
                'season_label' => $seasonResult['label'] ?? 'Normal Season',
                'forecast' => $forecastVal,
                'variance' => $diff,
                'variance_pct' => $diffPct,
            ];
        });

        // Calculate aggregated KPI statistics
        $totalPenumpangYear = $reportData->sum('total_penumpang');
        $totalTripYear = $reportData->sum('jumlah_trip');
        $avgOccupancyYear = $reportData->count() > 0 ? round($reportData->avg('occupancy'), 1) : 0;
        
        $peakMonth = $reportData->sortByDesc('total_penumpang')->first();
        $lowestMonth = $reportData->sortBy('total_penumpang')->first();

        return Inertia::render('PortMaster/Reports', [
            'user' => $user,
            'selectedYear' => $selectedYear,
            'availableYears' => $availableYears,
            'reportData' => $reportData,
            'annualSummary' => [
                'total_penumpang' => $totalPenumpangYear,
                'total_trip' => $totalTripYear,
                'avg_occupancy' => $avgOccupancyYear,
                'peak_month' => $peakMonth ? $peakMonth['bulan_nama'] : '-',
                'peak_passenger' => $peakMonth ? $peakMonth['total_penumpang'] : 0,
                'lowest_month' => $lowestMonth ? $lowestMonth['bulan_nama'] : '-',
                'lowest_passenger' => $lowestMonth ? $lowestMonth['total_penumpang'] : 0,
            ],
            'generatedAt' => date('d F Y H:i:s'),
        ]);
    }
}
