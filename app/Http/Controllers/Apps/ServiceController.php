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

        // Transform field names for frontend
        $services->transform(function ($service) {
            return [
                'id' => $service->id,
                'name' => $service->title,
                'description' => $service->description,
                'price' => $service->price,
                'duration' => $service->est_time_minutes,
                'complexity_level' => $service->complexity_level,
                'status' => $service->status,
                'service_category_id' => $service->service_category_id,
                'category' => $service->category,
                'required_tools' => $service->required_tools,
                'created_at' => $service->created_at,
                'updated_at' => $service->updated_at,
            ];
        });

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
        $validated = $request->validate([
            'service_category_id' => 'required|exists:service_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'duration' => 'required|integer|min:1',
            'complexity_level' => 'required|in:simple,medium,complex',
            'required_tools' => 'nullable|array',
            'status' => 'required|in:active,inactive',
        ]);

        // Map form fields to database columns
        $data = [
            'service_category_id' => $validated['service_category_id'],
            'title' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'est_time_minutes' => $validated['duration'],
            'complexity_level' => $this->mapComplexityLevel($validated['complexity_level']),
            'required_tools' => $validated['required_tools'] ? json_encode($validated['required_tools']) : null,
            'status' => $validated['status'],
            'code' => 'SVC-' . strtoupper(Str::random(8)),
        ];

        $service = Service::create($data);

        return redirect()->route('services.index')->with('success', 'Layanan berhasil ditambahkan');
    }

    public function edit(Service $service)
    {
        // Transform field names for frontend
        $transformedService = [
            'id' => $service->id,
            'name' => $service->title,
            'description' => $service->description,
            'price' => $service->price,
            'duration' => $service->est_time_minutes,
            'complexity_level' => $service->complexity_level,
            'status' => $service->status,
            'service_category_id' => $service->service_category_id,
            'required_tools' => $service->required_tools,
            'created_at' => $service->created_at,
            'updated_at' => $service->updated_at,
        ];

        return Inertia::render('Dashboard/Services/Edit', [
            'service' => $transformedService,
            'categories' => ServiceCategory::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'service_category_id' => 'required|exists:service_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'duration' => 'required|integer|min:1',
            'complexity_level' => 'required|in:simple,medium,complex',
            'required_tools' => 'nullable|array',
            'status' => 'required|in:active,inactive',
        ]);

        // Map form fields to database columns
        $data = [
            'service_category_id' => $validated['service_category_id'],
            'title' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'est_time_minutes' => $validated['duration'],
            'complexity_level' => $this->mapComplexityLevel($validated['complexity_level']),
            'required_tools' => $validated['required_tools'] ? json_encode($validated['required_tools']) : null,
            'status' => $validated['status'],
        ];

        $service->update($data);

        return redirect()->route('services.index')->with('success', 'Layanan berhasil diperbarui');
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

    /**
     * Map form complexity level to database values
     */
    private function mapComplexityLevel($level)
    {
        $mapping = [
            'simple' => 'easy',
            'medium' => 'medium',
            'complex' => 'hard',
        ];
        return $mapping[$level] ?? 'medium';
    }
}
