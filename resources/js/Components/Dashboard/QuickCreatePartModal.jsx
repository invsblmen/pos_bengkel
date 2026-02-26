import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { IconX, IconDeviceFloppy, IconBox, IconSparkles } from '@tabler/icons-react';
import toast from 'react-hot-toast';

export default function QuickCreatePartModal({
    isOpen,
    onClose,
    initialName = '',
    categories = [],
    onSuccess,
    onPartCreated  // New callback to refetch parts
}) {
    const [data, setData] = useState({
        name: initialName,
        part_number: '',
        barcode: '',
        sell_price: '',
        part_category_id: '',
        rack_location: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    // Generate Part Number
    const generatePartNumber = () => {
        const category = categories?.find(c => c.id == data.part_category_id);
        const prefix = category ? category.name.substring(0, 3).toUpperCase() : 'PRT';
        const random = Math.floor(Math.random() * 9000) + 1000;
        setData(prev => ({ ...prev, part_number: `${prefix}-${random}` }));
        toast.success('Kode part berhasil di-generate!');
    };

    React.useEffect(() => {
        if (isOpen && initialName) {
            setData(prev => ({ ...prev, name: initialName }));
        }
    }, [isOpen, initialName]);

    const reset = () => {
        setData({
            name: initialName,
            part_number: '',
            barcode: '',
            sell_price: '',
            part_category_id: '',
            rack_location: '',
        });
        setErrors({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        // Get CSRF token dari meta tag atau dari form
        const getCsrfToken = () => {
            // Method 1: From meta tag
            const token = document.querySelector('meta[name="csrf-token"]')?.content;
            if (token) {
                console.log('✅ CSRF token found in meta tag');
                return token;
            }

            // Method 2: From input (jika ada di form)
            const inputToken = document.querySelector('input[name="_token"]')?.value;
            if (inputToken) {
                console.log('✅ CSRF token found in input');
                return inputToken;
            }

            console.error('❌ CSRF token not found!');
            return null;
        };

        const csrfToken = getCsrfToken();

        if (!csrfToken) {
            toast.error('CSRF token tidak ditemukan. Refresh halaman dan coba lagi.');
            setProcessing(false);
            return;
        }

        console.log('🔐 Using CSRF token:', csrfToken.substring(0, 20) + '...');

        // Use fetch dengan proper Headers
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            formData.append(key, data[key] || '');
        });

        fetch(route('parts.store'), {
            method: 'POST',
            headers: {
                'X-CSRF-Token': csrfToken,
                'Accept': 'application/json',
            },
            body: formData,
        })
            .then((response) => {
                console.log('📡 Response status:', response.status);

                if (response.status === 419) {
                    throw new Error('CSRF token invalid atau expired. Refresh halaman dan coba lagi.');
                }

                if (!response.ok) {
                    return response.json().then(err => {
                        console.error('❌ Server error:', err);
                        throw err;
                    });
                }

                return response.json();
            })
            .then((responseData) => {
                console.log('✅ SUCCESS - Response:', responseData);
                console.log('📦 Part data received:', responseData.part);

                toast.success(responseData.message || 'Sparepart berhasil ditambahkan!');

                const newPart = responseData.part;

                console.log('📋 newPart fields:', {
                    id: newPart?.id,
                    name: newPart?.name,
                    buy_price: newPart?.buy_price,
                    sell_price: newPart?.sell_price,
                    stock: newPart?.stock,
                    part_number: newPart?.part_number,
                });

                reset();

                // Pass data sparepart baru ke parent component
                if (onSuccess && newPart) {
                    console.log('🎯 Calling onSuccess dengan part data lengkap');
                    onSuccess(newPart);
                    onClose();
                } else if (!onSuccess) {
                    console.warn('⚠️ onSuccess callback tidak tersedia');
                }

                setProcessing(false);
            })
            .catch((error) => {
                console.error('❌ Error:', error);

                let errorMsg = 'Gagal menambahkan sparepart!';

                if (error.message.includes('CSRF')) {
                    errorMsg = error.message;
                } else if (error.errors) {
                    errorMsg = 'Validasi gagal: ' + Object.values(error.errors)[0];
                    setErrors(error.errors);
                } else if (error.message) {
                    errorMsg = error.message;
                }

                toast.error(errorMsg);
                setProcessing(false);
            });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                            <IconBox size={24} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Tambah Sparepart Baru
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Buat sparepart langsung dari form pembelian
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Informasi Part */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Informasi Part</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Data utama sparepart yang akan disimpan.</p>
                        </div>
                        <div className="space-y-4">
                            {/* Nama */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Nama Sparepart <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Contoh: Oli Mesin"
                                    className={`w-full rounded-xl border ${
                                        errors.name ? 'border-red-300 dark:border-red-500/50' : 'border-slate-200 dark:border-slate-700'
                                    } bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm transition focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-500`}
                                    autoFocus
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Barcode & Part Number */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Barcode
                                    </label>
                                    <input
                                        type="text"
                                        value={data.barcode}
                                        onChange={(e) => setData(prev => ({ ...prev, barcode: e.target.value }))}
                                        placeholder="SCAN-001"
                                        className={`w-full rounded-xl border ${
                                            errors.barcode ? 'border-red-300 dark:border-red-500/50' : 'border-slate-200 dark:border-slate-700'
                                        } bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm transition focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500`}
                                    />
                                    {errors.barcode && (
                                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                            {errors.barcode}
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Opsional</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Kode Part
                                    </label>
                                    <input
                                        type="text"
                                        value={data.part_number}
                                        onChange={(e) => setData(prev => ({ ...prev, part_number: e.target.value }))}
                                        placeholder="PRT-001"
                                        className={`w-full rounded-xl border ${
                                            errors.part_number ? 'border-red-300 dark:border-red-500/50' : 'border-slate-200 dark:border-slate-700'
                                        } bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm transition focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500`}
                                    />
                                    <button
                                        type="button"
                                        onClick={generatePartNumber}
                                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                                    >
                                        <IconSparkles size={14} />
                                        Generate Otomatis
                                    </button>
                                    {errors.part_number && (
                                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                            {errors.part_number}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kategori & Lokasi */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Kategori & Lokasi</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Informasi tambahan untuk organisasi stok.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Kategori Sparepart
                                </label>
                                <select
                                    value={data.part_category_id}
                                    onChange={(e) => setData(prev => ({ ...prev, part_category_id: e.target.value }))}
                                    className={`w-full rounded-xl border ${
                                        errors.part_category_id ? 'border-red-300 dark:border-red-500/50' : 'border-slate-200 dark:border-slate-700'
                                    } bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-slate-100 shadow-sm transition focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 appearance-none cursor-pointer`}
                                >
                                    <option value="">Pilih Kategori (opsional)</option>
                                    {Array.isArray(categories) && categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Tidak ada kategori</option>
                                    )}
                                </select>
                                {errors.part_category_id && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                        {errors.part_category_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Lokasi Rak Gudang
                                </label>
                                <input
                                    type="text"
                                    value={data.rack_location}
                                    onChange={(e) => setData(prev => ({ ...prev, rack_location: e.target.value }))}
                                    placeholder="A-1-2 / Rak 1"
                                    className={`w-full rounded-xl border ${
                                        errors.rack_location ? 'border-red-300 dark:border-red-500/50' : 'border-slate-200 dark:border-slate-700'
                                    } bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm transition focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500`}
                                />
                                {errors.rack_location && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                        {errors.rack_location}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Harga */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Harga Jual</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Harga jual yang akan ditampilkan di sistem.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Harga Jual <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.sell_price}
                                onChange={(e) => setData(prev => ({ ...prev, sell_price: e.target.value }))}
                                placeholder="0"
                                className={`w-full rounded-xl border ${
                                    errors.sell_price ? 'border-red-300 dark:border-red-500/50' : 'border-slate-200 dark:border-slate-700'
                                } bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm transition focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500`}
                            />
                            {errors.sell_price && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                    {errors.sell_price}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex flex-1 items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
                        >
                            <IconDeviceFloppy size={18} />
                            {processing ? 'Menyimpan...' : 'Simpan Sparepart'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
