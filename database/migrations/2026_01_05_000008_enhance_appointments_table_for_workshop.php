<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('appointments', function (Blueprint $table) {
            if (!Schema::hasColumn('appointments', 'appointment_number')) {
                $table->string('appointment_number')->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('appointments', 'appointment_date')) {
                $table->date('appointment_date')->nullable()->after('appointment_number');
            }
            if (!Schema::hasColumn('appointments', 'appointment_time')) {
                $table->time('appointment_time')->nullable()->after('appointment_date');
            }
            if (Schema::hasColumn('appointments', 'scheduled_at')) {
                // scheduled_at akan di-update untuk sesuai dengan appointment_date dan appointment_time
            }
            if (!Schema::hasColumn('appointments', 'description')) {
                $table->text('description')->nullable()->after('appointment_time');
            }
            if (!Schema::hasColumn('appointments', 'status')) {
                $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending')->after('notes');
            }
        });
    }

    public function down()
    {
        Schema::table('appointments', function (Blueprint $table) {
            $columns = ['appointment_number', 'appointment_date', 'appointment_time', 'description'];
            $existing_columns = [];

            foreach ($columns as $col) {
                if (Schema::hasColumn('appointments', $col)) {
                    $existing_columns[] = $col;
                }
            }

            if (!empty($existing_columns)) {
                $table->dropColumn($existing_columns);
            }
        });
    }
};
