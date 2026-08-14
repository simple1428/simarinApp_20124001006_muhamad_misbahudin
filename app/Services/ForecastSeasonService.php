<?php

namespace App\Services;

use App\Models\SmaForecast;

class ForecastSeasonService
{
    public function generate()
    {

        /*
        Ambil batas season dari histori
        */

        $season =
            app(SeasonClassificationService::class)
                ->generate();

        $batasAtas =
            $season['batas_atas'];

        $batasBawah =
            $season['batas_bawah'];

        $forecasts =
            SmaForecast::all();

        foreach ($forecasts as $forecast) {

            $nilai =
                $forecast->nilai_sma;

            if ($nilai > $batasAtas) {

                $hasil = 'high';
            } elseif ($nilai < $batasBawah) {

                $hasil = 'low';
            } else {

                $hasil = 'normal';
            }

            $forecast->update([

                'season_prediction' => $hasil,

            ]);
        }

        return true;
    }
}
