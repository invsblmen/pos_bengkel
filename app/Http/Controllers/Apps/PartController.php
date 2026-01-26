<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Part;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PartController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('q', '');

        $query = Part::with(['supplier', 'category'])->orderBy('name');
        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('sku', 'like', "%{$q}%")
                    ->orWhere('part_number', 'like', "%{$q}%")
                    ->orWhere('barcode', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        $parts = $query->paginate(15)->withQueryString();

        return Inertia::render('Dashboard/Parts/Index', [
            'parts' => $parts,
            'filters' => ['q' => $q],
            'suppliers' => Supplier::orderBy('name')->get(),
            'categories' => \App\Models\PartCategory::orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Parts/Create', [
            'suppliers' => Supplier::orderBy('name')->get(),
            'categories' => \App\Models\PartCategory::orderBy('name')->get(),
        ]);
    }

    public function edit($id)
    {
        $part = Part::findOrFail($id);
        return Inertia::render('Dashboard/Parts/Edit', [
            'part' => $part,
            'suppliers' => Supplier::orderBy('name')->get(),
            'categories' => \App\Models\PartCategory::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:50|unique:parts,sku',
            'part_number' => 'nullable|string|max:100|unique:parts,part_number',
            'barcode' => 'nullable|string|max:150|unique:parts,barcode',
            'part_category_id' => 'nullable|exists:part_categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'buy_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
        ]);

        // Set default stock if not provided
        if (!isset($data['stock'])) {
            $data['stock'] = 0;
        }

        $part = Part::create($data);

        return redirect()->back()->with([
            'success' => 'Part created successfully.',
            'flash' => ['part' => $part]
        ]);
    }

    public function update(Request $request, $id)
    {
        $part = Part::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => "nullable|string|max:50|unique:parts,sku,{$id}",
            'part_number' => "nullable|string|max:100|unique:parts,part_number,{$id}",
            'barcode' => "nullable|string|max:150|unique:parts,barcode,{$id}",
            'part_category_id' => 'nullable|exists:part_categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'buy_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $part->update($data);

        return redirect()->back()->with([
            'success' => 'Part updated successfully.',
            'flash' => ['part' => $part]
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $part = Part::findOrFail($id);
        $part->delete();

        return redirect()->back()->with('success', 'Part deleted successfully.');
    }
}
