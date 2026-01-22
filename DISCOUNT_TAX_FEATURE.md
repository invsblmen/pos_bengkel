# Dokumentasi Fitur Diskon dan Pajak (Discount & Tax Feature)

## Ringkasan Fitur
Sistem POS Bengkel sekarang mendukung diskon dan pajak yang fleksibel untuk semua jenis transaksi:
- **Pembelian** (Purchases, Part Purchases)
- **Penjualan** (Part Sales, Part Sales Orders)
- **Servis Order** (Service Orders)

Diskon dapat diterapkan **per item** atau **per transaksi**, dan pajak dapat ditambahkan sebagai **persentase** atau **nilai tetap**.

---

## Database Schema

### Tabel Pembelian (Purchases)
```sql
ALTER TABLE purchases ADD COLUMN (
    discount_type ENUM('none', 'percent', 'fixed') DEFAULT 'none',
    discount_value DECIMAL(12,2) DEFAULT 0,
    discount_amount BIGINT DEFAULT 0,
    tax_type ENUM('none', 'percent', 'fixed') DEFAULT 'none',
    tax_value DECIMAL(12,2) DEFAULT 0,
    tax_amount BIGINT DEFAULT 0,
    grand_total BIGINT DEFAULT 0
);

ALTER TABLE purchase_details ADD COLUMN (
    discount_type ENUM('none', 'percent', 'fixed') DEFAULT 'none',
    discount_value DECIMAL(12,2) DEFAULT 0,
    discount_amount BIGINT DEFAULT 0,
    final_amount BIGINT DEFAULT 0
);
```

### Tabel Penjualan Suku Cadang (Part Sales)
```sql
ALTER TABLE part_sales ADD COLUMN (
    discount_type ENUM('none', 'percent', 'fixed') DEFAULT 'none',
    discount_value DECIMAL(12,2) DEFAULT 0,
    discount_amount BIGINT DEFAULT 0,
    tax_type ENUM('none', 'percent', 'fixed') DEFAULT 'none',
    tax_value DECIMAL(12,2) DEFAULT 0,
    tax_amount BIGINT DEFAULT 0,
    grand_total BIGINT DEFAULT 0
);

ALTER TABLE part_sale_details ADD COLUMN (
    discount_type ENUM('none', 'percent', 'fixed') DEFAULT 'none',
    discount_value DECIMAL(12,2) DEFAULT 0,
    discount_amount BIGINT DEFAULT 0,
    final_amount BIGINT DEFAULT 0
);
```

### Tabel Servis Order (Service Orders)
```sql
ALTER TABLE service_orders ADD COLUMN (
    discount_type ENUM('none', 'percent', 'fixed') DEFAULT 'none',
    discount_value DECIMAL(12,2) DEFAULT 0,
    discount_amount BIGINT DEFAULT 0,
    tax_type ENUM('none', 'percent', 'fixed') DEFAULT 'none',
    tax_value DECIMAL(12,2) DEFAULT 0,
    tax_amount BIGINT DEFAULT 0,
    grand_total BIGINT DEFAULT 0
);

ALTER TABLE service_order_details ADD COLUMN (
    discount_type ENUM('none', 'percent', 'fixed') DEFAULT 'none',
    discount_value DECIMAL(12,2) DEFAULT 0,
    discount_amount BIGINT DEFAULT 0,
    final_amount BIGINT DEFAULT 0
);
```

---

## Model Architecture

### DiscountTaxService (App\Services\DiscountTaxService)
Kelas utility untuk menghitung diskon dan pajak. Menyediakan static methods:

#### Metode Tersedia:

1. **calculateDiscount($subtotal, $discountType, $discountValue)**
   - Menghitung jumlah diskon
   - Return: Integer (dalam satuan terkecil, e.g. cents)
   - Contoh:
     ```php
     // Diskon 10% dari 100,000
     DiscountTaxService::calculateDiscount(100000, 'percent', 10); // 10000
     
     // Diskon tetap 5,000
     DiscountTaxService::calculateDiscount(100000, 'fixed', 50); // 5000
     ```

2. **calculateTax($amount, $taxType, $taxValue)**
   - Menghitung jumlah pajak
   - Return: Integer
   - Contoh:
     ```php
     // Pajak 10% dari 90,000
     DiscountTaxService::calculateTax(90000, 'percent', 10); // 9000
     
     // Pajak tetap 8,000
     DiscountTaxService::calculateTax(90000, 'fixed', 80); // 8000
     ```

3. **calculateAmountWithDiscount($subtotal, $discountType, $discountValue)**
   - Menghitung jumlah setelah diskon
   - Return: Integer
   - Contoh:
     ```php
     // 100,000 - diskon 10%
     DiscountTaxService::calculateAmountWithDiscount(100000, 'percent', 10); // 90000
     ```

