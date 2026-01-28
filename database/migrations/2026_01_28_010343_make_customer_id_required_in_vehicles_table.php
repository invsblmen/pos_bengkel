<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, ensure all existing vehicles have a customer_id
        // If there are orphaned vehicles, you may need to assign them to a default customer
        // or delete them before running this migration

        // Check if there are any vehicles without customer_id
        $orphanedVehicles = DB::table('vehicles')->whereNull('customer_id')->count();

        if ($orphanedVehicles > 0) {
            // Option 1: Create a default "Unknown Owner" customer
            $defaultCustomerId = DB::table('customers')->insertGetId([
                'name' => 'Pemilik Tidak Diketahui',
                'phone' => '000000000000',
                'email' => null,
                'address' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Assign orphaned vehicles to default customer
            DB::table('vehicles')
                ->whereNull('customer_id')
                ->update(['customer_id' => $defaultCustomerId]);
        }

        // Now make customer_id required and indexed
        Schema::table('vehicles', function (Blueprint $table) {
            $table->unsignedBigInteger('customer_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->unsignedBigInteger('customer_id')->nullable()->change();
        });
    }
};
