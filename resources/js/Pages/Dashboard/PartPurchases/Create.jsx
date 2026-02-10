import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import toast from 'react-hot-toast';
import { IconPlus, IconTrash, IconArrowLeft, IconPencil, IconTruck, IconCheck, IconX } from '@tabler/icons-react';
import { todayLocalDate } from '@/Utils/datetime';
import AddSupplierModal from '@/Components/Dashboard/AddSupplierModal';
import QuickCreatePartModal from '@/Components/Dashboard/QuickCreatePartModal';

export default function Create({ suppliers, parts, categories = [] }) {
    const [localSuppliers, setLocalSuppliers] = useState(suppliers);
    const [localParts, setLocalParts] = useState(parts);
    const [showPartModal, setShowPartModal] = useState(false);
    const [createPartName, setCreatePartName] = useState('');
    const [showSupplierModal, setShowSupplierModal] = useState(false);

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
    const [editingIndex, setEditingIndex] = useState(null);
    const [selectedPart, setSelectedPart] = useState(null);
    const [itemQty, setItemQty] = useState(1);
    const [itemPrice, setItemPrice] = useState(0);
    const [itemDiscountType, setItemDiscountType] = useState('none');
    const [itemDiscountValue, setItemDiscountValue] = useState(0);

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
        setEditingIndex(null);
        setShowItemModal(true);
    };

    const openEditItemModal = (index) => {
        const item = formData.items[index];
        if (!item) return;
        const part = parts.find(p => p.id === item.part_id) || null;
        setSelectedPart(part);
        setSearchPart('');
        setItemQty(item.quantity || 1);
        setItemPrice(item.unit_price || 0);
        setItemDiscountType(item.discount_type || 'none');
        setItemDiscountValue(item.discount_value || 0);
        setEditingIndex(index);
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

        // Check if part already exists (ignore current item when editing)
        const exists = formData.items.find((i, idx) => i.part_id === selectedPart.id && idx !== editingIndex);
        if (exists) {
            toast.error('Part already added');
            return;
        }

        const newItem = {
            part_id: selectedPart.id,
            part_name: selectedPart.name,
            quantity: parseInt(itemQty),
            unit_price: parseInt(itemPrice),
            discount_type: itemDiscountType,
            discount_value: parseFloat(itemDiscountValue) || 0,
            subtotal: parseInt(itemQty) * parseInt(itemPrice),
            margin_type: 'percent',
            margin_value: 0,
            promo_discount_type: 'none',
            promo_discount_value: 0,
        };

        setFormData(prev => {
            if (editingIndex !== null) {
                const newItems = [...prev.items];
                newItems[editingIndex] = newItem;
                return { ...prev, items: newItems };
            }
            return {
                ...prev,
                items: [...prev.items, newItem],
            };
        });

        setShowItemModal(false);
        setEditingIndex(null);
        toast.success(editingIndex !== null ? 'Item updated' : 'Item added');
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

    const calculateSellingPrice = (normalUnitPrice) => {
        return Math.round(normalUnitPrice);
    };

    const calculateItemTotal = (item) => {
        const subtotal = item.quantity * item.unit_price;
        const discountTotal = calculateItemDiscount(item);
        return subtotal - discountTotal;
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
                const firstError = err?.error || Object.values(err || {})[0];
                if (firstError) {
                    toast.error(firstError);
                } else {
                    toast.error('Failed to create purchase');
                }
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

    const filteredParts = localParts.filter(p =>
        p.name?.toLowerCase().includes(searchPart.toLowerCase()) ||
        p.part_number?.toLowerCase().includes(searchPart.toLowerCase())
    );

    return (
        <>
            <Head title="Create Part Purchase" />
            <div className="p-6">
                {/* Header Section */}
                <div className="mb-6">
                    <button
                        onClick={() => router.visit(route('part-purchases.index'))}
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-4 transition-colors"
                    >
                        <IconArrowLeft size={16} />
                        <span>Kembali ke Pembelian</span>
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Buat Pembelian Sparepart</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Form pembelian sparepart dari supplier</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Purchase Information Section */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-6 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                            <div className="flex items-center gap-3 text-white">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <IconTruck size={20} />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-lg">Informasi Pembelian</h2>
                                    <p className="text-sm text-white/80">Data utama pembelian sparepart</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Supplier <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={formData.supplier_id}
                                            onChange={(e) => handleChange('supplier_id', e.target.value)}
                                            className={`flex-1 h-11 px-4 rounded-xl border transition-colors ${errors.supplier_id ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500`}
                                            required
                                        >
                                            <option value="">Pilih Supplier</option>
                                            {localSuppliers.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowSupplierModal(true)}
                                            className="h-11 px-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 transition-colors flex items-center gap-2 font-medium"
                                            title="Tambah supplier baru"
                                        >
                                            <IconPlus size={18} />
                                            <span className="hidden sm:inline">Baru</span>
                                        </button>
                                    </div>
                                    {errors.supplier_id && <p className="text-xs text-red-500 mt-1.5">{errors.supplier_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Tanggal Pembelian <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.purchase_date}
                                        onChange={(e) => handleChange('purchase_date', e.target.value)}
                                        className={`w-full h-11 px-4 rounded-xl border transition-colors ${errors.purchase_date ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500`}
                                        required
                                    />
                                    {errors.purchase_date && <p className="text-xs text-red-500 mt-1.5">{errors.purchase_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Tgl. Pengiriman Diharapkan
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.expected_delivery_date}
                                        onChange={(e) => handleChange('expected_delivery_date', e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Catatan
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.notes}
                                        onChange={(e) => handleChange('notes', e.target.value)}
                                        placeholder="Tambahkan catatan untuk pembelian ini..."
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-6 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-white">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <IconPlus size={20} />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-lg">Item Pembelian</h2>
                                    <p className="text-sm text-white/80">Daftar sparepart yang dibeli</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={openItemModal}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors font-medium"
                            >
                                <IconPlus size={18} />
                                <span>Tambah Item</span>
                            </button>
                        </div>

                        <div className="p-6">

                        {formData.items.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Part</th>
                                            <th className="px-4 py-3 text-center font-semibold text-slate-700">Qty</th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-700">Harga</th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-700">Diskon</th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-700">Subtotal</th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-700">Harga Jual</th>
                                            <th className="px-4 py-3 text-center font-semibold text-slate-700">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.items.map((item, idx) => {
                                            const sellingPrice = calculateSellingPrice(item.unit_price);
                                            const discountTotal = calculateItemDiscount(item);
                                            const itemTotal = calculateItemTotal(item);
                                            return (
                                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-900 dark:text-white">{item.part_name}</div>
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
                                                    {discountTotal > 0 ? (
                                                        <div className="text-red-600 font-medium">-{formatCurrency(discountTotal)}</div>
                                                    ) : (
                                                        <div className="text-slate-400">-</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-slate-700">
                                                    {formatCurrency(itemTotal)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-green-600">
                                                    {formatCurrency(sellingPrice)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditItemModal(idx)}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                                            title="Edit item"
                                                        >
                                                            <IconPencil size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(idx)}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Hapus item"
                                                        >
                                                            <IconTrash size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                <IconPlus size={48} className="mx-auto mb-4 opacity-40" />
                                <p className="font-medium">Belum ada item</p>
                                <p className="text-sm mt-1">Klik "Tambah Item" untuk memulai penambahan sparepart</p>
                            </div>
                        )}
                        {errors.items && <p className="text-xs text-red-500 mt-2">{errors.items}</p>}

                        {/* Transaction Summary */}
                        {formData.items.length > 0 && (
                            <div className="mt-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-6">Ringkasan Transaksi</h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm bg-white dark:bg-slate-800 p-3 rounded-lg">
                                        <span className="text-slate-600 dark:text-slate-300">Subtotal Item:</span>
                                        <span className="font-semibold text-slate-900 dark:text-white text-base">{formatCurrency(itemsSubtotal)}</span>
                                    </div>

                                    {/* Transaction Discount */}
                                    <div className="border-t border-slate-300 dark:border-slate-600 pt-4">
                                        <div className="grid grid-cols-12 gap-3 items-end mb-3">
                                            <div className="col-span-4">
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Diskon Transaksi</label>
                                                <select value={formData.discount_type} onChange={(e) => handleChange('discount_type', e.target.value)} className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                                                    <option value="none">Tidak Ada</option>
                                                    <option value="percent">Persen (%)</option>
                                                    <option value="fixed">Nilai Tetap</option>
                                                </select>
                                            </div>
                                            {formData.discount_type !== 'none' && (
                                                <div className="col-span-4">
                                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                        {formData.discount_type === 'percent' ? 'Nilai (%)' : 'Nilai (Rp)'}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.discount_value}
                                                        onChange={(e) => handleChange('discount_value', e.target.value)}
                                                        placeholder={formData.discount_type === 'percent' ? '0-100' : '0'}
                                                        className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    />
                                                </div>
                                            )}
                                            <div className={`${formData.discount_type !== 'none' ? 'col-span-4' : 'col-span-8'} text-right`}>
                                                {transactionDiscount > 0 && (
                                                    <span className="text-sm text-red-600 dark:text-red-400 font-semibold">-{formatCurrency(transactionDiscount)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-sm bg-white dark:bg-slate-800 p-3 rounded-lg">
                                        <span className="text-slate-600 dark:text-slate-300">Setelah Diskon:</span>
                                        <span className="font-semibold text-slate-900 dark:text-white text-base">{formatCurrency(afterDiscount)}</span>
                                    </div>

                                    {/* Tax */}
                                    <div className="border-t border-slate-300 dark:border-slate-600 pt-4">
                                        <div className="grid grid-cols-12 gap-3 items-end mb-3">
                                            <div className="col-span-4">
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Pajak</label>
                                                <select value={formData.tax_type} onChange={(e) => handleChange('tax_type', e.target.value)} className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                                                    <option value="none">Tidak Ada</option>
                                                    <option value="percent">Persen (%)</option>
                                                    <option value="fixed">Nilai Tetap</option>
                                                </select>
                                            </div>
                                            {formData.tax_type !== 'none' && (
                                                <div className="col-span-4">
                                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                        {formData.tax_type === 'percent' ? 'Nilai (%)' : 'Nilai (Rp)'}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.tax_value}
                                                        onChange={(e) => handleChange('tax_value', e.target.value)}
                                                        placeholder={formData.tax_type === 'percent' ? '0-100' : '0'}
                                                        className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    />
                                                </div>
                                            )}
                                            <div className={`${formData.tax_type !== 'none' ? 'col-span-4' : 'col-span-8'} text-right`}>
                                                {taxAmount > 0 && (
                                                    <span className="text-sm text-green-600 dark:text-green-400 font-semibold">+{formatCurrency(taxAmount)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-base bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-lg font-bold border-t-2 border-slate-300 dark:border-slate-600">
                                        <span>Total Akhir:</span>
                                        <span>{formatCurrency(grandTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => router.visit(route('part-purchases.index'))}
                            className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || formData.items.length === 0}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <IconCheck size={18} />
                            {submitting ? 'Menyimpan...' : 'Buat Pembelian'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Item Selection Modal */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-white">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <IconPlus size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {editingIndex !== null ? 'Edit Item' : 'Tambah Item'}
                                    </h3>
                                    <p className="text-sm text-white/80">Pilih sparepart untuk ditambahkan</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowItemModal(false);
                                    setEditingIndex(null);
                                }}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                            >
                                <IconX size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cari Sparepart</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Ketik nama atau kode part..."
                                        value={searchPart}
                                        onChange={(e) => setSearchPart(e.target.value)}
                                        className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCreatePartName(searchPart);
                                            setShowPartModal(true);
                                        }}
                                        className="h-11 px-4 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 border border-primary-200 dark:border-primary-800 transition-colors flex items-center gap-2 font-medium whitespace-nowrap"
                                        title="Tambah sparepart baru"
                                    >
                                        <IconPlus size={18} />
                                        <span className="hidden sm:inline">Baru</span>
                                    </button>
                                </div>
                            </div>

                            {/* Parts List */}
                            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                                {filteredParts.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => {
                                            setSelectedPart(p);
                                            setItemPrice(p.buy_price || 0);
                                        }}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            selectedPart?.id === p.id
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                                                {p.part_number && <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kode: {p.part_number}</div>}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Stock: {p.stock}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">Harga Beli: {formatCurrency(p.buy_price || 0)}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredParts.length === 0 && (
                                    <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                                        <p>Tidak ada sparepart yang sesuai</p>
                                    </div>
                                )}
                            </div>

                            {/* Form Section */}
                            {selectedPart && (
                                <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                                    <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
                                        <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
                                            Sparepart: <span className="font-semibold">{selectedPart.name}</span>
                                        </p>
                                    </div>

                                    {/* Quantity & Price */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jumlah <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                value={itemQty}
                                                onChange={(e) => setItemQty(e.target.value)}
                                                min="1"
                                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Harga Satuan <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                value={itemPrice}
                                                onChange={(e) => setItemPrice(e.target.value)}
                                                min="0"
                                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Discount Section */}
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Diskon Item (Negosiasi)</label>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <select
                                                    value={itemDiscountType}
                                                    onChange={(e) => setItemDiscountType(e.target.value)}
                                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                                                >
                                                    <option value="none">Tidak Ada Diskon</option>
                                                    <option value="percent">Persen (%)</option>
                                                    <option value="fixed">Nilai Tetap (Rp)</option>
                                                </select>
                                            </div>
                                            {itemDiscountType !== 'none' && (
                                                <div>
                                                    <input
                                                        type="number"
                                                        value={itemDiscountValue}
                                                        onChange={(e) => setItemDiscountValue(e.target.value)}
                                                        min="0"
                                                        placeholder={itemDiscountType === 'percent' ? '0-100' : '0'}
                                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Margin Info */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                        <p className="text-sm text-blue-900 dark:text-blue-100">
                                            <span className="font-semibold">ℹ️ Margin Otomatis:</span> Margin dan keuntungan akan dihitung secara otomatis dari selisih harga normal dan harga setelah diskon.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowItemModal(false);
                                    setEditingIndex(null);
                                }}
                                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-white dark:hover:bg-slate-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={addItem}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:shadow-lg hover:shadow-primary-500/50 transition-all flex items-center gap-2"
                            >
                                <IconCheck size={16} />
                                {editingIndex !== null ? 'Update Item' : 'Tambah Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Supplier Modal */}
            <AddSupplierModal
                isOpen={showSupplierModal}
                onClose={() => setShowSupplierModal(false)}
                onSuccess={(supplier) => {
                    setLocalSuppliers([...localSuppliers, supplier]);
                    setFormData(prev => ({ ...prev, supplier_id: supplier.id }));
                    toast.success('Supplier berhasil ditambahkan dan dipilih');
                }}
            />

            {/* Quick Create Part Modal */}
            <QuickCreatePartModal
                isOpen={showPartModal}
                onClose={() => {
                    setShowPartModal(false);
                    setCreatePartName('');
                }}
                initialName={createPartName}
                categories={categories}
                onPartCreated={() => {
                    // Refetch parts list after part creation
                    router.get(route('part-purchases.create'), {}, {
                        preserveScroll: true,
                        preserveState: true, // Preserve component state to keep modals open
                        only: ['parts'],
                        onSuccess: (response) => {
                            const updatedParts = response.props?.parts || [];
                            setLocalParts(updatedParts);

                            // Find and select the newly created part by name
                            const createdPart = updatedParts.find(p => p.name === createPartName);
                            if (createdPart) {
                                setSelectedPart(createdPart);
                                setItemPrice(createdPart.buy_price || createdPart.sell_price || 0);
                                toast.success('Sparepart berhasil ditambahkan dan dipilih');
                            }

                            // Close only the create part modal, keep item selection modal open
                            setShowPartModal(false);
                            setCreatePartName('');
                            // Explicitly keep the item selection modal open
                            setShowItemModal(true);
                        }
                    });
                }}
                onSuccess={(newPart) => {
                    if (newPart && newPart.id) {
                        // Update local parts list with the new part
                        setLocalParts(prev => [...prev, newPart]);
                        // Auto-select the newly created part
                        setSelectedPart(newPart);
                        setItemPrice(newPart.buy_price || newPart.sell_price || 0);
                        setShowPartModal(false);
                        setCreatePartName('');
                        toast.success('Sparepart berhasil ditambahkan dan dipilih');
                    }
                }}
            />
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
