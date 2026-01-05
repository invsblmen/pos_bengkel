<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('transaction_details', function (Blueprint $table) {
            $table->unsignedBigInteger('service_id')->nullable()->after('product_id')->index();
            $table->unsignedBigInteger('part_id')->nullable()->after('service_id')->index();

            $table->foreign('service_id')->references('id')->on('services')->onDelete('set null');
            $table->foreign('part_id')->references('id')->on('parts')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('transaction_details', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->dropForeign(['part_id']);

            $table->dropColumn(['service_id', 'part_id']);
        });
    }
};
