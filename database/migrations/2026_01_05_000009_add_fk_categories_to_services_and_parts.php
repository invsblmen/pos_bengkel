<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Add FK to services -> service_categories
        Schema::table('services', function (Blueprint $table) {
            if (Schema::hasColumn('services', 'service_category_id') && Schema::hasTable('service_categories')) {
                $table->foreign('service_category_id')
                    ->references('id')
                    ->on('service_categories')
                    ->onDelete('set null');
            }
        });

        // Add FK to parts -> part_categories
        Schema::table('parts', function (Blueprint $table) {
            if (Schema::hasColumn('parts', 'part_category_id') && Schema::hasTable('part_categories')) {
                $table->foreign('part_category_id')
                    ->references('id')
                    ->on('part_categories')
                    ->onDelete('set null');
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

        Schema::table('parts', function (Blueprint $table) {
            if (Schema::hasColumn('parts', 'part_category_id')) {
                $table->dropForeign(['part_category_id']);
            }
        });
    }
};
