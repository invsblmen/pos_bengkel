<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Mechanic;
use App\Models\ServiceOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MechanicPerformanceController extends Controller
{
    /**
     * Display mechanic performance dashboard
     */
    public function dashboard()
    {
        $mechanics = Mechanic::with(['serviceOrders' => function ($query) {
            $query->withCount('details');
        }])
        ->get()
        ->map(function ($mechanic) {
            return [
                'id' => $mechanic->id,
                'name' => $mechanic->name,
                'specialty' => $mechanic->specialty,
                'phone' => $mechanic->phone,
                'status' => $mechanic->status,
                'total_service_orders' => $mechanic->serviceOrders->count(),
                'completed_orders' => $mechanic->serviceOrders->where('status', 'completed')->count(),
                'pending_orders' => $mechanic->serviceOrders->where('status', 'pending')->count(),
                'in_progress_orders' => $mechanic->serviceOrders->where('status', 'in_progress')->count(),
                'total_earnings' => $mechanic->serviceOrders->sum('total'),
                'total_labor_cost' => $mechanic->serviceOrders->sum('labor_cost'),
                'average_order_value' => $mechanic->serviceOrders->count() > 0
                    ? round($mechanic->serviceOrders->sum('total') / $mechanic->serviceOrders->count())
                    : 0,
                'completion_rate' => $mechanic->serviceOrders->count() > 0
                    ? round(($mechanic->serviceOrders->where('status', 'completed')->count() / $mechanic->serviceOrders->count()) * 100, 2)
                    : 0,
            ];
        });

        // Calculate summary stats
        $totalMechanics = $mechanics->count();
        $totalServiceOrders = ServiceOrder::count();
        $totalEarnings = $mechanics->sum('total_earnings');
        $averageEarningsPerMechanic = $totalMechanics > 0 ? round($totalEarnings / $totalMechanics) : 0;

        return inertia('Dashboard/Mechanics/Dashboard', [
            'mechanics' => $mechanics->sortByDesc('total_earnings')->values(),
            'summary' => [
                'total_mechanics' => $totalMechanics,
                'total_service_orders' => $totalServiceOrders,
                'total_earnings' => $totalEarnings,
                'average_earnings_per_mechanic' => $averageEarningsPerMechanic,
            ],
        ]);
    }

    /**
     * Display detailed performance for single mechanic
     */
    public function show($id)
    {
        $mechanic = Mechanic::with(['serviceOrders.customer', 'serviceOrders.vehicle', 'serviceOrders.details'])
            ->findOrFail($id);

        $serviceOrders = $mechanic->serviceOrders()->with('customer', 'vehicle', 'details')->paginate(20);

        // Calculate statistics
        $stats = [
            'total_orders' => $mechanic->serviceOrders->count(),
            'completed_orders' => $mechanic->serviceOrders->where('status', 'completed')->count(),
            'pending_orders' => $mechanic->serviceOrders->where('status', 'pending')->count(),
            'in_progress_orders' => $mechanic->serviceOrders->where('status', 'in_progress')->count(),
            'total_earnings' => $mechanic->serviceOrders->sum('total'),
            'total_labor_cost' => $mechanic->serviceOrders->sum('labor_cost'),
            'average_labor_cost' => $mechanic->serviceOrders->count() > 0
                ? round($mechanic->serviceOrders->sum('labor_cost') / $mechanic->serviceOrders->count())
                : 0,
            'average_order_value' => $mechanic->serviceOrders->count() > 0
                ? round($mechanic->serviceOrders->sum('total') / $mechanic->serviceOrders->count())
                : 0,
            'completion_rate' => $mechanic->serviceOrders->count() > 0
                ? round(($mechanic->serviceOrders->where('status', 'completed')->count() / $mechanic->serviceOrders->count()) * 100, 2)
                : 0,
        ];

        // Monthly earnings trend
        $monthlyEarnings = $mechanic->serviceOrders()
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total) as earnings')
            ->where('status', 'completed')
            ->groupByRaw('DATE_FORMAT(created_at, "%Y-%m")')
            ->orderBy('month')
            ->limit(12)
            ->pluck('earnings', 'month')
            ->toArray();

        return inertia('Dashboard/Mechanics/Performance', [
            'mechanic' => $mechanic,
            'service_orders' => $serviceOrders,
            'stats' => $stats,
            'monthly_earnings' => $monthlyEarnings,
        ]);
    }

    /**
     * Export mechanic performance report
     */
    public function export(Request $request)
    {
        $mechanics = Mechanic::with(['serviceOrders'])
            ->get()
            ->map(function ($mechanic) {
                return [
                    'name' => $mechanic->name,
                    'specialty' => $mechanic->specialty,
                    'total_orders' => $mechanic->serviceOrders->count(),
                    'completed_orders' => $mechanic->serviceOrders->where('status', 'completed')->count(),
                    'total_earnings' => $mechanic->serviceOrders->sum('total'),
                    'completion_rate' => $mechanic->serviceOrders->count() > 0
                        ? round(($mechanic->serviceOrders->where('status', 'completed')->count() / $mechanic->serviceOrders->count()) * 100, 2)
                        : 0,
                ];
            });

        // Return CSV or JSON based on request
        if ($request->get('format') === 'csv') {
            return $this->exportCSV($mechanics);
        }

        return response()->json($mechanics);
    }

    /**
     * Export as CSV
     */
    private function exportCSV($mechanics)
    {
        $filename = 'mechanic_performance_' . now()->format('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=$filename",
        ];

        $callback = function () use ($mechanics) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Nama', 'Spesialisasi', 'Total Pesanan', 'Pesanan Selesai', 'Total Penghasilan', 'Tingkat Selesai']);

            foreach ($mechanics as $mechanic) {
                fputcsv($file, [
                    $mechanic['name'],
                    $mechanic['specialty'],
                    $mechanic['total_orders'],
                    $mechanic['completed_orders'],
                    $mechanic['total_earnings'],
                    $mechanic['completion_rate'] . '%',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
