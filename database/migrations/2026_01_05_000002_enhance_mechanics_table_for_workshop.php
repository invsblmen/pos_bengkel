<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('mechanics', function (Blueprint $table) {
            if (!Schema::hasColumn('mechanics', 'status')) {
                $table->enum('status', ['active', 'inactive', 'on_leave'])->default('active')->after('employee_number');
            }
            if (!Schema::hasColumn('mechanics', 'specialization')) {
                $table->json('specialization')->nullable()->after('status'); // JSON array: ['mesin', 'transmisi', 'listrik']
            }
            if (!Schema::hasColumn('mechanics', 'hourly_rate')) {
                $table->integer('hourly_rate')->nullable()->default(0)->after('specialization');
            }
            if (!Schema::hasColumn('mechanics', 'commission_percentage')) {
                $table->decimal('commission_percentage', 5, 2)->nullable()->default(0)->after('hourly_rate');
            }
            if (!Schema::hasColumn('mechanics', 'certification')) {
                $table->json('certification')->nullable()->after('commission_percentage'); // JSON array
            }
            if (!Schema::hasColumn('mechanics', 'email')) {
                $table->string('email')->nullable()->unique()->after('phone');
            }
        });
    }

    public function down()
    {
        Schema::table('mechanics', function (Blueprint $table) {
            $columns = ['status', 'specialization', 'hourly_rate', 'commission_percentage', 'certification', 'email'];
            $existing_columns = [];

            foreach ($columns as $col) {
                if (Schema::hasColumn('mechanics', $col)) {
                    $existing_columns[] = $col;
                }
            }

            if (!empty($existing_columns)) {
                if (in_array('email', $existing_columns)) {
                    $table->dropUnique(['email']);
                }
                $table->dropColumn($existing_columns);
            }
        });
    }
};
