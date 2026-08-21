<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Ship;
use App\Models\ShippingRoute;
use App\Models\PassengerRecord;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PassengerRecordSeeder extends Seeder
{
    public function run(): void
    {

        $admin = User::where('role', 'operator')
            ->first();


        $ships = Ship::where('status', 'aktif')
            ->get();


        $routes = ShippingRoute::all();



        $monthlyTargets = [

            1 => 16800,
            2 => 10500,
            3 => 11200,
            4 => 13800,
            5 => 14500,
            6 => 15300,
            7 => 20500,
            8 => 22000,
            9 => 11800,
            10 => 12100,
            11 => 14700,
            12 => 21500,

        ];



        foreach ($monthlyTargets as $month => $target) {


            $days = 10;


            $dailyPassenger =
                intval($target / $days);



            for ($i = 1; $i <= $days; $i++) {


                $date = Carbon::create(
                    2024,
                    $month,
                    min($i, 28)
                );



                foreach ($ships as $ship) {


                    $route = $routes
                        ->random();



                    $passenger =
                        rand(
                            intval($dailyPassenger / 8),
                            intval($dailyPassenger / 4)
                        );



                    PassengerRecord::create([

                        'ship_id' => $ship->id,

                        'shipping_route_id' => $route->id,

                        'tanggal' => $date,

                        'jumlah_penumpang' => $passenger,

                        'capacity_snapshot' => $ship->kapasitas,

                        'created_by' => $admin->id,

                    ]);
                }
            }
        }
    }
}
