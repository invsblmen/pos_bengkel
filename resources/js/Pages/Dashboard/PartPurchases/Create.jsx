import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import toast from 'react-hot-toast';
import { IconPlus, IconTrash, IconArrowLeft } from '@tabler/icons-react';
import { todayLocalDate } from '@/Utils/datetime';

export default function Create({ suppliers, parts }) {
    const [formData, setFormData] = useState({
        supplier_id: '',
        purchase_date: todayLocalDate(),
        expected_delivery_date: '',
        notes: '',
        items: [],
        discount_type: 'none',
        discount_value: 0,
        tax_type: 'none',
        tax_value: 0,
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Item selection modal
    const [showItemModal, setShowItemModal] = useState(false);
    const [searchPart, setSearchPart] = useState('');
    const [selectedPart, setSelectedPart] = useState(null);
    const [itemQty, setItemQty] = useState(1);
    const [itemPrice, setItemPrice] = useState(0);
    const [itemDiscountType, setItemDiscountType] = useState('none');
    const [itemDiscountValue, setItemDiscountValue] = useState(0);
    const [itemMarginType, setItemMarginType] = useState('percent');
    const [itemMarginValue, setItemMarginValue] = useState(0);
    const [itemPromoDiscountType, setItemPromoDiscountType] = useState('none');
    const [itemPromoDiscountValue, setItemPromoDiscountValue] = useState(0);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const openItemModal = () => {
        setSelectedPart(null);
        setSearchPart('');
        setItemQty(1);
        setItemPrice(0);
        setItemDiscountType('none');
        setItemDiscountValue(0);
        setItemMarginType('percent');
        setItemMarginValue(0);
        setItemPromoDiscountType('none');
        setItemPromoDiscountValue(0);
        setShowItemModal(true);
    };

    const addItem = () => {
        if (!selectedPart) {
            toast.error('Please select a part');
            return;
        }
        if (itemQty < 1) {
            toast.error('Quantity must be at least 1');
            return;
        }
        if (itemPrice < 0) {
            toast.error('Price cannot be negative');
            return;
        }
        if (itemMarginValue < 0) {
            toast.error('Margin cannot be negative');
            return;
        }

        // Check if part already exists
        const exists = formData.items.find(i => i.part_id === selectedPart.id);
        if (exists) {
            toast.error('Part already added');
            return;
        }

        const newItem = {
            part_id: selectedPart.id,
            part_name: selectedPart.name,
            part_sku: selectedPart.sku,
            quantity: parseInt(itemQty),
            unit_price: parseInt(itemPrice),
            discount_type: itemDiscountType,
            discount_value: parseFloat(itemDiscountValue) || 0,
            subtotal: parseInt(itemQty) * parseInt(itemPrice),
            margin_type: itemMarginType,
            margin_value: parseFloat(itemMarginValue) || 0,
            promo_discount_type: itemPromoDiscountType,
            promo_discount_value: parseFloat(itemPromoDiscountValue) || 0,
        };

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, newItem],
        }));

        setShowItemModal(false);
        toast.success('Item added');
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
        toast.success('Item removed');
    };

    const updateItemQty = (index, qty) => {
        const newQty = parseInt(qty) || 0;
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index].quantity = newQty;
            newItems[index].subtotal = newQty * newItems[index].unit_price;
            return { ...prev, items: newItems };
        });
    };

    const updateItemPrice = (index, price) => {
        const newPrice = parseInt(price) || 0;
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index].unit_price = newPrice;
            newItems[index].subtotal = newItems[index].quantity * newPrice;
            return { ...prev, items: newItems };
        });
    };

    const calculateItemDiscount = (item) => {
        const subtotal = item.quantity * item.unit_price;
        if (item.discount_type === 'percent') {
            return subtotal * (item.discount_value / 100);
        } else if (item.discount_type === 'fixed') {
            return item.discount_value;
        }
        return 0;
    };

    const calculateSellingPrice = (unitCost, marginType, marginValue) => {
        if (marginType === 'percent') {
            return Math.round(unitCost + (unitCost * (marginValue / 100)));
        } else {
            return Math.round(unitCost + marginValue);
        }
    };

    const calculateItemTotal = (item) => {
        const subtotal = item.quantity * item.unit_price;
        return subtotal - calculateItemDiscount(item);
    };

    const itemsSubtotal = formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

    const transactionDiscount = (() => {
        if (formData.discount_type === 'percent') {
            return itemsSubtotal * (formData.discount_value / 100);
        } else if (formData.discount_type === 'fixed') {
            return formData.discount_value;
        }
        return 0;
    })();

    const afterDiscount = itemsSubtotal - transactionDiscount;

    const taxAmount = (() => {
        if (formData.tax_type === 'percent') {
            return afterDiscount * (formData.tax_value / 100);
        } else if (formData.tax_type === 'fixed') {
            return formData.tax_value;
        }
        return 0;
    })();

    const grandTotal = afterDiscount + taxAmount;

    const calculateTotal = () => {
        return grandTotal;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.supplier_id) {
            toast.error('Please select a supplier');
            return;
        }
        if (formData.items.length === 0) {
            toast.error('Please add at least one item');
            return;
        }

        setSubmitting(true);
        setErrors({});

        router.post(route('part-purchases.store'), formData, {
            onError: (err) => {
                setErrors(err);
                toast.error('Failed to create purchase');
            },
            onFinish: () => {
                setSubmitting(false);
            },
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const filteredParts = parts.filter(p =>
        p.name.toLowerCase().includes(searchPart.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchPart.toLowerCase())
    );

    return (
        <>
            <Head title="Create Part Purchase" />
            <div className="p-6">
                <div className="mb-6">
                    <button
                        onClick={() => router.visit(route('part-purchases.index'))}
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-2"
                    >
                        <IconArrowLeft size={16} />
                        <span>Back to Purchases</span>
                    </button>
                    <h1 className="text-2xl font-bold">Create New Purchase</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-4">
                        <h2 className="text-lg font-semibold mb-4">Purchase Information</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Supplier <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.supplier_id}
                                    onChange={(e) => handleChange('supplier_id', e.target.value)}
                                    className={`w-full h-11 px-4 rounded-xl border ${errors.supplier_id ? 'border-red-500' : 'border-slate-200'}`}
                                    required
                                >
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                {errors.supplier_id && <p className="text-xs text-red-500 mt-1">{errors.supplier_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Purchase Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.purchase_date}
                                    onChange={(e) => handleChange('purchase_date', e.target.value)}
                                    className={`w-full h-11 px-4 rounded-xl border ${errors.purchase_date ? 'border-red-500' : 'border-slate-200'}`}
                                    required
                                />
                                {errors.purchase_date && <p className="text-xs text-red-500 mt-1">{errors.purchase_date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Expected Delivery Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.expected_delivery_date}
                                    onChange={(e) => handleChange('expected_delivery_date', e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Notes
                                </label>
                                <input
                                    type="text"
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    placeholder="Optional notes..."
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Items</h2>
                            <button
                                type="button"
                                onClick={openItemModal}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                            >
                                <IconPlus size={16} />
                                <span>Add Item</span>
                            </button>
                        </div>

                        {formData.items.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Part</th>
                                            <th className="px-4 py-3 text-center font-semibold text-slate-700">Qty</th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-700">Harga</th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-700">Margin</th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-700">Harga Jual</th>
                                            <th className="px-4 py-3 text-center font-semibold text-slate-700">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.items.map((item, idx) => {
                                            const sellingPrice = calculateSellingPrice(item.unit_price, item.margin_type, item.margin_value);
                                            return (
                                            <tr key={idx} className="border-b border-slate-100">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-900">{item.part_name}</div>
                                                    <div className="text-xs text-slate-500">{item.part_sku}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItemQty(idx, e.target.value)}
                                                        min="1"
                                                        className="w-20 h-9 px-2 text-center rounded-lg border border-slate-200"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <input
                                                        type="number"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItemPrice(idx, e.target.value)}
                                                        min="0"
                                                        className="w-32 h-9 px-2 text-right rounded-lg border border-slate-200"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right text-xs">
                                                    <div className="text-blue-600 font-medium">{item.margin_type === 'percent' ? `${item.margin_value}%` : formatCurrency(item.margin_value)}</div>
                                                    <div className="text-slate-500">({item.margin_type === 'percent' ? 'persen' : 'tetap'})</div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-green-600">
                                                    {formatCurrency(sellingPrice)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(idx)}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <IconTrash size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>No items added yet. Click "Add Item" to start.</p>
                            </div>
                        )}
                        {errors.items && <p className="text-xs text-red-500 mt-2">{errors.items}</p>}

                        {/* Transaction Summary */}
                        {formData.items.length > 0 && (
                            <div className="mt-6 bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Ringkasan Transaksi</h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Subtotal Items:</span>
                                        <span className="font-medium">{formatCurrency(itemsSubtotal)}</span>
                                    </div>

                                    {/* Transaction Discount */}
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                                        <div className="grid grid-cols-12 gap-3 items-end mb-2">
                                            <div className="col-span-4">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Diskon Transaksi</label>
                                                <select value={formData.discount_type} onChange={(e) => handleChange('discount_type', e.target.value)} className="w-full h-10 rounded-lg border px-3 text-sm">
                                                    <option value="none">Tidak Ada</option>
                                                    <option value="percent">Persen (%)</option>
                                                    <option value="fixed">Nilai Tetap</option>
                                                </select>
                                            </div>
                                            {formData.discount_type !== 'none' && (
                                                <div className="col-span-4">
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        {formData.discount_type === 'percent' ? 'Nilai (%)' : 'Nilai (Rp)'}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.discount_value}
                                                        onChange={(e) => handleChange('discount_value', e.target.value)}
                                                        placeholder={formData.discount_type === 'percent' ? '0-100' : '0'}
                                                        className="w-full h-10 px-3 rounded-lg border"
                                                    />
                                                </div>
                                            )}
                                            <div className={`${formData.discount_type !== 'none' ? 'col-span-4' : 'col-span-8'} text-right`}>
                                                {transactionDiscount > 0 && (
                                                    <span className="text-sm text-red-600 font-medium">-{formatCurrency(transactionDiscount)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Setelah Diskon:</span>
                                        <span className="font-medium">{formatCurrency(afterDiscount)}</span>
                                    </div>

                                    {/* Tax */}
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                                        <div className="grid grid-cols-12 gap-3 items-end mb-2">
                                            <div className="col-span-4">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pajak</label>
                                                <select value={formData.tax_type} onChange={(e) => handleChange('tax_type', e.target.value)} className="w-full h-10 rounded-lg border px-3 text-sm">
                                                    <option value="none">Tidak Ada</option>
                                                    <option value="percent">Persen (%)</option>
                                                    <option value="fixed">Nilai Tetap</option>
                                                </select>
                                            </div>
                                            {formData.tax_type !== 'none' && (
                                                <div className="col-span-4">
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        {formData.tax_type === 'percent' ? 'Nilai (%)' : 'Nilai (Rp)'}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.tax_value}
                                                        onChange={(e) => handleChange('tax_value', e.target.value)}
                                                        placeholder={formData.tax_type === 'percent' ? '0-100' : '0'}
                                                        className="w-full h-10 px-3 rounded-lg border"
                                                    />
                                                </div>
                                            )}
                                            <div className={`${formData.tax_type !== 'none' ? 'col-span-4' : 'col-span-8'} text-right`}>
                                                {taxAmount > 0 && (
                                                    <span className="text-sm text-green-600 font-medium">+{formatCurrency(taxAmount)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-lg font-bold border-t-2 border-slate-300 pt-3">
                                        <span className="text-slate-900 dark:text-white">Total Akhir:</span>
                                        <span className="text-primary-600">{formatCurrency(grandTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.visit(route('part-purchases.index'))}
                            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || formData.items.length === 0}
                            className="px-6 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Creating...' : 'Create Purchase'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Item Selection Modal */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-lg font-semibold">Add Item</h3>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search parts..."
                                    value={searchPart}
                                    onChange={(e) => setSearchPart(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200"
                                />
                            </div>
                            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                                {filteredParts.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => {
                                            setSelectedPart(p);
                                            setItemPrice(p.buy_price || 0);
                                        }}
                                        className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                                            selectedPart?.id === p.id
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="font-medium text-slate-900">{p.name}</div>
                                        <div className="text-sm text-slate-500">SKU: {p.sku} | Stock: {p.stock}</div>
                                    </div>
                                ))}
                            </div>
                            {selectedPart && (
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                                            <input
                                                type="number"
                                                value={itemQty}
                                                onChange={(e) => setItemQty(e.target.value)}
                                                min="1"
                                                className="w-full h-11 px-4 rounded-xl border border-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Unit Price</label>
                                            <input
                                                type="number"
                                                value={itemPrice}
                                                onChange={(e) => setItemPrice(e.target.value)}
                                                min="0"
                                                className="w-full h-11 px-4 rounded-xl border border-slate-200"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2 border-t border-slate-200 pt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Tipe Diskon</label>
                                            <select
                                                value={itemDiscountType}
                                                onChange={(e) => setItemDiscountType(e.target.value)}
                                                className="w-full h-11 px-4 rounded-xl border border-slate-200"
                                            >
                                                <option value="none">Tidak Ada</option>
                                                <option value="percent">Persen (%)</option>
                                                <option value="fixed">Nilai Tetap</option>
                                            </select>
                                        </div>
                                        {itemDiscountType !== 'none' && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    {itemDiscountType === 'percent' ? 'Nilai Diskon (%)' : 'Nilai Diskon (Rp)'}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={itemDiscountValue}
                                                    onChange={(e) => setItemDiscountValue(e.target.value)}
                                                    min="0"
                                                    placeholder={itemDiscountType === 'percent' ? '0-100' : '0'}
                                                    className="w-full h-11 px-4 rounded-xl border border-slate-200"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-slate-200 pt-4 mt-4">
                                        <h4 className="text-sm font-semibold text-slate-700 mb-4">Pengaturan Margin &amp; Keuntungan</h4>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Tipe Margin</label>
                                                <select
                                                    value={itemMarginType}
                                                    onChange={(e) => setItemMarginType(e.target.value)}
                                                    className="w-full h-11 px-4 rounded-xl border border-slate-200"
                                                >
                                                    <option value="percent">Persen (%)</option>
                                                    <option value="fixed">Nilai Tetap (Rp)</option>
                                                </select>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Harga jual = Harga beli + {itemMarginType === 'percent' ? 'persentase' : 'nilai'} margin
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Nilai Margin {itemMarginType === 'percent' ? '(%)' : '(Rp)'}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={itemMarginValue}
                                                    onChange={(e) => setItemMarginValue(e.target.value)}
                                                    min="0"
                                                    step={itemMarginType === 'percent' ? '1' : '100'}
                                                    placeholder="0"
                                                    className="w-full h-11 px-4 rounded-xl border border-slate-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-200 pt-4 mt-4">
                                        <h4 className="text-sm font-semibold text-slate-700 mb-4">Diskon Promosi (Opsional)</h4>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Tipe Diskon Promo</label>
                                                <select
                                                    value={itemPromoDiscountType}
                                                    onChange={(e) => setItemPromoDiscountType(e.target.value)}
                                                    className="w-full h-11 px-4 rounded-xl border border-slate-200"
                                                >
                                                    <option value="none">Tidak Ada</option>
                                                    <option value="percent">Persen (%)</option>
                                                    <option value="fixed">Nilai Tetap (Rp)</option>
                                                </select>
                                            </div>
                                            {itemPromoDiscountType !== 'none' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Nilai Diskon Promo {itemPromoDiscountType === 'percent' ? '(%)' : '(Rp)'}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={itemPromoDiscountValue}
                                                        onChange={(e) => setItemPromoDiscountValue(e.target.value)}
                                                        min="0"
                                                        step={itemPromoDiscountType === 'percent' ? '1' : '100'}
                                                        placeholder="0"
                                                        className="w-full h-11 px-4 rounded-xl border border-slate-200"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowItemModal(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={addItem}
                                className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
