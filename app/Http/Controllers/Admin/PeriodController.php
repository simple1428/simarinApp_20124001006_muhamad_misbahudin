<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MonthlyPeriod;
use App\Models\MonthlySummary;
use App\Models\PassengerRecord;
use App\Services\HoltWintersService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PeriodController extends Controller
{
    public function index(Request $request): Response
    {
        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        // 1. Ambil seluruh periode beserta summary dan user finalizer
        $periods = MonthlyPeriod::with(['summary', 'finalizer'])
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->get()
            ->map(function ($period) use ($monthNames) {
                // Hitung data realtime jika period masih open
                $totalPax = $period->summary ? (int) $period->summary->total_penumpang : 0;
                $totalTrips = $period->summary ? (int) $period->summary->jumlah_trip : 0;
                $totalCap = $period->summary ? (int) $period->summary->total_kapasitas : 0;
                $occupancy = $period->summary ? round($period->summary->occupancy, 1) : 0;

                if ($period->status === 'open') {
                    $records = PassengerRecord::whereYear('tanggal', $period->tahun)
                        ->whereMonth('tanggal', $period->bulan)
                        ->with('ship')
                        ->get();

                    $totalPax = (int) $records->sum('jumlah_penumpang');
                    $totalTrips = $records->count();
                    $totalCap = (int) $records->sum(function ($r) {
                        return $r->capacity_snapshot ?: ($r->ship ? $r->ship->kapasitas : 0);
                    });
                    $occupancy = $totalCap > 0 ? round(($totalPax / $totalCap) * 100, 1) : 0;
                }

                return [
                    'id' => $period->id,
                    'bulan' => $period->bulan,
                    'tahun' => $period->tahun,
                    'periode_label' => ($monthNames[$period->bulan] ?? $period->bulan) . ' ' . $period->tahun,
                    'status' => $period->status,
                    'total_penumpang' => $totalPax,
                    'jumlah_trip' => $totalTrips,
                    'total_kapasitas' => $totalCap,
                    'occupancy' => $occupancy,
                    'finalized_by' => $period->finalizer ? $period->finalizer->name : null,
                    'finalized_at' => $period->finalized_at ? Carbon::parse($period->finalized_at)->translatedFormat('d M Y, H:i') . ' WIB' : null,
                ];
            });

        // 2. Periode aktif (open) saat ini
        $activePeriod = $periods->firstWhere('status', 'open');

        // 3. Ringkasan Global
        $totalFinalized = $periods->where('status', 'final')->count();
        $totalOpen = $periods->where('status', 'open')->count();
        $allPaxSum = $periods->where('status', 'final')->sum('total_penumpang');

        return Inertia::render('Admin/Periods/Index', [
            'periods' => $periods,
            'activePeriod' => $activePeriod,
            'stats' => [
                'total_periods' => $periods->count(),
                'finalized_count' => $totalFinalized,
                'open_count' => $totalOpen,
                'total_final_passengers' => $allPaxSum,
            ],
        ]);
    }

    public function finalize(
        MonthlyPeriod $period,
        HoltWintersService $hwService
    ): RedirectResponse {
        // 1. Hitung agregasi real dari passenger_records untuk bulan tersebut
        $records = PassengerRecord::whereYear('tanggal', $period->tahun)
            ->whereMonth('tanggal', $period->bulan)
            ->with('ship')
            ->get();

        $totalPax = (int) $records->sum('jumlah_penumpang');
        $totalTrips = $records->count();
        $totalCap = (int) $records->sum(function ($r) {
            return $r->capacity_snapshot ?: ($r->ship ? $r->ship->kapasitas : 0);
        });
        $occupancy = $totalCap > 0 ? round(($totalPax / $totalCap) * 100, 2) : 0;

        // 2. Simpan atau perbarui monthly_summary
        MonthlySummary::updateOrCreate(
            ['monthly_period_id' => $period->id],
            [
                'jumlah_trip' => $totalTrips,
                'total_penumpang' => $totalPax,
                'total_kapasitas' => $totalCap,
                'occupancy' => $occupancy,
            ]
        );

        // 3. Ubah status periode menjadi final
        $period->update([
            'status' => 'final',
            'finalized_by' => Auth::id(),
            'finalized_at' => Carbon::now(),
        ]);

        // 4. Buat periode berikutnya jika belum ada (Bulan + 1)
        $nextMonth = $period->bulan == 12 ? 1 : $period->bulan + 1;
        $nextYear = $period->bulan == 12 ? $period->tahun + 1 : $period->tahun;

        $existingNext = MonthlyPeriod::where('bulan', $nextMonth)
            ->where('tahun', $nextYear)
            ->first();

        if (! $existingNext) {
            $newPeriod = MonthlyPeriod::create([
                'bulan' => $nextMonth,
                'tahun' => $nextYear,
                'status' => 'open',
            ]);

            MonthlySummary::create([
                'monthly_period_id' => $newPeriod->id,
                'jumlah_trip' => 0,
                'total_penumpang' => 0,
                'total_kapasitas' => 0,
                'occupancy' => 0,
            ]);
        }

        // 5. Trigger peramalan Holt-Winters untuk periode baru
        try {
            $hwService->generate();
        } catch (\Exception $e) {
            // Log or continue
        }

        return redirect()
            ->route('periods.index')
            ->with('success', "Periode {$period->bulan}/{$period->tahun} berhasil ditutup & difinalisasi. Model peramalan Holt-Winters telah diperbarui.");
    }

    public function reopen(MonthlyPeriod $period): RedirectResponse
    {
        $period->update([
            'status' => 'open',
            'finalized_by' => null,
            'finalized_at' => null,
        ]);

        return redirect()
            ->route('periods.index')
            ->with('success', "Periode {$period->bulan}/{$period->tahun} dibuka kembali untuk perbaikan data.");
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'bulan' => 'required|integer|between:1,12',
            'tahun' => 'required|integer|min:2020|max:2050',
        ]);

        $exists = MonthlyPeriod::where('bulan', $request->bulan)
            ->where('tahun', $request->tahun)
            ->exists();

        if ($exists) {
            return redirect()
                ->back()
                ->withErrors(['bulan' => 'Periode tersebut sudah terdaftar dalam sistem.']);
        }

        $period = MonthlyPeriod::create([
            'bulan' => $request->bulan,
            'tahun' => $request->tahun,
            'status' => 'open',
        ]);

        MonthlySummary::create([
            'monthly_period_id' => $period->id,
            'jumlah_trip' => 0,
            'total_penumpang' => 0,
            'total_kapasitas' => 0,
            'occupancy' => 0,
        ]);

        return redirect()
            ->route('periods.index')
            ->with('success', "Periode baru {$request->bulan}/{$request->tahun} berhasil ditambahkan.");
    }
}
