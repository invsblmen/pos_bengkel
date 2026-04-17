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
        Schema::table('part_purchases', function (Blueprint $table) {
            if (!Schema::hasColumn('part_purchases', 'discount_type')) {
                $table->enum('discount_type', ['none', 'percent', 'fixed'])->default('none')->after('notes');
            }

            if (!Schema::hasColumn('part_purchases', 'discount_value')) {
                $table->decimal('discount_value', 12, 2)->default(0)->after('discount_type');
            }

            if (!Schema::hasColumn('part_purchases', 'discount_amount')) {
                $table->bigInteger('discount_amount')->default(0)->after('discount_value');
            }

            if (!Schema::hasColumn('part_purchases', 'tax_type')) {
                $table->enum('tax_type', ['none', 'percent', 'fixed'])->default('none')->after('discount_amount');
            }

            if (!Schema::hasColumn('part_purchases', 'tax_value')) {
                $table->decimal('tax_value', 12, 2)->default(0)->after('tax_type');
            }

            if (!Schema::hasColumn('part_purchases', 'tax_amount')) {
                $table->bigInteger('tax_amount')->default(0)->after('tax_value');
            }

            if (!Schema::hasColumn('part_purchases', 'grand_total')) {
                $table->bigInteger('grand_total')->default(0)->after('tax_amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_purchases', function (Blueprint $table) {
            foreach ([
                'grand_total',
                'tax_amount',
                'tax_value',
                'tax_type',
                'discount_amount',
                'discount_value',
                'discount_type',
            ] as $column) {
                if (Schema::hasColumn('part_purchases', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
