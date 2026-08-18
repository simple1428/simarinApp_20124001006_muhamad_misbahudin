<?php

namespace App\Http\Controllers\PortMaster;

use App\Http\Controllers\Controller;
use App\Models\MonthlyPeriod;
use App\Models\MonthlySummary;
use App\Models\PassengerRecord;
use App\Models\Ship;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OccupancyController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $selectedYear = $request->input('year', 'all');

        // 1. Ambil daftar tahun yang tersedia
        $availableYears = MonthlyPeriod::select('tahun')
            ->distinct()
            ->orderByDesc('tahun')
            ->pluck('tahun')
            ->toArray();

        // 2. Ambil data armada kapal
        $ships = Ship::all();

        // 3. Query passenger records berdasarkan filter tahun
        $recordsQuery = PassengerRecord::with('ship');
        if ($selectedYear !== 'all') {
            $recordsQuery->whereYear('tanggal', (int) $selectedYear);
        }
        $allRecords = $recordsQuery->get();

        // 4. Hitung metrik per kapal
        $shipStats = $ships->map(function ($ship) use ($allRecords) {
            $shipRecords = $allRecords->where('ship_id', $ship->id);
            $totalPax = (int) $shipRecords->sum('jumlah_penumpang');
            $totalTrips = $shipRecords->count();
            
            // Total kapasitas yang tersedia = kapasitas * trip
            $totalCapacity = $shipRecords->sum('capacity_snapshot') ?: ($ship->kapasitas * $totalTrips);
            $occupancy = $totalCapacity > 0 ? round(($totalPax / $totalCapacity) * 100, 1) : 0;
            $avgPaxPerTrip = $totalTrips > 0 ? (int) round($totalPax / $totalTrips) : 0;
            $emptySeats = max(0, $totalCapacity - $totalPax);

            $statusClass = 'optimal';
            $statusLabel = 'Optimal';
            if ($occupancy >= 80) {
                $statusClass = 'high';
                $statusLabel = 'Sangat Tinggi (Padat)';
            } elseif ($occupancy < 65) {
                $statusClass = 'low';
                $statusLabel = 'Rendah (Longgar)';
            }

            return [
                'id' => $ship->id,
                'nama_kapal' => $ship->nama_kapal,
                'jenis_kapal' => $ship->jenis_kapal ?? 'Kapal Cepat Penumpang',
                'kapasitas_per_trip' => (int) $ship->kapasitas,
                'status_armada' => $ship->status ?? 'aktif',
                'total_trip' => $totalTrips,
                'total_penumpang' => $totalPax,
                'total_kapasitas' => $totalCapacity,
                'kursi_kosong' => $emptySeats,
                'avg_per_trip' => $avgPaxPerTrip,
                'occupancy' => $occupancy,
                'status_class' => $statusClass,
                'status_label' => $statusLabel,
            ];
        });

        // 5. Hitung metrik global agregat
        $globalTotalPax = $shipStats->sum('total_penumpang');
        $globalTotalCapacity = $shipStats->sum('total_kapasitas');
        $globalTotalTrips = $shipStats->sum('total_trip');
        $globalOccupancy = $globalTotalCapacity > 0 
            ? round(($globalTotalPax / $globalTotalCapacity) * 100, 1) 
            : 0;
        $globalEmptySeats = max(0, $globalTotalCapacity - $globalTotalPax);

        // 6. Tren okupansi bulanan
        $summariesQuery = MonthlySummary::with('period')
            ->whereHas('period', function ($q) {
                $q->where('status', 'final');
            });

        if ($selectedYear !== 'all') {
            $summariesQuery->whereHas('period', function ($q) use ($selectedYear) {
                $q->where('tahun', (int) $selectedYear);
            });
        }

        $monthlySummaries = $summariesQuery->get()
            ->sortBy(function ($item) {
                return ($item->period->tahun * 100) + $item->period->bulan;
            })
            ->values();

        $monthNames = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
            5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Agu',
            9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
        ];

        $occupancyChart = $monthlySummaries->map(function ($item) use ($monthNames) {
            $bln = $item->period->bulan;
            $thn = $item->period->tahun;
            return [
                'label' => ($monthNames[$bln] ?? $bln) . ' ' . substr((string)$thn, 2),
                'labelFull' => ($monthNames[$bln] ?? $bln) . ' ' . $thn,
                'occupancy' => round($item->occupancy, 1),
                'total_penumpang' => (int) $item->total_penumpang,
                'jumlah_trip' => (int) $item->jumlah_trip,
            ];
        });

        return Inertia::render('PortMaster/Occupancy', [
            'user' => $user,
            'selectedYear' => $selectedYear,
            'availableYears' => $availableYears,
            'shipStats' => $shipStats,
            'globalSummary' => [
                'occupancy' => $globalOccupancy,
                'total_penumpang' => $globalTotalPax,
                'total_kapasitas' => $globalTotalCapacity,
                'total_trip' => $globalTotalTrips,
                'kursi_kosong' => $globalEmptySeats,
                'active_ships_count' => $ships->where('status', 'aktif')->count(),
            ],
            'occupancyChart' => $occupancyChart,
        ]);
    }
}
