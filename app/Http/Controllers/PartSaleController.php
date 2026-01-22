<?php

namespace App\Http\Controllers;

use App\Models\PartSale;
use App\Models\PartSaleDetail;
use App\Models\PartSalesOrder;
use App\Models\Part;
use App\Models\Customer;
use App\Models\PartStockMovement;
use App\Services\DiscountTaxService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PartSaleController extends Controller
{
    protected $discountTaxService;

    public function __construct(DiscountTaxService $discountTaxService)
    {
        $this->discountTaxService = $discountTaxService;
    }

    public function index(Request $request)
    {
        $query = PartSale::with(['customer', 'creator', 'salesOrder'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by customer
        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        // Search by sale number
        if ($request->filled('search')) {
            $query->where('sale_number', 'like', '%' . $request->search . '%');
        }

        $sales = $query->paginate(15)->withQueryString();

        return Inertia::render('PartSales/Index', [
            'sales' => $sales,
            'filters' => $request->only(['status', 'payment_status', 'customer_id', 'search']),
        ]);
    }

    public function create(Request $request)
    {
        $customers = Customer::orderBy('name')->get();
        $parts = Part::where('stock', '>', 0)
            ->orderBy('name')
            ->get();

        // If fulfilling from sales order
        $salesOrder = null;
        if ($request->filled('sales_order_id')) {
            $salesOrder = PartSalesOrder::with(['customer', 'details.part'])
                ->findOrFail($request->sales_order_id);
        }

        return Inertia::render('PartSales/Create', [
            'customers' => $customers,
            'parts' => $parts,
            'salesOrder' => $salesOrder,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'sale_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.part_id' => 'required|exists:parts,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|integer|min:0',
            'items.*.discount_type' => 'nullable|in:none,percent,fixed',
            'items.*.discount_value' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:none,percent,fixed',
            'discount_value' => 'nullable|numeric|min:0',
            'tax_type' => 'nullable|in:none,percent,fixed',
            'tax_value' => 'nullable|numeric|min:0',
            'paid_amount' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'part_sales_order_id' => 'nullable|exists:part_sales_orders,id',
        ]);

        DB::beginTransaction();
        try {
            // Check stock availability
            foreach ($request->items as $item) {
                $part = Part::findOrFail($item['part_id']);
                if ($part->stock < $item['quantity']) {
                    throw new \Exception("Stock {$part->name} tidak mencukupi. Tersedia: {$part->stock}, diminta: {$item['quantity']}");
                }
            }

            // Create sale
            $sale = PartSale::create([
                'sale_number' => PartSale::generateSaleNumber(),
                'customer_id' => $request->customer_id,
                'sale_date' => $request->sale_date,
                'part_sales_order_id' => $request->part_sales_order_id,
                'discount_type' => $request->discount_type ?? 'none',
                'discount_value' => $request->discount_value ?? 0,
                'tax_type' => $request->tax_type ?? 'none',
                'tax_value' => $request->tax_value ?? 0,
                'paid_amount' => $request->paid_amount ?? 0,
                'notes' => $request->notes,
                'status' => 'confirmed',
                'created_by' => Auth::id(),
            ]);

            // Create sale details and update stock
            foreach ($request->items as $item) {
                $part = Part::findOrFail($item['part_id']);
                
                $subtotal = $item['quantity'] * $item['unit_price'];
                
                // Calculate item discount
                $discountAmount = 0;
                $discountType = $item['discount_type'] ?? 'none';
                $discountValue = $item['discount_value'] ?? 0;
                
                if ($discountType !== 'none' && $discountValue > 0) {
                    $discountAmount = $this->discountTaxService->calculateAmount(
                        $subtotal,
                        $discountType,
                        $discountValue
                    );
                }
                
                $finalAmount = $subtotal - $discountAmount;

                // Create detail
                PartSaleDetail::create([
                    'part_sale_id' => $sale->id,
                    'part_id' => $part->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                    'discount_type' => $discountType,
                    'discount_value' => $discountValue,
                    'discount_amount' => $discountAmount,
                    'final_amount' => $finalAmount,
                ]);

                // Reduce stock
                $part->decrement('stock', $item['quantity']);

                // Create stock movement
                PartStockMovement::create([
                    'part_id' => $part->id,
                    'reference_type' => PartSale::class,
                    'reference_id' => $sale->id,
                    'type' => 'out',
                    'quantity' => $item['quantity'],
                    'stock_before' => $part->stock + $item['quantity'],
                    'stock_after' => $part->stock,
                    'notes' => "Penjualan #{$sale->sale_number}",
                    'created_by' => Auth::id(),
                ]);
            }

            // Recalculate totals
            $sale->recalculateTotals();

            // If fulfilling a sales order, update SO status
            if ($request->filled('part_sales_order_id')) {
                $salesOrder = PartSalesOrder::findOrFail($request->part_sales_order_id);
                $salesOrder->update(['status' => 'fulfilled']);
            }

            DB::commit();

            return redirect()
                ->route('part-sales.show', $sale)
                ->with('success', 'Penjualan berhasil dibuat');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show(PartSale $partSale)
    {
        $partSale->load([
            'customer',
            'salesOrder',
            'details.part',
            'creator',
            'stockMovements.part',
        ]);

        return Inertia::render('PartSales/Show', [
            'sale' => $partSale,
        ]);
    }

    public function edit(PartSale $partSale)
    {
        // Only allow editing draft sales
        if ($partSale->status !== 'draft') {
            return back()->withErrors(['error' => 'Hanya penjualan draft yang bisa diedit']);
        }

        $partSale->load('details.part');
        $customers = Customer::orderBy('name')->get();
        $parts = Part::orderBy('name')->get();

        return Inertia::render('PartSales/Edit', [
            'sale' => $partSale,
            'customers' => $customers,
            'parts' => $parts,
        ]);
    }

    public function update(Request $request, PartSale $partSale)
    {
        // Only allow updating draft sales
        if ($partSale->status !== 'draft') {
            return back()->withErrors(['error' => 'Hanya penjualan draft yang bisa diupdate']);
        }

        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'sale_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.part_id' => 'required|exists:parts,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|integer|min:0',
            'discount_type' => 'nullable|in:none,percent,fixed',
            'discount_value' => 'nullable|numeric|min:0',
            'tax_type' => 'nullable|in:none,percent,fixed',
            'tax_value' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Delete old details
            $partSale->details()->delete();

            // Update sale
            $partSale->update([
                'customer_id' => $request->customer_id,
                'sale_date' => $request->sale_date,
                'discount_type' => $request->discount_type ?? 'none',
                'discount_value' => $request->discount_value ?? 0,
                'tax_type' => $request->tax_type ?? 'none',
                'tax_value' => $request->tax_value ?? 0,
                'notes' => $request->notes,
            ]);

            // Create new details
            foreach ($request->items as $item) {
                $subtotal = $item['quantity'] * $item['unit_price'];
                
                $discountAmount = 0;
                $discountType = $item['discount_type'] ?? 'none';
                $discountValue = $item['discount_value'] ?? 0;
                
                if ($discountType !== 'none' && $discountValue > 0) {
                    $discountAmount = $this->discountTaxService->calculateAmount(
                        $subtotal,
                        $discountType,
                        $discountValue
                    );
                }
                
                $finalAmount = $subtotal - $discountAmount;

                PartSaleDetail::create([
                    'part_sale_id' => $partSale->id,
                    'part_id' => $item['part_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                    'discount_type' => $discountType,
                    'discount_value' => $discountValue,
                    'discount_amount' => $discountAmount,
                    'final_amount' => $finalAmount,
                ]);
            }

            // Recalculate totals
            $partSale->recalculateTotals();

            DB::commit();

            return redirect()
                ->route('part-sales.show', $partSale)
                ->with('success', 'Penjualan berhasil diupdate');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(PartSale $partSale)
    {
        // Only allow deleting draft sales
        if ($partSale->status !== 'draft') {
            return back()->withErrors(['error' => 'Hanya penjualan draft yang bisa dihapus']);
        }

        DB::beginTransaction();
        try {
            $partSale->details()->delete();
            $partSale->delete();

            DB::commit();

            return redirect()
                ->route('part-sales.index')
                ->with('success', 'Penjualan berhasil dihapus');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function updatePayment(Request $request, PartSale $partSale)
    {
        $request->validate([
            'payment_amount' => 'required|integer|min:1',
        ]);

        $newPaidAmount = $partSale->paid_amount + $request->payment_amount;

        if ($newPaidAmount > $partSale->grand_total) {
            return back()->withErrors(['error' => 'Jumlah pembayaran melebihi total']);
        }

        $partSale->update([
            'paid_amount' => $newPaidAmount,
            'remaining_amount' => $partSale->grand_total - $newPaidAmount,
            'payment_status' => $newPaidAmount >= $partSale->grand_total ? 'paid' : ($newPaidAmount > 0 ? 'partial' : 'unpaid'),
        ]);

        return back()->with('success', 'Pembayaran berhasil dicatat');
    }

    public function createFromOrder(Request $request)
    {
        $request->validate([
            'sales_order_id' => 'required|exists:part_sales_orders,id',
        ]);

        return redirect()->route('part-sales.create', [
            'sales_order_id' => $request->sales_order_id
        ]);
    }
}
