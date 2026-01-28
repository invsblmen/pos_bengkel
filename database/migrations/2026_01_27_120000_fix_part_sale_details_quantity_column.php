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
        Schema::table('part_sale_details', function (Blueprint $table) {
            // Check if quantity column exists; if not, add it
            if (!Schema::hasColumn('part_sale_details', 'quantity')) {
                // If qty exists, rename it to quantity
                if (Schema::hasColumn('part_sale_details', 'qty')) {
                    $table->renameColumn('qty', 'quantity');
                } else {
                    // Otherwise, create quantity column after part_id
                    $table->integer('quantity')->default(0)->after('part_id');
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_sale_details', function (Blueprint $table) {
            if (Schema::hasColumn('part_sale_details', 'quantity')) {
                $table->renameColumn('quantity', 'qty');
            }
        });
    }
};
