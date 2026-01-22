# Frontend Implementation Guide - Diskon & Pajak

## Quick Start untuk Frontend Developer

---

## 1. API Endpoints Siap Digunakan

### Purchases
```
POST /purchases
  - Items support per-item discount
  - Transaction supports discount + tax
  - Calculates grand_total automatically
```

### Part Purchases
```
POST /part-purchases
  - Items support per-item discount
  - Transaction supports discount + tax
  - Calculates grand_total automatically
```

### Part Sales
```
POST /parts/sales
  - Items support per-item discount
  - Transaction supports discount + tax
  - Calculates grand_total automatically
```

### Part Sales Orders
```
POST /part-sales-orders
  - Items support per-item discount
  - Transaction supports discount + tax
  - Calculates grand_total automatically
```

### Service Orders
```
POST /service-orders
  - Transaction supports discount + tax
  - Calculates grand_total automatically
```

---

## 2. Form Payload Example

### Full Payload with Discount & Tax:
```json
{
  "supplier_id": 1,
  "notes": "Optional notes",
  "items": [
    {
      "part_id": 5,
      "qty": 10,
      "unit_price": 100000,
      "discount_type": "percent",
      "discount_value": 10
    },
    {
      "part_id": 6,
      "qty": 5,
      "unit_price": 50000,
      "discount_type": "fixed",
      "discount_value": 25000
    }
  ],
  "discount_type": "percent",
  "discount_value": 5,
  "tax_type": "percent",
  "tax_value": 10
}
```

---

## 3. Form Fields to Add

### Per-Item Discount (Add to each item row):
```javascript
{
  "discount_type": "none|percent|fixed",  // Select dropdown
  "discount_value": 0                      // Number input
}
```

### Transaction-Level Discount & Tax (Add to form footer):
```javascript
{
  "discount_type": "none|percent|fixed",  // Select dropdown
  "discount_value": 0,                    // Number input
  "tax_type": "none|percent|fixed",       // Select dropdown
  "tax_value": 0                          // Number input
}
```

---

## 4. Real-Time Calculation Logic (React/JavaScript)

### Item-Level Discount Calculation:
```javascript
const calculateItemTotal = (item) => {
  const subtotal = item.qty * item.unit_price;
  
  if (item.discount_type === 'percent') {
    const discount = subtotal * (item.discount_value / 100);
    return subtotal - discount;
  } else if (item.discount_type === 'fixed') {
    return subtotal - item.discount_value;
  }
  return subtotal;
};

const getItemDiscount = (item) => {
  const subtotal = item.qty * item.unit_price;
  
  if (item.discount_type === 'percent') {
    return subtotal * (item.discount_value / 100);
  } else if (item.discount_type === 'fixed') {
    return item.discount_value;
  }
  return 0;
};
```

### Transaction-Level Calculation:
```javascript
const calculateGrandTotal = (items, discountType, discountValue, taxType, taxValue) => {
  // Calculate item subtotal (after item-level discounts)
  const itemsSubtotal = items.reduce((sum, item) => {
    return sum + calculateItemTotal(item);
  }, 0);
  
  // Apply transaction discount
  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = itemsSubtotal * (discountValue / 100);
  } else if (discountType === 'fixed') {
    discountAmount = discountValue;
  }
  
  const afterDiscount = itemsSubtotal - discountAmount;
  
  // Apply tax (on amount after discount)
  let taxAmount = 0;
  if (taxType === 'percent') {
    taxAmount = afterDiscount * (taxValue / 100);
  } else if (taxType === 'fixed') {
    taxAmount = taxValue;
  }
  
  return {
    items_subtotal: itemsSubtotal,
    discount_amount: discountAmount,
    tax_amount: taxAmount,
    grand_total: afterDiscount + taxAmount
  };
};
```

---

## 5. Form Component Structure

### Purchase/Sale Form Structure:
```jsx
<form>
  {/* Supplier/Customer fields */}
  
  {/* Items Section */}
  <div className="items-section">
    {items.map((item, idx) => (
      <div key={idx} className="item-row">
        <input name="items[${idx}].part_id" />
        <input name="items[${idx}].qty" type="number" />
        <input name="items[${idx}].unit_price" type="number" />
        
        {/* Per-Item Discount */}
        <select name="items[${idx}].discount_type">
          <option value="none">Tidak Ada</option>
          <option value="percent">Persen (%)</option>
          <option value="fixed">Nilai Tetap</option>
        </select>
        
        {item.discount_type !== 'none' && (
          <input 
            name="items[${idx}].discount_value" 
            type="number" 
            placeholder={item.discount_type === 'percent' ? '0-100' : '0'}
          />
        )}
        
        {/* Display calculated total */}
        <div className="item-total">
          Rp {calculateItemTotal(item).toLocaleString('id-ID')}
        </div>
      </div>
    ))}
  </div>
  
  {/* Summary Section */}
  <div className="summary">
    <div>Subtotal: Rp {itemsSubtotal.toLocaleString('id-ID')}</div>
    
    {/* Transaction Discount */}
    <div className="discount-section">
      <label>Diskon Transaksi:</label>
      <select name="discount_type">
        <option value="none">Tidak Ada</option>
        <option value="percent">Persen (%)</option>
        <option value="fixed">Nilai Tetap</option>
      </select>
      
      {discountType !== 'none' && (
        <input 
          name="discount_value" 
          type="number"
          placeholder={discountType === 'percent' ? '0-100' : '0'}
          onChange={(e) => setDiscountValue(e.target.value)}
        />
      )}
      
      <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
    </div>
    
    <div>Setelah Diskon: Rp {afterDiscount.toLocaleString('id-ID')}</div>
    
    {/* Tax */}
    <div className="tax-section">
      <label>Pajak:</label>
      <select name="tax_type">
        <option value="none">Tidak Ada</option>
        <option value="percent">Persen (%)</option>
        <option value="fixed">Nilai Tetap</option>
      </select>
      
      {taxType !== 'none' && (
        <input 
          name="tax_value" 
          type="number"
          placeholder={taxType === 'percent' ? '0-100' : '0'}
          onChange={(e) => setTaxValue(e.target.value)}
        />
      )}
      
      <span>+Rp {taxAmount.toLocaleString('id-ID')}</span>
    </div>
    
    <div className="grand-total">
      <strong>Total Akhir: Rp {grandTotal.toLocaleString('id-ID')}</strong>
    </div>
  </div>
  
  <button type="submit">Simpan</button>
</form>
```

