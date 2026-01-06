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
            'customer_id' => 'nullable|exists:customers,id',
            'plate_number' => 'required|string|max:20|unique:vehicles,plate_number',
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'color' => 'nullable|string|max:50',
            'engine_type' => 'nullable|string|max:100',
            'transmission_type' => 'nullable|in:manual,automatic,semi-automatic',
            'cylinder_volume' => 'nullable|integer|min:50|max:10000',
            'km' => 'nullable|integer|min:0',
            'last_service_date' => 'nullable|date',
            'next_service_date' => 'nullable|date|after_or_equal:last_service_date',
            'features' => 'nullable|array',
            'notes' => 'nullable|string',
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
            'km' => $request->km,
            'last_service_date' => $request->last_service_date,
            'next_service_date' => $request->next_service_date,
            'features' => $request->features ? json_encode($request->features) : null,
            'notes' => $request->notes,
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
            'km' => 'nullable|integer|min:0',
            'last_service_date' => 'nullable|date',
            'next_service_date' => 'nullable|date|after_or_equal:last_service_date',
            'features' => 'nullable|array',
            'notes' => 'nullable|string',
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
            'km' => $request->km,
            'last_service_date' => $request->last_service_date,
            'next_service_date' => $request->next_service_date,
            'features' => $request->features ? json_encode($request->features) : null,
            'notes' => $request->notes,
        ]);

        return redirect()->route('vehicles.index')->with('success', 'Kendaraan berhasil diperbarui!');
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();

        return redirect()->route('vehicles.index')->with('success', 'Kendaraan berhasil dihapus!');
    }
}
