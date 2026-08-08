<?php

namespace Database\Seeders;

use App\Models\ShippingRoute;
use Illuminate\Database\Seeder;

class ShippingRouteSeeder extends Seeder
{
    public function run(): void
    {

        $routes = [

            [
                'asal' => 'Jepara',
                'tujuan' => 'Karimunjawa',
                'status' => 'aktif',
            ],

            [
                'asal' => 'Karimunjawa',
                'tujuan' => 'Jepara',
                'status' => 'aktif',
            ],

        ];

        foreach ($routes as $route) {

            ShippingRoute::updateOrCreate(
                [
                    'asal' => $route['asal'],
                    'tujuan' => $route['tujuan'],
                ],
                $route
            );
        }
    }
}
