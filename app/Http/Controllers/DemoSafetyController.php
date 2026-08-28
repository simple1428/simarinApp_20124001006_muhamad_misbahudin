<?php

namespace App\Http\Controllers;

use App\Models\HoltWintersForecast;
use App\Models\MonthlyPeriod;
use App\Models\MonthlySummary;
use App\Models\PassengerRecord;
use App\Models\Ship;
use App\Models\ShippingRoute;
use App\Models\SmaForecast;
use App\Models\User;
use App\Services\HoltWintersService;
use App\Services\MonthlySummaryService;
use App\Services\SmaService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DemoSafetyController extends Controller
{
    public function index(Request $request, HoltWintersService $hwService): Response
    {
        // 1. Cek kesehatan sistem & dependensi (Python, DB, Dataset)
        $pythonVersion = null;
        $statsmodelsVersion = null;
        $pythonOk = false;

        try {
            exec('python --version 2>&1', $pyOut, $pyStatus);
            if ($pyStatus === 0 && !empty($pyOut)) {
                $pythonVersion = implode(' ', $pyOut);
            }

            exec('python -c "import statsmodels; print(statsmodels.__version__)" 2>&1', $smOut, $smStatus);
            if ($smStatus === 0 && !empty($smOut)) {
                $statsmodelsVersion = 'v' . implode('', $smOut);
                $pythonOk = true;
            }
        } catch (\Throwable $e) {
            $pythonOk = false;
        }

        // 2. Statistik status dataset saat ini
        $totalUsers = User::count();
        $totalShips = Ship::count();
        $totalRoutes = ShippingRoute::count();
        $totalPassengerRecords = PassengerRecord::count();
        $totalPeriods = MonthlyPeriod::count();
        $finalPeriods = MonthlyPeriod::where('status', 'final')->count();
        $activePeriod = MonthlyPeriod::where('status', 'open')->first()
            ?? MonthlyPeriod::orderByDesc('tahun')->orderByDesc('bulan')->first();

        $latestHwForecast = HoltWintersForecast::orderByDesc('tahun_prediksi')->orderByDesc('bulan_prediksi')->first();
        $latestSmaForecast = SmaForecast::orderByDesc('tahun_prediksi')->orderByDesc('bulan_prediksi')->first();

        // 3. Ambil akun demo
        $operatorUser = User::where('role', 'operator')->first();
        $kepalaUser = User::where('role', 'kepala_pelabuhan')->first();

        // 4. Quick health check summary
        $healthCheck = [
            'database' => [
                'status' => $totalPassengerRecords > 0 ? 'READY' : 'EMPTY',
                'totalRecords' => $totalPassengerRecords,
                'totalPeriods' => $totalPeriods,
                'finalPeriods' => $finalPeriods,
            ],
            'python' => [
                'status' => $pythonOk ? 'READY' : 'WARNING',
                'version' => $pythonVersion ?? 'Python tidak terdeteksi',
                'statsmodels' => $statsmodelsVersion ?? 'Belum terinstall',
            ],
            'forecast' => [
                'status' => ($latestHwForecast && $latestSmaForecast) ? 'READY' : 'NEEDS_TRIGGER',
                'hwLatest' => $latestHwForecast ? "Bulan {$latestHwForecast->bulan_prediksi}/{$latestHwForecast->tahun_prediksi} (Pax: " . number_format($latestHwForecast->nilai_forecast, 0, ',', '.') . ")" : '-',
                'smaLatest' => $latestSmaForecast ? "Bulan {$latestSmaForecast->bulan_prediksi}/{$latestSmaForecast->tahun_prediksi} (Pax: " . number_format($latestSmaForecast->nilai_sma, 0, ',', '.') . ")" : '-',
            ],
        ];

        return Inertia::render('DemoSafety/index', [
            'healthCheck' => $healthCheck,
            'demoAccounts' => [
                'operator' => $operatorUser ? [
                    'id' => $operatorUser->id,
                    'name' => $operatorUser->name,
                    'email' => $operatorUser->email,
                    'role' => $operatorUser->role,
                ] : null,
                'kepala' => $kepalaUser ? [
                    'id' => $kepalaUser->id,
                    'name' => $kepalaUser->name,
                    'email' => $kepalaUser->email,
                    'role' => $kepalaUser->role,
                ] : null,
            ],
            'activePeriodInfo' => $activePeriod ? [
                'bulan' => $activePeriod->bulan,
                'tahun' => $activePeriod->tahun,
                'status' => $activePeriod->status,
            ] : null,
            'summaryStats' => [
                'totalShips' => $totalShips,
                'totalRoutes' => $totalRoutes,
                'totalUsers' => $totalUsers,
            ],
        ]);
    }

    /**
     * 1-Click Instant Login (Bypass form login saat presentasi sidang)
     */
    public function quickLogin(Request $request)
    {
        $role = $request->input('role', 'operator');
        $user = User::where('role', $role)->first();

        if (! $user) {
            return redirect()->back()->with('error', "Akun dengan role {$role} tidak ditemukan.");
        }

        Auth::login($user);
        $request->session()->regenerate();

        if ($user->role === 'operator') {
            return redirect()->route('dashboard.admin')->with('success', 'Berhasil masuk langsung sebagai Operator!');
        }

        return redirect()->route('port.dashboard')->with('success', 'Berhasil masuk langsung sebagai Kepala Pelabuhan!');
    }

    /**
     * Trigger eksekusi ulang algoritma peramalan Python & SMA secara langsung
     */
    public function triggerForecast(HoltWintersService $hwService, SmaService $smaService)
    {
        $start = microtime(true);
        $hwResult = $hwService->generate();
        $smaResult = $smaService->generate();
        $duration = round((microtime(true) - $start) * 1000, 2);

        return redirect()->back()->with([
            'flash_message' => [
                'type' => 'success',
                'title' => 'Algoritma Peramalan Berhasil Dijalankan!',
                'detail' => "Holt-Winters & SMA berhasil dikalkulasi ulang dalam waktu {$duration} ms.",
                'hw_status' => $hwResult['status'] ?? true,
                'sma_status' => $smaResult['status'] ?? true,
            ],
        ]);
    }

    /**
     * Simulasi inject data perjalanan kapal harian secara realtime
     */
    public function injectSampleTrip(Request $request, MonthlySummaryService $summaryService)
    {
        $activePeriod = MonthlyPeriod::where('status', 'open')->first()
            ?? MonthlyPeriod::orderByDesc('tahun')->orderByDesc('bulan')->first();

        $ship = Ship::where('status', 'aktif')->inRandomOrder()->first() ?? Ship::first();
        $route = ShippingRoute::where('status', 'aktif')->inRandomOrder()->first() ?? ShippingRoute::first();
        $operator = User::where('role', 'operator')->first() ?? User::first();

        if (! $activePeriod || ! $ship || ! $route || ! $operator) {
            return redirect()->back()->with('error', 'Gagal inject data: Master data belum lengkap.');
        }

        $pax = rand((int) ($ship->kapasitas * 0.5), (int) ($ship->kapasitas * 0.95));
        $tripDate = Carbon::create($activePeriod->tahun, $activePeriod->bulan, rand(1, 28))->format('Y-m-d');

        $record = PassengerRecord::create([
            'ship_id' => $ship->id,
            'shipping_route_id' => $route->id,
            'tanggal' => $tripDate,
            'jumlah_penumpang' => $pax,
            'capacity_snapshot' => $ship->kapasitas,
            'created_by' => $operator->id,
        ]);

        // Auto trigger update monthly summary
        $summary = $summaryService->generate($activePeriod->bulan, $activePeriod->tahun);

        return redirect()->back()->with([
            'flash_message' => [
                'type' => 'success',
                'title' => 'Simulasi Perjalanan Berhasil Disuntikkan!',
                'detail' => "Kapal: {$ship->nama_kapal} ({$pax} pax) pada {$tripDate}. Rekapitulasi bulanan otomatis terupdate (Occupancy: {$summary->occupancy}%).",
            ],
        ]);
    }

    /**
     * Reset database ke dataset awal skripsi yang bersih dan siap sidang
     */
    public function resetDatabase(HoltWintersService $hwService, SmaService $smaService)
    {
        try {
            Artisan::call('migrate:fresh', [
                '--seed' => true,
                '--force' => true,
            ]);

            // Re-run forecasting algorithms
            $hwService->generate();
            $smaService->generate();

            return redirect()->back()->with([
                'flash_message' => [
                    'type' => 'success',
                    'title' => 'Database Berhasil Direset ke Kondisi Ideal Sidang!',
                    'detail' => 'Seluruh tabel, 32 bulan dataset historis, akun demo, dan model peramalan telah disetel ulang dalam kondisi prima.',
                ],
            ]);
        } catch (\Throwable $e) {
            return redirect()->back()->with([
                'flash_message' => [
                    'type' => 'error',
                    'title' => 'Gagal Mereset Database',
                    'detail' => $e->getMessage(),
                ],
            ]);
        }
    }
}
