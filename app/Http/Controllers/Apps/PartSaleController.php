<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Part;
use App\Models\PartSale;
use App\Models\PartSaleDetail;
use App\Models\PartStockMovement;
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
            'parts' => Part::orderBy('name')->get(),
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
        ]);

        DB::transaction(function () use ($data) {
            $invoice = 'PS-' . strtoupper(Str::random(8));
            $total = 0;

            $sale = PartSale::create([
                'invoice' => $invoice,
                'notes' => $data['notes'] ?? null,
                'total' => 0,
                'created_by' => Auth::id(),
            ]);

            foreach ($data['items'] as $item) {
                $part = Part::findOrFail($item['part_id']);
                $qty = (int) $item['qty'];
                $unitPrice = (float) $item['unit_price'];
                $subtotal = (int) round($qty * $unitPrice);

                if ($part->stock < $qty) {
                    throw ValidationException::withMessages(['items' => ["Stok tidak mencukupi untuk {$part->name}"]]);
                }

                $sale->details()->create([
                    'part_id' => $part->id,
                    'qty' => $qty,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);

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

                $total += $subtotal;
            }

            $sale->total = $total;
            $sale->save();
        });

        return redirect()->route('parts.sales.index')->with('success', 'Penjualan sparepart berhasil disimpan');
    }
}
