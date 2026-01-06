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

    public function create()
    {
        return inertia('Dashboard/ServiceOrders/Create', [
            'customers' => \App\Models\Customer::all(),
            'vehicles' => \App\Models\Vehicle::all(),
            'mechanics' => \App\Models\Mechanic::all(),
            'services' => \App\Models\Service::all(),
            'parts' => \App\Models\Part::all(),
        ]);
    }

    public function edit($id)
    {
        $order = ServiceOrder::with('customer', 'vehicle', 'mechanic', 'details.service', 'details.part')
            ->findOrFail($id);

        return inertia('Dashboard/ServiceOrders/Edit', [
            'order' => $order,
            'customers' => \App\Models\Customer::all(),
            'vehicles' => \App\Models\Vehicle::all(),
            'mechanics' => \App\Models\Mechanic::all(),
            'services' => \App\Models\Service::all(),
            'parts' => \App\Models\Part::all(),
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
            'status' => 'nullable|in:pending,in_progress,completed,paid,cancelled',
            'estimated_start_at' => 'nullable|date',
            'estimated_finish_at' => 'nullable|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.service_id' => 'nullable|exists:services,id',
            'items.*.parts' => 'nullable|array',
            'items.*.parts.*.part_id' => 'nullable|exists:parts,id',
            'items.*.parts.*.qty' => 'required|integer|min:1',
            'items.*.parts.*.price' => 'required|integer|min:0',
        ]);

        $orderNumber = 'SO-' . strtoupper(Str::random(8));

        $order = ServiceOrder::create([
            'order_number' => $orderNumber,
            'customer_id' => $request->customer_id,
            'vehicle_id' => $request->vehicle_id,
            'mechanic_id' => $request->mechanic_id,
            'status' => $request->status ?? 'pending',
            'estimated_start_at' => $request->estimated_start_at,
            'estimated_finish_at' => $request->estimated_finish_at,
            'notes' => $request->notes,
            'total' => 0,
        ]);

        $total = 0;
        foreach ($request->items as $item) {
            // Tambah service jika ada
            if (!empty($item['service_id'])) {
                $detail = ServiceOrderDetail::create([
                    'service_order_id' => $order->id,
                    'service_id' => $item['service_id'],
                    'part_id' => null,
                    'qty' => 1,
                    'price' => \App\Models\Service::find($item['service_id'])->price ?? 0,
                ]);
                $total += $detail->price;
            }

            // Tambah parts jika ada
            if (!empty($item['parts']) && is_array($item['parts'])) {
                foreach ($item['parts'] as $part) {
                    $detail = ServiceOrderDetail::create([
                        'service_order_id' => $order->id,
                        'service_id' => null,
                        'part_id' => $part['part_id'] ?? null,
                        'qty' => $part['qty'],
                        'price' => $part['price'],
                    ]);
                    $total += $detail->price * $detail->qty;
                }
            }
        }

        $order->total = $total;
        $order->save();

        return redirect()->route('service-orders.index')->with('success', 'Service order created.');
    }

    public function update(Request $request, $id)
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
            'items.*.parts' => 'nullable|array',
            'items.*.parts.*.part_id' => 'nullable|exists:parts,id',
            'items.*.parts.*.qty' => 'required|integer|min:1',
            'items.*.parts.*.price' => 'required|integer|min:0',
        ]);

        $order = ServiceOrder::findOrFail($id);
        $order->update([
            'customer_id' => $request->customer_id,
            'vehicle_id' => $request->vehicle_id,
            'mechanic_id' => $request->mechanic_id,
            'estimated_start_at' => $request->estimated_start_at,
            'estimated_finish_at' => $request->estimated_finish_at,
            'notes' => $request->notes,
        ]);

        // Delete old items and create new ones
        $order->details()->delete();
        $total = 0;

        foreach ($request->items as $item) {
            // Tambah service jika ada
            if (!empty($item['service_id'])) {
                $detail = ServiceOrderDetail::create([
                    'service_order_id' => $order->id,
                    'service_id' => $item['service_id'],
                    'part_id' => null,
                    'qty' => 1,
                    'price' => \App\Models\Service::find($item['service_id'])->price ?? 0,
                ]);
                $total += $detail->price;
            }

            // Tambah parts jika ada
            if (!empty($item['parts']) && is_array($item['parts'])) {
                foreach ($item['parts'] as $part) {
                    $detail = ServiceOrderDetail::create([
                        'service_order_id' => $order->id,
                        'service_id' => null,
                        'part_id' => $part['part_id'] ?? null,
                        'qty' => $part['qty'],
                        'price' => $part['price'],
                    ]);
                    $total += $detail->price * $detail->qty;
                }
            }
        }

        $order->total = $total;
        $order->save();

        return redirect()->route('service-orders.show', $order->id)->with('success', 'Service order updated.');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:pending,in_progress,completed,paid,cancelled']);

        $order = ServiceOrder::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        return back()->with('success', 'Status updated.');
    }
}
