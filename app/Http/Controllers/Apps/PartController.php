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

        $query = Part::with('supplier')->orderBy('name');
        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('sku', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        $parts = $query->paginate(15)->withQueryString();

        return Inertia::render('Dashboard/Parts/Index', [
            'parts' => $parts,
            'filters' => ['q' => $q],
            'suppliers' => Supplier::orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Parts/Create', [
            'suppliers' => Supplier::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:50|unique:parts,sku',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'buy_price' => 'nullable|numeric|min:0',
            'sell_price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $part = Part::create($data);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'data' => $part]);
        }

        return redirect()->route('parts.index')->with('success', 'Part created.');
    }

    public function update(Request $request, $id)
    {
        $part = Part::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => "nullable|string|max:50|unique:parts,sku,{$id}",
            'supplier_id' => 'nullable|exists:suppliers,id',
            'buy_price' => 'nullable|numeric|min:0',
            'sell_price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $part->update($data);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'data' => $part]);
        }

        return redirect()->route('parts.index')->with('success', 'Part updated.');
    }

    public function destroy(Request $request, $id)
    {
        $part = Part::findOrFail($id);
        $part->delete();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('parts.index')->with('success', 'Part deleted.');
    }
}
