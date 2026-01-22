<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Tables already have all needed columns from previous migrations
        // Just need to clean up duplicate qty column in part_sale_details
        
        // Copy qty to quantity if needed
        DB::statement('UPDATE part_sale_details SET quantity = qty WHERE quantity = 0 AND qty > 0');
        
        // Drop old qty column if exists
        if (Schema::hasColumn('part_sale_details', 'qty')) {
            Schema::table('part_sale_details', function (Blueprint $table) {
                $table->dropColumn('qty');
            });
        }
        
        // Drop old total column from part_sales if exists (we use grand_total now)
        if (Schema::hasColumn('part_sales', 'total')) {
            // Copy to grand_total if needed
            DB::statement('UPDATE part_sales SET grand_total = total WHERE grand_total = 0 AND total > 0');
            
            Schema::table('part_sales', function (Blueprint $table) {
                $table->dropColumn('total');
            });
        }
    }

    public function down()
    {
        Schema::table('part_sales', function (Blueprint $table) {
            $table->dropColumn([
                'subtotal',
                'paid_amount',
                'remaining_amount',
                'payment_status',
                'status',
            ]);
        });

        Schema::table('part_sale_details', function (Blueprint $table) {
            $table->integer('qty')->after('part_id');
        });
        
        DB::statement('UPDATE part_sale_details SET qty = quantity');
    }
};
