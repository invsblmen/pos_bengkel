import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Autocomplete from '@/Components/Dashboard/Autocomplete';
import QuickCreateCustomerModal from '@/Components/Dashboard/QuickCreateCustomerModal';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import toast from 'react-hot-toast';

export default function Create({ customers }) {
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [customersList, setCustomersList] = useState(customers);

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        plate_number: '',
        brand: '',
        model: '',
        year: '',
        color: '',
        engine_type: '',
        transmission_type: '',
        cylinder_volume: '',
        notes: '',
        // STNK fields
        chassis_number: '',
        engine_number: '',
        manufacture_year: '',
        registration_number: '',
        registration_date: '',
        stnk_expiry_date: '',
        previous_owner: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('vehicles.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kendaraan berhasil ditambahkan!');
            },
            onError: () => {
                toast.error('Gagal menambahkan kendaraan!');
            },
        });
    };

    return (
        <>
            <Head title="Tambah Kendaraan" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Tambah Kendaraan
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Tambahkan data kendaraan baru
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
                                <Autocomplete
                                    label="Pemilik"
                                    value={data.customer_id}
                                    onChange={(value) => setData('customer_id', value)}
                                    options={customersList}
                                    displayField={(customer) => `${customer.name} - ${customer.phone}`}
                                    searchFields={['name', 'phone', 'email']}
                                    placeholder="Cari pelanggan..."
                                    onCreateNew={(searchTerm) => {
                                        setCustomerSearchTerm(searchTerm);
                                        setShowCustomerModal(true);
                                    }}
                                    createLabel="Tambah Pelanggan"
                                    errors={errors.customer_id}
                                    required
                                />
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

                        </div>
                    </div>

                    {/* Service History */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Jadwal Service
                        </h3>
                        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                ℹ️ <strong>Kilometer Terakhir, Tanggal Service Terakhir, dan Tanggal Service Berikutnya</strong> akan otomatis diperbarui dari riwayat service order terbaru.
                            </p>
                            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                                Data ini dihitung real-time berdasarkan:
                                <br />• Kilometer dari odometer service order terakhir
                                <br />• Tanggal dari service order yang sudah selesai
                                <br />• Jadwal service berikutnya dari service order aktif
                            </p>
                        </div>
                    </div>

                    {/* Data STNK */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Data STNK (Surat Tanda Nomor Kendaraan)
                        </h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Chassis Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nomor Rangka (VIN)
                                </label>
                                <input
                                    type="text"
                                    value={data.chassis_number}
                                    onChange={(e) => setData('chassis_number', e.target.value)}
                                    placeholder="Nomor rangka kendaraan"
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.chassis_number && (
                                    <p className="mt-1 text-sm text-red-500">{errors.chassis_number}</p>
                                )}
                            </div>

                            {/* Engine Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nomor Mesin
                                </label>
                                <input
                                    type="text"
                                    value={data.engine_number}
                                    onChange={(e) => setData('engine_number', e.target.value)}
                                    placeholder="Nomor mesin kendaraan"
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.engine_number && (
                                    <p className="mt-1 text-sm text-red-500">{errors.engine_number}</p>
                                )}
                            </div>

                            {/* Manufacture Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tahun Pembuatan
                                </label>
                                <input
                                    type="number"
                                    value={data.manufacture_year}
                                    onChange={(e) => setData('manufacture_year', e.target.value)}
                                    placeholder="2024"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.manufacture_year && (
                                    <p className="mt-1 text-sm text-red-500">{errors.manufacture_year}</p>
                                )}
                            </div>

                            {/* Registration Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nomor Registrasi
                                </label>
                                <input
                                    type="text"
                                    value={data.registration_number}
                                    onChange={(e) => setData('registration_number', e.target.value)}
                                    placeholder="Nomor registrasi STNK"
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.registration_number && (
                                    <p className="mt-1 text-sm text-red-500">{errors.registration_number}</p>
                                )}
                            </div>

                            {/* Registration Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tanggal Registrasi
                                </label>
                                <input
                                    type="date"
                                    value={data.registration_date}
                                    onChange={(e) => setData('registration_date', e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.registration_date && (
                                    <p className="mt-1 text-sm text-red-500">{errors.registration_date}</p>
                                )}
                            </div>

                            {/* STNK Expiry Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tanggal Berakhir STNK
                                </label>
                                <input
                                    type="date"
                                    value={data.stnk_expiry_date}
                                    onChange={(e) => setData('stnk_expiry_date', e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.stnk_expiry_date && (
                                    <p className="mt-1 text-sm text-red-500">{errors.stnk_expiry_date}</p>
                                )}
                            </div>

                            {/* Previous Owner */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Pemilik Sebelumnya
                                </label>
                                <input
                                    type="text"
                                    value={data.previous_owner}
                                    onChange={(e) => setData('previous_owner', e.target.value)}
                                    placeholder="Nama pemilik sebelumnya (opsional)"
                                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.previous_owner && (
                                    <p className="mt-1 text-sm text-red-500">{errors.previous_owner}</p>
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
                            {processing ? 'Menyimpan...' : 'Simpan Kendaraan'}
                        </button>
                        <Link
                            href={route('vehicles.index')}
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Batal
                        </Link>
                    </div>
                </form>

                {/* Quick Create Customer Modal */}
                <QuickCreateCustomerModal
                    isOpen={showCustomerModal}
                    onClose={() => {
                        setShowCustomerModal(false);
                        setCustomerSearchTerm('');
                    }}
                    initialName={customerSearchTerm}
                    onSuccess={(newCustomer) => {
                        setCustomersList([...customersList, newCustomer]);
                        setData('customer_id', newCustomer.id);
                        router.reload({ only: ['customers'] });
                    }}
                />
            </div>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
