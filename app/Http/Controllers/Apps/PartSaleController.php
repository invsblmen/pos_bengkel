<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Part;
use App\Models\PartSale;
use App\Models\PartSaleDetail;
use App\Models\PartStockMovement;
use App\Services\DiscountTaxService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class PartSaleController extends Controller
{
    public function index()
    {
        $sales = PartSale::with(['user'])->orderByDesc('created_at')->paginate(15)->withQueryString();
        return Inertia::render('Dashboard/Parts/Sales/Index', [
            'sales' => $sales,
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Parts/Sales/Create', [
            'parts' => Part::with('category')->orderBy('name')->get(),
        ]);
    }

    public function show($id)
    {
        $sale = PartSale::with(['details.part', 'user'])->findOrFail($id);

        return Inertia::render('Dashboard/Parts/Sales/Show', [
            'sale' => $sale,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.part_id' => 'required|exists:parts,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_type' => 'nullable|in:none,percent,fixed',
            'items.*.discount_value' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:none,percent,fixed',
            'discount_value' => 'nullable|numeric|min:0',
            'tax_type' => 'nullable|in:none,percent,fixed',
            'tax_value' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($data) {
            $invoice = 'PS-' . strtoupper(Str::random(8));
            $total = 0;

            $sale = PartSale::create([
                'invoice' => $invoice,
                'notes' => $data['notes'] ?? null,
                'total' => 0,
                'created_by' => Auth::id(),
                'discount_type' => $data['discount_type'] ?? 'none',
                'discount_value' => $data['discount_value'] ?? 0,
                'tax_type' => $data['tax_type'] ?? 'none',
                'tax_value' => $data['tax_value'] ?? 0,
            ]);

            foreach ($data['items'] as $item) {
                $part = Part::findOrFail($item['part_id']);
                $qty = (int) $item['qty'];
                $unitPrice = (float) $item['unit_price'];
                $subtotal = (int) round($qty * $unitPrice);

                if ($part->stock < $qty) {
                    throw ValidationException::withMessages(['items' => ["Stok tidak mencukupi untuk {$part->name}"]]);
                }

                $detail = $sale->details()->create([
                    'part_id' => $part->id,
                    'qty' => $qty,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                    'discount_type' => $item['discount_type'] ?? 'none',
                    'discount_value' => $item['discount_value'] ?? 0,
                ]);

                // Calculate final amount for item discount
                $detail->calculateFinalAmount()->save();

                $before = $part->stock;
                $part->stock = max(0, $part->stock - $qty);
                $part->save();

                PartStockMovement::create([
                    'part_id' => $part->id,
                    'type' => 'sale',
                    'qty' => $qty,
                    'before_stock' => $before,
                    'after_stock' => $part->stock,
                    'unit_price' => $unitPrice,
                    'reference_type' => PartSale::class,
                    'reference_id' => $sale->id,
                    'notes' => $data['notes'] ?? null,
                    'created_by' => Auth::id(),
                ]);

                // Use final_amount (after item discount) for total calculation
                $total += $detail->final_amount ?? $subtotal;
            }

            $sale->total = $total;
            // Calculate transaction-level discount and tax
            $sale->recalculateTotals()->save();
        });

        return redirect()->route('parts.sales.index')->with('success', 'Penjualan sparepart berhasil disimpan');
    }
}
