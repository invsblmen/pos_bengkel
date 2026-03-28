<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parts', function (Blueprint $table) {
            if (!Schema::hasColumn('parts', 'has_warranty')) {
                $table->boolean('has_warranty')->default(false)->after('status');
            }
            if (!Schema::hasColumn('parts', 'warranty_duration_days')) {
                $table->unsignedInteger('warranty_duration_days')->nullable()->after('has_warranty');
            }
            if (!Schema::hasColumn('parts', 'warranty_terms')) {
                $table->text('warranty_terms')->nullable()->after('warranty_duration_days');
            }
        });

        Schema::table('services', function (Blueprint $table) {
            if (!Schema::hasColumn('services', 'has_warranty')) {
                $table->boolean('has_warranty')->default(false)->after('status');
            }
            if (!Schema::hasColumn('services', 'warranty_duration_days')) {
                $table->unsignedInteger('warranty_duration_days')->nullable()->after('has_warranty');
            }
            if (!Schema::hasColumn('services', 'warranty_terms')) {
                $table->text('warranty_terms')->nullable()->after('warranty_duration_days');
            }
        });
    }

    public function down(): void
    {
        Schema::table('parts', function (Blueprint $table) {
            if (Schema::hasColumn('parts', 'warranty_terms')) {
                $table->dropColumn('warranty_terms');
            }
            if (Schema::hasColumn('parts', 'warranty_duration_days')) {
                $table->dropColumn('warranty_duration_days');
            }
            if (Schema::hasColumn('parts', 'has_warranty')) {
                $table->dropColumn('has_warranty');
            }
        });

        Schema::table('services', function (Blueprint $table) {
            if (Schema::hasColumn('services', 'warranty_terms')) {
                $table->dropColumn('warranty_terms');
            }
            if (Schema::hasColumn('services', 'warranty_duration_days')) {
                $table->dropColumn('warranty_duration_days');
            }
            if (Schema::hasColumn('services', 'has_warranty')) {
                $table->dropColumn('has_warranty');
            }
        });
    }
};
