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
            // FIFO tracking: link to source purchase detail (if not exists)
            if (!Schema::hasColumn('part_sale_details', 'source_purchase_detail_id')) {
                $table->unsignedBigInteger('source_purchase_detail_id')->nullable()->after('part_id');
                $table->foreign('source_purchase_detail_id')->references('id')->on('part_purchase_details')->onDelete('set null');
                $table->index('source_purchase_detail_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_sale_details', function (Blueprint $table) {
            if (Schema::hasColumn('part_sale_details', 'source_purchase_detail_id')) {
                $table->dropForeignKey(['source_purchase_detail_id']);
                $table->dropIndex(['source_purchase_detail_id']);
                $table->dropColumn('source_purchase_detail_id');
            }
        });
    }
};
