<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('service_order_id')->nullable()->after('invoice')->index();
            $table->unsignedBigInteger('mechanic_id')->nullable()->after('service_order_id')->index();
            $table->unsignedBigInteger('vehicle_id')->nullable()->after('mechanic_id')->index();

            $table->foreign('service_order_id')->references('id')->on('service_orders')->onDelete('set null');
            $table->foreign('mechanic_id')->references('id')->on('mechanics')->onDelete('set null');
            $table->foreign('vehicle_id')->references('id')->on('vehicles')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['service_order_id']);
            $table->dropForeign(['mechanic_id']);
            $table->dropForeign(['vehicle_id']);

            $table->dropColumn(['service_order_id', 'mechanic_id', 'vehicle_id']);
        });
    }
};
