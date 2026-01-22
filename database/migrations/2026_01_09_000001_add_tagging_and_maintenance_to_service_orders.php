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
        // Tags table
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('color')->default('gray'); // For UI styling
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Service Order Tags (pivot table)
        Schema::create('service_order_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['service_order_id', 'tag_id']);
        });

        // Add maintenance tracking to service_orders
        Schema::table('service_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('service_orders', 'maintenance_type')) {
                $table->string('maintenance_type')->nullable()->after('notes'); // e.g., routine, emergency, warranty
            }
            if (!Schema::hasColumn('service_orders', 'next_service_km')) {
                $table->integer('next_service_km')->nullable()->after('maintenance_type');
            }
            if (!Schema::hasColumn('service_orders', 'next_service_date')) {
                $table->date('next_service_date')->nullable()->after('next_service_km');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_order_tags');
        Schema::dropIfExists('tags');

        Schema::table('service_orders', function (Blueprint $table) {
            if (Schema::hasColumn('service_orders', 'maintenance_type')) {
                $table->dropColumn('maintenance_type');
            }
            if (Schema::hasColumn('service_orders', 'next_service_km')) {
                $table->dropColumn('next_service_km');
            }
            if (Schema::hasColumn('service_orders', 'next_service_date')) {
                $table->dropColumn('next_service_date');
            }
        });
    }
};
