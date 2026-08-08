<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ship extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_kapal',
        'jenis_kapal',
        'kapasitas',
        'status',
    ];

    public function passengerRecords()
    {
        return $this->hasMany(
            PassengerRecord::class
        );
    }
}