---

## 6. Validation Rules

```javascript
const validateDiscountTax = (data) => {
  const errors = {};
  
  // Validate discount type
  if (data.discount_type && !['none', 'percent', 'fixed'].includes(data.discount_type)) {
    errors.discount_type = 'Tipe diskon tidak valid';
  }
  
  // Validate discount percentage
  if (data.discount_type === 'percent') {
    if (data.discount_value < 0 || data.discount_value > 100) {
      errors.discount_value = 'Diskon % harus antara 0-100';
    }
  }
  
  // Validate tax type
  if (data.tax_type && !['none', 'percent', 'fixed'].includes(data.tax_type)) {
    errors.tax_type = 'Tipe pajak tidak valid';
  }
  
  // Validate tax percentage
  if (data.tax_type === 'percent') {
    if (data.tax_value < 0 || data.tax_value > 100) {
      errors.tax_value = 'Pajak % harus antara 0-100';
    }
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};
```

---

## 7. Display in Show/Invoice Page

```jsx
<div className="invoice-summary">
  <table>
    <tbody>
      <tr>
        <td>Subtotal Items:</td>
        <td>Rp {purchase.total.toLocaleString('id-ID')}</td>
      </tr>
      
      {purchase.discount_amount > 0 && (
        <tr className="discount-row">
          <td>Diskon ({purchase.discount_type}):</td>
          <td>-Rp {purchase.discount_amount.toLocaleString('id-ID')}</td>
        </tr>
      )}
      
      {purchase.tax_amount > 0 && (
        <tr className="tax-row">
          <td>Pajak ({purchase.tax_type}):</td>
          <td>+Rp {purchase.tax_amount.toLocaleString('id-ID')}</td>
        </tr>
      )}
      
      <tr className="total-row">
        <td><strong>Total Akhir:</strong></td>
        <td><strong>Rp {purchase.grand_total.toLocaleString('id-ID')}</strong></td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 8. Update Existing Forms

### Where to Add Discount/Tax Fields:

**Purchases (resources/js/Pages/Dashboard/Parts/Purchases/Create.jsx)**
- Add per-item discount to items table
- Add transaction-level discount & tax to summary section

**Part Purchases (resources/js/Pages/Dashboard/PartPurchases/Create.jsx)**
- Add per-item discount to items section
- Add transaction-level discount & tax to form

**Part Sales (resources/js/Pages/Dashboard/Parts/Sales/Create.jsx)**
- Add per-item discount to items table
- Add transaction-level discount & tax to summary

**Part Sales Orders (resources/js/Pages/Dashboard/PartSalesOrders/Create.jsx)**
- Add per-item discount to items section
- Add transaction-level discount & tax to form

**Service Orders (resources/js/Pages/Dashboard/ServiceOrders/Create.jsx)**
- Add transaction-level discount & tax to summary section

---

## 9. Testing Checklist

- [ ] Form submission with per-item discount
- [ ] Form submission with transaction discount
- [ ] Form submission with tax
- [ ] Form submission with both discount & tax
- [ ] Real-time calculation updates correctly
- [ ] Display of discount/tax in show page
- [ ] Invoice shows discount breakdown
- [ ] No discount (default behavior) still works
- [ ] Validation errors show properly
- [ ] Large numbers format correctly

---

## 10. Notes

1. **Backward Compatibility**: Existing forms will work without discount/tax fields (default: none)
2. **Real-Time Updates**: Update calculations whenever items or discount/tax values change
3. **Formatting**: Use Rupiah format for display (Rp X.XXX.XXX)
4. **Validation**: Validate on both frontend and backend
5. **User Experience**: Show breakdown of discount and tax in summary

---

## Sample Component Hook:

```javascript
const useDiscountTax = () => {
  const calculateItemDiscount = (qty, unitPrice, discountType, discountValue) => {
    const subtotal = qty * unitPrice;
    if (discountType === 'percent') {
      return subtotal * (discountValue / 100);
    } else if (discountType === 'fixed') {
      return discountValue;
    }
    return 0;
  };
  
  const calculateTransactionTotal = (itemsSubtotal, discountType, discountValue, taxType, taxValue) => {
    let discountAmount = 0;
    if (discountType === 'percent') {
      discountAmount = itemsSubtotal * (discountValue / 100);
    } else if (discountType === 'fixed') {
      discountAmount = discountValue;
    }
    
    const afterDiscount = itemsSubtotal - discountAmount;
    
    let taxAmount = 0;
    if (taxType === 'percent') {
      taxAmount = afterDiscount * (taxValue / 100);
    } else if (taxType === 'fixed') {
      taxAmount = taxValue;
    }
    
    return {
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      grand_total: afterDiscount + taxAmount,
    };
  };
  
  return {
    calculateItemDiscount,
    calculateTransactionTotal,
  };
};
```

---

**SELAMAT! Backend sepenuhnya siap untuk integrasi frontend! 🚀**
