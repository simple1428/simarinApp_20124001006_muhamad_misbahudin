<?php

namespace App\Services;

use App\Models\MonthlySummary;
use App\Models\SmaEvaluation;
use App\Models\SmaForecast;

class SmaEvaluationService
{
    public function generate()
    {

        $forecasts =
        SmaForecast::orderBy('tahun_prediksi')
            ->orderBy('bulan_prediksi')
            ->get();

        foreach ($forecasts as $forecast) {

            $actual =
            MonthlySummary::whereHas(
                'period',
                function ($q) use ($forecast) {

                    $q->where(
                        'bulan',
                        $forecast->bulan_prediksi
                    )
                        ->where(
                            'tahun',
                            $forecast->tahun_prediksi
                        );

                }
            )
                ->first();

            if (! $actual) {

                continue;

            }

            $error =
            $actual->total_penumpang
            -
            $forecast->nilai_sma;

            $absolute =
            abs($error);

            $percentage =
            (
                $absolute /
                $actual->total_penumpang
            )
            *
            100;

            SmaEvaluation::updateOrCreate(

                [

                    'bulan' => $forecast->bulan_prediksi,

                    'tahun' => $forecast->tahun_prediksi,

                ],

                [

                    'aktual' => $actual->total_penumpang,

                    'prediksi' => $forecast->nilai_sma,

                    'error' => $error,

                    'absolute_error' => $absolute,

                    'percentage_error' => round(
                        $percentage,
                        2
                    ),

                ]

            );

        }

    }
}
