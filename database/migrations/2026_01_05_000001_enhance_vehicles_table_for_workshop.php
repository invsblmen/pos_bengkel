<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('vehicles', function (Blueprint $table) {
            if (!Schema::hasColumn('vehicles', 'engine_type')) {
                $table->string('engine_type')->nullable()->after('model'); // e.g., '4-stroke', '2-stroke'
            }
            if (!Schema::hasColumn('vehicles', 'transmission_type')) {
                $table->enum('transmission_type', ['manual', 'automatic'])->nullable()->after('engine_type');
            }
            if (!Schema::hasColumn('vehicles', 'color')) {
                $table->string('color')->nullable()->after('transmission_type');
            }
            if (!Schema::hasColumn('vehicles', 'cylinder_volume')) {
                $table->string('cylinder_volume')->nullable()->after('color'); // e.g., '110cc', '150cc'
            }
            if (!Schema::hasColumn('vehicles', 'last_service_date')) {
                $table->date('last_service_date')->nullable()->after('km');
            }
            if (!Schema::hasColumn('vehicles', 'next_service_date')) {
                $table->date('next_service_date')->nullable()->after('last_service_date');
            }
            if (!Schema::hasColumn('vehicles', 'features')) {
                $table->text('features')->nullable()->after('next_service_date'); // JSON: disk brake, ABS, dll
            }
        });
    }

    public function down()
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $columns = ['engine_type', 'transmission_type', 'color', 'cylinder_volume', 'last_service_date', 'next_service_date', 'features'];
            $existing_columns = [];

            foreach ($columns as $col) {
                if (Schema::hasColumn('vehicles', $col)) {
                    $existing_columns[] = $col;
                }
            }

            if (!empty($existing_columns)) {
                $table->dropColumn($existing_columns);
            }
        });
    }
};
