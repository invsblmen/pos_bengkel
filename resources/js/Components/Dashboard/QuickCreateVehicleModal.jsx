import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { IconX, IconDeviceFloppy } from '@tabler/icons-react';
import toast from 'react-hot-toast';

export default function QuickCreateVehicleModal({ isOpen, onClose, initialPlateNumber = '', onSuccess }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        plate_number: initialPlateNumber,
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        customer_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('vehicles.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                toast.success('Kendaraan berhasil ditambahkan!');
                const newVehicle = page.props.flash?.vehicle;
                if (onSuccess && newVehicle) {
                    onSuccess(newVehicle);
                }
                reset();
                onClose();
            },
            onError: () => {
                toast.error('Gagal menambahkan kendaraan!');
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Tambah Kendaraan Baru
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Plat Nomor <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.plate_number}
                                onChange={(e) => setData('plate_number', e.target.value.toUpperCase())}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                required
                                autoFocus
                            />
                            {errors.plate_number && <p className="mt-1 text-sm text-red-600">{errors.plate_number}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Merek <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.brand}
                                onChange={(e) => setData('brand', e.target.value)}
                                placeholder="Contoh: Honda, Yamaha"
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                required
                            />
                            {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Model <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.model}
                                onChange={(e) => setData('model', e.target.value)}
                                placeholder="Contoh: Vario, Beat"
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                required
                            />
                            {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tahun
                            </label>
                            <input
                                type="number"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                            {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Warna
                            </label>
                            <input
                                type="text"
                                value={data.color}
                                onChange={(e) => setData('color', e.target.value)}
                                placeholder="Contoh: Hitam, Merah"
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                            {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <IconDeviceFloppy size={16} />
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
