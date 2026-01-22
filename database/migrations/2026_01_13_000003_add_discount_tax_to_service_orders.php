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
        // Add to service_orders table
        Schema::table('service_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('service_orders', 'discount_type')) {
                $table->enum('discount_type', ['none', 'percent', 'fixed'])->default('none')->after('total');
            }
            if (!Schema::hasColumn('service_orders', 'discount_value')) {
                $table->decimal('discount_value', 12, 2)->default(0)->after('discount_type');
            }
            if (!Schema::hasColumn('service_orders', 'discount_amount')) {
                $table->bigInteger('discount_amount')->default(0)->after('discount_value');
            }
            if (!Schema::hasColumn('service_orders', 'tax_type')) {
                $table->enum('tax_type', ['none', 'percent', 'fixed'])->default('none')->after('discount_amount');
            }
            if (!Schema::hasColumn('service_orders', 'tax_value')) {
                $table->decimal('tax_value', 12, 2)->default(0)->after('tax_type');
            }
            if (!Schema::hasColumn('service_orders', 'tax_amount')) {
                $table->bigInteger('tax_amount')->default(0)->after('tax_value');
            }
            if (!Schema::hasColumn('service_orders', 'grand_total')) {
                $table->bigInteger('grand_total')->default(0)->after('tax_amount');
            }
        });

        // Add to service_order_details table
        Schema::table('service_order_details', function (Blueprint $table) {
            if (!Schema::hasColumn('service_order_details', 'amount')) {
                $table->bigInteger('amount')->default(0)->after('price')->nullable();
            }
            if (!Schema::hasColumn('service_order_details', 'discount_type')) {
                $table->enum('discount_type', ['none', 'percent', 'fixed'])->default('none')->after('amount')->nullable();
            }
            if (!Schema::hasColumn('service_order_details', 'discount_value')) {
                $table->decimal('discount_value', 12, 2)->default(0)->after('discount_type')->nullable();
            }
            if (!Schema::hasColumn('service_order_details', 'discount_amount')) {
                $table->bigInteger('discount_amount')->default(0)->after('discount_value')->nullable();
            }
            if (!Schema::hasColumn('service_order_details', 'final_amount')) {
                $table->bigInteger('final_amount')->default(0)->after('discount_amount')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_orders', function (Blueprint $table) {
            $table->dropColumn([
                'discount_type', 'discount_value', 'discount_amount',
                'tax_type', 'tax_value', 'tax_amount', 'grand_total'
            ]);
        });

        Schema::table('service_order_details', function (Blueprint $table) {
            $table->dropColumn([
                'discount_type', 'discount_value', 'discount_amount', 'final_amount'
            ]);
        });
    }
};
