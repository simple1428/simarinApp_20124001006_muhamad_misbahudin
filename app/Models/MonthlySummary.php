<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonthlySummary extends Model
{
    protected $fillable = [

        'monthly_period_id',

        'jumlah_trip',

        'total_penumpang',

        'total_kapasitas',

        'occupancy',

    ];

    public function period()
    {
        return $this->belongsTo(
            MonthlyPeriod::class,
            'monthly_period_id'
        );
    }
}
