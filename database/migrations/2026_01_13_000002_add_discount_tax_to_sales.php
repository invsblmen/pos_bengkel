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
        // Add to part_sales table
        Schema::table('part_sales', function (Blueprint $table) {
            if (!Schema::hasColumn('part_sales', 'discount_type')) {
                $table->enum('discount_type', ['none', 'percent', 'fixed'])->default('none')->after('total');
            }
            if (!Schema::hasColumn('part_sales', 'discount_value')) {
                $table->decimal('discount_value', 12, 2)->default(0)->after('discount_type');
            }
            if (!Schema::hasColumn('part_sales', 'discount_amount')) {
                $table->bigInteger('discount_amount')->default(0)->after('discount_value');
            }
            if (!Schema::hasColumn('part_sales', 'tax_type')) {
                $table->enum('tax_type', ['none', 'percent', 'fixed'])->default('none')->after('discount_amount');
            }
            if (!Schema::hasColumn('part_sales', 'tax_value')) {
                $table->decimal('tax_value', 12, 2)->default(0)->after('tax_type');
            }
            if (!Schema::hasColumn('part_sales', 'tax_amount')) {
                $table->bigInteger('tax_amount')->default(0)->after('tax_value');
            }
            if (!Schema::hasColumn('part_sales', 'grand_total')) {
                $table->bigInteger('grand_total')->default(0)->after('tax_amount');
            }
        });

        // Add to part_sale_details table
        Schema::table('part_sale_details', function (Blueprint $table) {
            if (!Schema::hasColumn('part_sale_details', 'discount_type')) {
                $table->enum('discount_type', ['none', 'percent', 'fixed'])->default('none')->after('subtotal');
            }
            if (!Schema::hasColumn('part_sale_details', 'discount_value')) {
                $table->decimal('discount_value', 12, 2)->default(0)->after('discount_type');
            }
            if (!Schema::hasColumn('part_sale_details', 'discount_amount')) {
                $table->bigInteger('discount_amount')->default(0)->after('discount_value');
            }
            if (!Schema::hasColumn('part_sale_details', 'final_amount')) {
                $table->bigInteger('final_amount')->default(0)->after('discount_amount');
            }
        });

        // Add to part_sales_orders table
        Schema::table('part_sales_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('part_sales_orders', 'discount_type')) {
                $table->enum('discount_type', ['none', 'percent', 'fixed'])->default('none')->after('total_amount');
            }
            if (!Schema::hasColumn('part_sales_orders', 'discount_value')) {
                $table->decimal('discount_value', 12, 2)->default(0)->after('discount_type');
            }
            if (!Schema::hasColumn('part_sales_orders', 'discount_amount')) {
                $table->bigInteger('discount_amount')->default(0)->after('discount_value');
            }
            if (!Schema::hasColumn('part_sales_orders', 'tax_type')) {
                $table->enum('tax_type', ['none', 'percent', 'fixed'])->default('none')->after('discount_amount');
            }
            if (!Schema::hasColumn('part_sales_orders', 'tax_value')) {
                $table->decimal('tax_value', 12, 2)->default(0)->after('tax_type');
            }
            if (!Schema::hasColumn('part_sales_orders', 'tax_amount')) {
                $table->bigInteger('tax_amount')->default(0)->after('tax_value');
            }
            if (!Schema::hasColumn('part_sales_orders', 'grand_total')) {
                $table->bigInteger('grand_total')->default(0)->after('tax_amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_sales', function (Blueprint $table) {
            $table->dropColumn([
                'discount_type', 'discount_value', 'discount_amount',
                'tax_type', 'tax_value', 'tax_amount', 'grand_total'
            ]);
        });

        Schema::table('part_sale_details', function (Blueprint $table) {
            $table->dropColumn([
                'discount_type', 'discount_value', 'discount_amount', 'final_amount'
            ]);
        });

        Schema::table('part_sales_orders', function (Blueprint $table) {
            $table->dropColumn([
                'discount_type', 'discount_value', 'discount_amount',
                'tax_type', 'tax_value', 'tax_amount', 'grand_total'
            ]);
        });
    }
};
