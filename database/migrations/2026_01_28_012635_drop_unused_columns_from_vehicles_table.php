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
        Schema::table('vehicles', function (Blueprint $table) {
            // Drop columns yang tidak diperlukan karena data diambil dari service_orders
            $table->dropColumn([
                'km',
                'last_service_date',
                'next_service_date'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            // Restore columns jika rollback
            $table->integer('km')->nullable();
            $table->date('last_service_date')->nullable();
            $table->date('next_service_date')->nullable();
        });
    }
};
