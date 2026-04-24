<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Add to part_purchases
        Schema::table('part_purchases', function (Blueprint $table) {
            if (!Schema::hasColumn('part_purchases', 'transfer_destination')) {
                $table->string('transfer_destination')->nullable()->after('payment_status');
            }
        });

        // Add to part_sales
        Schema::table('part_sales', function (Blueprint $table) {
            if (!Schema::hasColumn('part_sales', 'transfer_destination')) {
                $table->string('transfer_destination')->nullable()->after('payment_status');
            }
        });

        // Add to service_orders
        Schema::table('service_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('service_orders', 'transfer_destination')) {
                $table->string('transfer_destination')->nullable()->after('payment_status');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('part_purchases', function (Blueprint $table) {
            if (Schema::hasColumn('part_purchases', 'transfer_destination')) {
                $table->dropColumn('transfer_destination');
            }
        });

        Schema::table('part_sales', function (Blueprint $table) {
            if (Schema::hasColumn('part_sales', 'transfer_destination')) {
                $table->dropColumn('transfer_destination');
            }
        });

        Schema::table('service_orders', function (Blueprint $table) {
            if (Schema::hasColumn('service_orders', 'transfer_destination')) {
                $table->dropColumn('transfer_destination');
            }
        });
    }
};
