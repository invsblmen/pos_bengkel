<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Part;
use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\Supplier;
use App\Models\PartStockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PurchaseController extends Controller
{
    public function index()
    {
        $purchases = Purchase::with(['supplier', 'user'])->orderByDesc('created_at')->paginate(15)->withQueryString();

        return Inertia::render('Dashboard/Parts/Purchases/Index', [
            'purchases' => $purchases,
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Parts/Purchases/Create', [
            'parts' => Part::orderBy('name')->get(),
            'suppliers' => Supplier::orderBy('name')->get(),
        ]);
    }

    public function show($id)
    {
        $purchase = Purchase::with(['details.part', 'supplier', 'user'])->findOrFail($id);

        return Inertia::render('Dashboard/Parts/Purchases/Show', [
            'purchase' => $purchase,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'supplier_id' => 'nullable|exists:suppliers,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.part_id' => 'required|exists:parts,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($data) {
            $invoice = 'PO-' . strtoupper(Str::random(8));
            $total = 0;

            $purchase = Purchase::create([
                'invoice' => $invoice,
                'supplier_id' => $data['supplier_id'] ?? null,
                'notes' => $data['notes'] ?? null,
                'total' => 0,
                'created_by' => Auth::id(),
            ]);

            foreach ($data['items'] as $item) {
                $part = Part::findOrFail($item['part_id']);
                $qty = (int) $item['qty'];
                $unitPrice = (float) $item['unit_price'];
                $subtotal = (int) round($qty * $unitPrice);

                $purchase->details()->create([
                    'part_id' => $part->id,
                    'qty' => $qty,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);

                $before = $part->stock;
                $part->stock = $part->stock + $qty;
                $part->save();

                PartStockMovement::create([
                    'part_id' => $part->id,
                    'type' => 'purchase',
                    'qty' => $qty,
                    'before_stock' => $before,
                    'after_stock' => $part->stock,
                    'unit_price' => $unitPrice,
                    'supplier_id' => $data['supplier_id'] ?? null,
                    'reference_type' => Purchase::class,
                    'reference_id' => $purchase->id,
                    'notes' => $data['notes'] ?? null,
                    'created_by' => Auth::id(),
                ]);

                $total += $subtotal;
            }

            $purchase->total = $total;
            $purchase->save();
        });

        return redirect()->route('parts.purchases.index')->with('success', 'Pembelian sparepart berhasil disimpan');
    }
}
