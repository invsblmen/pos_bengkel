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
        Schema::table('part_purchase_details', function (Blueprint $table) {
            $table->enum('margin_type', ['percent', 'fixed'])->default('percent')->after('final_amount');
            $table->decimal('margin_value', 12, 2)->default(0)->after('margin_type')->comment('Markup/Margin for selling price');
            $table->enum('promo_discount_type', ['none', 'percent', 'fixed'])->default('none')->after('margin_value')->comment('Promotional discount type for this batch');
            $table->decimal('promo_discount_value', 12, 2)->default(0)->after('promo_discount_type')->comment('Promotional discount amount/percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_purchase_details', function (Blueprint $table) {
            $table->dropColumn(['margin_type', 'margin_value', 'promo_discount_type', 'promo_discount_value']);
        });
    }
};
