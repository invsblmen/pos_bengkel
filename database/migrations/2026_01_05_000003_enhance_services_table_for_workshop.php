<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('services', function (Blueprint $table) {
            if (!Schema::hasColumn('services', 'service_category_id')) {
                $table->unsignedBigInteger('service_category_id')->nullable()->after('code')->index();
            }
            if (!Schema::hasColumn('services', 'complexity_level')) {
                $table->enum('complexity_level', ['easy', 'medium', 'hard'])->default('medium')->after('est_time_minutes');
            }
            if (!Schema::hasColumn('services', 'required_tools')) {
                $table->json('required_tools')->nullable()->after('complexity_level');
            }
            if (!Schema::hasColumn('services', 'status')) {
                $table->enum('status', ['active', 'inactive'])->default('active')->after('required_tools');
            }
            if (!Schema::hasColumn('services', 'deleted_at')) {
                $table->softDeletes()->after('status');
            }
        });

    }

    public function down()
    {
        Schema::table('services', function (Blueprint $table) {
            if (Schema::hasColumn('services', 'service_category_id')) {
                $table->dropForeign(['service_category_id']);
            }
        });

        Schema::table('services', function (Blueprint $table) {
            $columns = ['service_category_id', 'complexity_level', 'required_tools', 'status', 'deleted_at'];
            $existing_columns = [];

            foreach ($columns as $col) {
                if (Schema::hasColumn('services', $col)) {
                    $existing_columns[] = $col;
                }
            }

            if (!empty($existing_columns)) {
                $table->dropColumn($existing_columns);
            }
        });
    }
};
