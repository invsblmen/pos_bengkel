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
            // Add margin calculation fields
            if (!Schema::hasColumn('part_purchase_details', 'margin_amount')) {
                $table->bigInteger('margin_amount')->default(0)->after('margin_value')->comment('Calculated margin amount');
            }

            // Add selling price fields
            if (!Schema::hasColumn('part_purchase_details', 'normal_unit_price')) {
                $table->bigInteger('normal_unit_price')->default(0)->after('margin_amount')->comment('Selling price before promo discount');
            }

            if (!Schema::hasColumn('part_purchase_details', 'promo_discount_amount')) {
                $table->bigInteger('promo_discount_amount')->default(0)->after('promo_discount_value')->comment('Calculated promo discount amount');
            }

            if (!Schema::hasColumn('part_purchase_details', 'selling_price')) {
                $table->bigInteger('selling_price')->default(0)->after('promo_discount_amount')->comment('Final selling price after all discounts');
            }

            // Add audit trail
            if (!Schema::hasColumn('part_purchase_details', 'created_by')) {
                $table->foreignId('created_by')->nullable()->after('selling_price')->constrained('users')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_purchase_details', function (Blueprint $table) {
            $table->dropColumn([
                'margin_amount',
                'normal_unit_price',
                'promo_discount_amount',
                'selling_price',
                'created_by',
            ]);
        });
    }
};
