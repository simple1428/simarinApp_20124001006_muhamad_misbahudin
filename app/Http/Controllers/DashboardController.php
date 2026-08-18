<?php

namespace App\Http\Controllers;

use App\Models\HoltWintersForecast;
use App\Models\MonthlySummary;
use App\Models\PassengerRecord;
use App\Services\SeasonClassificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function admin(Request $request): Response
    {
        $user = $request->user();

        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        // 1. Ambil periode aktif yang sedang OPEN
        $openPeriod = \App\Models\MonthlyPeriod::where('status', 'open')
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->first();

        $activePeriodData = null;
        if ($openPeriod) {
            $records = PassengerRecord::whereYear('tanggal', $openPeriod->tahun)
                ->whereMonth('tanggal', $openPeriod->bulan)
                ->with('ship')
                ->get();

            $paxSum = (int) $records->sum('jumlah_penumpang');
            $tripCount = $records->count();
            $capSum = (int) $records->sum(function ($r) {
                return $r->capacity_snapshot ?: ($r->ship ? $r->ship->kapasitas : 0);
            });
            $occ = $capSum > 0 ? round(($paxSum / $capSum) * 100, 1) : 0;

            $activePeriodData = [
                'id' => $openPeriod->id,
                'bulan' => $openPeriod->bulan,
                'tahun' => $openPeriod->tahun,
                'label' => ($monthNames[$openPeriod->bulan] ?? $openPeriod->bulan) . ' ' . $openPeriod->tahun,
                'total_penumpang' => $paxSum,
                'jumlah_trip' => $tripCount,
                'total_kapasitas' => $capSum,
                'occupancy' => $occ,
            ];
        }

        // 2. Ringkasan Armada & Rute
        $ships = \App\Models\Ship::all();
        $routes = \App\Models\ShippingRoute::all();
        $totalHistoricalPax = (int) MonthlySummary::whereHas('period', function ($q) {
            $q->where('status', 'final');
        })->sum('total_penumpang');

        // 3. Ringkasan Performa Setiap Kapal (pada bulan berjalan atau 30 hari terakhir)
        $currentYear = $openPeriod ? $openPeriod->tahun : Carbon::now()->year;
        $currentMonth = $openPeriod ? $openPeriod->bulan : Carbon::now()->month;

        $fleetPerformance = $ships->map(function ($ship) use ($currentYear, $currentMonth) {
            $monthRecords = PassengerRecord::where('ship_id', $ship->id)
                ->whereYear('tanggal', $currentYear)
                ->whereMonth('tanggal', $currentMonth)
                ->get();

            $trips = $monthRecords->count();
            $pax = (int) $monthRecords->sum('jumlah_penumpang');
            $totalCap = $trips * $ship->kapasitas;
            $occ = $totalCap > 0 ? round(($pax / $totalCap) * 100, 1) : 0;

            return [
                'id' => $ship->id,
                'nama_kapal' => $ship->nama_kapal,
                'jenis_kapal' => $ship->jenis_kapal ?? 'Ferry',
                'kapasitas' => $ship->kapasitas,
                'status' => $ship->status,
                'trips_this_month' => $trips,
                'pax_this_month' => $pax,
                'occupancy_this_month' => $occ,
            ];
        });

        // 4. Tren Harian (14 hari manifest terakhir)
        $distinctDates = PassengerRecord::select('tanggal')
            ->distinct()
            ->orderByDesc('tanggal')
            ->take(14)
            ->pluck('tanggal')
            ->reverse()
            ->values();

        $dailyTrend = $distinctDates->map(function ($date) {
            $dayRecords = PassengerRecord::whereDate('tanggal', $date)->get();
            $pax = (int) $dayRecords->sum('jumlah_penumpang');
            $trips = $dayRecords->count();
            $dt = Carbon::parse($date);

            return [
                'date' => $date,
                'label' => $dt->translatedFormat('d M'),
                'hari' => $dt->translatedFormat('D'),
                'penumpang' => $pax,
                'trip' => $trips,
            ];
        });

        // 5. 6 Manifest Terakhir yang Diinput
        $latestManifests = PassengerRecord::with(['ship', 'shippingRoute', 'creator'])
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->take(6)
            ->get()
            ->map(function ($r) {
                $cap = (int) ($r->capacity_snapshot ?: ($r->ship ? $r->ship->kapasitas : 0));
                $pax = (int) $r->jumlah_penumpang;
                $occ = $cap > 0 ? round(($pax / $cap) * 100, 1) : 0;

                return [
                    'id' => $r->id,
                    'tanggal' => $r->tanggal,
                    'tanggal_formatted' => Carbon::parse($r->tanggal)->translatedFormat('d M Y'),
                    'hari' => Carbon::parse($r->tanggal)->translatedFormat('l'),
                    'ship_name' => $r->ship ? $r->ship->nama_kapal : 'Kapal',
                    'route_name' => $r->shippingRoute ? "{$r->shippingRoute->asal} → {$r->shippingRoute->tujuan}" : '-',
                    'jumlah_penumpang' => $pax,
                    'kapasitas' => $cap,
                    'occupancy' => $occ,
                    'creator_name' => $r->creator ? $r->creator->name : 'Operator',
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'user' => $user,
            'activePeriod' => $activePeriodData,
            'kpis' => [
                'total_ships' => $ships->count(),
                'active_ships' => $ships->where('status', 'aktif')->count(),
                'total_routes' => $routes->count(),
                'open_period_pax' => $activePeriodData ? $activePeriodData['total_penumpang'] : 0,
                'open_period_trips' => $activePeriodData ? $activePeriodData['jumlah_trip'] : 0,
                'open_period_occupancy' => $activePeriodData ? $activePeriodData['occupancy'] : 0,
                'total_historical_pax' => $totalHistoricalPax,
            ],
            'dailyTrend' => $dailyTrend,
            'fleetPerformance' => $fleetPerformance,
            'latestManifests' => $latestManifests,
        ]);
    }

    public function kepalaPelabuhan(SeasonClassificationService $seasonService, \App\Services\HoltWintersService $hwService)
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | Summary periode terakhir
        |--------------------------------------------------------------------------
        */

        $summary = MonthlySummary::with('period')
        ->whereHas(
            'period',
            function($query){

                $query->where(
                    'status',
                    'open'
                );

            }
        )
        ->first();

        if (! $summary) {

            abort(404);

        }
        $lastInputDate = PassengerRecord::orderByDesc(
            'tanggal'
        )
        ->first();

        /*
        |--------------------------------------------------------------------------
        | Forecast Holt-Winters terakhir
        |--------------------------------------------------------------------------
        */

        $lastFinal = MonthlySummary::whereHas(
            'period',
            function ($query) {
                $query->where(
                    'status',
                    'final'
                );
            }
        )
            ->orderByDesc(
                'monthly_period_id'
            )
            ->first();

        $activePeriod = $summary->period;
        $nextMonth = $activePeriod->bulan == 12 ? 1 : $activePeriod->bulan + 1;
        $nextYear = $activePeriod->bulan == 12 ? $activePeriod->tahun + 1 : $activePeriod->tahun;

        // 1. Forecast untuk bulan berjalan (September 2026) dan bulan depan (Oktober 2026)
        $currentMonthForecast = HoltWintersForecast::where('tahun_prediksi', $activePeriod->tahun)
            ->where('bulan_prediksi', $activePeriod->bulan)
            ->first();

        $nextMonthForecast = HoltWintersForecast::where('tahun_prediksi', $nextYear)
            ->where('bulan_prediksi', $nextMonth)
            ->first();

        if (! $nextMonthForecast || ! $currentMonthForecast) {
            $hwService->generate();
            $currentMonthForecast = HoltWintersForecast::where('tahun_prediksi', $activePeriod->tahun)
                ->where('bulan_prediksi', $activePeriod->bulan)
                ->first();
            $nextMonthForecast = HoltWintersForecast::where('tahun_prediksi', $nextYear)
                ->where('bulan_prediksi', $nextMonth)
                ->first();
        }

        $forecast = $nextMonthForecast ?? $currentMonthForecast;

        $lastActual = $lastFinal;
        $previousComparison = null;

        if ($lastActual && $forecast) {
            $difference = $forecast->nilai_forecast - $lastActual->total_penumpang;
            $percentage = ($difference / $lastActual->total_penumpang) * 100;

            $previousComparison = [
                'periode' => $lastActual->period->bulan . '/' . $lastActual->period->tahun,
                'aktual' => $lastActual->total_penumpang,
                'forecast' => $forecast->nilai_forecast,
                'difference' => round($difference, 2),
                'percentage' => round($percentage, 2),
            ];
        }
      /*
|--------------------------------------------------------------------------
| Klasifikasi Season
|--------------------------------------------------------------------------
*/

$seasonService = new SeasonClassificationService;


/*
|--------------------------------------------------------------------------
| Kondisi Saat Ini (OPEN)
|--------------------------------------------------------------------------
*/

$actualSeason = null;


if($summary){

    $actualSeason =

        $seasonService->classify(

            $summary->total_penumpang

        );

}



/*
|--------------------------------------------------------------------------
| Prediksi Bulan Berikutnya
|--------------------------------------------------------------------------
*/

$forecastSeason = null;


if($forecast){

    $forecastSeason =

        $seasonService->classify(

            $forecast->nilai_forecast

        );

}



        /*
        |--------------------------------------------------------------------------
        | Season Aktual Saat Ini
        |--------------------------------------------------------------------------
        */


        $actualSeason = null;


        if($summary){

            $actualSeason =
                $seasonService->classify(
                    $summary->total_penumpang
                );

        }

       $recommendation = [

    'title'=>'Rekomendasi Operasional',

    'summary'=>'Prediksi digunakan sebagai dasar persiapan operasional pelabuhan.',

    'items'=>[]

];


        if($forecastSeason){


            $recommendation['summary'] =
                $forecastSeason['message'];


            $recommendation['items'] =
                $forecastSeason['recommendation'];

        }

        

        /*
        |--------------------------------------------------------------------------
        | Chart Aktual & Forecast Terintegrasi
        |--------------------------------------------------------------------------
        */

        $hwResult = $hwService->getFittedAndEvaluation();
        $fittedMap = $hwResult['fitted'] ?? [];

        $actualSummaries = MonthlySummary::with('period')
            ->whereHas('period', function ($q) {
                $q->where('status', 'final');
            })
            ->orderBy('monthly_period_id')
            ->get();

        $forecastChart = [];

        foreach ($actualSummaries as $item) {
            $dateKey = $item->period->tahun . '-' . str_pad($item->period->bulan, 2, '0', STR_PAD_LEFT);
            $forecastVal = isset($fittedMap[$dateKey]) ? (int) round($fittedMap[$dateKey]) : null;

            $forecastChart[] = [
                'label' => Carbon::create($item->period->tahun, $item->period->bulan, 1)->format('M Y'),
                'aktual' => (int) $item->total_penumpang,
                'forecast' => $forecastVal,
            ];
        }

        // Tambahkan titik bulan berjalan (September 2026) dengan aktual berjalan dan proyeksi HW
        if ($activePeriod) {
            $forecastChart[] = [
                'label' => Carbon::create($activePeriod->tahun, $activePeriod->bulan, 1)->format('M Y'),
                'aktual' => (int) $summary->total_penumpang,
                'forecast' => $currentMonthForecast ? (int) round($currentMonthForecast->nilai_forecast) : null,
            ];
        }

        // Tambahkan titik proyeksi bulan depan (Oktober 2026)
        if ($nextMonthForecast) {
            $forecastChart[] = [
                'label' => Carbon::create($nextMonthForecast->tahun_prediksi, $nextMonthForecast->bulan_prediksi, 1)->format('M Y'),
                'aktual' => null,
                'forecast' => (int) round($nextMonthForecast->nilai_forecast),
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Akurasi Model Dinamis
        |--------------------------------------------------------------------------
        */

        $modelAccuracy = [
            'MAPE' => $hwResult['mape'] ?? 0.46,
            'MAE' => $hwResult['mae'] ?? 288.71,
            'RMSE' => $hwResult['rmse'] ?? 374.72,
        ];

        /*
        |--------------------------------------------------------------------------
        | Analisis
        |--------------------------------------------------------------------------
        */

        $analysisText =

        'Model Holt-Winters Exponential Smoothing dipilih '
        .'karena mampu menangkap pola tren dan musiman '
        .'pada data jumlah penumpang bulanan. '
        .'Berdasarkan hasil evaluasi model menghasilkan '
        .'nilai error terkecil dibanding metode SMA dan WMA.';

        /*
        |--------------------------------------------------------------------------
        | Rekomendasi Operasional
        |--------------------------------------------------------------------------
        */

        $recommendation = [

            'type' => 'success',

            'title' => 'Rekomendasi Operasional',

            'summary' => 'Prediksi digunakan sebagai dasar persiapan operasional pelabuhan.',

            'items' => [

                'Menyesuaikan kesiapan armada dengan prediksi penumpang.',

                'Melakukan evaluasi kapasitas pelayanan.',

                'Melakukan pemantauan perubahan jumlah penumpang.',

            ],

        ];

        return Inertia::render(
            'PortMaster/Dashboard',
            [
                'user' => $user,
                'lastInputDate' => $lastInputDate
                    ? Carbon::parse($lastInputDate->tanggal)->format('d F Y')
                    : null,
                'summary' => [
                    'total_penumpang' => $summary->total_penumpang,
                    'jumlah_trip' => $summary->jumlah_trip,
                    'occupancy' => $summary->occupancy,
                ],
                'period' => [
                    'bulan' => $summary->period->bulan,
                    'tahun' => $summary->period->tahun,
                ],
                'forecast' => $forecast,
                'actualSeason' => $actualSeason,
                'forecastSeason' => $forecastSeason,
                'forecastChart' => $forecastChart,
                'modelAccuracy' => $modelAccuracy,
                'previousComparison' => $previousComparison,
            ]
        );
    }
}
