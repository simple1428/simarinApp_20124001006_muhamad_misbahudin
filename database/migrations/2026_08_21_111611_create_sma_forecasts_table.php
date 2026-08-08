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
        Schema::create('sma_forecasts', function (Blueprint $table) {

            $table->id();

            /*
     * Bulan yang diprediksi
     */
            $table->unsignedTinyInteger('bulan_prediksi');

            $table->unsignedInteger('tahun_prediksi');

            /*
     * Nilai hasil SMA
     */
            $table->decimal(
                'nilai_sma',
                12,
                2
            );

            /*
     * Periode data yang digunakan
     */
            $table->date('periode_mulai');

            $table->date('periode_akhir');

            /*
     * Hasil klasifikasi
     */
            $table->enum(
                'season_prediction',
                [
                    'high',
                    'normal',
                    'low',
                ]
            )
                ->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sma_forecasts');
    }
};
