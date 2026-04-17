<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['part_sales', 'part_purchases', 'service_orders'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (!Schema::hasColumn($tableName, 'rounding_adjustment')) {
                    $table->bigInteger('rounding_adjustment')->default(0)->after('tax_amount');
                }
            });
        }
    }

    public function down(): void
    {
        foreach (['part_sales', 'part_purchases', 'service_orders'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (Schema::hasColumn($tableName, 'rounding_adjustment')) {
                    $table->dropColumn('rounding_adjustment');
                }
            });
        }
    }
};
