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
        Schema::table('part_sale_details', function (Blueprint $table) {
            // Rename qty to quantity if exists
            if (Schema::hasColumn('part_sale_details', 'qty') && !Schema::hasColumn('part_sale_details', 'quantity')) {
                $table->renameColumn('qty', 'quantity');
            }

            // Add discount columns
            if (!Schema::hasColumn('part_sale_details', 'discount_type')) {
                $table->string('discount_type')->default('none')->after('subtotal');
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

            // Add cost and profit tracking
            if (!Schema::hasColumn('part_sale_details', 'source_purchase_detail_id')) {
                $table->foreignId('source_purchase_detail_id')->nullable()->after('final_amount')->constrained('part_purchase_details')->nullOnDelete();
            }
            if (!Schema::hasColumn('part_sale_details', 'cost_price')) {
                $table->bigInteger('cost_price')->default(0)->after('source_purchase_detail_id');
            }
            if (!Schema::hasColumn('part_sale_details', 'selling_price')) {
                $table->bigInteger('selling_price')->default(0)->after('cost_price');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_sale_details', function (Blueprint $table) {
            if (Schema::hasColumn('part_sale_details', 'quantity') && !Schema::hasColumn('part_sale_details', 'qty')) {
                $table->renameColumn('quantity', 'qty');
            }

            $table->dropColumn([
                'discount_type',
                'discount_value',
                'discount_amount',
                'final_amount',
                'source_purchase_detail_id',
                'cost_price',
                'selling_price',
            ]);
        });
    }
};
