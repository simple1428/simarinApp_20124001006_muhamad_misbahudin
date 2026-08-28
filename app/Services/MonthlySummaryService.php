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
        $period = MonthlyPeriod::firstOrCreate([
            'bulan' => $bulan,
            'tahun' => $tahun,
        ]);

        $records = PassengerRecord::whereYear('tanggal', $tahun)
            ->whereMonth('tanggal', $bulan)
            ->with('ship')
            ->get();

        $totalTrip = $records->count();
        $totalPenumpang = (int) $records->sum('jumlah_penumpang');

        $totalKapasitas = (int) $records->sum(function ($r) {
            return $r->capacity_snapshot ?: ($r->ship ? $r->ship->kapasitas : 0);
        });

        $occupancy = 0;
        if ($totalKapasitas > 0) {
            $occupancy = round(($totalPenumpang / $totalKapasitas) * 100, 2);
        }

        return MonthlySummary::updateOrCreate(
            [
                'monthly_period_id' => $period->id,
            ],
            [
                'jumlah_trip' => $totalTrip,
                'total_penumpang' => $totalPenumpang,
                'total_kapasitas' => $totalKapasitas,
                'occupancy' => $occupancy,
            ]
        );
    }
}

