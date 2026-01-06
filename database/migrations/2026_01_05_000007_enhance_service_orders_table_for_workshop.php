<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('service_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('service_orders', 'actual_start_at')) {
                $table->timestamp('actual_start_at')->nullable()->after('estimated_finish_at');
            }
            if (!Schema::hasColumn('service_orders', 'actual_finish_at')) {
                $table->timestamp('actual_finish_at')->nullable()->after('actual_start_at');
            }
            if (!Schema::hasColumn('service_orders', 'labor_cost')) {
                $table->bigInteger('labor_cost')->default(0)->after('actual_finish_at');
            }
            if (!Schema::hasColumn('service_orders', 'material_cost')) {
                $table->bigInteger('material_cost')->default(0)->after('labor_cost');
            }
            if (!Schema::hasColumn('service_orders', 'warranty_period')) {
                $table->integer('warranty_period')->nullable()->after('material_cost'); // dalam hari
            }
            if (!Schema::hasColumn('service_orders', 'deleted_at')) {
                $table->softDeletes()->after('warranty_period');
            }
        });
    }

    public function down()
    {
        Schema::table('service_orders', function (Blueprint $table) {
            $columns = ['actual_start_at', 'actual_finish_at', 'labor_cost', 'material_cost', 'warranty_period', 'deleted_at'];
            $existing_columns = [];

            foreach ($columns as $col) {
                if (Schema::hasColumn('service_orders', $col)) {
                    $existing_columns[] = $col;
                }
            }

            if (!empty($existing_columns)) {
                $table->dropColumn($existing_columns);
            }
        });
    }
};
