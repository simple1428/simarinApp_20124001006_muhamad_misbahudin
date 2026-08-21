<?php

namespace Database\Seeders;

use App\Models\Ship;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ShipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ships = [
            [
                'nama_kapal' => 'Express Bahari 1C',
                'jenis_kapal' => null,
                'kapasitas' => 350,
                'status' => 'aktif',
            ],
            [
                'nama_kapal' => 'Express Bahari 3C',
                'jenis_kapal' => null,
                'kapasitas' => 350,
                'status' => 'aktif',
            ],
            [
                'nama_kapal' => 'Express Bahari 8F',
                'jenis_kapal' => null,
                'kapasitas' => 390,
                'status' => 'aktif',
            ],
            [
                'nama_kapal' => 'KMP. Siginjai',
                'jenis_kapal' => null,
                'kapasitas' => 400,
                'status' => 'aktif',
            ],
        ];

        foreach ($ships as $ship) {
            Ship::updateOrCreate(
                [
                    'nama_kapal' => $ship['nama_kapal'],
                ],
                $ship
            );
        }
    }
}
