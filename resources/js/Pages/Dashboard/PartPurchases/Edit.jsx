import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import toast from 'react-hot-toast';
import { IconPlus, IconTrash, IconArrowLeft, IconPencil, IconTruck, IconCheck, IconX, IconAlertTriangle, IconPercentage } from '@tabler/icons-react';
import { todayLocalDate, extractDateFromISO } from '@/Utils/datetime';
import AddSupplierModal from '@/Components/Dashboard/AddSupplierModal';
import QuickCreatePartModal from '@/Components/Dashboard/QuickCreatePartModal';

export default function Edit({ purchase, suppliers, parts, categories = [] }) {
    const [localSuppliers, setLocalSuppliers] = useState(suppliers);
    const [localParts, setLocalParts] = useState(parts);
    const [showPartModal, setShowPartModal] = useState(false);
    const [createPartName, setCreatePartName] = useState('');
    const [showSupplierModal, setShowSupplierModal] = useState(false);

    // Initialize form with purchase data
    const [formData, setFormData] = useState({
        supplier_id: purchase.supplier_id || '',
        purchase_date: extractDateFromISO(purchase.purchase_date) || todayLocalDate(),
        expected_delivery_date: extractDateFromISO(purchase.expected_delivery_date) || '',
        notes: purchase.notes || '',
        items: purchase.details?.map(detail => ({
            part_id: detail.part_id,
            part_name: detail.part?.name || '',
            quantity: detail.quantity,
            unit_price: detail.unit_price,
            discount_type: detail.discount_type || 'none',
            discount_value: detail.discount_value || 0,
            subtotal: detail.subtotal,
            margin_type: 'percent',
            margin_value: 0,
            promo_discount_type: 'none',
            promo_discount_value: 0,
        })) || [],
        discount_type: purchase.discount_type || 'none',
        discount_value: purchase.discount_value || 0,
        tax_type: purchase.tax_type || 'none',
        tax_value: purchase.tax_value || 0,
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

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const calculateSellingPrice = (item) => {
        const itemTotal = calculateItemTotal(item);
        const costPerUnit = itemTotal / item.quantity;

        let markupAmount = 0;
        if (item.markup_type === 'percent') {
            markupAmount = costPerUnit * (item.markup_value / 100);
        } else if (item.markup_type === 'fixed') {
            markupAmount = item.markup_value;
        }

        return costPerUnit + markupAmount;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.supplier_id) {
            toast.error('Please select a supplier');
            return;
        }

        if (!formData.purchase_date) {
            toast.error('Please select purchase date');
            return;
        }

        if (formData.items.length === 0) {
            toast.error('Please add at least one item');
            return;
        }

        console.log('Submitting formData:', formData);
        setSubmitting(true);

        router.put(route('part-purchases.update', purchase.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Update success');
                toast.success('Purchase updated successfully!');
                router.visit(route('part-purchases.show', purchase.id));
            },
            onError: (errors) => {
                console.error('Update error:', errors);
                const firstError = errors?.error || Object.values(errors || {})[0];
                if (firstError) {
                    toast.error(firstError);
                } else {
                    toast.error('Failed to update purchase');
                }
                setErrors(errors);
                setSubmitting(false);
            },
            onFinish: () => {
                console.log('Update finished');
            },
        });
    };

    const filteredParts = localParts.filter(p => {
        if (!searchPart) return true;
        const lowerSearch = searchPart.toLowerCase();
        return (
            (p.name && p.name.toLowerCase().includes(lowerSearch)) ||
            (p.part_number && p.part_number.toLowerCase().includes(lowerSearch)) ||
            (p.barcode && p.barcode.toLowerCase().includes(lowerSearch))
        );
    });

    return (
        <>
            <Head title={`Edit Pembelian ${purchase.purchase_number}`} />
            <div className="p-6">
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
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Pembelian Sparepart</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Edit data pembelian sparepart dari supplier</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Warning for received purchases */}
                    {purchase.status === 'received' && (
                        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex items-start gap-3">
                            <IconAlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <div className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Pembelian Sudah Diterima</div>
                                <div className="text-amber-700 dark:text-amber-200">Pembelian ini sudah diterima dan stok sudah diperbarui. Pengeditan tidak disarankan karena mungkin menyebabkan inkonsistensi data.</div>
                            </div>
                        </div>
                    )}

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

                        {formData.items.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                <p className="text-slate-500 dark:text-slate-400 mb-3">Belum ada item yang ditambahkan</p>
                                <button
                                    type="button"
                                    onClick={openItemModal}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                                >
                                    <IconPlus size={18} />
                                    <span>Tambah Item Pertama</span>
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Part</th>
                                            <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Qty</th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Harga</th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Diskon</th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Subtotal</th>
                                            <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Harga Jual</th>
                                            <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {formData.items.map((item, idx) => {
                                            const sellingPrice = calculateSellingPrice(item);
                                            const discountTotal = calculateItemDiscount(item);
                                            const itemTotal = calculateItemTotal(item);
                                            return (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-900 dark:text-white">{item.part_name}</div>
                                                    {item.discount_type !== 'none' && (
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            Disc: {item.discount_type === 'percent' ? `${item.discount_value}%` : formatCurrency(item.discount_value)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItemQty(idx, e.target.value)}
                                                        min="1"
                                                        className="w-16 h-9 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-center text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <input
                                                        type="number"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItemPrice(idx, e.target.value)}
                                                        min="0"
                                                        className="w-28 h-9 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-right text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-semibold">
                                                    {discountTotal > 0 ? `-${formatCurrency(discountTotal)}` : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                                                    {formatCurrency(itemTotal)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                                                    {formatCurrency(sellingPrice)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditItemModal(idx)}
                                                            className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                                        >
                                                            <IconPencil size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(idx)}
                                                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                        )}
                        </div>
                    </div>

                    {/* Discount & Tax Section */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-6 overflow-hidden p-6">
                        <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                    <IconPercentage size={20} className="text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-lg text-slate-900 dark:text-white">Diskon & Pajak</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Pengaturan diskon dan pajak pembelian</p>
                                </div>
                            </div>

                            {/* Transaction Discount */}
                            <div className="mb-4">
                                <div className="grid grid-cols-12 gap-3 items-end">
                                    <div className="col-span-4">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Diskon Transaksi</label>
                                        <select
                                            value={formData.discount_type}
                                            onChange={(e) => handleChange('discount_type', e.target.value)}
                                            className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
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
                                                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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

                            <div className="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-300">Setelah Diskon:</span>
                                <span className="font-semibold text-slate-900 dark:text-white text-base">{formatCurrency(afterDiscount)}</span>
                            </div>

                            {/* Tax */}
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="grid grid-cols-12 gap-3 items-end">
                                    <div className="col-span-4">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Pajak</label>
                                        <select
                                            value={formData.tax_type}
                                            onChange={(e) => handleChange('tax_type', e.target.value)}
                                            className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
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
                                                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-sm mb-6 p-6">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Subtotal ({formData.items.length} items)</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(itemsSubtotal)}</span>
                                </div>
                                {transactionDiscount > 0 && (
                                    <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
                                        <span className="text-slate-600 dark:text-slate-400">Discount</span>
                                        <span className="font-semibold text-red-600">-{formatCurrency(transactionDiscount)}</span>
                                    </div>
                                )}
                                {taxAmount > 0 && (
                                    <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
                                        <span className="text-slate-600 dark:text-slate-400">Tax</span>
                                        <span className="font-semibold text-green-600">+{formatCurrency(taxAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t-2 border-slate-300 dark:border-slate-600 pt-3">
                                    <span className="text-lg font-bold text-slate-900 dark:text-white">Grand Total</span>
                                    <span className="text-2xl font-bold text-primary-600">{formatCurrency(grandTotal)}</span>
                                </div>
                            </div>
                        </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => router.visit(route('part-purchases.index'))}
                            disabled={submitting}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 dark:bg-slate-700 px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || formData.items.length === 0}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:shadow-xl hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <IconCheck size={20} />
                                    <span>Simpan Pembelian</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Add Supplier Modal */}
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
                    router.get(route('part-purchases.edit', purchase.id), {}, {
                        preserveScroll: true,
                        preserveState: true,
                        only: ['parts'],
                        onSuccess: (response) => {
                            const updatedParts = response.props?.parts || [];
                            setLocalParts(updatedParts);

                            const createdPart = updatedParts.find(p => p.name === createPartName);
                            if (createdPart) {
                                setSelectedPart(createdPart);
                                setItemPrice(createdPart.buy_price || createdPart.sell_price || 0);
                                toast.success('Sparepart berhasil ditambahkan dan dipilih');
                            }

                            setShowPartModal(false);
                            setCreatePartName('');
                            setShowItemModal(true);
                        }
                    });
                }}
            />

            {/* Item Selection Modal */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
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

                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cari Sparepart</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Ketik nama atau kode part..."
                                        value={searchPart}
                                        onChange={(e) => setSearchPart(e.target.value)}
                                        className="flex-1 h-11 px-4 rounded-xl border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCreatePartName(searchPart);
                                            setShowPartModal(true);
                                        }}
                                        className="h-11 px-4 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200 transition-colors flex items-center gap-2"
                                    >
                                        <IconPlus size={18} />
                                        <span className="hidden sm:inline">Baru</span>
                                    </button>
                                </div>
                            </div>

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
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold text-slate-900">{p.name}</div>
                                                {p.part_number && <div className="text-sm text-slate-500 mt-1">Kode: {p.part_number}</div>}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-slate-700">Stock: {p.stock}</div>
                                                <div className="text-xs text-slate-500">Harga: {formatCurrency(p.buy_price || 0)}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedPart && (
                                <div className="space-y-4 border-t pt-4">
                                    <div className="bg-primary-50 rounded-lg p-3">
                                        <p className="text-sm font-medium text-primary-900">
                                            Sparepart: <span className="font-semibold">{selectedPart.name}</span>
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah</label>
                                            <input
                                                type="number"
                                                value={itemQty}
                                                onChange={(e) => setItemQty(e.target.value)}
                                                min="1"
                                                className="w-full h-11 px-4 rounded-xl border"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Harga Satuan</label>
                                            <input
                                                type="number"
                                                value={itemPrice}
                                                onChange={(e) => setItemPrice(e.target.value)}
                                                min="0"
                                                className="w-full h-11 px-4 rounded-xl border"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Diskon Item</label>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <select
                                                value={itemDiscountType}
                                                onChange={(e) => setItemDiscountType(e.target.value)}
                                                className="w-full h-11 px-4 rounded-xl border"
                                            >
                                                <option value="none">Tidak Ada Diskon</option>
                                                <option value="percent">Persen (%)</option>
                                                <option value="fixed">Nilai Tetap</option>
                                            </select>
                                            {itemDiscountType !== 'none' && (
                                                <input
                                                    type="number"
                                                    value={itemDiscountValue}
                                                    onChange={(e) => setItemDiscountValue(e.target.value)}
                                                    min="0"
                                                    className="w-full h-11 px-4 rounded-xl border"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-slate-50 border-t px-6 py-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowItemModal(false);
                                    setEditingIndex(null);
                                }}
                                className="px-4 py-2 rounded-xl border text-slate-700 hover:bg-white transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={addItem}
                                disabled={!selectedPart}
                                className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
                            >
                                {editingIndex !== null ? 'Update Item' : 'Tambah Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