4. **calculateTotal($subtotal, $discountType, $discountValue, $taxType, $taxValue)**
   - Menghitung total keseluruhan dengan diskon dan pajak
   - Return: Array dengan keys: discount_amount, tax_amount, grand_total
   - Contoh:
     ```php
     $totals = DiscountTaxService::calculateTotal(
         100000,      // subtotal
         'percent',   // discount_type
         10,          // discount_value (10%)
         'percent',   // tax_type
         10           // tax_value (10%)
     );
     
     // Result:
     // [
     //     'discount_amount' => 10000,
     //     'tax_amount' => 9000,
     //     'grand_total' => 99000
     // ]
     ```

5. **validate($data)**
   - Memvalidasi parameter diskon dan pajak
   - Throws: InvalidArgumentException jika data invalid

---

## Model Updates

### Purchase Model
```php
public function recalculateTotals()
{
    // Menghitung ulang total dari detail
    // Memperbarui: discount_amount, tax_amount, grand_total
}
```

### PartPurchase Model
```php
public function recalculateTotals()
{
    // Menghitung ulang total pembelian suku cadang
}
```

### PartSale Model
```php
public function recalculateTotals()
{
    // Menghitung ulang total penjualan suku cadang
}
```

### ServiceOrder Model
```php
public function recalculateTotals()
{
    // Menghitung ulang total servis order
    // Subtotal = labor_cost + material_cost + detail amounts
}
```

### Detail Models
- PurchaseDetail, PartSaleDetail, ServiceOrderDetail memiliki method:
```php
public function calculateFinalAmount()
{
    // Menghitung final_amount berdasarkan diskon per item
}
```

---

## Tipe Diskon & Pajak

### 1. Diskon Per Item (Item-Level Discount)
- Diterapkan pada setiap baris item dalam transaksi
- Disimpan di tabel detail (purchase_details, part_sale_details, service_order_details)
- Jenis:
  - **none**: Tidak ada diskon
  - **percent**: Diskon berdasarkan persentase (0-100%)
  - **fixed**: Diskon nilai tetap

Contoh penggunaan:
```
Item 1: Harga Rp 100,000 → Diskon 20% → Final Rp 80,000
Item 2: Harga Rp 50,000 → Diskon Rp 5,000 (fixed) → Final Rp 45,000
Total Item: Rp 125,000
```

### 2. Diskon Per Transaksi (Transaction-Level Discount)
- Diterapkan pada seluruh transaksi
- Disimpan di tabel header (purchases, part_sales, service_orders)
- Jenis:
  - **none**: Tidak ada diskon
  - **percent**: Diskon berdasarkan persentase dari subtotal
  - **fixed**: Diskon nilai tetap

Contoh penggunaan:
```
Subtotal: Rp 100,000
Diskon: 10% → Rp 10,000
Pajak: 10% dari (Rp 100,000 - Rp 10,000) = Rp 9,000
Grand Total: Rp 99,000
```

### 3. Pajak (Tax)
- Hanya diterapkan di level transaksi
- Dihitung dari jumlah setelah diskon transaksi
- Jenis:
  - **none**: Tidak ada pajak
  - **percent**: Pajak berdasarkan persentase (0-100%)
  - **fixed**: Pajak nilai tetap

---

## Formula Perhitungan

### Per Item Discount:
```
final_amount = subtotal - discount_amount

Jika discount_type = 'percent':
    discount_amount = subtotal × (discount_value / 100)
    
Jika discount_type = 'fixed':
    discount_amount = discount_value
```

### Per Transaction:
```
Subtotal dari semua item → Terapkan diskon transaksi

amount_after_discount = subtotal - discount_amount

Jika discount_type = 'percent':
    discount_amount = subtotal × (discount_value / 100)
    
Jika discount_type = 'fixed':
    discount_amount = discount_value

Terapkan pajak ke amount_after_discount:

Jika tax_type = 'percent':
    tax_amount = amount_after_discount × (tax_value / 100)
    
Jika tax_type = 'fixed':
    tax_amount = tax_value

Grand Total = amount_after_discount + tax_amount
```

---

## Implementasi di Controller

