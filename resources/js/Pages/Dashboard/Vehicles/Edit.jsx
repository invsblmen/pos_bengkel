import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import toast from 'react-hot-toast';

export default function Edit({ vehicle, customers }) {
    const { data, setData, put, processing, errors } = useForm({
        customer_id: vehicle.customer_id || '',
        plate_number: vehicle.plate_number || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        color: vehicle.color || '',
        engine_type: vehicle.engine_type || '',
        transmission_type: vehicle.transmission_type || '',
        cylinder_volume: vehicle.cylinder_volume || '',
        km: vehicle.km || '',
        last_service_date: vehicle.last_service_date || '',
        next_service_date: vehicle.next_service_date || '',
        notes: vehicle.notes || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route('vehicles.update', vehicle.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kendaraan berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui kendaraan!');
            },
        });
    };

    return (
        <>
            <Head title="Edit Kendaraan" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Edit Kendaraan
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Perbarui data kendaraan {vehicle.plate_number}
                        </p>
                    </div>
                    <Link
                        href={route('vehicles.index')}
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        <IconArrowLeft size={18} />
                        Kembali
                    </Link>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informasi Dasar */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Informasi Dasar
                        </h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Customer */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Pemilik <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.customer_id}
                                    onChange={(e) => setData('customer_id', e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                >
                                    <option value="">Pilih Pemilik</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name} - {customer.phone}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer_id && (
                                    <p className="mt-1 text-sm text-red-500">{errors.customer_id}</p>
                                )}
                            </div>

                            {/* Plate Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nomor Plat <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.plate_number}
                                    onChange={(e) => setData('plate_number', e.target.value.toUpperCase())}
                                    placeholder="B 1234 XYZ"
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                                {errors.plate_number && (
                                    <p className="mt-1 text-sm text-red-500">{errors.plate_number}</p>
                                )}
                            </div>

                            {/* Brand */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Merek <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.brand}
                                    onChange={(e) => setData('brand', e.target.value)}
                                    placeholder="Honda, Yamaha, Suzuki..."
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                                {errors.brand && (
                                    <p className="mt-1 text-sm text-red-500">{errors.brand}</p>
                                )}
                            </div>

                            {/* Model */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Model <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.model}
                                    onChange={(e) => setData('model', e.target.value)}
                                    placeholder="Vario, Beat, Scoopy..."
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                                {errors.model && (
                                    <p className="mt-1 text-sm text-red-500">{errors.model}</p>
                                )}
                            </div>

                            {/* Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tahun
                                </label>
                                <input
                                    type="number"
                                    value={data.year}
                                    onChange={(e) => setData('year', e.target.value)}
                                    placeholder="2024"
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.year && (
                                    <p className="mt-1 text-sm text-red-500">{errors.year}</p>
                                )}
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Warna
                                </label>
                                <input
                                    type="text"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    placeholder="Merah, Hitam, Putih..."
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.color && (
                                    <p className="mt-1 text-sm text-red-500">{errors.color}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Spesifikasi Teknis */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Spesifikasi Teknis
                        </h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Engine Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tipe Mesin
                                </label>
                                <input
                                    type="text"
                                    value={data.engine_type}
                                    onChange={(e) => setData('engine_type', e.target.value)}
                                    placeholder="4-Stroke, 2-Stroke..."
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.engine_type && (
                                    <p className="mt-1 text-sm text-red-500">{errors.engine_type}</p>
                                )}
                            </div>

                            {/* Transmission Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tipe Transmisi
                                </label>
                                <select
                                    value={data.transmission_type}
                                    onChange={(e) => setData('transmission_type', e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Pilih Transmisi</option>
                                    <option value="manual">Manual</option>
                                    <option value="automatic">Automatic</option>
                                    <option value="semi-automatic">Semi-Automatic</option>
                                </select>
                                {errors.transmission_type && (
                                    <p className="mt-1 text-sm text-red-500">{errors.transmission_type}</p>
                                )}
                            </div>

                            {/* Cylinder Volume */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Kapasitas Mesin (cc)
                                </label>
                                <input
                                    type="number"
                                    value={data.cylinder_volume}
                                    onChange={(e) => setData('cylinder_volume', e.target.value)}
                                    placeholder="150"
                                    min="50"
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.cylinder_volume && (
                                    <p className="mt-1 text-sm text-red-500">{errors.cylinder_volume}</p>
                                )}
                            </div>

                            {/* KM */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Kilometer Saat Ini
                                </label>
                                <input
                                    type="number"
                                    value={data.km}
                                    onChange={(e) => setData('km', e.target.value)}
                                    placeholder="10000"
                                    min="0"
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.km && (
                                    <p className="mt-1 text-sm text-red-500">{errors.km}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Service History */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Riwayat Service
                        </h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Last Service Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tanggal Service Terakhir
                                </label>
                                <input
                                    type="date"
                                    value={data.last_service_date}
                                    onChange={(e) => setData('last_service_date', e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.last_service_date && (
                                    <p className="mt-1 text-sm text-red-500">{errors.last_service_date}</p>
                                )}
                            </div>

                            {/* Next Service Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tanggal Service Berikutnya
                                </label>
                                <input
                                    type="date"
                                    value={data.next_service_date}
                                    onChange={(e) => setData('next_service_date', e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.next_service_date && (
                                    <p className="mt-1 text-sm text-red-500">{errors.next_service_date}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Catatan Tambahan
                        </h3>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows="4"
                            placeholder="Catatan atau informasi tambahan tentang kendaraan..."
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        {errors.notes && (
                            <p className="mt-1 text-sm text-red-500">{errors.notes}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                            <IconDeviceFloppy size={20} />
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                        <Link
                            href={route('vehicles.index')}
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
