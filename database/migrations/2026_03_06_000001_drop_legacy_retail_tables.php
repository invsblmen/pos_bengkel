<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $legacyTables = [
            'transaction_details',
            'transactions',
            'carts',
            'profits',
            'purchase_details',
            'purchases',
            'products',
            'categories',
        ];

        Schema::disableForeignKeyConstraints();

        foreach ($legacyTables as $table) {
            Schema::dropIfExists($table);
        }

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Intentionally left empty: legacy retail tables are removed permanently.
    }
};
