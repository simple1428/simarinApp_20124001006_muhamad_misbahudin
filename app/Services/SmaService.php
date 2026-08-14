<?php

namespace App\Services;

use App\Models\MonthlySummary;
use App\Models\SmaForecast;
use Carbon\Carbon;

class SmaService
{
    public function generate()
    {

        /*
        |--------------------------------------------------------------------------
        | Ambil data bulanan urut waktu
        |--------------------------------------------------------------------------
        */

        $summaries =

            MonthlySummary::with('period')
                ->get()
                ->sortBy(function ($item) {

                    return
                    ($item->period->tahun * 100)
                    +
                    $item->period->bulan;

                })
                ->values();

        if ($summaries->count() < 6) {

            return [

                'status' => false,

                'message' => 'Data minimal 6 bulan',

            ];

        }

        $results = [];

        /*
        |--------------------------------------------------------------------------
        | Hapus forecast lama
        |--------------------------------------------------------------------------
        */

        SmaForecast::truncate();

        /*
        |--------------------------------------------------------------------------
        | Sliding Window SMA 6 Bulan
        |--------------------------------------------------------------------------
        |
        | Contoh:
        |
        | Jul 2025 - Des 2025
        |
        | menghasilkan
        |
        | Jan 2026
        |
        |--------------------------------------------------------------------------
        */

        for (
            $i = 6;
            $i < $summaries->count();
            $i++
        ) {

            $window =

                $summaries
                    ->slice(
                        $i - 6,
                        6
                    );

            $sma =

                $window
                    ->avg(
                        'total_penumpang'
                    );

            $target =

                $summaries[$i]
                    ->period;

            $start =

                $summaries[$i - 6]
                    ->period;

            $end =

                $summaries[$i - 1]
                    ->period;

            $forecast =

            SmaForecast::create([

                'bulan_prediksi' => $target->bulan,

                'tahun_prediksi' => $target->tahun,

                'nilai_sma' => round(
                    $sma,
                    2
                ),

                'periode_mulai' => Carbon::create(

                    $start->tahun,

                    $start->bulan,

                    1

                ),

                'periode_akhir' => Carbon::create(

                    $end->tahun,

                    $end->bulan,

                    1

                ),

            ]);

            $results[] = $forecast;

        }

        /*
        |--------------------------------------------------------------------------
        | Forecast bulan berikutnya
        |--------------------------------------------------------------------------
        */

        $window =

            $summaries
                ->slice(-6);

        $futureSma =

            $window
                ->avg(
                    'total_penumpang'
                );

        $lastPeriod =

            $summaries
                ->last()
                ->period;

        $nextMonth =

            $lastPeriod->bulan + 1;

        $nextYear =

            $lastPeriod->tahun;

        if ($nextMonth > 12) {

            $nextMonth = 1;

            $nextYear++;

        }

        $futureForecast =

        SmaForecast::create([

            'bulan_prediksi' => $nextMonth,

            'tahun_prediksi' => $nextYear,

            'nilai_sma' => round(
                $futureSma,
                2
            ),

            'periode_mulai' => Carbon::create(

                $window
                    ->first()
                    ->period
                    ->tahun,

                $window
                    ->first()
                    ->period
                    ->bulan,

                1

            ),

            'periode_akhir' => Carbon::create(

                $lastPeriod->tahun,

                $lastPeriod->bulan,

                1

            ),

        ]);

        $results[] = $futureForecast;

        return [

            'status' => true,

            'data' => $results,

        ];

    }
}
