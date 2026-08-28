<?php

use App\Http\Controllers\Admin\PassengerRecordController;
use App\Http\Controllers\Admin\ShipController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PortMaster\ForecastController;
use App\Http\Controllers\PortMaster\OccupancyController;
use App\Http\Controllers\PortMaster\PassengerController;
use App\Http\Controllers\PortMaster\ReportController;
use App\Http\Controllers\PortMaster\EvaluationHistoryController;
use App\Models\MonthlySummary;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::get('/register', function () {
    return redirect()->route('login');
});

Route::middleware('auth')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Redirect setelah login
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', function () {

        $user = Auth::user();

        if ($user->role === 'operator') {

            return redirect()
                ->route('dashboard.admin');
        }

        if ($user->role === 'kepala_pelabuhan') {

            return redirect()
                ->route('port.dashboard');
        }

        abort(403);
    })
        ->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Dashboard Operator/Admin
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/dashboard/admin',
        [DashboardController::class, 'admin']
    )
        ->middleware('role:operator')
        ->name('dashboard.admin');

    /*
    |--------------------------------------------------------------------------
    | Dashboard Kepala Pelabuhan
    |--------------------------------------------------------------------------
    */

    Route::middleware([
        'auth',
        'role:kepala_pelabuhan',
    ])
        ->prefix('kepala-pelabuhan')
        ->group(function () {
            Route::get(
                '/dashboard',
                [DashboardController::class, 'kepalaPelabuhan']
            )
                ->name('port.dashboard');

            Route::get(
                '/passengers',
                [
                    PassengerController::class,
                    'index',
                ]
            )
                ->name('port.passengers');

            Route::get(
                '/occupancy',
                [
                    OccupancyController::class,
                    'index',
                ]
            )
                ->name('port.occupancy');

            Route::get(
                '/forecast',
                [
                    ForecastController::class,
                    'index',
                ]
            )
                ->name('port.forecast');

            Route::get(
                '/reports',
                [ReportController::class, 'index']
            )
                ->name('port.reports');

            Route::get(
                '/evaluation-history',
                [EvaluationHistoryController::class, 'index']
            )
                ->name('port.evaluation-history');
        });
});

/*
|--------------------------------------------------------------------------
| Modul Admin Operator
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth',
    'role:operator',
])
    ->group(function () {

        Route::patch(
            '/ships/{ship}/toggle-status',
            [ShipController::class, 'toggleStatus']
        )
            ->name('ships.toggle-status');

        Route::resource('ships', ShipController::class)
            ->except([
                'show',
                'destroy',
            ]);

        Route::resource(
            'passenger-records',
            PassengerRecordController::class
        )
            ->except([
                'show',
            ]);

        // Master Rute Penyeberangan (Tetap - Hanya Edit Nama)
        Route::resource('shipping-routes', \App\Http\Controllers\Admin\ShippingRouteController::class)
            ->only(['index', 'edit', 'update']);

        // Penutupan & Rekapitulasi Periode Bulanan
        Route::get('/periods', [\App\Http\Controllers\Admin\PeriodController::class, 'index'])->name('periods.index');
        Route::post('/periods', [\App\Http\Controllers\Admin\PeriodController::class, 'store'])->name('periods.store');
        Route::patch('/periods/{period}/finalize', [\App\Http\Controllers\Admin\PeriodController::class, 'finalize'])->name('periods.finalize');
        Route::patch('/periods/{period}/reopen', [\App\Http\Controllers\Admin\PeriodController::class, 'reopen'])->name('periods.reopen');
    });

Route::get('/test-holt', function () {

    return MonthlySummary::with('period')
        ->orderBy('monthly_period_id')
        ->get()
        ->map(function ($item) {

            exec('python --version', $output, $status);

            return [

                'status' => $status,

                'output' => $output,

            ];

        });

});

Route::get('/test-stats', function () {

    exec(
        'python -c "import statsmodels; print(statsmodels.__version__)"',
        $output,
        $status
    );

    return [

        'status' => $status,

        'output' => $output,

    ];

});
/*
|--------------------------------------------------------------------------
| Halaman Diagram & Flowchart (Publik - Tanpa Auth)
|--------------------------------------------------------------------------
*/

Route::get('/flowchart', function () {
    return inertia('Flowchart/index');
})->name('flowchart');

/*
|--------------------------------------------------------------------------
| Halaman Komparasi Metode Prediksi (Publik - Bab 4 Skripsi)
|--------------------------------------------------------------------------
*/
Route::get('/komparasi', [\App\Http\Controllers\ComparisonController::class, 'index'])
    ->name('comparison');

/*
|--------------------------------------------------------------------------
| Halaman Lampiran & Pengujian Sistem (Publik - Bab 3 & Bab 4 Skripsi)
|--------------------------------------------------------------------------
*/
Route::get('/lampiran-pengujian', function () {
    return inertia('TestingDocs/index');
})->name('testing-docs');

/*
|--------------------------------------------------------------------------
| Halaman Demo Sidang & Safety Net Presentasi (Publik)
|--------------------------------------------------------------------------
*/
Route::get('/demo-sidang', [\App\Http\Controllers\DemoSafetyController::class, 'index'])
    ->name('demo-safety');
Route::post('/demo-sidang/quick-login', [\App\Http\Controllers\DemoSafetyController::class, 'quickLogin'])
    ->name('demo-safety.quick-login');
Route::post('/demo-sidang/trigger-forecast', [\App\Http\Controllers\DemoSafetyController::class, 'triggerForecast'])
    ->name('demo-safety.trigger-forecast');
Route::post('/demo-sidang/inject-trip', [\App\Http\Controllers\DemoSafetyController::class, 'injectSampleTrip'])
    ->name('demo-safety.inject-trip');
Route::post('/demo-sidang/reset-database', [\App\Http\Controllers\DemoSafetyController::class, 'resetDatabase'])
    ->name('demo-safety.reset-database');

/*
|--------------------------------------------------------------------------
| Halaman Early Warning & Rekomendasi Kapasitas Armada (Decision Support)
|--------------------------------------------------------------------------
*/
Route::get('/rekomendasi-armada', [\App\Http\Controllers\DecisionSupportController::class, 'index'])
    ->name('decision-support');

require __DIR__.'/settings.php';
