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
        Schema::create('passenger_records', function (Blueprint $table) {

            $table->id();

            $table->foreignId('ship_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('shipping_route_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('tanggal');

            $table->unsignedInteger('jumlah_penumpang');

            $table->unsignedInteger('capacity_snapshot');

            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('passenger_records');
    }
};
