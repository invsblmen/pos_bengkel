<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('service_order_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('service_order_id')->index();
            $table->unsignedBigInteger('service_id')->nullable()->index();
            $table->unsignedBigInteger('part_id')->nullable()->index();
            $table->integer('qty')->default(1);
            $table->bigInteger('price')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('service_order_id')->references('id')->on('service_orders')->onDelete('cascade');
            $table->foreign('service_id')->references('id')->on('services')->onDelete('set null');
            $table->foreign('part_id')->references('id')->on('parts')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('service_order_details');
    }
};
