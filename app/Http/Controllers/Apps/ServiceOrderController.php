<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use App\Models\ServiceOrderDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ServiceOrderController extends Controller
{
    public function index()
    {
        $orders = ServiceOrder::with('customer', 'vehicle', 'mechanic', 'details.service', 'details.part')
            ->orderByDesc('created_at')
            ->paginate(15);

        return inertia('Dashboard/ServiceOrders/Index', [
            'orders' => $orders,
        ]);
    }

    public function show($id)
    {
        $order = ServiceOrder::with('customer', 'vehicle', 'mechanic', 'details.service', 'details.part')
            ->findOrFail($id);

        return inertia('Dashboard/ServiceOrders/Show', [
            'order' => $order,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'mechanic_id' => 'nullable|exists:mechanics,id',
            'estimated_start_at' => 'nullable|date',
            'estimated_finish_at' => 'nullable|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.service_id' => 'nullable|exists:services,id',
            'items.*.part_id' => 'nullable|exists:parts,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|integer|min:0',
        ]);

        $orderNumber = 'SO-' . strtoupper(Str::random(8));

        $order = ServiceOrder::create([
            'order_number' => $orderNumber,
            'customer_id' => $request->customer_id,
            'vehicle_id' => $request->vehicle_id,
            'mechanic_id' => $request->mechanic_id,
            'estimated_start_at' => $request->estimated_start_at,
            'estimated_finish_at' => $request->estimated_finish_at,
            'notes' => $request->notes,
            'total' => 0,
        ]);

        $total = 0;
        foreach ($request->items as $item) {
            $detail = ServiceOrderDetail::create([
                'service_order_id' => $order->id,
                'service_id' => $item['service_id'] ?? null,
                'part_id' => $item['part_id'] ?? null,
                'qty' => $item['qty'],
                'price' => $item['price'],
                'notes' => $item['notes'] ?? null,
            ]);

            $total += $detail->price * $detail->qty;
        }

        $order->total = $total;
        $order->save();

        // If request expects JSON (POS/ajax), return JSON payload
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'order' => $order->load('customer', 'vehicle', 'mechanic', 'details.service', 'details.part'),
            ]);
        }

        return redirect()->route('service-orders.show', $order->id)->with('success', 'Service order created.');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:pending,in_progress,completed,cancelled']);

        $order = ServiceOrder::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        return back()->with('success', 'Status updated.');
    }
}
