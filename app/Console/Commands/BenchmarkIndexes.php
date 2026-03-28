<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class BenchmarkIndexes extends Command
{
    protected $signature = 'db:benchmark-indexes';

    protected $description = 'Benchmark database indexes and query performance';

    protected array $benchmarks = [];

    public function handle()
    {
        $this->info("\n" . str_repeat("=", 80));
        $this->info("DATABASE INDEX & QUERY PERFORMANCE REVIEW");
        $this->info("Generated: " . Carbon::now()->format('Y-m-d H:i:s'));
        $this->info(str_repeat("=", 80) . "\n");

        $this->reviewIndexes();
        $this->benchmarkQueries();
        $this->recommendations();
        $this->summary();

        $this->info("\n" . str_repeat("=", 80));
        $this->info("Review Complete");
        $this->info(str_repeat("=", 80) . "\n");
    }

    private function reviewIndexes()
    {
        $this->info("\n[1] EXISTING INDEXES BY TABLE");
        $this->info(str_repeat("-", 80) . "\n");

        $tables = [
            'warranty_registrations',
            'vouchers',
            'voucher_eligibilities',
            'voucher_usages',
            'service_orders',
            'part_sales',
        ];

        foreach ($tables as $table) {
            if (!Schema::hasTable($table)) {
                $this->line("Table '$table' does not exist.");
                continue;
            }

            $this->line("Table: <info>$table</info>");
            
            try {
                $indexes = $this->getTableIndexes($table);

                if (empty($indexes)) {
                    $this->line("  No indexes found.\n");
                    continue;
                }

                foreach ($indexes as $index) {
                    $this->line("  - Index: <info>{$index['name']}</info>");
                    $this->line("    Columns: " . implode(', ', $index['columns']));
                    $this->line("    Unique: " . ($index['unique'] ? 'Yes' : 'No') . "\n");
                }
            } catch (\Exception $e) {
                $this->line("  Error reading indexes: {$e->getMessage()}\n");
            }
        }
    }

    private function getTableIndexes(string $table): array
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            $indexes = DB::select("PRAGMA index_list($table)");
            $mapped = [];
            foreach ($indexes as $index) {
                $indexInfo = DB::select("PRAGMA index_info({$index->name})");
                $columns = [];
                foreach ($indexInfo as $col) {
                    $columns[] = $col->name;
                }

                $mapped[] = [
                    'name' => $index->name,
                    'columns' => $columns,
                    'unique' => (bool) $index->unique,
                ];
            }

            return $mapped;
        }

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            $database = DB::getDatabaseName();
            $rows = DB::select(
                'SELECT INDEX_NAME, NON_UNIQUE, COLUMN_NAME, SEQ_IN_INDEX
                 FROM information_schema.statistics
                 WHERE table_schema = ? AND table_name = ?
                 ORDER BY INDEX_NAME, SEQ_IN_INDEX',
                [$database, $table]
            );

            $grouped = [];
            foreach ($rows as $row) {
                if (!isset($grouped[$row->INDEX_NAME])) {
                    $grouped[$row->INDEX_NAME] = [
                        'name' => $row->INDEX_NAME,
                        'columns' => [],
                        'unique' => ((int) $row->NON_UNIQUE) === 0,
                    ];
                }

                $grouped[$row->INDEX_NAME]['columns'][] = $row->COLUMN_NAME;
            }

            return array_values($grouped);
        }

        return [];
    }

    private function benchmarkQueries()
    {
        $this->info("\n[2] CRITICAL QUERY BENCHMARKS");
        $this->info(str_repeat("-", 80) . "\n");

        $benchmarks = array();

        // Warranty lookup
        $this->line("Query 1: Get warranty registration by service order");
        $start = microtime(true);
        for ($i = 0; $i < 100; $i++) {
            DB::table('warranty_registrations')
                ->where('source_type', 'App\\Models\\ServiceOrder')
                ->where('source_id', 1)
                ->get();
        }
        $duration = (microtime(true) - $start) * 1000;
        $benchmarks['warranty_lookup'] = $duration;
        $this->line("  100 iterations: " . number_format($duration, 2) . "ms\n");

        // Voucher validation
        $this->line("Query 2: Validate active voucher");
        $start = microtime(true);
        for ($i = 0; $i < 100; $i++) {
            DB::table('vouchers')
                ->where('code', 'TEST')
                ->where('is_active', true)
                ->first();
        }
        $duration = (microtime(true) - $start) * 1000;
        $benchmarks['voucher_validation'] = $duration;
        $this->line("  100 iterations: " . number_format($duration, 2) . "ms\n");

        // Voucher usage count
        $this->line("Query 3: Check voucher usage quota");
        $start = microtime(true);
        for ($i = 0; $i < 100; $i++) {
            DB::table('voucher_usages')
                ->where('voucher_id', 1)
                ->count();
        }
        $duration = (microtime(true) - $start) * 1000;
        $benchmarks['voucher_usage_count'] = $duration;
        $this->line("  100 iterations: " . number_format($duration, 2) . "ms\n");

        // Service order lookup
        $this->line("Query 4: Get service order");
        $start = microtime(true);
        for ($i = 0; $i < 50; $i++) {
            DB::table('service_orders')
                ->where('id', 1)
                ->first();
        }
        $duration = (microtime(true) - $start) * 1000;
        $benchmarks['service_order_load'] = $duration;
        $this->line("  50 iterations: " . number_format($duration, 2) . "ms\n");

        $this->benchmarks = $benchmarks;
    }

    private function recommendations()
    {
        $this->info("\n[3] INDEX RECOMMENDATIONS");
        $this->info(str_repeat("-", 80) . "\n");

        $this->line("Table: <info>warranty_registrations</info>");
        $this->line("  - source_type + source_id (for quick lookup by transaction)");
        $this->line("  - customer_id (for filtering customer warranties)");
        $this->line("  - status (for filtering active/expired warranties)\n");

        $this->line("Table: <info>vouchers</info>");
        $this->line("  - code (should be unique for fast validation)");
        $this->line("  - is_active (for active voucher queries)\n");

        $this->line("Table: <info>voucher_usages</info>");
        $this->line("  - voucher_id + customer_id (for per-customer limit checks)");
        $this->line("  - source_type + source_id (for anti-reuse)\n");
    }

    private function summary()
    {
        $this->info("\n[4] PERFORMANCE SUMMARY");
        $this->info(str_repeat("-", 80) . "\n");

        $this->line("Benchmark Results:");
        if (isset($this->benchmarks) && is_array($this->benchmarks)) {
            $totalTime = 0;
            foreach ($this->benchmarks as $name => $duration) {
                $totalTime += $duration;
                $this->line("  $name: " . number_format($duration, 2) . "ms");
            }
            $this->line("  Total: " . number_format($totalTime, 2) . "ms\n");
        }

        $this->line("Recommendations for next phase:");
        $this->line("  1. Add composite indexes for warranty_registrations queries");
        $this->line("  2. Monitor query performance as data grows");
        $this->line("  3. Implement query result caching for frequently accessed data");
        $this->line("  4. Use query analysis tools (EXPLAIN) for production queries");
    }
}
