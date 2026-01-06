import React from 'react';
import { useForm } from '@inertiajs/react';
import { IconX, IconDeviceFloppy } from '@tabler/icons-react';
import toast from 'react-hot-toast';

export default function QuickCreatePartModal({
    isOpen,
    onClose,
    initialName = '',
    onSuccess
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: initialName,
        sku: '',
        part_number: '',
        sell_price: '',
        part_category_id: '',
    });

    React.useEffect(() => {
        if (isOpen && initialName) {
            setData('name', initialName);
        }
    }, [isOpen, initialName]);

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('parts.store'), {
            preserveScroll: true,
            onSuccess: (response) => {
                toast.success('Sparepart berhasil ditambahkan!');
                reset();
                onClose();
                if (onSuccess && response.props?.flash?.part) {
                    onSuccess(response.props.flash.part);
                }
            },
            onError: (errors) => {
                toast.error('Gagal menambahkan sparepart!');
                console.error(errors);
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Tambah Sparepart Baru
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nama Sparepart <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Oli Mesin"
                                className={`block w-full rounded-xl border ${
                                    errors.name ? 'border-red-300' : 'border-gray-300'
                                } bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100`}
                                autoFocus
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* SKU */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                SKU
                            </label>
                            <input
                                type="text"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value.toUpperCase())}
                                placeholder="SKU-001"
                                className={`block w-full rounded-xl border ${
                                    errors.sku ? 'border-red-300' : 'border-gray-300'
                                } bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100`}
                            />
                            {errors.sku && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                    {errors.sku}
                                </p>
                            )}
                        </div>

                        {/* Part Number */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Part Number
                            </label>
                            <input
                                type="text"
                                value={data.part_number}
                                onChange={(e) => setData('part_number', e.target.value)}
                                placeholder="PN-001"
                                className={`block w-full rounded-xl border ${
                                    errors.part_number ? 'border-red-300' : 'border-gray-300'
                                } bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100`}
                            />
                            {errors.part_number && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                    {errors.part_number}
                                </p>
                            )}
                        </div>

                        {/* Sell Price */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Harga Jual <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.sell_price}
                                onChange={(e) => setData('sell_price', e.target.value)}
                                placeholder="0"
                                className={`block w-full rounded-xl border ${
                                    errors.sell_price ? 'border-red-300' : 'border-gray-300'
                                } bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100`}
                            />
                            {errors.sell_price && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                    {errors.sell_price}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <IconDeviceFloppy size={18} />
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
