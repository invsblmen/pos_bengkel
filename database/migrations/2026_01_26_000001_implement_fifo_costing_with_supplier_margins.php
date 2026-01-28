<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Make buy_price and sell_price nullable in parts table
        // (They will be determined from actual purchases instead)
        Schema::table('parts', function (Blueprint $table) {
            $table->bigInteger('buy_price')->nullable()->change();
            $table->bigInteger('sell_price')->nullable()->change();
        });

        // Add pricing and margin tracking to part_purchases table
        Schema::table('part_purchases', function (Blueprint $table) {
            // If column doesn't exist, add them
            if (!Schema::hasColumn('part_purchases', 'unit_cost')) {
                $table->bigInteger('unit_cost')->default(0)->comment('Cost per unit from supplier');
            }
            if (!Schema::hasColumn('part_purchases', 'margin_type')) {
                $table->enum('margin_type', ['percent', 'fixed'])->default('percent')->comment('Margin calculation type');
            }
            if (!Schema::hasColumn('part_purchases', 'margin_value')) {
                $table->decimal('margin_value', 10, 2)->default(0)->comment('Margin percentage or fixed amount');
            }
            if (!Schema::hasColumn('part_purchases', 'promo_discount_type')) {
                $table->enum('promo_discount_type', ['none', 'percent', 'fixed'])->default('none');
            }
            if (!Schema::hasColumn('part_purchases', 'promo_discount_value')) {
                $table->decimal('promo_discount_value', 10, 2)->default(0);
            }
        });

        // Add tracking for FIFO costing in part_sale_details
        Schema::table('part_sale_details', function (Blueprint $table) {
            // Track which purchase batch this came from for FIFO costing
            if (!Schema::hasColumn('part_sale_details', 'source_purchase_id')) {
                $table->unsignedBigInteger('source_purchase_id')->nullable()->comment('Reference to part_purchases for FIFO costing');
            }
            if (!Schema::hasColumn('part_sale_details', 'cost_price')) {
                $table->bigInteger('cost_price')->default(0)->comment('Actual cost from source purchase');
            }
            if (!Schema::hasColumn('part_sale_details', 'selling_price')) {
                $table->bigInteger('selling_price')->default(0)->comment('Final selling price with margin');
            }
        });
    }

    public function down()
    {
        Schema::table('part_sales_details', function (Blueprint $table) {
            $table->dropColumn(['source_purchase_id', 'cost_price', 'selling_price']);
        });

        Schema::table('part_purchases', function (Blueprint $table) {
            $table->dropColumn(['unit_cost', 'margin_type', 'margin_value', 'promo_discount_type', 'promo_discount_value']);
        });

        Schema::table('parts', function (Blueprint $table) {
            $table->bigInteger('buy_price')->change();
            $table->bigInteger('sell_price')->change();
        });
    }
};
