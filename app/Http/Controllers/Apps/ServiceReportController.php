<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use App\Models\Mechanic;
use App\Models\Part;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ServiceReportController extends Controller
{
    /**
     * Service Revenue Report
     */
    public function revenue(Request $request)
    {
        $startDate = $request->get('start_date', now()->firstOfMonth());
        $endDate = $request->get('end_date', now());
        $period = $request->get('period', 'daily'); // daily, weekly, monthly

        $startDate = Carbon::parse($startDate)->startOfDay();
        $endDate = Carbon::parse($endDate)->endOfDay();

        // Build query - include both completed and paid orders
        $query = ServiceOrder::whereIn('status', ['completed', 'paid'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        // Group by period
        if ($period === 'daily') {
            $data = $query->selectRaw('DATE(created_at) as date, COUNT(*) as count, SUM(total) as revenue, SUM(labor_cost) as labor_cost, SUM(material_cost) as material_cost')
                ->groupByRaw('DATE(created_at)')
                ->orderBy('date')
                ->get();
        } elseif ($period === 'weekly') {
            $data = $query->selectRaw('YEAR(created_at) as year, WEEK(created_at) as week, COUNT(*) as count, SUM(total) as revenue, SUM(labor_cost) as labor_cost, SUM(material_cost) as material_cost')
                ->groupByRaw('YEAR(created_at), WEEK(created_at)')
                ->orderBy('year')
                ->orderBy('week')
                ->get();
        } else { // monthly
            $data = $query->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as count, SUM(total) as revenue, SUM(labor_cost) as labor_cost, SUM(material_cost) as material_cost')
                ->groupByRaw('YEAR(created_at), MONTH(created_at)')
                ->orderBy('year')
                ->orderBy('month')
                ->get();
        }

        // Summary stats - rebuild query without groupBy/orderBy
        $summaryQuery = ServiceOrder::whereIn('status', ['completed', 'paid'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        $totalRevenue = $summaryQuery->sum('total');
        $totalOrders = $summaryQuery->count();
        $totalLaborCost = $summaryQuery->sum('labor_cost');
        $totalMaterialCost = $summaryQuery->sum('material_cost');
        $averageOrderValue = $totalOrders > 0 ? round($totalRevenue / $totalOrders) : 0;

        return inertia('Dashboard/Reports/ServiceRevenue', [
            'report_data' => $data,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'period' => $period,
            ],
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'total_labor_cost' => $totalLaborCost,
                'total_material_cost' => $totalMaterialCost,
                'average_order_value' => $averageOrderValue,
            ],
        ]);
    }

    /**
     * Mechanic Productivity Report
     */
    public function mechanicProductivity(Request $request)
    {
        $startDate = $request->get('start_date', now()->firstOfMonth());
        $endDate = $request->get('end_date', now());

        $startDate = Carbon::parse($startDate)->startOfDay();
        $endDate = Carbon::parse($endDate)->endOfDay();

        $mechanics = Mechanic::with(['serviceOrders' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate])->whereIn('status', ['completed', 'paid']);
        }])
        ->get()
        ->map(function ($mechanic) {
            $totalLaborCost = $mechanic->serviceOrders->sum('labor_cost');
            $totalMaterialCost = $mechanic->serviceOrders->sum('material_cost');

            return [
                'id' => $mechanic->id,
                'name' => $mechanic->name,
                'specialty' => $mechanic->specialty,
                'total_orders' => $mechanic->serviceOrders->count(),
                'total_revenue' => $mechanic->serviceOrders->sum('total'),
                'total_labor_cost' => $totalLaborCost,
                'total_material_cost' => $totalMaterialCost,
                'total_labor_cost' => $mechanic->serviceOrders->sum('labor_cost'),
                'average_order_value' => $mechanic->serviceOrders->count() > 0
                    ? round($mechanic->serviceOrders->sum('total') / $mechanic->serviceOrders->count())
                    : 0,
            ];
        })
        ->sortByDesc('total_revenue')
        ->values();

        return inertia('Dashboard/Reports/MechanicProductivity', [
            'mechanics' => $mechanics,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
            'summary' => [
                'total_mechanics' => $mechanics->count(),
                'total_revenue' => $mechanics->sum('total_revenue'),
                'total_orders' => $mechanics->sum('total_orders'),
            ],
        ]);
    }

    /**
     * Parts Inventory Analysis Report
     */
    public function partsInventory(Request $request)
    {
        $parts = Part::with('category')
            ->get()
            ->map(function ($part) {
                return [
                    'id' => $part->id,
                    'name' => $part->name,
                    'category' => $part->category?->name,
                    'stock' => $part->stock,
                    'reorder_level' => $part->reorder_level ?? 10,
                    'price' => $part->price,
                    'stock_value' => ($part->stock ?? 0) * ($part->price ?? 0),
                    'status' => $part->stock <= ($part->reorder_level ?? 10) ? 'low' : 'good',
                ];
            });

        // Filter by status if requested
        if ($request->get('status') === 'low') {
            $parts = $parts->filter(fn($p) => $p['status'] === 'low');
        }

        return inertia('Dashboard/Reports/PartsInventory', [
            'parts' => $parts->values(),
            'filters' => [
                'status' => $request->get('status', 'all'),
            ],
            'summary' => [
                'total_parts' => $parts->count(),
                'total_stock_value' => $parts->sum('stock_value'),
                'low_stock_items' => $parts->where('status', 'low')->count(),
            ],
        ]);
    }

    /**
     * Outstanding Payments Report
     */
    public function outstandingPayments(Request $request)
    {
        // Outstanding = completed but not paid yet
        $orders = ServiceOrder::with('customer', 'vehicle')
            ->where('status', 'completed')
            ->orderByDesc('created_at')
            ->paginate(20);

        $orders->getCollection()->transform(function ($order) {
            $createdAt = Carbon::parse($order->created_at);
            $daysOutstanding = $createdAt->diffInDays(now(), false); // false = unsigned

            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer?->name,
                'vehicle_plate' => $order->vehicle?->plate_number,
                'total' => $order->total,
                'labor_cost' => $order->labor_cost ?? 0,
                'material_cost' => $order->material_cost ?? 0,
                'status' => $order->status,
                'days_outstanding' => max(0, floor($daysOutstanding)), // Round down and ensure non-negative
                'created_at' => $order->created_at,
            ];
        });

        $totalOutstanding = ServiceOrder::where('status', 'completed')
            ->sum('total');

        return inertia('Dashboard/Reports/OutstandingPayments', [
            'orders' => $orders,
            'summary' => [
                'total_outstanding' => $totalOutstanding,
                'count_outstanding' => ServiceOrder::where('status', 'completed')
                    ->count(),
            ],
        ]);
    }

    /**
     * Export report to CSV
     */
    public function exportCsv(Request $request)
    {
        $type = $request->get('type', 'revenue');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $filename = $type . '_report_' . now()->format('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=$filename",
        ];

        $callback = function () use ($type, $startDate, $endDate) {
            $file = fopen('php://output', 'w');

            if ($type === 'revenue') {
                fputcsv($file, ['Tanggal', 'Jumlah Pesanan', 'Pendapatan', 'Biaya Tenaga Kerja', 'Biaya Material']);
                // Get revenue data
                $data = ServiceOrder::whereIn('status', ['completed', 'paid'])
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->selectRaw('DATE(created_at) as date, COUNT(*) as count, SUM(total) as revenue, SUM(labor_cost) as labor_cost, SUM(material_cost) as material_cost')
                    ->groupByRaw('DATE(created_at)')
                    ->get();

                foreach ($data as $row) {
                    fputcsv($file, [$row->date, $row->count, $row->revenue, $row->labor_cost, $row->material_cost]);
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
