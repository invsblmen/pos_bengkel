import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function Create({ customers, parts, salesOrder }) {
    const { flash } = usePage().props;
    const [formData, setFormData] = useState({
        customer_id: salesOrder?.customer_id || '',
        sale_date: new Date().toISOString().split('T')[0],
        items: salesOrder ? salesOrder.details.map(d => ({
            part_id: d.part_id,
            quantity: d.quantity,
            unit_price: d.unit_price,
            discount_type: 'none',
            discount_value: 0,
        })) : [{ part_id: '', quantity: 1, unit_price: 0, discount_type: 'none', discount_value: 0 }],
        discount_type: 'none',
        discount_value: 0,
        tax_type: 'none',
        tax_value: 0,
        paid_amount: 0,
        notes: '',
        part_sales_order_id: salesOrder?.id || null,
    });

    const [errors, setErrors] = useState({});

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = field === 'unit_price' || field === 'quantity' ? parseInt(value) : value;
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { part_id: '', quantity: 1, unit_price: 0, discount_type: 'none', discount_value: 0 }]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const calculateItemSubtotal = (quantity, unitPrice) => {
        return quantity * unitPrice;
    };

    const calculateItemDiscount = (subtotal, discountType, discountValue) => {
        if (discountType === 'percent') {
            return Math.floor(subtotal * (discountValue / 100));
        } else if (discountType === 'fixed') {
            return Math.floor(discountValue);
        }
        return 0;
    };

    const calculateTotals = () => {
        let subtotal = 0;
        formData.items.forEach(item => {
            subtotal += calculateItemSubtotal(item.quantity, item.unit_price);
        });

        const discount = calculateItemDiscount(subtotal, formData.discount_type, formData.discount_value);
        const subtotalAfterDiscount = subtotal - discount;

        let tax = 0;
        if (formData.tax_type === 'percent') {
            tax = Math.floor(subtotalAfterDiscount * (formData.tax_value / 100));
        } else if (formData.tax_type === 'fixed') {
            tax = Math.floor(formData.tax_value);
        }

        const total = subtotalAfterDiscount + tax;
        return { subtotal, discount, tax, total };
    };

    const totals = calculateTotals();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (formData.items.length === 0) {
            setErrors({ items: 'Minimal ada satu item' });
            return;
        }

        router.post(route('part-sales.store'), {
            ...formData,
            paid_amount: formData.paid_amount || 0,
        }, {
            onError: (errors) => setErrors(errors),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Buat Penjualan Sparepart" />
            
            <div className="py-6">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Buat Penjualan Sparepart</h1>
                        {salesOrder && (
                            <p className="text-sm text-gray-600 mt-2">Dari SO: {salesOrder.so_number}</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Penjualan</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pelanggan</label>
                                    <select
                                        value={formData.customer_id}
                                        onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Pilih Pelanggan --</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.customer_id} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Penjualan</label>
                                    <input
                                        type="date"
                                        value={formData.sale_date}
                                        onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <InputError message={errors.sale_date} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dibayar (Rp)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.paid_amount}
                                        onChange={(e) => setFormData({ ...formData, paid_amount: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <InputError message={errors.paid_amount} />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Items */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Penjualan</h2>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Sparepart</th>
                                            <th className="px-4 py-2 text-center">Qty</th>
                                            <th className="px-4 py-2 text-right">Harga Satuan</th>
                                            <th className="px-4 py-2 text-right">Subtotal</th>
                                            <th className="px-4 py-2 text-center">Diskon Type</th>
                                            <th className="px-4 py-2 text-right">Diskon</th>
                                            <th className="px-4 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {formData.items.map((item, index) => {
                                            const subtotal = calculateItemSubtotal(item.quantity, item.unit_price);
                                            const discount = calculateItemDiscount(subtotal, item.discount_type, item.discount_value);
                                            return (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">
                                                        <select
                                                            value={item.part_id}
                                                            onChange={(e) => handleItemChange(index, 'part_id', e.target.value)}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded"
                                                        >
                                                            <option value="">-- Pilih --</option>
                                                            {parts.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-right">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={item.unit_price}
                                                            onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-medium">
                                                        {subtotal.toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <select
                                                            value={item.discount_type}
                                                            onChange={(e) => handleItemChange(index, 'discount_type', e.target.value)}
                                                            className="w-24 px-1 py-1 border border-gray-300 rounded text-xs"
                                                        >
                                                            <option value="none">None</option>
                                                            <option value="percent">%</option>
                                                            <option value="fixed">Fixed</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-2 text-right">
                                                        {item.discount_type !== 'none' && (
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={item.discount_value}
                                                                onChange={(e) => handleItemChange(index, 'discount_value', e.target.value)}
                                                                className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                                                            />
                                                        )}
                                                        {discount > 0 && (
                                                            <div className="text-sm font-medium text-red-600">
                                                                -{discount.toLocaleString('id-ID')}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="text-red-600 hover:text-red-900 text-sm"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <button
                                type="button"
                                onClick={addItem}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                                + Tambah Item
                            </button>
                            <InputError message={errors.items} />
                        </div>

                        {/* Discount & Tax */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Diskon & Pajak Transaksi</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Diskon</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="none">Tidak Ada</option>
                                        <option value="percent">Persen (%)</option>
                                        <option value="fixed">Fixed (Rp)</option>
                                    </select>
                                </div>

                                {formData.discount_type !== 'none' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Diskon</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.discount_value}
                                            onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Pajak</label>
                                    <select
                                        value={formData.tax_type}
                                        onChange={(e) => setFormData({ ...formData, tax_type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="none">Tidak Ada</option>
                                        <option value="percent">Persen (%)</option>
                                        <option value="fixed">Fixed (Rp)</option>
                                    </select>
                                </div>

                                {formData.tax_type !== 'none' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Pajak</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.tax_value}
                                            onChange={(e) => setFormData({ ...formData, tax_value: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-50 rounded-lg shadow-md p-6">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Subtotal</span>
                                    <span className="font-medium">Rp {totals.subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                {totals.discount > 0 && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Diskon</span>
                                        <span>-Rp {totals.discount.toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                {totals.tax > 0 && (
                                    <div className="flex justify-between text-blue-600">
                                        <span>Pajak</span>
                                        <span>+Rp {totals.tax.toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                <div className="border-t pt-2 flex justify-between">
                                    <span className="text-lg font-semibold">Total</span>
                                    <span className="text-lg font-semibold">Rp {totals.total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                            >
                                Simpan Penjualan
                            </button>
                            <Link
                                href={route('part-sales.index')}
                                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium text-center"
                            >
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
