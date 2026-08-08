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
        Schema::create('holt_winters_forecasts', function (Blueprint $table) {

            $table->id();

            $table->integer('bulan_prediksi');

            $table->integer('tahun_prediksi');

            $table->decimal(
                'nilai_forecast',
                10,
                2
            );

            $table->date('periode_mulai');

            $table->date('periode_akhir');

            $table->string('metode')
                ->default('Holt-Winters Additive');

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('holt_winters_forecasts');
    }
};
