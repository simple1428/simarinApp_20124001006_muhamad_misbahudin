<?php

namespace App\Services;

use App\Models\MonthlyPeriod;
use App\Models\MonthlySummary;
use App\Models\PassengerRecord;

class MonthlySummaryService
{
    public function generate(
        int $bulan,
        int $tahun
    ) {

        $period =
            MonthlyPeriod::firstOrCreate([

                'bulan' => $bulan,

                'tahun' => $tahun,

            ]);

        $records =
            PassengerRecord::whereYear(
                'tanggal',
                $tahun
            )
                ->whereMonth(
                    'tanggal',
                    $bulan
                )
                ->get();

        $totalTrip =
            $records->count();
        $totalPenumpang =
            $records->sum(
                'jumlah_penumpang'
            );

        $totalKapasitas =
            $records->sum(
                'capacity_snapshot'
            );

        $occupancy = 0;

        if ($totalKapasitas > 0) {

            $occupancy =
                ($totalPenumpang /
                    $totalKapasitas)
                * 100;
        }

        return MonthlySummary::updateOrCreate(

            [

                'monthly_period_id' => $period->id,

            ],

            [

                'jumlah_trip' => $totalTrip,

                'total_penumpang' => $totalPenumpang,

                'total_kapasitas' => $totalKapasitas,

                'occupancy' => round($occupancy, 2),

            ]

        );
    }
}
