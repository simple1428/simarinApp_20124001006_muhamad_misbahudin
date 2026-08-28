<?php

namespace App\Http\Controllers;

use App\Models\MonthlyPeriod;
use App\Models\MonthlySummary;
use App\Services\HoltWintersService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComparisonController extends Controller
{
    public function index(Request $request, HoltWintersService $hwService): Response
    {
        // 1. Ambil seluruh data rekapitulasi bulanan yang sudah final secara kronologis
        $summaries = MonthlySummary::with('period')
            ->whereHas('period', function ($q) {
                $q->where('status', 'final');
            })
            ->get()
            ->sortBy(function ($item) {
                return ($item->period->tahun * 100) + $item->period->bulan;
            })
            ->values();

        $monthNames = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
            5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Agu',
            9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'
        ];

        $monthNamesFull = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        // 2. Ambil fitted prediction & evaluasi dari Holt-Winters
        $hwResult = $hwService->getFittedAndEvaluation();
        $fittedHwMap = $hwResult['fitted'] ?? [];

        // Parameter window SMA (default: 6 bulan, dapat diganti via query param)
        $smaWindow = (int) $request->input('sma_window', 6);
        if ($smaWindow < 2 || $smaWindow > 12) {
            $smaWindow = 6;
        }

        // 3. Bangun tabel komparasi baris demi baris
        $comparisonRows = [];
        $chartData = [];

        // Metrik akumulasi SMA
        $smaTotalApe = 0;
        $smaTotalAe = 0;
        $smaTotalSe = 0;
        $smaCount = 0;

        // Metrik akumulasi Holt-Winters
        $hwTotalApe = 0;
        $hwTotalAe = 0;
        $hwTotalSe = 0;
        $hwCount = 0;

        $totalRecords = $summaries->count();

        for ($i = 0; $i < $totalRecords; $i++) {
            $item = $summaries[$i];
            $bln = $item->period->bulan;
            $thn = $item->period->tahun;
            $actual = (int) $item->total_penumpang;

            $dateKey = $thn . '-' . str_pad($bln, 2, '0', STR_PAD_LEFT);
            $labelShort = ($monthNames[$bln] ?? $bln) . ' ' . $thn;
            $labelFull = ($monthNamesFull[$bln] ?? $bln) . ' ' . $thn;

            // --- Perhitungan SMA ---
            $smaVal = null;
            $smaDiff = null;
            $smaAbsDiff = null;
            $smaApe = null;

            if ($i >= $smaWindow) {
                $windowItems = $summaries->slice($i - $smaWindow, $smaWindow);
                $smaAvg = $windowItems->avg('total_penumpang');
                $smaVal = (int) round($smaAvg);

                if ($actual > 0) {
                    $smaDiff = $actual - $smaVal;
                    $smaAbsDiff = abs($smaDiff);
                    $smaApe = round(($smaAbsDiff / $actual) * 100, 2);

                    $smaTotalApe += $smaApe;
                    $smaTotalAe += $smaAbsDiff;
                    $smaTotalSe += pow($smaDiff, 2);
                    $smaCount++;
                }
            }

            // --- Perhitungan Holt-Winters ---
            $hwVal = isset($fittedHwMap[$dateKey]) ? (int) round($fittedHwMap[$dateKey]) : null;
            $hwDiff = null;
            $hwAbsDiff = null;
            $hwApe = null;

            if ($hwVal !== null && $actual > 0) {
                $hwDiff = $actual - $hwVal;
                $hwAbsDiff = abs($hwDiff);
                $hwApe = round(($hwAbsDiff / $actual) * 100, 2);

                $hwTotalApe += $hwApe;
                $hwTotalAe += $hwAbsDiff;
                $hwTotalSe += pow($hwDiff, 2);
                $hwCount++;
            }

            // Menentukan metode mana yang lebih unggul pada periode ini
            $winner = null;
            if ($smaApe !== null && $hwApe !== null) {
                if ($hwApe < $smaApe) {
                    $winner = 'HW';
                } elseif ($smaApe < $hwApe) {
                    $winner = 'SMA';
                } else {
                    $winner = 'EQUAL';
                }
            } elseif ($hwApe !== null) {
                $winner = 'HW';
            }

            $comparisonRows[] = [
                'no' => $i + 1,
                'periode_key' => $dateKey,
                'periode_label' => $labelFull,
                'periode_short' => $labelShort,
                'bulan' => $bln,
                'tahun' => $thn,
                'aktual' => $actual,
                'sma_val' => $smaVal,
                'sma_diff' => $smaDiff,
                'sma_abs_diff' => $smaAbsDiff,
                'sma_ape' => $smaApe,
                'hw_val' => $hwVal,
                'hw_diff' => $hwDiff,
                'hw_abs_diff' => $hwAbsDiff,
                'hw_ape' => $hwApe,
                'winner' => $winner,
            ];

            $chartData[] = [
                'periode' => $labelShort,
                'Aktual' => $actual,
                'SMA' => $smaVal,
                'HoltWinters' => $hwVal,
            ];
        }

        // 4. Kalkulasi metrik global perbandingan
        $smaGlobalMape = $smaCount > 0 ? round($smaTotalApe / $smaCount, 2) : 0;
        $smaGlobalMae = $smaCount > 0 ? round($smaTotalAe / $smaCount, 2) : 0;
        $smaGlobalRmse = $smaCount > 0 ? round(sqrt($smaTotalSe / $smaCount), 2) : 0;

        $hwGlobalMape = $hwCount > 0 ? round($hwTotalApe / $hwCount, 2) : ($hwResult['mape'] ?? 0);
        $hwGlobalMae = $hwCount > 0 ? round($hwTotalAe / $hwCount, 2) : ($hwResult['mae'] ?? 0);
        $hwGlobalRmse = $hwCount > 0 ? round(sqrt($hwTotalSe / $hwCount), 2) : ($hwResult['rmse'] ?? 0);

        // Lewis Criteria Evaluator function
        $evalLewis = function ($mape) {
            if ($mape <= 0) return ['category' => 'Belum Dievaluasi', 'badge' => 'gray', 'desc' => '-'];
            if ($mape < 10) return ['category' => 'Sangat Akurat', 'badge' => 'emerald', 'desc' => 'Tingkat akurasi tinggi (< 10%)'];
            if ($mape < 20) return ['category' => 'Baik', 'badge' => 'blue', 'desc' => 'Tingkat akurasi baik (10% - 20%)'];
            if ($mape < 50) return ['category' => 'Cukup / Layak', 'badge' => 'amber', 'desc' => 'Tingkat akurasi cukup (20% - 50%)'];
            return ['category' => 'Kurang Akurat', 'badge' => 'rose', 'desc' => 'Deviasi tinggi (> 50%)'];
        };

        // Kesimpulan Rekomendasi
        $mapeDiff = abs($smaGlobalMape - $hwGlobalMape);
        $overallWinner = ($hwGlobalMape < $smaGlobalMape) ? 'Holt-Winters' : 'Simple Moving Average (SMA)';
        $superiorityPercent = $smaGlobalMape > 0 ? round((($smaGlobalMape - $hwGlobalMape) / $smaGlobalMape) * 100, 1) : 0;

        return Inertia::render('Comparison/index', [
            'comparisonRows' => $comparisonRows,
            'chartData' => $chartData,
            'smaWindow' => $smaWindow,
            'totalDataCount' => $totalRecords,
            'summaryStats' => [
                'sma' => [
                    'name' => "Simple Moving Average (SMA-$smaWindow)",
                    'shortName' => 'SMA',
                    'mape' => $smaGlobalMape,
                    'mae' => $smaGlobalMae,
                    'rmse' => $smaGlobalRmse,
                    'evaluatedPeriods' => $smaCount,
                    'lewis' => $evalLewis($smaGlobalMape),
                ],
                'hw' => [
                    'name' => 'Holt-Winters Triple Exponential Smoothing',
                    'shortName' => 'Holt-Winters',
                    'mape' => $hwGlobalMape,
                    'mae' => $hwGlobalMae,
                    'rmse' => $hwGlobalRmse,
                    'evaluatedPeriods' => $hwCount,
                    'lewis' => $evalLewis($hwGlobalMape),
                ],
                'conclusion' => [
                    'winner' => $overallWinner,
                    'mapeDiff' => $mapeDiff,
                    'superiorityPercent' => $superiorityPercent,
                    'recommendationText' => "Metode {$overallWinner} terbukti memberikan tingkat kesalahan (MAPE) lebih rendah sebesar {$hwGlobalMape}% dibandingkan SMA sebesar {$smaGlobalMape}%, sehingga lebih direkomendasikan untuk digunakan dalam perencanaan operasional armada kapal di SIMARIN.",
                ],
            ],
        ]);
    }
}
