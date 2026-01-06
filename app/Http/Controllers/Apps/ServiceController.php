<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('q', '');

        $query = Service::with('category')->orderBy('title');
        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('code', 'like', "%{$q}%")
                    ->orWhere('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        $services = $query->paginate(15)->withQueryString();
        $categories = ServiceCategory::orderBy('name')->get();

        return Inertia::render('Dashboard/Services/Index', [
            'services' => $services,
            'categories' => $categories,
            'filters' => ['q' => $q],
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Services/Create', [
            'categories' => ServiceCategory::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'nullable|string|unique:services,code',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'service_category_id' => 'nullable|exists:service_categories,id',
            'est_time_minutes' => 'nullable|integer|min:1',
            'complexity_level' => 'nullable|in:easy,medium,hard',
            'price' => 'required|integer|min:0',
            'required_tools' => 'nullable|json',
        ]);

        // Auto-generate code if not provided
        if (empty($data['code'])) {
            $data['code'] = 'SVC-' . strtoupper(\Illuminate\Support\Str::random(8));
        }

        // Set default values for quick create
        if (!isset($data['est_time_minutes'])) {
            $data['est_time_minutes'] = 60; // Default 1 hour
        }
        if (!isset($data['complexity_level'])) {
            $data['complexity_level'] = 'medium';
        }

        $service = Service::create($data);

        return redirect()->route('services.index')->with([
            'success' => 'Service created successfully',
            'service' => $service
        ]);
    }

    public function edit(Service $service)
    {
        return Inertia::render('Dashboard/Services/Edit', [
            'service' => $service,
            'categories' => ServiceCategory::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Service $service)
    {
        $data = $request->validate([
            'code' => 'required|string|unique:services,code,' . $service->id,
            'title' => 'required|string',
            'description' => 'nullable|string',
            'service_category_id' => 'nullable|exists:service_categories,id',
            'est_time_minutes' => 'required|integer|min:1',
            'complexity_level' => 'required|in:easy,medium,hard',
            'price' => 'required|integer|min:0',
            'required_tools' => 'nullable|json',
            'status' => 'required|in:active,inactive',
        ]);

        $service->update($data);

        return redirect()->route('services.index')->with('success', 'Service updated successfully');
    }

    public function destroy(Service $service)
    {
        // Cek apakah ada service order detail yang menggunakan service ini
        if ($service->serviceOrderDetails()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete service that is used in service orders']);
        }

        $service->delete();

        return back()->with('success', 'Service deleted successfully');
    }
}
