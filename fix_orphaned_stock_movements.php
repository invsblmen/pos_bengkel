<?php

/**
 * Database Cleanup - Fix Orphaned PartStockMovement References
 * 
 * This script fixes part_stock_movements records that reference deleted models
 * (PartSale, Purchase) by either updating them to NULL or deleting them.
 * 
 * Orphaned Reference Types:
 * - App\Models\PartSale
 * - App\Models\Purchase
 * 
 * Usage:
 *   php fix_orphaned_stock_movements.php         # Check orphaned records
 *   php fix_orphaned_stock_movements.php --fix   # Set reference to NULL
 *   php fix_orphaned_stock_movements.php --delete # Delete orphaned records
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$shouldFix = in_array('--fix', $argv);
$shouldDelete = in_array('--delete', $argv);

echo "\n";
echo "=================================================================\n";
echo "  ORPHANED STOCK MOVEMENT REFERENCES CLEANUP SCRIPT\n";
echo "=================================================================\n";
echo "\n";

$orphanedModels = [
    'App\Models\PartSale',
    'App\Models\Purchase',
];

echo "Checking for orphaned references...\n\n";

foreach ($orphanedModels as $modelClass) {
    echo "Reference Type: {$modelClass}\n";
    echo str_repeat('-', 65) . "\n";
    
    try {
        $records = DB::table('part_stock_movements')
            ->where('reference_type', $modelClass)
            ->get();
        
        $count = $records->count();
        
        if ($count === 0) {
            echo "✓ No orphaned records found\n\n";
            continue;
        }
        
        echo "⚠️  Found {$count} orphaned record(s)\n\n";
        
        // Show sample records
        echo "Sample records (first 5):\n";
        foreach ($records->take(5) as $record) {
            echo "  ID: {$record->id}\n";
            echo "  Part ID: {$record->part_id}\n";
            echo "  Type: {$record->type}\n";
            echo "  Qty: {$record->qty}\n";
            echo "  Reference: {$record->reference_type} #{$record->reference_id}\n";
            echo "  Created: {$record->created_at}\n";
            echo "  ---\n";
        }
        
        if ($count > 5) {
            echo "  ... and " . ($count - 5) . " more\n";
        }
        
        echo "\n";
        
        if ($shouldFix) {
            echo "🔧 Fixing records (setting reference_type and reference_id to NULL)...\n";
            
            $updated = DB::table('part_stock_movements')
                ->where('reference_type', $modelClass)
                ->update([
                    'reference_type' => null,
                    'reference_id' => null,
                ]);
            
            echo "✅ Fixed {$updated} record(s)\n";
            
        } elseif ($shouldDelete) {
            echo "🗑️  Deleting records...\n";
            
            $deleted = DB::table('part_stock_movements')
                ->where('reference_type', $modelClass)
                ->delete();
            
            echo "✅ Deleted {$deleted} record(s)\n";
        }
        
    } catch (\Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

// Summary
echo "=================================================================\n";

if (!$shouldFix && !$shouldDelete) {
    echo "  DRY RUN - NO CHANGES MADE\n";
    echo "=================================================================\n";
    echo "\n";
    echo "What these orphaned records mean:\n";
    echo "  These stock movements reference deleted models (PartSale, Purchase).\n";
    echo "  The models were part of the old system that has been removed.\n";
    echo "\n";
    echo "Options:\n";
    echo "  1. Keep records, remove reference (RECOMMENDED):\n";
    echo "     php fix_orphaned_stock_movements.php --fix\n";
    echo "     • Preserves stock movement history\n";
    echo "     • Sets reference_type and reference_id to NULL\n";
    echo "     • Stock quantities remain accurate\n";
    echo "\n";
    echo "  2. Delete orphaned records (CAUTION):\n";
    echo "     php fix_orphaned_stock_movements.php --delete\n";
    echo "     • Removes orphaned stock movements entirely\n";
    echo "     • Historical data will be lost\n";
    echo "     • Only use if these are test/old data\n";
    echo "\n";
    echo "RECOMMENDATION: Use --fix to preserve history\n";
    
} elseif ($shouldFix) {
    echo "  CLEANUP COMPLETE - REFERENCES NULLIFIED\n";
    echo "=================================================================\n";
    echo "\n";
    echo "✅ All orphaned references have been set to NULL.\n";
    echo "   Stock movement records are preserved but no longer\n";
    echo "   reference deleted models.\n";
    
} elseif ($shouldDelete) {
    echo "  CLEANUP COMPLETE - RECORDS DELETED\n";
    echo "=================================================================\n";
    echo "\n";
    echo "✅ All orphaned stock movement records have been deleted.\n";
    echo "   ⚠️  Historical stock movement data for those records is lost.\n";
}

echo "\n";
echo "Context:\n";
echo "  The old Purchase and PartSale models have been removed.\n";
echo "  The active system now uses:\n";
echo "  - PartPurchase (for purchases)\n";
echo "  - PartSalesOrder (for sales)\n";
echo "\n";
echo "IMPORTANT:\n";
echo "  Records with orphaned references are HIDDEN from the Part Stock\n";
echo "  History page to prevent errors. They still exist in the database\n";
echo "  but won't display in the UI.\n";
echo "\n";
echo "  Running --fix will:\n";
echo "  • Make these records visible again (with no reference link)\n";
echo "  • Preserve all stock movement data\n";
echo "  • Maintain accurate stock quantities\n";
echo "\n";
echo "Next steps:\n";
echo "  1. Run --fix to make orphaned records visible: php fix_orphaned_stock_movements.php --fix\n";
echo "  2. Test the application: /dashboard/part-stock-history\n";
echo "  3. Verify stock movements display correctly\n";
echo "  4. Check that current stock quantities are accurate\n";
echo "\n";
