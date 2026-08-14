<?php

namespace App\Services;

use App\Models\MonthlySummary;


class SeasonClassificationService
{

    public function classify($jumlah)
    {


        /*
        |--------------------------------------------------------------------------
        | Ambil data historis FINAL
        |--------------------------------------------------------------------------
        */


        $summaries = MonthlySummary::whereHas(
            'period',
            function($q){
                $q->where(
                    'status',
                    'final'
                );
            }
        )
        ->with('period')
        ->get();

        if($summaries->count() == 0){
            return null;
        }

        $data = $summaries->pluck('total_penumpang');
        $totalBulan = $summaries->count();
        $totalPenumpangSum = $data->sum();

        $firstPeriod = $summaries->first()->period;
        $lastPeriod = $summaries->last()->period;

        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        $periodeAwal = ($firstPeriod ? ($monthNames[$firstPeriod->bulan] ?? $firstPeriod->bulan) . ' ' . $firstPeriod->tahun : '-');
        $periodeAkhir = ($lastPeriod ? ($monthNames[$lastPeriod->bulan] ?? $lastPeriod->bulan) . ' ' . $lastPeriod->tahun : '-');

        /*
        |--------------------------------------------------------------------------
        | Statistik historis
        |--------------------------------------------------------------------------
        */

        $mean = $data->avg();

        $variance = $data
            ->map(function($value) use($mean){
                return pow(
                    $value-$mean,
                    2
                );
            })
            ->avg();

        $std = sqrt($variance);

        $batasAtas = $mean + $std;
        $batasBawah = $mean - $std;

        /*
        |--------------------------------------------------------------------------
        | Perbandingan
        |--------------------------------------------------------------------------
        */

        $selisih = $jumlah - $mean;

        $persentase = ($selisih / $mean) * 100;

        /*
        |--------------------------------------------------------------------------
        | Klasifikasi Season
        |--------------------------------------------------------------------------
        */

        if($jumlah > $batasAtas){
            $season = 'high';
            $label = 'High Season';
            $message = 'Jumlah penumpang berada di atas batas normal historis.';
            $recommendation = [
                'Menyiapkan kapasitas armada tambahan.',
                'Meningkatkan kesiapan pelayanan.',
                'Melakukan monitoring lonjakan penumpang.'
            ];
        }
        elseif($jumlah < $batasBawah){
            $season='low';
            $label='Low Season';
            $message = 'Jumlah penumpang berada di bawah batas normal historis.';
            $recommendation = [
                'Evaluasi kebutuhan armada.',
                'Optimasi jadwal keberangkatan.',
                'Melakukan efisiensi biaya operasional.'
            ];
        }
        else{
            $season='normal';
            $label='Normal Season';
            $message = 'Jumlah penumpang berada pada kondisi normal.';
            $recommendation = [
                'Pertahankan pola pelayanan.',
                'Lakukan monitoring berkala.'
            ];
        }

        return [
            'season'=>$season,
            'label'=>$label,
            'jumlah'=>round($jumlah,2),
            'mean'=>round($mean,2),
            'std'=>round($std,2),
            'batas_atas'=>round($batasAtas,2),
            'batas_bawah'=>round($batasBawah,2),
            'selisih'=>round($selisih,2),
            'persentase'=>round($persentase,2),
            'total_bulan'=>$totalBulan,
            'total_penumpang_sum'=>$totalPenumpangSum,
            'periode_awal'=>$periodeAwal,
            'periode_akhir'=>$periodeAkhir,
            'message'=>$message,
            'recommendation'=>$recommendation,
            'criteria'=>[
                'high'=>'Jumlah penumpang lebih besar dari batas atas historis (Mean + Standar Deviasi).',
                'normal'=>'Jumlah penumpang berada dalam rentang batas normal historis.',
                'low'=>'Jumlah penumpang lebih kecil dari batas bawah historis (Mean - Standar Deviasi).',
            ],
        ];
    }
}