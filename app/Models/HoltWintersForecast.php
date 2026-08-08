<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HoltWintersForecast extends Model
{
    use HasFactory;

    protected $fillable = [

        'bulan_prediksi',

        'tahun_prediksi',

        'nilai_forecast',

        'periode_mulai',

        'periode_akhir',

        'metode',

    ];

    protected $casts = [

        'periode_mulai' => 'date',

        'periode_akhir' => 'date',

        'nilai_forecast' => 'decimal:2',

    ];
}
