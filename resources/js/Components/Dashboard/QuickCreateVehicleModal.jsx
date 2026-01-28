import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    IconX,
    IconCar,
    IconLoader2,
    IconCheck,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';
import Autocomplete from '@/Components/Dashboard/Autocomplete';

export default function QuickCreateVehicleModal({ isOpen, onClose, initialPlateNumber = '', initialCustomerId = null, customers = [], onSuccess }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        plate_number: initialPlateNumber,
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        customer_id: initialCustomerId || '',
        engine_type: '',
        transmission_type: '',
        cylinder_volume: '',
        chassis_number: '',
        engine_number: '',
        manufacture_year: new Date().getFullYear(),
        registration_number: '',
        registration_date: '',
        stnk_expiry_date: '',
        previous_owner: '',
        notes: '',
    });

    useEffect(() => {
        if (initialCustomerId) {
            setData('customer_id', initialCustomerId);
        }
    }, [initialCustomerId]);

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

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <IconCar size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">
                                Tambah Kendaraan
                            </h3>
                            <p className="text-sm text-white/80">
                                Daftarkan kendaraan baru
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    >
                        <IconX size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Plate Number */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Plat Nomor <span className="text-danger-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="plate_number"
                            value={data.plate_number}
                            onChange={(e) => setData('plate_number', e.target.value.toUpperCase())}
                            placeholder="Contoh: B 1234 ABC"
                            autoFocus
                            className={`w-full h-11 px-4 rounded-xl border ${
                                errors.plate_number
                                    ? 'border-danger-500 focus:ring-danger-500/20'
                                    : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                            } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                        />
                        {errors.plate_number && (
                            <p className="mt-1 text-xs text-danger-500">
                                {errors.plate_number}
                            </p>
                        )}
                    </div>

                    {/* Brand & Model Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Merek <span className="text-danger-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="brand"
                                value={data.brand}
                                onChange={(e) => setData('brand', e.target.value)}
                                placeholder="Honda, Yamaha"
                                className={`w-full h-11 px-4 rounded-xl border ${
                                    errors.brand
                                        ? 'border-danger-500 focus:ring-danger-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                            />
                            {errors.brand && (
                                <p className="mt-1 text-xs text-danger-500">
                                    {errors.brand}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Model <span className="text-danger-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="model"
                                value={data.model}
                                onChange={(e) => setData('model', e.target.value)}
                                placeholder="Vario, Beat, Vios"
                                className={`w-full h-11 px-4 rounded-xl border ${
                                    errors.model
                                        ? 'border-danger-500 focus:ring-danger-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                            />
                            {errors.model && (
                                <p className="mt-1 text-xs text-danger-500">
                                    {errors.model}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Year & Color Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Tahun Produksi
                            </label>
                            <input
                                type="number"
                                name="year"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                className={`w-full h-11 px-4 rounded-xl border ${
                                    errors.year
                                        ? 'border-danger-500 focus:ring-danger-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                            />
                            {errors.year && (
                                <p className="mt-1 text-xs text-danger-500">
                                    {errors.year}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Warna
                            </label>
                            <input
                                type="text"
                                name="color"
                                value={data.color}
                                onChange={(e) => setData('color', e.target.value)}
                                placeholder="Hitam, Merah, Silver"
                                className={`w-full h-11 px-4 rounded-xl border ${
                                    errors.color
                                        ? 'border-danger-500 focus:ring-danger-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                            />
                            {errors.color && (
                                <p className="mt-1 text-xs text-danger-500">
                                    {errors.color}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Engine Type & Transmission Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Jenis Mesin
                            </label>
                            <input
                                type="text"
                                name="engine_type"
                                value={data.engine_type}
                                onChange={(e) => setData('engine_type', e.target.value)}
                                placeholder="Bensin, Diesel, Hybrid"
                                className={`w-full h-11 px-4 rounded-xl border ${
                                    errors.engine_type
                                        ? 'border-danger-500 focus:ring-danger-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                            />
                            {errors.engine_type && (
                                <p className="mt-1 text-xs text-danger-500">
                                    {errors.engine_type}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Transmisi
                            </label>
                            <input
                                type="text"
                                name="transmission_type"
                                value={data.transmission_type}
                                onChange={(e) => setData('transmission_type', e.target.value)}
                                placeholder="Manual, Otomatis, CVT"
                                className={`w-full h-11 px-4 rounded-xl border ${
                                    errors.transmission_type
                                        ? 'border-danger-500 focus:ring-danger-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                            />
                            {errors.transmission_type && (
                                <p className="mt-1 text-xs text-danger-500">
                                    {errors.transmission_type}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Cylinder Volume */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Volume Silinder (cc)
                        </label>
                        <input
                            type="text"
                            name="cylinder_volume"
                            value={data.cylinder_volume}
                            onChange={(e) => setData('cylinder_volume', e.target.value)}
                            placeholder="Contoh: 150, 250, 1000"
                            className={`w-full h-11 px-4 rounded-xl border ${
                                errors.cylinder_volume
                                    ? 'border-danger-500 focus:ring-danger-500/20'
                                    : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                            } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                        />
                        {errors.cylinder_volume && (
                            <p className="mt-1 text-xs text-danger-500">
                                {errors.cylinder_volume}
                            </p>
                        )}
                    </div>

                    {/* Chassis Number & Engine Number Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Nomor Rangka
                            </label>
                            <input
                                type="text"
                                name="chassis_number"
                                value={data.chassis_number}
                                onChange={(e) => setData('chassis_number', e.target.value)}
                                placeholder="VIN/Nomor Rangka"
                                className={`w-full h-11 px-4 rounded-xl border ${
                                    errors.chassis_number
                                        ? 'border-danger-500 focus:ring-danger-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                            />
                            {errors.chassis_number && (
                                <p className="mt-1 text-xs text-danger-500">
                                    {errors.chassis_number}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Nomor Mesin
                            </label>
                            <input
                                type="text"
                                name="engine_number"
                                value={data.engine_number}
                                onChange={(e) => setData('engine_number', e.target.value)}
                                placeholder="Nomor Mesin"
                                className={`w-full h-11 px-4 rounded-xl border ${
                                    errors.engine_number
                                        ? 'border-danger-500 focus:ring-danger-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                            />
                            {errors.engine_number && (
                                <p className="mt-1 text-xs text-danger-500">
                                    {errors.engine_number}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Manufacture Year & Registration Number Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Tahun Pembuatan
                            </label>
                            <input
                                type="number"
                                name="manufacture_year"
                                value={data.manufacture_year}
                                onChange={(e) => setData('manufacture_year', e.target.value)}
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                className={`w-full h-11 px-4 rounded-xl border ${
                                    errors.manufacture_year
                                        ? 'border-danger-500 focus:ring-danger-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                            />
                            {errors.manufacture_year && (
                                <p className="mt-1 text-xs text-danger-500">
                                    {errors.manufacture_year}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Nomor Pendaftaran
                            </label>
                            <input
                                type="text"
                                name="registration_number"
                                value={data.registration_number}
                                onChange={(e) => setData('registration_number', e.target.value)}
                                placeholder="Nomor STNK"
                                className={`w-full h-11 px-4 rounded-xl border ${
                                    errors.registration_number
                                        ? 'border-danger-500 focus:ring-danger-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                            />
                            {errors.registration_number && (
                                <p className="mt-1 text-xs text-danger-500">
                                    {errors.registration_number}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Registration Date & STNK Expiry Date Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Tanggal Pendaftaran
                            </label>
                            <input
                                type="date"
                                name="registration_date"
                                value={data.registration_date}
                                onChange={(e) => setData('registration_date', e.target.value)}
                                className={`w-full h-11 px-4 rounded-xl border ${
                                    errors.registration_date
                                        ? 'border-danger-500 focus:ring-danger-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                            />
                            {errors.registration_date && (
                                <p className="mt-1 text-xs text-danger-500">
                                    {errors.registration_date}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Tanggal Kadaluarsa STNK
                            </label>
                            <input
                                type="date"
                                name="stnk_expiry_date"
                                value={data.stnk_expiry_date}
                                onChange={(e) => setData('stnk_expiry_date', e.target.value)}
                                className={`w-full h-11 px-4 rounded-xl border ${
                                    errors.stnk_expiry_date
                                        ? 'border-danger-500 focus:ring-danger-500/20'
                                        : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                            />
                            {errors.stnk_expiry_date && (
                                <p className="mt-1 text-xs text-danger-500">
                                    {errors.stnk_expiry_date}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Previous Owner */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Pemilik Sebelumnya
                        </label>
                        <input
                            type="text"
                            name="previous_owner"
                            value={data.previous_owner}
                            onChange={(e) => setData('previous_owner', e.target.value)}
                            placeholder="Nama pemilik sebelumnya (jika ada)"
                            className={`w-full h-11 px-4 rounded-xl border ${
                                errors.previous_owner
                                    ? 'border-danger-500 focus:ring-danger-500/20'
                                    : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                            } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                        />
                        {errors.previous_owner && (
                            <p className="mt-1 text-xs text-danger-500">
                                {errors.previous_owner}
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Catatan
                        </label>
                        <textarea
                            name="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Catatan tambahan tentang kendaraan"
                            rows={3}
                            className={`w-full px-4 py-3 rounded-xl border ${
                                errors.notes
                                    ? 'border-danger-500 focus:ring-danger-500/20'
                                    : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500/20'
                            } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all resize-none`}
                        />
                        {errors.notes && (
                            <p className="mt-1 text-xs text-danger-500">
                                {errors.notes}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2 sticky bottom-0 bg-white dark:bg-slate-900">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            {processing ? (
                                <>
                                    <IconLoader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <IconCheck size={18} />
                                    Simpan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
