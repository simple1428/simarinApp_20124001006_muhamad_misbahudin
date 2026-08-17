<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Operator SIMARIN',
            'email' => 'operator@simarin.test',
            'password' => Hash::make('password'),
            'role' => 'operator',
        ]);

        User::create([
            'name' => 'Kepala Pelabuhan',
            'email' => 'kepala@simarin.test',
            'password' => Hash::make('password'),
            'role' => 'kepala_pelabuhan',
        ]);
    }
}
