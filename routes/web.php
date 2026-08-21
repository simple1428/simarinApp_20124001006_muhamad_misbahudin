<?php

use App\Http\Controllers\Admin\PassengerRecordController;
use App\Http\Controllers\Admin\ShipController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');
});
Route::middleware(['auth', 'role:operator'])->group(function () {
    Route::patch(
        '/ships/{ship}/toggle-status',
        [ShipController::class, 'toggleStatus']
    )->name('ships.toggle-status');


    Route::resource('ships', ShipController::class)
        ->except([
            'show',
            'destroy',
        ]);

    Route::resource(
        'passenger-records',
        PassengerRecordController::class
    )
        ->except([
            'show'
        ]);
});
require __DIR__ . '/settings.php';