### Contoh di PurchaseController:
```php
public function store(Request $request)
{
    $request->validate([
        'invoice' => 'required|unique:purchases',
        'supplier_id' => 'required|exists:suppliers,id',
        'details' => 'required|array',
        'details.*.part_id' => 'required|exists:parts,id',
        'details.*.qty' => 'required|integer|min:1',
        'details.*.unit_price' => 'required|numeric|min:0',
        'details.*.discount_type' => 'nullable|in:none,percent,fixed',
        'details.*.discount_value' => 'nullable|numeric|min:0',
        'discount_type' => 'nullable|in:none,percent,fixed',
        'discount_value' => 'nullable|numeric|min:0',
        'tax_type' => 'nullable|in:none,percent,fixed',
        'tax_value' => 'nullable|numeric|min:0',
    ]);
    
    $purchase = Purchase::create([
        'invoice' => $request->invoice,
        'supplier_id' => $request->supplier_id,
        'discount_type' => $request->discount_type ?? 'none',
        'discount_value' => $request->discount_value ?? 0,
        'tax_type' => $request->tax_type ?? 'none',
        'tax_value' => $request->tax_value ?? 0,
    ]);
    
    // Simpan detail items
    foreach ($request->details as $detail) {
        $purchaseDetail = $purchase->details()->create([
            'part_id' => $detail['part_id'],
            'qty' => $detail['qty'],
            'unit_price' => $detail['unit_price'],
            'subtotal' => $detail['qty'] * $detail['unit_price'],
            'discount_type' => $detail['discount_type'] ?? 'none',
            'discount_value' => $detail['discount_value'] ?? 0,
        ]);
        
        // Hitung final_amount untuk detail
        $purchaseDetail->calculateFinalAmount()->save();
    }
    
    // Hitung total keseluruhan
    $purchase->recalculateTotals()->save();
    
    return redirect()->back()->with('success', 'Purchase created.');
}
```

---

## Frontend Implementation (React/Inertia)

### State untuk Form:
```javascript
const [formData, setFormData] = useState({
    details: [
        {
            part_id: null,
            qty: 1,
            unit_price: 0,
            discount_type: 'none',
            discount_value: 0,
        }
    ],
    discount_type: 'none',
    discount_value: 0,
    tax_type: 'none',
    tax_value: 0,
});
```

### Perhitungan Real-Time di Frontend:
```javascript
// Hitung final amount per item
const calculateItemTotal = (detail) => {
    const subtotal = detail.qty * detail.unit_price;
    
    if (detail.discount_type === 'percent') {
        const discount = subtotal * (detail.discount_value / 100);
        return subtotal - discount;
    } else if (detail.discount_type === 'fixed') {
        return subtotal - detail.discount_value;
    }
    return subtotal;
};

// Hitung grand total
const calculateGrandTotal = () => {
    const subtotal = formData.details.reduce((sum, detail) => {
        return sum + calculateItemTotal(detail);
    }, 0);
    
    let discountAmount = 0;
    if (formData.discount_type === 'percent') {
        discountAmount = subtotal * (formData.discount_value / 100);
    } else if (formData.discount_type === 'fixed') {
        discountAmount = formData.discount_value;
    }
    
    const afterDiscount = subtotal - discountAmount;
    
    let taxAmount = 0;
    if (formData.tax_type === 'percent') {
        taxAmount = afterDiscount * (formData.tax_value / 100);
    } else if (formData.tax_type === 'fixed') {
        taxAmount = formData.tax_value;
    }
    
    return afterDiscount + taxAmount;
};
```

---

## Migrasi Database

Tiga file migrasi telah dibuat:
1. `2026_01_13_000001_add_discount_tax_to_purchases.php`
2. `2026_01_13_000002_add_discount_tax_to_sales.php`
3. `2026_01_13_000003_add_discount_tax_to_service_orders.php`

Jalankan migrasi:
```bash
php artisan migrate
```

---

## Testing

### Unit Test untuk DiscountTaxService:
```php
public function testCalculatePercentDiscount()
{
    $result = DiscountTaxService::calculateDiscount(100000, 'percent', 10);
    $this->assertEquals(10000, $result);
}

public function testCalculateFixedDiscount()
{
    $result = DiscountTaxService::calculateDiscount(100000, 'fixed', 50);
    $this->assertEquals(5000, $result);
}

public function testCalculateTotal()
{
    $result = DiscountTaxService::calculateTotal(100000, 'percent', 10, 'percent', 10);
    
    $this->assertEquals(10000, $result['discount_amount']);
    $this->assertEquals(9000, $result['tax_amount']);
    $this->assertEquals(99000, $result['grand_total']);
}
```

---

## Catatan Penting

1. **Satuan Numerik**: Semua perhitungan menggunakan integer (dalam satuan terkecil, e.g., cents/rupiah).
2. **Validasi**: Gunakan `DiscountTaxService::validate()` sebelum menyimpan data.
3. **Recalculation**: Selalu panggil `recalculateTotals()` pada model setelah mengubah detail items.
4. **Two-Level Discount**: Sistem mendukung diskon per-item DAN per-transaksi secara bersamaan.
5. **Tax on Discounted Amount**: Pajak selalu dihitung dari jumlah SETELAH diskon transaksi diterapkan.

---

## Roadmap untuk Frontend Implementation

- [ ] Update Purchase Create form dengan diskon/pajak
- [ ] Update Part Sale Create form dengan diskon/pajak
- [ ] Update Service Order Create form dengan diskon/pajak
- [ ] Tambah display diskon/pajak di form editing
- [ ] Update invoice/receipt display untuk menampilkan breakdown diskon dan pajak
- [ ] Tambah report untuk analisis diskon yang diberikan
