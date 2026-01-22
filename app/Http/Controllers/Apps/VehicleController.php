<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\Customer;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::with('customer')
            ->when(request('search'), function ($query) {
                $query->where('plate_number', 'like', '%' . request('search') . '%')
                    ->orWhere('brand', 'like', '%' . request('search') . '%')
                    ->orWhere('model', 'like', '%' . request('search') . '%')
                    ->orWhereHas('customer', function ($q) {
                        $q->where('name', 'like', '%' . request('search') . '%');
                    });
            })
            ->orderByDesc('created_at')
            ->paginate(15);

        return inertia('Dashboard/Vehicles/Index', [
            'vehicles' => $vehicles,
        ]);
    }

    public function create()
    {
        $customers = Customer::orderBy('name')->get();

        return inertia('Dashboard/Vehicles/Create', [
            'customers' => $customers,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'plate_number' => 'required|string|max:20|unique:vehicles,plate_number',
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'color' => 'nullable|string|max:50',
            'engine_type' => 'nullable|string|max:100',
            'transmission_type' => 'nullable|in:manual,automatic,semi-automatic',
            'cylinder_volume' => 'nullable|integer|min:50|max:10000',
            'last_service_date' => 'nullable|date',
            'next_service_date' => 'nullable|date|after_or_equal:last_service_date',
            'features' => 'nullable|array',
            'notes' => 'nullable|string',
            // STNK fields
            'chassis_number' => 'nullable|string|max:100',
            'engine_number' => 'nullable|string|max:100',
            'manufacture_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'registration_number' => 'nullable|string|max:100',
            'registration_date' => 'nullable|date',
            'stnk_expiry_date' => 'nullable|date',
            'previous_owner' => 'nullable|string|max:255',
        ]);

        $vehicle = Vehicle::create([
            'customer_id' => $request->customer_id,
            'plate_number' => strtoupper($request->plate_number),
            'brand' => $request->brand,
            'model' => $request->model,
            'year' => $request->year,
            'color' => $request->color,
            'engine_type' => $request->engine_type,
            'transmission_type' => $request->transmission_type,
            'cylinder_volume' => $request->cylinder_volume,
            'last_service_date' => $request->last_service_date,
            'next_service_date' => $request->next_service_date,
            'features' => $request->features ? json_encode($request->features) : null,
            'notes' => $request->notes,
            // STNK fields
            'chassis_number' => $request->chassis_number,
            'engine_number' => $request->engine_number,
            'manufacture_year' => $request->manufacture_year,
            'registration_number' => $request->registration_number,
            'registration_date' => $request->registration_date,
            'stnk_expiry_date' => $request->stnk_expiry_date,
            'previous_owner' => $request->previous_owner,
        ]);

        // Return with flash data for quick create modals
        return redirect()->route('vehicles.index')->with([
            'success' => 'Kendaraan berhasil ditambahkan!',
            'vehicle' => $vehicle
        ]);
    }

    public function edit($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $customers = Customer::orderBy('name')->get();

        // Decode JSON features if exists
        if ($vehicle->features) {
            $vehicle->features = json_decode($vehicle->features, true);
        }

        return inertia('Dashboard/Vehicles/Edit', [
            'vehicle' => $vehicle,
            'customers' => $customers,
        ]);
    }

    public function show($id)
    {
        $vehicle = Vehicle::with(['customer', 'serviceOrders' => function ($q) {
            $q->with(['mechanic:id,name', 'details.service:id,title,price', 'details.part:id,name,sell_price'])
              ->orderByDesc('created_at');
        }])->findOrFail($id);

        $serviceOrders = $vehicle->serviceOrders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'odometer_km' => $order->odometer_km,
                'total' => (int) ($order->total ?? 0),
                'labor_cost' => (int) ($order->labor_cost ?? 0),
                'material_cost' => (int) ($order->material_cost ?? 0),
                'created_at' => optional($order->created_at)->toDateTimeString(),
                'actual_finish_at' => optional($order->actual_finish_at)->toDateTimeString(),
                'estimated_finish_at' => optional($order->estimated_finish_at)->toDateTimeString(),
                'mechanic' => $order->mechanic ? [
                    'id' => $order->mechanic->id,
                    'name' => $order->mechanic->name,
                ] : null,
                'details' => $order->details->map(function ($detail) {
                    return [
                        'id' => $detail->id,
                        'qty' => $detail->qty,
                        'price' => (int) $detail->price,
                        'service' => $detail->service ? [
                            'id' => $detail->service->id,
                            'title' => $detail->service->title,
                            'price' => (int) $detail->service->price,
                        ] : null,
                        'part' => $detail->part ? [
                            'id' => $detail->part->id,
                            'name' => $detail->part->name,
                            'price' => (int) $detail->part->sell_price,
                        ] : null,
                    ];
                }),
            ];
        });

        return inertia('Dashboard/Vehicles/Show', [
            'vehicle' => [
                'id' => $vehicle->id,
                'plate_number' => $vehicle->plate_number,
                'brand' => $vehicle->brand,
                'model' => $vehicle->model,
                'year' => $vehicle->year,
                'color' => $vehicle->color,
                'km' => $vehicle->km,
                'engine_type' => $vehicle->engine_type,
                'transmission_type' => $vehicle->transmission_type,
                'cylinder_volume' => $vehicle->cylinder_volume,
                'last_service_date' => optional($vehicle->last_service_date)->toDateString(),
                'next_service_date' => optional($vehicle->next_service_date)->toDateString(),
                'features' => $vehicle->features,
                'notes' => $vehicle->notes,
                'customer' => $vehicle->customer ? [
                    'id' => $vehicle->customer->id,
                    'name' => $vehicle->customer->name,
                    'phone' => $vehicle->customer->phone,
                ] : null,
            ],
            'service_orders' => $serviceOrders,
        ]);
    }

    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'plate_number' => 'required|string|max:20|unique:vehicles,plate_number,' . $id,
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'color' => 'nullable|string|max:50',
            'engine_type' => 'nullable|string|max:100',
            'transmission_type' => 'nullable|in:manual,automatic,semi-automatic',
            'cylinder_volume' => 'nullable|integer|min:50|max:10000',
            'last_service_date' => 'nullable|date',
            'next_service_date' => 'nullable|date|after_or_equal:last_service_date',
            'features' => 'nullable|array',
            'notes' => 'nullable|string',
            // STNK fields
            'chassis_number' => 'nullable|string|max:100',
            'engine_number' => 'nullable|string|max:100',
            'manufacture_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'registration_number' => 'nullable|string|max:100',
            'registration_date' => 'nullable|date',
            'stnk_expiry_date' => 'nullable|date',
            'previous_owner' => 'nullable|string|max:255',
        ]);

        $vehicle->update([
            'customer_id' => $request->customer_id,
            'plate_number' => strtoupper($request->plate_number),
            'brand' => $request->brand,
            'model' => $request->model,
            'year' => $request->year,
            'color' => $request->color,
            'engine_type' => $request->engine_type,
            'transmission_type' => $request->transmission_type,
            'cylinder_volume' => $request->cylinder_volume,
            'last_service_date' => $request->last_service_date,
            'next_service_date' => $request->next_service_date,
            'features' => $request->features ? json_encode($request->features) : null,
            'notes' => $request->notes,
            // STNK fields
            'chassis_number' => $request->chassis_number,
            'engine_number' => $request->engine_number,
            'manufacture_year' => $request->manufacture_year,
            'registration_number' => $request->registration_number,
            'registration_date' => $request->registration_date,
            'stnk_expiry_date' => $request->stnk_expiry_date,
            'previous_owner' => $request->previous_owner,
        ]);

        return redirect()->route('vehicles.index')->with('success', 'Kendaraan berhasil diperbarui!');
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();

        return redirect()->route('vehicles.index')->with('success', 'Kendaraan berhasil dihapus!');
    }

    public function maintenanceInsights($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $orders = \App\Models\ServiceOrder::with('details.service', 'details.part')
            ->where('vehicle_id', $vehicle->id)
            ->whereNotNull('odometer_km')
            ->orderByDesc('odometer_km')
            ->limit(100)
            ->get(['id', 'odometer_km']);

        $lastKm = [
            'oil' => null,
            'air' => null,
            'spark' => null,
            'brakepad' => null,
            'belt' => null,
        ];

        $match = function ($text, $keywords) {
            $t = mb_strtolower($text ?? '');
            foreach ($keywords as $kw) {
                if (str_contains($t, mb_strtolower($kw))) return true;
            }
            return false;
        };

        foreach ($orders as $order) {
            foreach ($order->details as $detail) {
                $serviceTitle = $detail->service->title ?? '';
                $partName = $detail->part->name ?? '';

                if (is_null($lastKm['oil']) && ($match($serviceTitle, ['oli', 'oil']) || $match($partName, ['oli', 'oil']))) {
                    $lastKm['oil'] = $order->odometer_km;
                }
                if (is_null($lastKm['air']) && ($match($serviceTitle, ['filter udara', 'air filter']) || $match($partName, ['filter udara', 'air filter']))) {
                    $lastKm['air'] = $order->odometer_km;
                }
                if (is_null($lastKm['spark']) && ($match($serviceTitle, ['busi', 'spark']) || $match($partName, ['busi', 'spark']))) {
                    $lastKm['spark'] = $order->odometer_km;
                }
                if (is_null($lastKm['brakepad']) && ($match($serviceTitle, ['kampas rem', 'brake pad']) || $match($partName, ['kampas rem', 'brake pad']))) {
                    $lastKm['brakepad'] = $order->odometer_km;
                }
                if (is_null($lastKm['belt']) && ($match($serviceTitle, ['belt', 'v-belt', 'cvt']) || $match($partName, ['belt', 'v-belt', 'cvt']))) {
                    $lastKm['belt'] = $order->odometer_km;
                }
            }
        }

        $lastOrderKm = $orders->max('odometer_km');

        return response()->json([
            'last_km' => $lastKm,
            'vehicle_km' => $vehicle->km,
            'last_order_km' => $lastOrderKm,
        ]);
    }

    public function getWithHistory($id)
    {
        $vehicle = Vehicle::with('customer')->findOrFail($id);

        // Get last 10 service orders
        $recentOrders = \App\Models\ServiceOrder::with('mechanic', 'details.service', 'details.part')
            ->where('vehicle_id', $vehicle->id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'created_at' => $order->created_at->toDateString(),
                    'odometer_km' => $order->odometer_km,
                    'mechanic' => $order->mechanic ? ['name' => $order->mechanic->name] : null,
                    'total_cost' => $order->details->sum(function ($detail) {
                        $service_price = $detail->service->price ?? 0;
                        $part_cost = ($detail->part->sell_price ?? 0) * $detail->qty;
                        return $service_price + $part_cost;
                    }),
                ];
            });

        return response()->json([
            'vehicle' => [
                'id' => $vehicle->id,
                'plate_number' => $vehicle->plate_number,
                'brand' => $vehicle->brand,
                'model' => $vehicle->model,
                'km' => $vehicle->km,
            ],
            'recent_orders' => $recentOrders,
        ]);
    }
}
