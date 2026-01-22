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
        Schema::table('customers', function (Blueprint $table) {
            // Drop old no_telp column since phone already exists
            if (Schema::hasColumn('customers', 'no_telp')) {
                $table->dropColumn('no_telp');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Restore no_telp column
            if (!Schema::hasColumn('customers', 'no_telp')) {
                $table->bigInteger('no_telp')->after('name');
            }
        });
    }
};
