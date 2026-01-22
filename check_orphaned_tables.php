<?php

/**
 * Database Cleanup Script
 *
 * This script checks and optionally drops orphaned database tables that no longer have
 * corresponding models or controllers after the cleanup process.
 *
 * Orphaned Tables:
 * - purchases
 * - purchase_details
 *
 * Usage:
 *   php check_orphaned_tables.php         # Check if tables have data
 *   php check_orphaned_tables.php --drop  # Drop the orphaned tables
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$shouldDrop = in_array('--drop', $argv);

echo "\n";
echo "=================================================\n";
echo "  ORPHANED DATABASE TABLES CLEANUP SCRIPT\n";
echo "=================================================\n";
echo "\n";

$orphanedTables = ['purchases', 'purchase_details'];

foreach ($orphanedTables as $table) {
    echo "Checking table: {$table}\n";
    echo str_repeat('-', 50) . "\n";

    if (!Schema::hasTable($table)) {
        echo "✓ Table '{$table}' does not exist (already dropped)\n\n";
        continue;
    }

    try {
        $count = DB::table($table)->count();

        echo "Table exists: YES\n";
        echo "Row count: {$count}\n";

        if ($count > 0) {
            echo "⚠️  WARNING: Table has {$count} records!\n";
            echo "   You may want to backup or migrate this data before dropping.\n";

            // Show sample data
            $sample = DB::table($table)->limit(3)->get();
            echo "\n   Sample data (first 3 rows):\n";
            foreach ($sample as $row) {
                echo "   - " . json_encode($row) . "\n";
            }
        } else {
            echo "✓ Table is empty\n";
        }

        if ($shouldDrop) {
            if ($count > 0) {
                echo "\n❌ SKIPPING DROP: Table has data. Use --force-drop to override.\n";
            } else {
                echo "\n🗑️  Dropping table '{$table}'...\n";
                Schema::dropIfExists($table);
                echo "✅ Table '{$table}' dropped successfully!\n";
            }
        }

    } catch (\Exception $e) {
        echo "❌ Error checking table: " . $e->getMessage() . "\n";
    }

    echo "\n";
}

if (!$shouldDrop) {
    echo "\n";
    echo "=================================================\n";
    echo "  NO ACTION TAKEN (DRY RUN)\n";
    echo "=================================================\n";
    echo "\n";
    echo "To drop empty orphaned tables, run:\n";
    echo "  php check_orphaned_tables.php --drop\n";
    echo "\n";
    echo "IMPORTANT:\n";
    echo "  • Tables with data will NOT be dropped\n";
    echo "  • Backup your database first\n";
    echo "  • Review the data above before proceeding\n";
    echo "\n";
} else {
    echo "\n";
    echo "=================================================\n";
    echo "  CLEANUP COMPLETE\n";
    echo "=================================================\n";
    echo "\n";
}

echo "Context:\n";
echo "  These tables were created for the old Purchase/PartSale\n";
echo "  system that has been removed. The active system now uses:\n";
echo "  - PartPurchase / PartPurchaseDetail models\n";
echo "  - PartSalesOrder / PartSalesOrderDetail models\n";
echo "\n";
