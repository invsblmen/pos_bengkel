<?php
namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Mechanic;
use App\Models\Part;
use App\Models\Profit;
use App\Models\Product;
use App\Models\ServiceOrder;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Original retail stats
        $totalCategories   = Category::count();
        $totalProducts     = Product::count();
        $totalTransactions = Transaction::count();
        $totalUsers        = User::count();
        $totalRevenue      = Transaction::sum('grand_total');
        $totalProfit       = Profit::sum('total');
        $averageOrder      = Transaction::avg('grand_total') ?? 0;
        $todayTransactions = Transaction::whereDate('created_at', Carbon::today())->count();

        // Workshop-specific statistics
        $totalServiceOrders = ServiceOrder::count();
        $pendingOrders = ServiceOrder::where('status', 'pending')->count();
        $inProgressOrders = ServiceOrder::where('status', 'in_progress')->count();
        $completedOrdersToday = ServiceOrder::where('status', 'completed')
            ->whereDate('updated_at', Carbon::today())
            ->count();

        $todayRevenue = ServiceOrder::where('status', 'completed')
            ->whereDate('updated_at', Carbon::today())
            ->sum(DB::raw('COALESCE(labor_cost, 0) + COALESCE(material_cost, 0)'));

        $activeMechanics = Mechanic::where('status', 'active')->count();
        $totalMechanics = Mechanic::count();

        $lowStockParts = Part::where('status', 'active')
            ->whereColumn('stock', '<=', 'reorder_level')
            ->count();

        $totalParts = Part::where('status', 'active')->count();

        $revenueTrend      = Transaction::selectRaw('DATE(created_at) as date, SUM(grand_total) as total')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->take(12)
            ->get()
            ->map(function ($row) {
                return [
                    'date'  => $row->date,
                    'label' => Carbon::parse($row->date)->format('d M'),
                    'total' => (int) $row->total,
                ];
            })
            ->reverse()
            ->values();

        $topProducts = TransactionDetail::select('product_id', DB::raw('SUM(qty) as qty'), DB::raw('SUM(price) as total'))
            ->with('product:id,title')
            ->groupBy('product_id')
            ->orderByDesc('qty')
            ->take(5)
            ->get()
            ->map(function ($detail) {
                return [
                    'name'  => $detail->product?->title ?? 'Produk terhapus',
                    'qty'   => (int) $detail->qty,
                    'total' => (int) $detail->total,
                ];
            });

        $recentTransactions = Transaction::with('cashier:id,name', 'customer:id,name')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($transaction) {
                return [
                    'invoice'  => $transaction->invoice,
                    'date'     => Carbon::parse($transaction->created_at)->format('d M Y'),
                    'customer' => $transaction->customer?->name ?? '-',
                    'cashier'  => $transaction->cashier?->name ?? '-',
                    'total'    => (int) $transaction->grand_total,
                ];
            });

        $topCustomers = Transaction::select('customer_id', DB::raw('COUNT(*) as orders'), DB::raw('SUM(grand_total) as total'))
            ->with('customer:id,name')
            ->whereNotNull('customer_id')
            ->groupBy('customer_id')
            ->orderByDesc('total')
            ->take(5)
            ->get()
            ->map(function ($row) {
                return [
                    'name'   => $row->customer?->name ?? 'Pelanggan',
                    'orders' => (int) $row->orders,
                    'total'  => (int) $row->total,
                ];
            });

        return Inertia::render('Dashboard/Index', [
            // Original retail stats
            'totalCategories'   => $totalCategories,
            'totalProducts'     => $totalProducts,
            'totalTransactions' => $totalTransactions,
            'totalUsers'        => $totalUsers,
            'revenueTrend'      => $revenueTrend,
            'totalRevenue'      => (int) $totalRevenue,
            'totalProfit'       => (int) $totalProfit,
            'averageOrder'      => (int) round($averageOrder),
            'todayTransactions' => (int) $todayTransactions,
            'topProducts'       => $topProducts,
            'recentTransactions'=> $recentTransactions,
            'topCustomers'      => $topCustomers,

            // Workshop statistics
            'workshop' => [
                'totalServiceOrders' => $totalServiceOrders,
                'pendingOrders' => $pendingOrders,
                'inProgressOrders' => $inProgressOrders,
                'completedOrdersToday' => $completedOrdersToday,
                'todayRevenue' => (int) $todayRevenue,
                'activeMechanics' => $activeMechanics,
                'totalMechanics' => $totalMechanics,
                'lowStockParts' => $lowStockParts,
                'totalParts' => $totalParts,
            ],
        ]);
    }
}
