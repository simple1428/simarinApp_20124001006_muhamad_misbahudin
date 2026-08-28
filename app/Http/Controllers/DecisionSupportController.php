<?php

namespace App\Http\Controllers;

use App\Models\HoltWintersForecast;
use App\Models\MonthlyPeriod;
use App\Models\MonthlySummary;
use App\Models\Ship;
use App\Models\ShippingRoute;
use App\Services\HoltWintersService;
use App\Services\SeasonClassificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DecisionSupportController extends Controller
{
    public function index(
        Request $request,
        HoltWintersService $hwService,
        SeasonClassificationService $seasonService
    ): Response {
        // 1. Ambil seluruh data kapal
        $allShips = Ship::orderBy('kapasitas', 'desc')->get();
        $activeShips = $allShips->where('status', 'aktif')->values();
        $inactiveShips = $allShips->where('status', 'nonaktif')->values();

        $activeCapacityPerTrip = $activeShips->sum('kapasitas');
        $avgShipCapacity = $activeShips->count() > 0 ? round($activeCapacityPerTrip / $activeShips->count()) : 350;

        // 2. Ambil data rute pelayaran
        $routes = ShippingRoute::all();

        // 3. Ambil data rata-rata trip bulanan dari data final historis
        $recentSummaries = MonthlySummary::whereHas('period', function ($q) {
            $q->where('status', 'final');
        })->orderByDesc('monthly_period_id')->take(12)->get();

        $avgMonthlyTrips = $recentSummaries->count() > 0
            ? (int) round($recentSummaries->avg('jumlah_trip'))
            : 60; // default 2 trip/hari * 30 hari

        if ($avgMonthlyTrips < 20) $avgMonthlyTrips = 60;

        // 4. Ambil target peramalan bulan berikutnya (Proyeksi Target Keputusan)
        $activePeriod = MonthlyPeriod::where('status', 'open')->first()
            ?? MonthlyPeriod::orderByDesc('tahun')->orderByDesc('bulan')->first();

        $currentMonth = $activePeriod ? $activePeriod->bulan : 9;
        $currentYear = $activePeriod ? $activePeriod->tahun : 2026;

        $nextMonth = $currentMonth == 12 ? 1 : $currentMonth + 1;
        $nextYear = $currentMonth == 12 ? $currentYear + 1 : $currentYear;

        $targetForecast = HoltWintersForecast::where('tahun_prediksi', $nextYear)
            ->where('bulan_prediksi', $nextMonth)
            ->first();

        if (! $targetForecast) {
            $targetForecast = HoltWintersForecast::where('tahun_prediksi', $currentYear)
                ->where('bulan_prediksi', $currentMonth)
                ->first();
        }

        if (! $targetForecast) {
            $hwService->generate();
            $targetForecast = HoltWintersForecast::orderByDesc('tahun_prediksi')->orderByDesc('bulan_prediksi')->first();
        }

        $predictedPassengers = $targetForecast ? (int) round($targetForecast->nilai_forecast) : 15000;
        $targetMonthNumber = $targetForecast ? $targetForecast->bulan_prediksi : $nextMonth;
        $targetYearNumber = $targetForecast ? $targetForecast->tahun_prediksi : $nextYear;

        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        $targetPeriodLabel = ($monthNames[$targetMonthNumber] ?? $targetMonthNumber) . ' ' . $targetYearNumber;

        // 5. Analisis Musiman (Season Classification)
        $seasonInfo = $seasonService->classify($predictedPassengers);

        // 6. Perhitungan Kapasitas & Early Warning
        $totalProjectedCapacity = $avgMonthlyTrips * $avgShipCapacity;
        $projectedOccupancy = $totalProjectedCapacity > 0
            ? round(($predictedPassengers / $totalProjectedCapacity) * 100, 1)
            : 0;

        // Status Level Early Warning:
        // - NORMAL / AMAN (Occupancy < 70%)
        // - SIAGA / WASPADA (Occupancy 70% - 85%)
        // - KRITIS / LONJAKAN TINGGI (Occupancy > 85%)
        $warningLevel = 'NORMAL';
        $warningTitle = 'Kapasitas Operasional Memadai';
        $warningBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        $severityColor = 'emerald';

        if ($projectedOccupancy >= 85 || ($seasonInfo && $seasonInfo['season'] === 'high')) {
            $warningLevel = 'KRITIS';
            $warningTitle = 'Peringatan Dini: Potensi Lonjakan & Defisit Kapasitas!';
            $warningBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse';
            $severityColor = 'rose';
        } elseif ($projectedOccupancy >= 70) {
            $warningLevel = 'SIAGA';
            $warningTitle = 'Status Siaga: Kepadatan Penumpang Meningkat';
            $warningBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            $severityColor = 'amber';
        }

        // 7. Hitung Rekomendasi Solusi Otomatis
        $capacityDeficit = 0;
        $extraTripsNeeded = 0;
        $recommendedActions = [];

        // Kapasitas aman target adalah occupancy 75%
        $safeCapacityTarget = (int) round($predictedPassengers / 0.75);

        if ($totalProjectedCapacity < $safeCapacityTarget) {
            $capacityDeficit = $safeCapacityTarget - $totalProjectedCapacity;
            $extraTripsNeeded = (int) ceil($capacityDeficit / $avgShipCapacity);
        }

        if ($warningLevel === 'KRITIS') {
            $extraTripsPerDay = (int) ceil($extraTripsNeeded / 30);
            $recommendedActions[] = "Lakukan penambahan minimal {$extraTripsNeeded} trip pelayaran per bulan (rata-rata +{$extraTripsPerDay} trip ekstra/hari).";
            $recommendedActions[] = "Siapkan 1 armada cadangan dalam status siaga operasional penuh untuk mengantisipasi penumpukan antrean dermaga.";
            $recommendedActions[] = "Buka loket tiket digital / pra-pemesanan lebih awal untuk meratakan distribusi jam keberangkatan.";
        } elseif ($warningLevel === 'SIAGA') {
            $recommendedActions[] = "Optimasi jadwal keberangkatan pada jam-jam sibuk (pagi & sore) guna mencegah konsentrasi penumpukan penumpang.";
            $recommendedActions[] = "Lakukan inspeksi kelaikan armada kapal (ramp check) sebelum memasuki masa peningkatan volume.";
            $recommendedActions[] = "Monitor data okupansi harian secara intensif melalui modul SIMARIN.";
        } else {
            $recommendedActions[] = "Pertahankan pola operasional dan jadwal keberangkatan reguler saat ini.";
            $recommendedActions[] = "Lakukan perawatan rutin (maintenance) pada armada kapal secara bergilir pada hari-hari sepi.";
        }

        // 8. Rangkuman data untuk tampilan visual
        return Inertia::render('DecisionSupport/index', [
            'targetPeriodLabel' => $targetPeriodLabel,
            'targetMonth' => $targetMonthNumber,
            'targetYear' => $targetYearNumber,
            'predictedPassengers' => $predictedPassengers,
            'avgMonthlyTrips' => $avgMonthlyTrips,
            'avgShipCapacity' => $avgShipCapacity,
            'activeCapacityPerTrip' => $activeCapacityPerTrip,
            'totalProjectedCapacity' => $totalProjectedCapacity,
            'projectedOccupancy' => $projectedOccupancy,
            'warningLevel' => $warningLevel,
            'warningTitle' => $warningTitle,
            'severityColor' => $severityColor,
            'capacityDeficit' => $capacityDeficit,
            'extraTripsNeeded' => $extraTripsNeeded,
            'recommendedActions' => $recommendedActions,
            'seasonInfo' => $seasonInfo,
            'ships' => [
                'all' => $allShips,
                'active' => $activeShips,
                'inactive' => $inactiveShips,
            ],
            'routes' => $routes,
        ]);
    }
}
