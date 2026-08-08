<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PassengerRecord extends Model
{
    use HasFactory;

    protected $fillable = [

        'ship_id',
        'shipping_route_id',
        'tanggal',
        'jumlah_penumpang',
        'capacity_snapshot',
        'created_by',

    ];

    public function ship()
    {
        return $this->belongsTo(Ship::class);
    }

    public function shippingRoute()
    {
        return $this->belongsTo(
            ShippingRoute::class
        );
    }

    public function creator()
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }
}
