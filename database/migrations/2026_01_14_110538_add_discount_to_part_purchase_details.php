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
        Schema::table('part_purchase_details', function (Blueprint $table) {
            if (!Schema::hasColumn('part_purchase_details', 'discount_type')) {
                $table->enum('discount_type', ['none', 'percent', 'fixed'])->default('none')->after('subtotal');
            }
            if (!Schema::hasColumn('part_purchase_details', 'discount_value')) {
                $table->decimal('discount_value', 12, 2)->default(0)->after('discount_type');
            }
            if (!Schema::hasColumn('part_purchase_details', 'discount_amount')) {
                $table->bigInteger('discount_amount')->default(0)->after('discount_value');
            }
            if (!Schema::hasColumn('part_purchase_details', 'final_amount')) {
                $table->bigInteger('final_amount')->default(0)->after('discount_amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_purchase_details', function (Blueprint $table) {
            $table->dropColumn(['discount_type', 'discount_value', 'discount_amount', 'final_amount']);
        });
    }
};
