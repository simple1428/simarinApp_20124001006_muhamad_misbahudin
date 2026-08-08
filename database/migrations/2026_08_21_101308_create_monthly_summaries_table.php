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
        Schema::create('monthly_summaries', function (Blueprint $table) {

            $table->id();

            $table->foreignId('monthly_period_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->unsignedInteger(
                'total_penumpang'
            );

            $table->unsignedInteger(
                'total_kapasitas'
            );

            $table->decimal(
                'occupancy',
                5,
                2
            );
            $table->unsignedInteger('jumlah_trip')
                ->default(0)
                ->after('total_aktivitas');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_summaries');
    }
};
