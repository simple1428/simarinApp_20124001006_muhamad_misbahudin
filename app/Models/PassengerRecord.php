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

    protected static function booted(): void
    {
        static::saved(function (PassengerRecord $record) {
            if ($record->tanggal) {
                $dt = \Illuminate\Support\Carbon::parse($record->tanggal);
                app(\App\Services\MonthlySummaryService::class)->generate($dt->month, $dt->year);
            }
            if ($record->wasChanged('tanggal') && $record->getOriginal('tanggal')) {
                $oldDt = \Illuminate\Support\Carbon::parse($record->getOriginal('tanggal'));
                if ($oldDt->month !== $dt->month || $oldDt->year !== $dt->year) {
                    app(\App\Services\MonthlySummaryService::class)->generate($oldDt->month, $oldDt->year);
                }
            }
        });

        static::deleted(function (PassengerRecord $record) {
            if ($record->tanggal) {
                $dt = \Illuminate\Support\Carbon::parse($record->tanggal);
                app(\App\Services\MonthlySummaryService::class)->generate($dt->month, $dt->year);
            }
        });
    }

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
