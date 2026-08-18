<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePassengerRecordRequest;
use App\Http\Requests\UpdatePassengerRecordRequest;
use App\Models\MonthlyPeriod;
use App\Models\PassengerRecord;
use App\Models\Ship;
use App\Models\ShippingRoute;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PassengerRecordController extends Controller
{
    public function index(Request $request): Response
    {
        $shipId = $request->input('ship_id');
        $routeId = $request->input('route_id');
        $date = $request->input('date');
        $search = $request->input('search');

        $query = PassengerRecord::with(['ship', 'shippingRoute', 'creator']);

        if ($shipId && $shipId !== 'all') {
            $query->where('ship_id', $shipId);
        }

        if ($routeId && $routeId !== 'all') {
            $query->where('shipping_route_id', $routeId);
        }

        if ($date) {
            $query->whereDate('tanggal', $date);
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

        // Summary stats
        $summaryQuery = clone $query;
        $allFiltered = $summaryQuery->get();
        $totalManifests = $allFiltered->count();
        $totalPassengers = (int) $allFiltered->sum('jumlah_penumpang');
        $totalCapacity = (int) $allFiltered->sum(function ($r) {
            return $r->capacity_snapshot ?: ($r->ship ? $r->ship->kapasitas : 0);
        });
        $avgOccupancy = $totalCapacity > 0 ? round(($totalPassengers / $totalCapacity) * 100, 1) : 0;

        // Map status periode (open vs final)
        $periods = MonthlyPeriod::all()->keyBy(function ($p) {
            return "{$p->tahun}-{$p->bulan}";
        });

        $manifests = $query->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(function ($record) use ($periods) {
                $dt = Carbon::parse($record->tanggal);
                $periodKey = "{$dt->year}-{$dt->month}";
                $period = $periods->get($periodKey);
                // Jika tidak ada data periode atau statusnya 'final', maka locked
                $isLocked = $period ? ($period->status === 'final') : false;

                $cap = (int) ($record->capacity_snapshot ?: ($record->ship ? $record->ship->kapasitas : 0));
                $pax = (int) $record->jumlah_penumpang;
                $occ = $cap > 0 ? round(($pax / $cap) * 100, 1) : 0;

                return [
                    'id' => $record->id,
                    'ship_id' => $record->ship_id,
                    'shipping_route_id' => $record->shipping_route_id,
                    'tanggal' => $record->tanggal,
                    'tanggal_formatted' => $dt->translatedFormat('d M Y'),
                    'hari' => $dt->translatedFormat('l'),
                    'ship_name' => $record->ship ? $record->ship->nama_kapal : 'Kapal Tidak Dikenal',
                    'ship_type' => $record->ship ? ($record->ship->jenis_kapal ?? 'Ferry') : '-',
                    'route_name' => $record->shippingRoute ? ($record->shippingRoute->asal . ' → ' . $record->shippingRoute->tujuan) : '-',
                    'asal' => $record->shippingRoute?->asal ?? '-',
                    'tujuan' => $record->shippingRoute?->tujuan ?? '-',
                    'jumlah_penumpang' => $pax,
                    'kapasitas' => $cap,
                    'sisa_kursi' => max(0, $cap - $pax),
                    'occupancy' => $occ,
                    'is_locked' => $isLocked,
                    'creator_name' => $record->creator ? $record->creator->name : 'Sistem',
                ];
            });

        $ships = Ship::orderBy('nama_kapal')->get(['id', 'nama_kapal', 'kapasitas', 'status']);
        $routes = ShippingRoute::all(['id', 'asal', 'tujuan', 'status']);

        return Inertia::render('Admin/PassengerRecords/Index', [
            'manifests' => $manifests,
            'filters' => [
                'ship_id' => $shipId ?? 'all',
                'route_id' => $routeId ?? 'all',
                'date' => $date ?? '',
                'search' => $search ?? '',
            ],
            'summary' => [
                'total_manifests' => $totalManifests,
                'total_passengers' => $totalPassengers,
                'total_capacity' => $totalCapacity,
                'avg_occupancy' => $avgOccupancy,
            ],
            'ships' => $ships,
            'routes' => $routes,
        ]);
    }

    public function create(): Response
    {
        $ships = Ship::where('status', 'aktif')->orderBy('nama_kapal')->get(['id', 'nama_kapal', 'kapasitas', 'jenis_kapal']);
        $routes = ShippingRoute::all(['id', 'asal', 'tujuan']);

        // Ambil daftar periode yang open & final untuk validasi frontend
        $openPeriods = MonthlyPeriod::where('status', 'open')->get(['bulan', 'tahun']);
        $finalPeriods = MonthlyPeriod::where('status', 'final')->get(['bulan', 'tahun']);

        return Inertia::render('Admin/PassengerRecords/Create', [
            'ships' => $ships,
            'routes' => $routes,
            'openPeriods' => $openPeriods,
            'finalPeriods' => $finalPeriods,
            'defaultDate' => Carbon::now()->format('Y-m-d'),
        ]);
    }

    public function store(StorePassengerRecordRequest $request): RedirectResponse
    {
        $dt = Carbon::parse($request->tanggal);
        $period = MonthlyPeriod::where('tahun', $dt->year)
            ->where('bulan', $dt->month)
            ->first();

        if ($period && $period->status === 'final') {
            return redirect()->back()->withErrors([
                'tanggal' => "Periode {$dt->translatedFormat('F Y')} sudah berstatus FINAL (Terkunci). Data tidak dapat ditambahkan kecuali periode dibuka koreksi terlebih dahulu di menu Penutupan Periode.",
            ])->withInput();
        }

        $ship = Ship::findOrFail($request->ship_id);

        PassengerRecord::create([
            'ship_id' => $ship->id,
            'shipping_route_id' => $request->shipping_route_id,
            'tanggal' => $request->tanggal,
            'jumlah_penumpang' => $request->jumlah_penumpang,
            'capacity_snapshot' => $ship->kapasitas,
            'created_by' => auth()->id(),
        ]);

        return redirect()
            ->route('passenger-records.index')
            ->with('success', 'Data manifest penumpang kapal berhasil disimpan.');
    }

    public function edit(PassengerRecord $passengerRecord): Response|RedirectResponse
    {
        $dt = Carbon::parse($passengerRecord->tanggal);
        $period = MonthlyPeriod::where('tahun', $dt->year)
            ->where('bulan', $dt->month)
            ->first();

        if ($period && $period->status === 'final') {
            return redirect()
                ->route('passenger-records.index')
                ->with('error', "Manifest pada periode {$dt->translatedFormat('F Y')} sudah berstatus FINAL (Terkunci) dan tidak dapat diedit.");
        }

        $passengerRecord->load(['ship', 'shippingRoute']);
        $ships = Ship::orderBy('nama_kapal')->get(['id', 'nama_kapal', 'kapasitas', 'status']);
        $routes = ShippingRoute::all(['id', 'asal', 'tujuan']);

        return Inertia::render('Admin/PassengerRecords/Edit', [
            'record' => [
                'id' => $passengerRecord->id,
                'ship_id' => $passengerRecord->ship_id,
                'shipping_route_id' => $passengerRecord->shipping_route_id,
                'tanggal' => $passengerRecord->tanggal,
                'jumlah_penumpang' => $passengerRecord->jumlah_penumpang,
                'capacity_snapshot' => $passengerRecord->capacity_snapshot,
            ],
            'ships' => $ships,
            'routes' => $routes,
        ]);
    }

    public function update(
        UpdatePassengerRecordRequest $request,
        PassengerRecord $passengerRecord
    ): RedirectResponse {
        $oldDt = Carbon::parse($passengerRecord->tanggal);
        $oldPeriod = MonthlyPeriod::where('tahun', $oldDt->year)
            ->where('bulan', $oldDt->month)
            ->first();

        if ($oldPeriod && $oldPeriod->status === 'final') {
            return redirect()
                ->route('passenger-records.index')
                ->with('error', "Manifest pada periode {$oldDt->translatedFormat('F Y')} sudah berstatus FINAL (Terkunci) dan tidak dapat diubah.");
        }

        $newDt = Carbon::parse($request->tanggal);
        $newPeriod = MonthlyPeriod::where('tahun', $newDt->year)
            ->where('bulan', $newDt->month)
            ->first();

        if ($newPeriod && $newPeriod->status === 'final') {
            return redirect()->back()->withErrors([
                'tanggal' => "Periode tujuan {$newDt->translatedFormat('F Y')} sudah berstatus FINAL (Terkunci).",
            ])->withInput();
        }

        $ship = Ship::findOrFail($request->ship_id);

        $passengerRecord->update([
            'ship_id' => $ship->id,
            'shipping_route_id' => $request->shipping_route_id,
            'tanggal' => $request->tanggal,
            'jumlah_penumpang' => $request->jumlah_penumpang,
            'capacity_snapshot' => $ship->kapasitas,
        ]);

        return redirect()
            ->route('passenger-records.index')
            ->with('success', 'Data manifest penumpang berhasil diperbarui.');
    }

    public function destroy(PassengerRecord $passengerRecord): RedirectResponse
    {
        $dt = Carbon::parse($passengerRecord->tanggal);
        $period = MonthlyPeriod::where('tahun', $dt->year)
            ->where('bulan', $dt->month)
            ->first();

        if ($period && $period->status === 'final') {
            return redirect()
                ->route('passenger-records.index')
                ->with('error', "Manifest pada periode {$dt->translatedFormat('F Y')} sudah berstatus FINAL (Terkunci) dan tidak dapat dihapus.");
        }

        $passengerRecord->delete();

        return redirect()
            ->route('passenger-records.index')
            ->with('success', 'Data manifest penumpang berhasil dihapus.');
    }
}
