<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmaForecast extends Model
{
    protected $fillable = [

        'bulan_prediksi',
        'tahun_prediksi',

        'nilai_sma',

        'periode_mulai',
        'periode_akhir',

        'season_prediction',

    ];

    public function period()
    {
        return $this->belongsTo(
            MonthlyPeriod::class,
            'monthly_period_id'
        );
    }
}
