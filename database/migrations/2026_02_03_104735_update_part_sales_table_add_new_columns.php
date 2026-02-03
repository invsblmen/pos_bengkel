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
        Schema::table('part_sales', function (Blueprint $table) {
            // Check if columns exist before adding
            if (!Schema::hasColumn('part_sales', 'sale_number')) {
                $table->string('sale_number')->unique()->after('id');
            }
            if (!Schema::hasColumn('part_sales', 'customer_id')) {
                $table->foreignId('customer_id')->nullable()->after('sale_number')->constrained()->nullOnDelete();
            }
            if (!Schema::hasColumn('part_sales', 'sale_date')) {
                $table->date('sale_date')->after('customer_id');
            }
            if (!Schema::hasColumn('part_sales', 'part_sales_order_id')) {
                $table->foreignId('part_sales_order_id')->nullable()->after('sale_date')->constrained()->nullOnDelete();
            }
            if (!Schema::hasColumn('part_sales', 'subtotal')) {
                $table->bigInteger('subtotal')->default(0)->after('part_sales_order_id');
            }
            if (!Schema::hasColumn('part_sales', 'discount_type')) {
                $table->string('discount_type')->default('none')->after('subtotal');
            }
            if (!Schema::hasColumn('part_sales', 'discount_value')) {
                $table->decimal('discount_value', 12, 2)->default(0)->after('discount_type');
            }
            if (!Schema::hasColumn('part_sales', 'discount_amount')) {
                $table->bigInteger('discount_amount')->default(0)->after('discount_value');
            }
            if (!Schema::hasColumn('part_sales', 'tax_type')) {
                $table->string('tax_type')->default('none')->after('discount_amount');
            }
            if (!Schema::hasColumn('part_sales', 'tax_value')) {
                $table->decimal('tax_value', 12, 2)->default(0)->after('tax_type');
            }
            if (!Schema::hasColumn('part_sales', 'tax_amount')) {
                $table->bigInteger('tax_amount')->default(0)->after('tax_value');
            }
            if (!Schema::hasColumn('part_sales', 'grand_total')) {
                $table->bigInteger('grand_total')->default(0)->after('tax_amount');
            }
            if (!Schema::hasColumn('part_sales', 'paid_amount')) {
                $table->bigInteger('paid_amount')->default(0)->after('grand_total');
            }
            if (!Schema::hasColumn('part_sales', 'remaining_amount')) {
                $table->bigInteger('remaining_amount')->default(0)->after('paid_amount');
            }
            if (!Schema::hasColumn('part_sales', 'payment_status')) {
                $table->string('payment_status')->default('unpaid')->after('remaining_amount');
            }
            if (!Schema::hasColumn('part_sales', 'status')) {
                $table->string('status')->default('confirmed')->after('payment_status');
            }

            // Drop old columns if they exist
            if (Schema::hasColumn('part_sales', 'invoice')) {
                $table->dropColumn('invoice');
            }
            if (Schema::hasColumn('part_sales', 'total')) {
                $table->dropColumn('total');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('part_sales', function (Blueprint $table) {
            $table->dropColumn([
                'sale_number',
                'customer_id',
                'sale_date',
                'part_sales_order_id',
                'subtotal',
                'discount_type',
                'discount_value',
                'discount_amount',
                'tax_type',
                'tax_value',
                'tax_amount',
                'grand_total',
                'paid_amount',
                'remaining_amount',
                'payment_status',
                'status',
            ]);

            // Restore old columns
            $table->string('invoice')->unique();
            $table->bigInteger('total')->default(0);
        });
    }
};
