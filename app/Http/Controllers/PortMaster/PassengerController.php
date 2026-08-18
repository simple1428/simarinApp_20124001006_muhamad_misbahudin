<?php

namespace App\Http\Controllers\PortMaster;

use App\Http\Controllers\Controller;
use App\Models\MonthlyPeriod;
use App\Models\PassengerRecord;
use App\Models\Ship;
use App\Models\ShippingRoute;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PassengerController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // 1. Parameter Filter
        $shipId = $request->input('ship_id');
        $routeId = $request->input('route_id');
        $year = $request->input('year');
        $month = $request->input('month');
        $search = $request->input('search');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // 2. Query dasar manifest
        $query = PassengerRecord::with(['ship', 'shippingRoute']);

        if ($shipId && $shipId !== 'all') {
            $query->where('ship_id', $shipId);
        }

        if ($routeId && $routeId !== 'all') {
            $query->where('shipping_route_id', $routeId);
        }

        if ($year && $year !== 'all') {
            $query->whereYear('tanggal', (int) $year);
        }

        if ($month && $month !== 'all') {
            $query->whereMonth('tanggal', (int) $month);
        }

        if ($startDate && $endDate) {
            $query->whereBetween('tanggal', [$startDate, $endDate]);
        } elseif ($startDate) {
            $query->where('tanggal', '>=', $startDate);
        } elseif ($endDate) {
            $query->where('tanggal', '<=', $endDate);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('ship', function ($sq) use ($search) {
                    $sq->where('nama_kapal', 'like', "%{$search}%");
                })->orWhereHas('shippingRoute', function ($rq) use ($search) {
                    $rq->where('asal', 'like', "%{$search}%")
                        ->orWhere('tujuan', 'like', "%{$search}%");
                })->orWhere('tanggal', 'like', "%{$search}%");
            });
        }

        // 3. Summary metrics dari query filter yang sama
        $summaryQuery = clone $query;
        $allFiltered = $summaryQuery->get();

        $totalTrips = $allFiltered->count();
        $totalPax = (int) $allFiltered->sum('jumlah_penumpang');
        $totalCap = (int) $allFiltered->sum(function ($r) {
            return $r->capacity_snapshot ?: ($r->ship ? $r->ship->kapasitas : 0);
        });

        $avgOccupancy = $totalCap > 0 ? round(($totalPax / $totalCap) * 100, 1) : 0;
        $highLoadTrips = $allFiltered->filter(function ($r) {
            $cap = $r->capacity_snapshot ?: ($r->ship ? $r->ship->kapasitas : 0);
            return $cap > 0 && (($r->jumlah_penumpang / $cap) >= 0.90);
        })->count();

        // 4. Perbandingan per Rute
        $routeBreakdown = [];
        $routes = ShippingRoute::all();
        foreach ($routes as $rt) {
            $rtRecords = $allFiltered->where('shipping_route_id', $rt->id);
            $rtPax = (int) $rtRecords->sum('jumlah_penumpang');
            $rtTrips = $rtRecords->count();
            $rtCap = (int) $rtRecords->sum(function ($r) use ($rt) {
                return $r->capacity_snapshot ?: ($r->ship ? $r->ship->kapasitas : 0);
            });
            $rtOcc = $rtCap > 0 ? round(($rtPax / $rtCap) * 100, 1) : 0;

            $routeBreakdown[] = [
                'id' => $rt->id,
                'rute' => $rt->asal . ' → ' . $rt->tujuan,
                'asal' => $rt->asal,
                'tujuan' => $rt->tujuan,
                'total_trip' => $rtTrips,
                'total_penumpang' => $rtPax,
                'occupancy' => $rtOcc,
            ];
        }

        // 5. Data manifest terpaginasi
        $manifests = $query->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(function ($record) {
                $cap = (int) ($record->capacity_snapshot ?: ($record->ship ? $record->ship->kapasitas : 0));
                $pax = (int) $record->jumlah_penumpang;
                $occ = $cap > 0 ? round(($pax / $cap) * 100, 1) : 0;

                $loadStatus = 'normal';
                $loadLabel = 'Normal';
                if ($occ >= 90) {
                    $loadStatus = 'high';
                    $loadLabel = 'Penuh (Padat)';
                } elseif ($occ < 60) {
                    $loadStatus = 'low';
                    $loadLabel = 'Longgar';
                }

                return [
                    'id' => $record->id,
                    'tanggal' => $record->tanggal,
                    'tanggal_formatted' => Carbon::parse($record->tanggal)->translatedFormat('d M Y'),
                    'hari' => Carbon::parse($record->tanggal)->translatedFormat('l'),
                    'ship_name' => $record->ship ? $record->ship->nama_kapal : 'Kapal Tidak Dikenal',
                    'ship_type' => $record->ship ? ($record->ship->jenis_kapal ?? 'Kapal Cepat') : '-',
                    'route_name' => $record->shippingRoute ? ($record->shippingRoute->asal . ' → ' . $record->shippingRoute->tujuan) : '-',
                    'asal' => $record->shippingRoute?->asal ?? '-',
                    'tujuan' => $record->shippingRoute?->tujuan ?? '-',
                    'jumlah_penumpang' => $pax,
                    'kapasitas' => $cap,
                    'sisa_kursi' => max(0, $cap - $pax),
                    'occupancy' => $occ,
                    'load_status' => $loadStatus,
                    'load_label' => $loadLabel,
                ];
            });

        // 6. Master data untuk filter
        $ships = Ship::orderBy('nama_kapal')->get(['id', 'nama_kapal', 'kapasitas', 'status']);
        $availableYears = MonthlyPeriod::select('tahun')->distinct()->orderByDesc('tahun')->pluck('tahun')->toArray();

        return Inertia::render('PortMaster/Passengers', [
            'user' => $user,
            'filters' => [
                'ship_id' => $shipId ?? 'all',
                'route_id' => $routeId ?? 'all',
                'year' => $year ?? 'all',
                'month' => $month ?? 'all',
                'search' => $search ?? '',
                'start_date' => $startDate ?? '',
                'end_date' => $endDate ?? '',
            ],
            'summary' => [
                'total_trips' => $totalTrips,
                'total_passengers' => $totalPax,
                'total_capacity' => $totalCap,
                'avg_occupancy' => $avgOccupancy,
                'high_load_trips' => $highLoadTrips,
            ],
            'routeBreakdown' => $routeBreakdown,
            'manifests' => $manifests,
            'ships' => $ships,
            'routes' => $routes,
            'availableYears' => $availableYears,
        ]);
    }
}
