import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Button from '@/Components/Dashboard/Button';
import {
    IconArrowLeft, IconTrash, IconPlus, IconSearch, IconX,
    IconShoppingCart, IconReceipt, IconCash, IconCheck,
    IconAlertCircle, IconDiscount, IconPercentage, IconCurrencyDollar
} from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { todayLocalDate } from '@/Utils/datetime';

export default function Create({ parts = [], customers = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: '',
        sale_date: todayLocalDate(),
        items: [],
        notes: '',
        discount_type: 'none',
        discount_value: 0,
        tax_type: 'none',
        tax_value: 0,
        paid_amount: 0,
        status: 'confirmed',
    });

    const [showItemModal, setShowItemModal] = useState(false);
    const [searchPart, setSearchPart] = useState('');
    const [selectedPart, setSelectedPart] = useState(null);
    const [itemQty, setItemQty] = useState(1);
    const [itemPrice, setItemPrice] = useState(0);
    const [itemDiscountType, setItemDiscountType] = useState('none');
    const [itemDiscountValue, setItemDiscountValue] = useState(0);

    const filteredParts = useMemo(() => {
        const term = searchPart.toLowerCase();
        return parts.filter((p) =>
            (p.name || '').toLowerCase().includes(term) ||
            (p.part_number || '').toLowerCase().includes(term)
        );
    }, [parts, searchPart]);

    const formatCurrency = (value = 0) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    const openItemModal = () => {
        setShowItemModal(true);
        setSelectedPart(null);
        setSearchPart('');
        setItemQty(1);
        setItemPrice(0);
        setItemDiscountType('none');
        setItemDiscountValue(0);
    };

    const closeItemModal = () => {
        setShowItemModal(false);
    };

    const handleSubmit = (e) => {
        e?.preventDefault?.();
        if (!data.customer_id) {
            toast.error('Pilih pelanggan terlebih dahulu');
            return;
        }
        if (data.items.length === 0) {
            toast.error('Minimal harus ada 1 item');
            return;
        }

        post(route('part-sales.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Penjualan berhasil dibuat');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                if (errors.error) {
                    toast.error(errors.error);
                } else if (errors.items) {
                    toast.error('Ada kesalahan pada item penjualan');
                } else {
                    const firstError = Object.values(errors)[0];
                    toast.error(firstError || 'Gagal membuat penjualan');
                }
            },
        });
    };

    const addItem = () => {
        if (!selectedPart) {
            toast.error('Pilih sparepart terlebih dahulu');
            return;
        }
        if (itemQty < 1) {
            toast.error('Jumlah minimal 1');
            return;
        }
        if (itemPrice < 0) {
            toast.error('Harga tidak boleh negatif');
            return;
        }

        const exists = data.items.find((i) => i.part_id === selectedPart.id);
        if (exists) {
            toast.error('Sparepart sudah ditambahkan');
            return;
        }

        const fallbackPrice = selectedPart.selling_price || selectedPart.price || 0;
        setData('items', [
            ...data.items,
            {
                part_id: selectedPart.id,
                part_name: selectedPart.name,
                quantity: itemQty,
                unit_price: itemPrice || fallbackPrice,
                discount_type: itemDiscountType,
                discount_value: itemDiscountValue,
            },
        ]);

        toast.success('Item ditambahkan');
        closeItemModal();
    };

    const updateItem = (index, field, value) => {
        const items = [...data.items];
        items[index][field] = value;
        setData('items', items);
    };

    const removeItem = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const calculateSubtotal = (item) => (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
    const calculateItemDiscount = (item) => {
        const subtotal = calculateSubtotal(item);
        const type = item.discount_type || 'none';
        const value = Number(item.discount_value) || 0;
        if (type === 'percent') {
            return Math.min(subtotal, Math.round((subtotal * value) / 100));
        }
        if (type === 'fixed') {
            return Math.min(subtotal, Math.round(value));
        }
        return 0;
    };
    const calculateItemTotal = (item) => calculateSubtotal(item) - calculateItemDiscount(item);

    const itemsSubtotal = data.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

    const calculateTransactionDiscount = () => {
        const type = data.discount_type || 'none';
        const value = Number(data.discount_value) || 0;
        if (type === 'percent') {
            return Math.min(itemsSubtotal, Math.round((itemsSubtotal * value) / 100));
        }
        if (type === 'fixed') {
            return Math.min(itemsSubtotal, Math.round(value));
        }
        return 0;
    };

    const transactionDiscount = calculateTransactionDiscount();
    const afterDiscount = Math.max(0, itemsSubtotal - transactionDiscount);

    const calculateTax = () => {
        const type = data.tax_type || 'none';
        const value = Number(data.tax_value) || 0;
        if (type === 'percent') {
            return Math.round((afterDiscount * value) / 100);
        }
        if (type === 'fixed') {
            return Math.round(value);
        }
        return 0;
    };

    const taxAmount = calculateTax();
    const totalAmount = afterDiscount + taxAmount;
    const remainingAmount = Math.max(0, totalAmount - (Number(data.paid_amount) || 0));
    const paymentStatus = totalAmount === 0
        ? 'unpaid'
        : Number(data.paid_amount) >= totalAmount
            ? 'paid'
            : Number(data.paid_amount) > 0
                ? 'partial'
                : 'unpaid';

    return (
        <DashboardLayout>
            <Head title="Buat Penjualan Sparepart" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 shadow-xl">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href={route('part-sales.index')}>
                                    <button className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm hover:scale-105">
                                        <IconArrowLeft size={20} />
                                    </button>
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                        <IconShoppingCart size={32} className="text-white/90" />
                                        Penjualan Sparepart Baru
                                    </h1>
                                    <p className="text-emerald-100 mt-1">Buat transaksi penjualan dengan mudah dan cepat</p>
                                </div>
                            </div>
                            <div className="hidden lg:flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-emerald-100 text-sm font-medium">Total Transaksi</p>
                                    <p className="text-3xl font-bold text-white">{formatCurrency(totalAmount)}</p>
                                    {data.items.length > 0 && (
                                        <p className="text-emerald-200 text-xs mt-1">{data.items.length} item</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Informasi Penjualan */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                                        <IconReceipt size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Informasi Penjualan</h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Detail transaksi dan pelanggan</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Pelanggan <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.customer_id}
                                            onChange={(e) => setData('customer_id', e.target.value)}
                                            className={`w-full h-12 px-4 rounded-xl border-2 ${
                                                errors.customer_id
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500 focus:border-emerald-500'
                                            } dark:bg-slate-800 dark:text-white transition-all duration-200 font-medium`}
                                        >
                                            <option value="">Pilih pelanggan...</option>
                                            {customers.map((customer) => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.customer_id && (
                                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                                <IconAlertCircle size={14} /> {errors.customer_id}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Tanggal Penjualan <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.sale_date}
                                            onChange={(e) => setData('sale_date', e.target.value)}
                                            className={`w-full h-12 px-4 rounded-xl border-2 ${
                                                errors.sale_date
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500 focus:border-emerald-500'
                                            } dark:bg-slate-800 dark:text-white transition-all duration-200 font-medium`}
                                        />
                                        {errors.sale_date && (
                                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                                <IconAlertCircle size={14} /> {errors.sale_date}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Status Penjualan
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 font-medium"
                                        >
                                            <option value="draft">📝 Draft</option>
                                            <option value="confirmed">✅ Dikonfirmasi</option>
                                        </select>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                            {data.status === 'draft' ? '⚠️ Draft tidak mengurangi stok' : '✓ Konfirmasi akan mengurangi stok'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Catatan (Opsional)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Catatan untuk transaksi ini..."
                                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 px-6 py-4 border-b border-purple-200 dark:border-purple-700/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/30">
                                            <IconShoppingCart size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Item Penjualan</h2>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {data.items.length} item dipilih
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={openItemModal}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-bold hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30 transition-all duration-200 hover:scale-105"
                                    >
                                        <IconPlus size={18} /> Tambah Item
                                    </button>
                                </div>
                            </div>

                            {data.items.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                                <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">Sparepart</th>
                                                <th className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">Jumlah</th>
                                                <th className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">Harga</th>
                                                <th className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">Diskon</th>
                                                <th className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">Total</th>
                                                <th className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {data.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-900 dark:text-white">{item.part_name}</div>
                                                        {errors[`items.${index}.part_id`] && <p className="text-xs text-red-500 mt-1">{errors[`items.${index}.part_id`]}</p>}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                            className="w-20 h-10 px-3 text-center rounded-lg border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={item.unit_price}
                                                            onChange={(e) => updateItem(index, 'unit_price', parseInt(e.target.value) || 0)}
                                                            className="w-32 h-10 px-3 text-right rounded-lg border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <select
                                                                value={item.discount_type || 'none'}
                                                                onChange={(e) => updateItem(index, 'discount_type', e.target.value)}
                                                                className="h-10 px-3 rounded-lg border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                            >
                                                                <option value="none">-</option>
                                                                <option value="percent">%</option>
                                                                <option value="fixed">Rp</option>
                                                            </select>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={item.discount_value || 0}
                                                                onChange={(e) => updateItem(index, 'discount_value', parseFloat(e.target.value) || 0)}
                                                                className="w-24 h-10 px-3 text-right rounded-lg border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                            />
                                                        </div>
                                                        <div className="text-xs text-red-600 dark:text-red-400 mt-2 text-right font-medium">
                                                            -{formatCurrency(calculateItemDiscount(item))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                                        {formatCurrency(calculateItemTotal(item))}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 hover:scale-110"
                                                            title="Hapus item"
                                                        >
                                                            <IconTrash size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-900/60 border-t-2 border-slate-200 dark:border-slate-700">
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300 text-base">
                                                    Subtotal Item
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-xl text-slate-900 dark:text-white">
                                                    {formatCurrency(itemsSubtotal)}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-16 text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                        <IconShoppingCart size={40} className="text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada item yang ditambahkan</p>
                                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Klik tombol "Tambah Item" untuk memulai</p>
                                </div>
                            )}
                        </div>

                        {/* Summary and Payment */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Discount & Tax */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 px-6 py-4 border-b border-orange-200 dark:border-orange-700/30">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/30">
                                            <IconDiscount size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Diskon & Pajak</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Potongan dan pajak transaksi</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                                <IconPercentage size={16} className="text-orange-500" />
                                                Diskon Transaksi
                                            </label>
                                            <div className="flex gap-3">
                                                <select
                                                    value={data.discount_type}
                                                    onChange={(e) => setData('discount_type', e.target.value)}
                                                    className="h-12 px-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                >
                                                    <option value="none">Tidak Ada</option>
                                                    <option value="percent">%</option>
                                                    <option value="fixed">Rp</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={data.discount_value}
                                                    onChange={(e) => setData('discount_value', e.target.value)}
                                                    className="flex-1 h-12 px-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                            </div>
                                            <div className="mt-3 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700/30">
                                                <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">Potongan</p>
                                                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{formatCurrency(transactionDiscount)}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                                <IconReceipt size={16} className="text-green-500" />
                                                Pajak
                                            </label>
                                            <div className="flex gap-3">
                                                <select
                                                    value={data.tax_type}
                                                    onChange={(e) => setData('tax_type', e.target.value)}
                                                    className="h-12 px-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                >
                                                    <option value="none">Tidak Ada</option>
                                                    <option value="percent">%</option>
                                                    <option value="fixed">Rp</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={data.tax_value}
                                                    onChange={(e) => setData('tax_value', e.target.value)}
                                                    className="flex-1 h-12 px-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                />
                                            </div>
                                            <div className="mt-3 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700/30">
                                                <p className="text-xs text-green-700 dark:text-green-400 font-medium">Pajak</p>
                                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(taxAmount)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Panel */}
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl shadow-xl border-2 border-emerald-200 dark:border-emerald-700/30 overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
                                            <IconCash size={20} className="text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white">Ringkasan</h3>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-700/30">
                                            <span className="text-slate-600 dark:text-slate-400 font-medium">Subtotal</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(itemsSubtotal)}</span>
                                        </div>
                                        <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-700/30">
                                            <span className="text-slate-600 dark:text-slate-400 font-medium">Diskon</span>
                                            <span className="font-bold text-red-600 dark:text-red-400">-{formatCurrency(transactionDiscount)}</span>
                                        </div>
                                        <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-700/30">
                                            <span className="text-slate-600 dark:text-slate-400 font-medium">Pajak</span>
                                            <span className="font-bold text-green-600 dark:text-green-400">+{formatCurrency(taxAmount)}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 pb-4 border-b-2 border-emerald-300 dark:border-emerald-600">
                                            <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                                            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalAmount)}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                            <IconCurrencyDollar size={16} className="text-emerald-600" />
                                            Pembayaran Awal
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.paid_amount}
                                            onChange={(e) => setData('paid_amount', e.target.value)}
                                            placeholder="0"
                                            className="w-full h-12 px-4 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 dark:bg-slate-800 dark:text-white font-bold text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div className="pt-4 space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600 dark:text-slate-400 font-medium">Sisa Pembayaran</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(remainingAmount)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Status</span>
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                                paymentStatus === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                                {paymentStatus === 'paid' ? '✓ Lunas' : paymentStatus === 'partial' ? '◐ Sebagian' : '○ Belum Bayar'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t-2 border-emerald-300 dark:border-emerald-600">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={processing}
                                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold hover:from-emerald-700 hover:to-emerald-800 shadow-xl shadow-emerald-500/30 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <IconCheck size={20} />
                                                    Simpan Penjualan
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Submit */}
                        <div className="lg:hidden">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={processing}
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold hover:from-emerald-700 hover:to-emerald-800 shadow-xl shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <IconCheck size={20} />
                                        Simpan Penjualan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Item Modal */}
            {showItemModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 animate-slideUp">
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
                                    <IconPlus size={20} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Pilih Sparepart</h3>
                            </div>
                            <button
                                onClick={closeItemModal}
                                className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/10 text-white transition-all duration-200"
                            >
                                <IconX size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="relative">
                                <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchPart}
                                    onChange={(e) => setSearchPart(e.target.value)}
                                    placeholder="Cari nama atau kode part..."
                                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    autoFocus
                                />
                            </div>

                            <div className="max-h-64 overflow-y-auto border-2 border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredParts.length > 0 ? (
                                    filteredParts.map((part) => (
                                        <button
                                            type="button"
                                            key={part.id}
                                            onClick={() => {
                                                setSelectedPart(part);
                                                setItemPrice(part.sell_price || part.selling_price || part.price || itemPrice || 0);
                                            }}
                                            className={`w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 ${
                                                selectedPart?.id === part.id ? 'bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-500' : ''
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">{part.name}</div>
                                                    {part.part_number && (
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            Kode: <span className="font-medium">{part.part_number}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatCurrency(part.sell_price || part.selling_price || part.price || 0)}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-5 py-8 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                                            <IconSearch size={32} className="text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Tidak ada hasil</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Jumlah</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={itemQty}
                                        onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                                        className="w-full h-12 px-4 text-center rounded-xl border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold text-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Harga Satuan</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={itemPrice}
                                        onChange={(e) => setItemPrice(parseInt(e.target.value) || 0)}
                                        className="w-full h-12 px-4 text-right rounded-xl border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Diskon</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={itemDiscountType}
                                            onChange={(e) => setItemDiscountType(e.target.value)}
                                            className="h-12 px-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        >
                                            <option value="none">-</option>
                                            <option value="percent">%</option>
                                            <option value="fixed">Rp</option>
                                        </select>
                                        <input
                                            type="number"
                                            min="0"
                                            value={itemDiscountValue}
                                            onChange={(e) => setItemDiscountValue(parseFloat(e.target.value) || 0)}
                                            className="flex-1 h-12 px-3 text-right rounded-xl border-2 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                            <button
                                type="button"
                                onClick={closeItemModal}
                                className="px-6 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={addItem}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30 transition-all duration-200 hover:scale-105"
                            >
                                <IconPlus size={18} /> Tambah Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
