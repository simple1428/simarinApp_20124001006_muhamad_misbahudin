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
        Schema::create('monthly_periods', function (Blueprint $table) {

            $table->id();

            $table->unsignedTinyInteger('bulan');

            $table->unsignedInteger('tahun');


            $table->enum('status', [
                'open',
                'final'
            ])
                ->default('open');


            $table->foreignId('finalized_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();


            $table->timestamp('finalized_at')
                ->nullable();


            $table->timestamps();


            $table->unique([
                'bulan',
                'tahun'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_periods');
    }
};
