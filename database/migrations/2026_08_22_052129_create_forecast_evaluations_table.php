<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('forecast_evaluations', function (Blueprint $table) {

            $table->id();

            $table->string('metode');

            $table->decimal(
                'mae',
                10,
                2
            );

            $table->decimal(
                'mape',
                10,
                2
            );

            $table->decimal(
                'rmse',
                10,
                2
            );

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forecast_evaluations');
    }
};
