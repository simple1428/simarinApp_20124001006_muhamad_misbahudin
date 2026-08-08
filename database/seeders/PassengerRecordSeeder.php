<?php

namespace Database\Seeders;

use App\Models\MonthlyPeriod;
use App\Models\PassengerRecord;
use App\Models\Ship;
use App\Models\ShippingRoute;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PassengerRecordSeeder extends Seeder
{
    public function run(): void
    {

        DB::disableQueryLog();

        /*
        |--------------------------------------------------------------------------
        | Ambil user admin sebagai pembuat data
        |--------------------------------------------------------------------------
        */

        $admin = User::where('role', 'operator')->first();

        if (! $admin) {

            $this->command->error(
                'User admin tidak ditemukan.'
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Ambil master kapal dan rute
        |--------------------------------------------------------------------------
        */

        $ships = Ship::where('status', 'aktif')
            ->get();

        $routes = ShippingRoute::where('status', 'aktif')
            ->get();

        if ($ships->isEmpty()) {

            $this->command->error(
                'Data kapal belum tersedia.'
            );

            return;
        }

        if ($routes->isEmpty()) {

            $this->command->error(
                'Data rute belum tersedia.'
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Faktor okupansi dummy
        |
        | Ini hanya untuk simulasi.
        | Data asli nanti berasal dari Dishub.
        |--------------------------------------------------------------------------
        */

        $seasonFactor = [

            // High Season
            1 => [0.75, 0.95],
            7 => [0.80, 1.00],
            8 => [0.85, 1.00],
            12 => [0.80, 1.00],

            // Normal Season
            4 => [0.60, 0.80],
            5 => [0.60, 0.85],
            6 => [0.65, 0.90],
            11 => [0.60, 0.85],

            // Low Season
            2 => [0.45, 0.65],
            3 => [0.45, 0.65],
            9 => [0.45, 0.65],
            10 => [0.45, 0.70],

        ];

        /*
        |--------------------------------------------------------------------------
        | Tahun dan bulan data dummy
        |--------------------------------------------------------------------------
        */

        $currentYear = now()->year;

        $currentMonth = now()->month;

        $records = [];

        /*
        |--------------------------------------------------------------------------
        | Generate data Januari 2024
        | sampai bulan berjalan
        |--------------------------------------------------------------------------
        */

        for (
            $year = 2024;
            $year <= $currentYear;
            $year++
        ) {

            /*
            Jika tahun berjalan,
            hanya sampai bulan sekarang
            */

            $lastMonth = 12;

            if ($year == $currentYear) {

                $lastMonth = $currentMonth;
            }

            for (
                $month = 1;
                $month <= $lastMonth;
                $month++
            ) {

                /*
                |--------------------------------------------------------------------------
                | Buat periode bulanan
                |--------------------------------------------------------------------------
                */

                $status = 'final';

                if (
                    $year == $currentYear &&
                    $month == $currentMonth
                ) {

                    $status = 'open';
                }

                MonthlyPeriod::updateOrCreate(

                    [
                        'bulan' => $month,
                        'tahun' => $year,
                    ],

                    [
                        'status' => $status,
                    ]

                );

                /*
                |--------------------------------------------------------------------------
                | Jumlah hari dalam bulan
                |--------------------------------------------------------------------------
                */

                $days =
                    Carbon::create(
                        $year,
                        $month
                    )->daysInMonth;

                for (
                    $day = 1;
                    $day <= $days;
                    $day++
                ) {

                    $tanggal =
                        Carbon::create(
                            $year,
                            $month,
                            $day
                        )->format('Y-m-d');

                    foreach ($ships as $ship) {

                        foreach ($routes as $route) {

                            /*
                            Hitung batas penumpang
                            berdasarkan kapasitas kapal
                            */

                            $minPassenger =
                                intval(
                                    $ship->kapasitas *
                                        $seasonFactor[$month][0]
                                );

                            $maxPassenger =
                                intval(
                                    $ship->kapasitas *
                                        $seasonFactor[$month][1]
                                );

                            $jumlahPenumpang =
                                rand(
                                    $minPassenger,
                                    $maxPassenger
                                );

                            $records[] = [

                                'ship_id' => $ship->id,

                                'shipping_route_id' => $route->id,

                                'tanggal' => $tanggal,

                                'jumlah_penumpang' => $jumlahPenumpang,

                                'capacity_snapshot' => $ship->kapasitas,

                                'created_by' => $admin->id,

                                'created_at' => now(),

                                'updated_at' => now(),

                            ];
                        }
                    }
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Insert sekaligus
        |--------------------------------------------------------------------------
        */

        foreach (array_chunk($records, 100) as $chunk) {
            PassengerRecord::insert($chunk);
        }

        $this->command->info(
            count($records)
                .
                ' data aktivitas penumpang berhasil dibuat.'
        );

        /*
        |--------------------------------------------------------------------------
        | Otomatis Agregasi Monthly Summary & Model Holt-Winters
        |--------------------------------------------------------------------------
        */
        $periods = MonthlyPeriod::all();
        foreach ($periods as $period) {
            $monthRecords = PassengerRecord::whereYear('tanggal', $period->tahun)
                ->whereMonth('tanggal', $period->bulan)
                ->with('ship')
                ->get();

            $totalPax = (int) $monthRecords->sum('jumlah_penumpang');
            $totalTrips = $monthRecords->count();
            $totalCap = (int) $monthRecords->sum(function ($r) {
                return $r->capacity_snapshot ?: ($r->ship ? $r->ship->kapasitas : 0);
            });
            $occupancy = $totalCap > 0 ? round(($totalPax / $totalCap) * 100, 2) : 0;

            \App\Models\MonthlySummary::updateOrCreate(
                ['monthly_period_id' => $period->id],
                [
                    'jumlah_trip' => $totalTrips,
                    'total_penumpang' => $totalPax,
                    'total_kapasitas' => $totalCap,
                    'occupancy' => $occupancy,
                ]
            );
        }

        try {
            $hw = new \App\Services\HoltWintersService();
            $hw->generate();
            $this->command->info('Model Holt-Winters awal berhasil dilatih dan disimpan.');
        } catch (\Exception $e) {
            $this->command->warn('Peringatan: ' . $e->getMessage());
        }
    }
}
