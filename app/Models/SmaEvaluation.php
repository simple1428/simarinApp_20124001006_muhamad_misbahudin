<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmaEvaluation extends Model
{
    protected $fillable = [

        'bulan',
        'tahun',

        'aktual',
        'prediksi',

        'error',
        'absolute_error',
        'percentage_error',

    ];
}
