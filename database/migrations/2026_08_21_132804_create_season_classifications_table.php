<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        Schema::create('season_classifications', function (Blueprint $table) {

            $table->id();

            $table->foreignId('monthly_period_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
            Jumlah penumpang periode tersebut
            */
            $table->unsignedInteger(
                'jumlah_penumpang'
            );

            /*
            Nilai statistik pembanding
            */
            $table->decimal(
                'mean_value',
                12,
                2
            );

            $table->decimal(
                'std_value',
                12,
                2
            );

            /*
            Batas klasifikasi
            */
            $table->decimal(
                'batas_atas',
                12,
                2
            );

            $table->decimal(
                'batas_bawah',
                12,
                2
            );

            /*
            Hasil season
            */
            $table->enum(
                'season',
                [
                    'high',
                    'normal',
                    'low',
                ]
            );

            $table->timestamps();
        });
    }

    public function down(): void
    {

        Schema::dropIfExists(
            'season_classifications'
        );
    }
};
