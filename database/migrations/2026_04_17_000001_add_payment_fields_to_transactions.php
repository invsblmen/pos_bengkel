<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('part_sales', function (Blueprint $table) {
            if (!Schema::hasColumn('part_sales', 'payment_method')) {
                $table->string('payment_method')->default('cash')->after('tax_amount');
            }
            if (!Schema::hasColumn('part_sales', 'paid_amount')) {
                $table->bigInteger('paid_amount')->default(0)->after('payment_method');
            }
            if (!Schema::hasColumn('part_sales', 'remaining_amount')) {
                $table->bigInteger('remaining_amount')->default(0)->after('paid_amount');
            }
            if (!Schema::hasColumn('part_sales', 'payment_status')) {
                $table->string('payment_status')->default('unpaid')->after('remaining_amount');
            }
        });

        Schema::table('part_purchases', function (Blueprint $table) {
            if (!Schema::hasColumn('part_purchases', 'payment_method')) {
                $table->string('payment_method')->default('cash')->after('grand_total');
            }
            if (!Schema::hasColumn('part_purchases', 'paid_amount')) {
                $table->bigInteger('paid_amount')->default(0)->after('payment_method');
            }
            if (!Schema::hasColumn('part_purchases', 'remaining_amount')) {
                $table->bigInteger('remaining_amount')->default(0)->after('paid_amount');
            }
            if (!Schema::hasColumn('part_purchases', 'payment_status')) {
                $table->string('payment_status')->default('unpaid')->after('remaining_amount');
            }
        });

        Schema::table('service_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('service_orders', 'payment_method')) {
                $table->string('payment_method')->default('cash')->after('grand_total');
            }
            if (!Schema::hasColumn('service_orders', 'paid_amount')) {
                $table->bigInteger('paid_amount')->default(0)->after('payment_method');
            }
            if (!Schema::hasColumn('service_orders', 'remaining_amount')) {
                $table->bigInteger('remaining_amount')->default(0)->after('paid_amount');
            }
            if (!Schema::hasColumn('service_orders', 'payment_status')) {
                $table->string('payment_status')->default('unpaid')->after('remaining_amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('part_sales', function (Blueprint $table) {
            if (Schema::hasColumn('part_sales', 'payment_status')) {
                $table->dropColumn('payment_status');
            }
            if (Schema::hasColumn('part_sales', 'remaining_amount')) {
                $table->dropColumn('remaining_amount');
            }
            if (Schema::hasColumn('part_sales', 'paid_amount')) {
                $table->dropColumn('paid_amount');
            }
            if (Schema::hasColumn('part_sales', 'payment_method')) {
                $table->dropColumn('payment_method');
            }
        });

        Schema::table('part_purchases', function (Blueprint $table) {
            if (Schema::hasColumn('part_purchases', 'payment_status')) {
                $table->dropColumn('payment_status');
            }
            if (Schema::hasColumn('part_purchases', 'remaining_amount')) {
                $table->dropColumn('remaining_amount');
            }
            if (Schema::hasColumn('part_purchases', 'paid_amount')) {
                $table->dropColumn('paid_amount');
            }
            if (Schema::hasColumn('part_purchases', 'payment_method')) {
                $table->dropColumn('payment_method');
            }
        });

        Schema::table('service_orders', function (Blueprint $table) {
            if (Schema::hasColumn('service_orders', 'payment_status')) {
                $table->dropColumn('payment_status');
            }
            if (Schema::hasColumn('service_orders', 'remaining_amount')) {
                $table->dropColumn('remaining_amount');
            }
            if (Schema::hasColumn('service_orders', 'paid_amount')) {
                $table->dropColumn('paid_amount');
            }
            if (Schema::hasColumn('service_orders', 'payment_method')) {
                $table->dropColumn('payment_method');
            }
        });
    }
};
