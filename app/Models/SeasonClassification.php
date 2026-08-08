<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeasonClassification extends Model
{
    protected $fillable = [

        'monthly_period_id',

        'jumlah_penumpang',

        'mean_value',

        'std_value',

        'batas_atas',

        'batas_bawah',

        'season',

    ];

    public function period()
    {

        return $this->belongsTo(
            MonthlyPeriod::class,
            'monthly_period_id'
        );
    }
}
