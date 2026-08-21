<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

class ShippingRoute extends Model
{
    protected $fillable = [
        'asal',
        'tujuan',
        'status',
    ];

    public function passengerRecords()
    {
        return $this->hasMany(
            PassengerRecord::class
        );
    }
}
