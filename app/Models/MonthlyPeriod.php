<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonthlyPeriod extends Model
{
    protected $fillable = [

        'bulan',
        'tahun',
        'status',
        'finalized_by',
        'finalized_at',

    ];

    public function summary()
    {
        return $this->hasOne(
            MonthlySummary::class
        );
    }

    public function finalizer()
    {
        return $this->belongsTo(
            User::class,
            'finalized_by'
        );
    }
}
