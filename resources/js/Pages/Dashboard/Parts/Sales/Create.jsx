import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Button from '@/Components/Dashboard/Button';
import { IconArrowLeft, IconTrash, IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { todayLocalDate } from '@/Utils/datetime';

export default function Create({ parts = [], customers = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: '',
        sale_date: todayLocalDate(),
        items: [],
        notes: '',
    });

    const [showItemModal, setShowItemModal] = useState(false);
    const [searchPart, setSearchPart] = useState('');
    const [selectedPart, setSelectedPart] = useState(null);
    const [itemQty, setItemQty] = useState(1);
    const [itemPrice, setItemPrice] = useState(0);

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
                reset({ customer_id: '', sale_date: todayLocalDate(), items: [], notes: '' });
            },
            onError: () => toast.error('Gagal membuat penjualan'),
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
    const totalAmount = data.items.reduce((sum, item) => sum + calculateSubtotal(item), 0);

    return (
        <DashboardLayout>
            <Head title="Buat Penjualan Sparepart" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('part-sales.index')}>
                            <Button icon={<IconArrowLeft size={18} />} variant="secondary">
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Penjualan Sparepart Baru</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Ikuti gaya pembelian sparepart untuk kemudahan input</p>
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <Button type="button" onClick={handleSubmit} loading={processing}>
                            Simpan Penjualan
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Informasi Penjualan</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pelanggan <span className="text-red-500">*</span></label>
                                <select
                                    value={data.customer_id}
                                    onChange={(e) => setData('customer_id', e.target.value)}
                                    className={`w-full h-11 px-4 rounded-xl border ${errors.customer_id ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500`}
                                >
                                    <option value="">Pilih pelanggan</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer_id && <p className="text-xs text-red-500 mt-1">{errors.customer_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tanggal <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={data.sale_date}
                                    onChange={(e) => setData('sale_date', e.target.value)}
                                    className={`w-full h-11 px-4 rounded-xl border ${errors.sale_date ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500`}
                                />
                                {errors.sale_date && <p className="text-xs text-red-500 mt-1">{errors.sale_date}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Catatan</label>
                                <input
                                    type="text"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Catatan tambahan untuk penjualan ini"
                                    className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Item Penjualan</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Tambah item lewat modal seperti pembelian</p>
                            </div>
                            <button
                                type="button"
                                onClick={openItemModal}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
                            >
                                <IconPlus size={16} /> Tambah Item
                            </button>
                        </div>

                        {data.items.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Sparepart</th>
                                            <th className="px-6 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">Jumlah</th>
                                            <th className="px-6 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Harga Satuan</th>
                                            <th className="px-6 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Subtotal</th>
                                            <th className="px-6 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {data.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-3">
                                                    <div className="font-medium text-slate-900 dark:text-white">{item.part_name}</div>
                                                    {errors[`items.${index}.part_id`] && <p className="text-xs text-red-500 mt-1">{errors[`items.${index}.part_id`]}</p>}
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        className="w-20 h-9 px-2 text-center rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                                    />
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItem(index, 'unit_price', parseInt(e.target.value) || 0)}
                                                        className="w-28 h-9 px-2 text-right rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                                    />
                                                </td>
                                                <td className="px-6 py-3 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(calculateSubtotal(item))}</td>
                                                <td className="px-6 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        title="Hapus item"
                                                    >
                                                        <IconTrash size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <td colSpan="3" className="px-6 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Total</td>
                                            <td className="px-6 py-3 text-right font-bold text-lg text-slate-900 dark:text-white">{formatCurrency(totalAmount)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-slate-500 dark:text-slate-400">Belum ada item. Tambah melalui tombol di atas.</div>
                        )}
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Catatan</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Catatan tambahan untuk penjualan ini..."
                            rows="3"
                            className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 sm:hidden">
                        <Button type="submit" loading={processing} className="flex-1">
                            Simpan Penjualan
                        </Button>
                        <Link href={route('part-sales.index')} className="flex-1">
                            <Button type="button" variant="secondary" className="w-full">
                                Batal
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>

            {/* Item Modal */}
            {showItemModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pilih Sparepart</h3>
                            <button onClick={closeItemModal} className="text-slate-500 hover:text-slate-700 dark:text-slate-400"> <IconX size={18} /> </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="relative">
                                <IconSearch size={16} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchPart}
                                    onChange={(e) => setSearchPart(e.target.value)}
                                    placeholder="Cari nama atau kode part"
                                    className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredParts.length > 0 ? (
                                    filteredParts.map((part) => (
                                        <button
                                            type="button"
                                            key={part.id}
                                            onClick={() => {
                                                setSelectedPart(part);
                                                setItemPrice(part.selling_price || part.price || itemPrice || 0);
                                            }}
                                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedPart?.id === part.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-white">{part.name}</div>
                                                    {part.part_number && <div className="text-xs text-slate-500">Kode: {part.part_number}</div>}
                                                </div>
                                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(part.selling_price || part.price || 0)}</div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-6 text-center text-slate-500">Tidak ada hasil</div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Jumlah</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={itemQty}
                                        onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                                        className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Harga Satuan</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={itemPrice}
                                        onChange={(e) => setItemPrice(parseInt(e.target.value) || 0)}
                                        className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={closeItemModal}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={addItem}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700"
                            >
                                <IconPlus size={16} /> Tambah
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
