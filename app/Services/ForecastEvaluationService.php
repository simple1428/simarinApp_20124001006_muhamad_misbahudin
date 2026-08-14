<?php

namespace App\Services;

use App\Models\MonthlySummary;

class ForecastEvaluationService
{
    public function evaluateSMA($periode)
    {

        $data =

        MonthlySummary::with('period')
            ->orderBy('monthly_period_id')
            ->get();

        $actual = [];

        $forecast = [];

        for (
            $i = $periode;
            $i < $data->count();
            $i++
        ) {

            $window =

            $data->slice(
                $i - $periode,
                $periode
            );

            $prediction =

            $window
                ->avg(
                    'total_penumpang'
                );

            $actual[] =

            $data[$i]
                ->total_penumpang;

            $forecast[] =

            $prediction;

        }

        return $this->calculateError(
            $actual,
            $forecast
        );

    }

    public function evaluateWMA()
    {

        $data =

        MonthlySummary::orderBy(
            'monthly_period_id'
        )
            ->get();

        $weights = [

            5,
            10,
            15,
            20,
            25,
            25,

        ];

        $actual = [];

        $forecast = [];

        for (
            $i = 6;
            $i < $data->count();
            $i++
        ) {

            $window =

            $data->slice(
                $i - 6,
                6
            );

            $total = 0;

            foreach (
                $window->values() as $index => $item
            ) {

                $total +=

                $item->total_penumpang
                *
                $weights[$index];

            }

            $prediction =

            $total /
            array_sum($weights);

            $actual[] =

            $data[$i]
                ->total_penumpang;

            $forecast[] = $prediction;

        }

        return $this->calculateError(
            $actual,
            $forecast
        );

    }

    private function calculateError(
        $actual,
        $forecast
    ) {

        $n = count($actual);

        $mae = 0;

        $mape = 0;

        $rmse = 0;

        foreach ($actual as $key => $value) {

            $error =

            abs(
                $value -
                $forecast[$key]
            );

            $mae += $error;

            $mape +=

            ($error / $value) * 100;

            $rmse +=

            pow(
                $error,
                2
            );

        }

        return [

            'MAE' => round(
                $mae / $n,
                2
            ),

            'MAPE' => round(
                $mape / $n,
                2
            ),

            'RMSE' => round(
                sqrt($rmse / $n),
                2
            ),

        ];

    }
}
