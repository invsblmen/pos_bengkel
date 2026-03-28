<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('vouchers')) {
            Schema::create('vouchers', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('name');
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamp('starts_at')->nullable();
                $table->timestamp('ends_at')->nullable();
                $table->unsignedInteger('quota_total')->nullable();
                $table->unsignedInteger('quota_used')->default(0);
                $table->unsignedInteger('limit_per_customer')->nullable();
                $table->enum('discount_type', ['percent', 'fixed']);
                $table->decimal('discount_value', 12, 2)->default(0);
                $table->enum('scope', ['item_part', 'item_service', 'transaction'])->default('transaction');
                $table->bigInteger('min_purchase')->default(0);
                $table->bigInteger('max_discount')->nullable();
                $table->boolean('can_combine_with_discount')->default(false);
                $table->timestamps();

                $table->index(['is_active', 'starts_at', 'ends_at'], 'vouchers_active_period_idx');
                $table->index(['scope', 'discount_type'], 'vouchers_scope_type_idx');
            });
        }

        if (!Schema::hasTable('voucher_eligibilities')) {
            Schema::create('voucher_eligibilities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('voucher_id')->constrained('vouchers')->cascadeOnDelete();
                $table->string('eligible_type');
                $table->unsignedBigInteger('eligible_id');
                $table->timestamps();

                $table->unique(['voucher_id', 'eligible_type', 'eligible_id'], 'voucher_eligibilities_unique');
                $table->index(['eligible_type', 'eligible_id'], 'voucher_eligibilities_lookup_idx');
            });
        }

        if (!Schema::hasTable('voucher_usages')) {
            Schema::create('voucher_usages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('voucher_id')->constrained('vouchers')->cascadeOnDelete();
                $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
                $table->string('source_type');
                $table->unsignedBigInteger('source_id');
                $table->bigInteger('discount_amount')->default(0);
                $table->timestamp('used_at');
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->unique(['source_type', 'source_id'], 'voucher_usages_source_unique');
                $table->index(['voucher_id', 'customer_id'], 'voucher_usages_voucher_customer_idx');
            });
        }

        Schema::table('part_sales', function (Blueprint $table) {
            if (!Schema::hasColumn('part_sales', 'voucher_id')) {
                $table->foreignId('voucher_id')->nullable()->after('discount_amount')->constrained('vouchers')->nullOnDelete();
            }
            if (!Schema::hasColumn('part_sales', 'voucher_code')) {
                $table->string('voucher_code')->nullable()->after('voucher_id');
            }
            if (!Schema::hasColumn('part_sales', 'voucher_discount_amount')) {
                $table->bigInteger('voucher_discount_amount')->default(0)->after('voucher_code');
            }
        });

        Schema::table('service_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('service_orders', 'voucher_id')) {
                $table->foreignId('voucher_id')->nullable()->after('discount_amount')->constrained('vouchers')->nullOnDelete();
            }
            if (!Schema::hasColumn('service_orders', 'voucher_code')) {
                $table->string('voucher_code')->nullable()->after('voucher_id');
            }
            if (!Schema::hasColumn('service_orders', 'voucher_discount_amount')) {
                $table->bigInteger('voucher_discount_amount')->default(0)->after('voucher_code');
            }
        });
    }

    public function down(): void
    {
        Schema::table('service_orders', function (Blueprint $table) {
            if (Schema::hasColumn('service_orders', 'voucher_discount_amount')) {
                $table->dropColumn('voucher_discount_amount');
            }
            if (Schema::hasColumn('service_orders', 'voucher_code')) {
                $table->dropColumn('voucher_code');
            }
            if (Schema::hasColumn('service_orders', 'voucher_id')) {
                $table->dropConstrainedForeignId('voucher_id');
            }
        });

        Schema::table('part_sales', function (Blueprint $table) {
            if (Schema::hasColumn('part_sales', 'voucher_discount_amount')) {
                $table->dropColumn('voucher_discount_amount');
            }
            if (Schema::hasColumn('part_sales', 'voucher_code')) {
                $table->dropColumn('voucher_code');
            }
            if (Schema::hasColumn('part_sales', 'voucher_id')) {
                $table->dropConstrainedForeignId('voucher_id');
            }
        });

        Schema::dropIfExists('voucher_usages');
        Schema::dropIfExists('voucher_eligibilities');
        Schema::dropIfExists('vouchers');
    }
};
