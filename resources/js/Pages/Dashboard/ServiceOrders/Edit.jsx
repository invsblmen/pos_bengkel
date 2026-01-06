import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Autocomplete from '@/Components/Dashboard/Autocomplete';
import QuickCreateVehicleModal from '@/Components/Dashboard/QuickCreateVehicleModal';
import QuickCreateServiceModal from '@/Components/Dashboard/QuickCreateServiceModal';
import QuickCreatePartModal from '@/Components/Dashboard/QuickCreatePartModal';
import { IconArrowLeft, IconDeviceFloppy, IconTrash, IconPlus, IconX } from '@tabler/icons-react';
import toast from 'react-hot-toast';

// Helper function to format datetime to HTML datetime-local format
const formatDatetimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function Edit({ order, customers, mechanics, services, parts, vehicles }) {
    const { data, setData, put, processing, errors } = useForm({
        customer_id: order.customer_id || '',
        vehicle_id: order.vehicle_id || '',
        mechanic_id: order.mechanic_id || '',
        status: order.status || 'pending',
        estimated_start_at: formatDatetimeLocal(order.estimated_start_at) || '',
        estimated_finish_at: formatDatetimeLocal(order.estimated_finish_at) || '',
        notes: order.notes || '',
        items: order.details.map(detail => ({
            id: detail.id,
            service_id: detail.service_id || '',
            parts: detail.part_id ? [{ part_id: detail.part_id, qty: detail.qty, price: detail.price }] : [],
        })),
    });

    const [selectedCustomer, setSelectedCustomer] = useState(order.customer_id);
    const [customerVehicles, setCustomerVehicles] = useState(order.customer?.vehicles || []);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [vehicleSearchTerm, setVehicleSearchTerm] = useState('');
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [serviceSearchTerm, setServiceSearchTerm] = useState('');
    const [currentItemIndex, setCurrentItemIndex] = useState(null);
    const [showPartModal, setShowPartModal] = useState(false);
    const [partSearchTerm, setPartSearchTerm] = useState('');
    const [currentPartIndex, setCurrentPartIndex] = useState(null);

    // Handle customer change - update available vehicles
    const handleCustomerChange = (customerId) => {
        setData('customer_id', customerId);
        setSelectedCustomer(customerId);

        if (!customerId) {
            setCustomerVehicles([]);
            setData('vehicle_id', '');
            return;
        }

        const customer = customers.find(c => c.id === parseInt(customerId));
        if (customer && customer.vehicles) {
            setCustomerVehicles(customer.vehicles);
        } else {
            setCustomerVehicles([]);
        }
    };

    const handleVehicleCreated = (newVehicle) => {
        router.reload({
            only: ['vehicles'],
            onSuccess: () => {
                setData('vehicle_id', newVehicle.id);
                toast.success('Kendaraan berhasil ditambahkan');
            }
        });
    };

    const handleServiceCreated = (newService) => {
        router.reload({
            only: ['services'],
            onSuccess: () => {
                if (currentItemIndex !== null) {
                    handleServiceChange(currentItemIndex, newService.id);
                }
                toast.success('Layanan berhasil ditambahkan');
                setCurrentItemIndex(null);
            }
        });
    };

    const handlePartCreated = (newPart) => {
        router.reload({
            only: ['parts'],
            onSuccess: () => {
                if (currentItemIndex !== null && currentPartIndex !== null) {
                    handlePartChange(currentItemIndex, currentPartIndex, 'part_id', newPart.id);
                }
                toast.success('Sparepart berhasil ditambahkan');
                setCurrentItemIndex(null);
                setCurrentPartIndex(null);
            }
        });
    };

    const handleAddItem = () => {
        setData('items', [
            ...data.items,
            { id: null, service_id: '', parts: [] }
        ]);
    };

    const handleRemoveItem = (index) => {
        if (data.items.length === 1) {
            toast.error('Minimal harus ada 1 item!');
            return;
        }
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const handleServiceChange = (index, serviceId) => {
        const newItems = [...data.items];
        newItems[index].service_id = serviceId;
        setData('items', newItems);
    };

    const handleAddPart = (index) => {
        const newItems = [...data.items];
        newItems[index].parts.push({ part_id: '', qty: 1, price: 0 });
        setData('items', newItems);
    };

    const handleRemovePart = (itemIndex, partIndex) => {
        const newItems = [...data.items];
        newItems[itemIndex].parts = newItems[itemIndex].parts.filter((_, i) => i !== partIndex);
        setData('items', newItems);
    };

    const handlePartChange = (itemIndex, partIndex, field, value) => {
        const newItems = [...data.items];
        newItems[itemIndex].parts[partIndex][field] = value;

        // Auto-fill price from part
        if (field === 'part_id' && value) {
            const part = parts.find(p => p.id === parseInt(value));
            if (part) newItems[itemIndex].parts[partIndex].price = part.sell_price || 0;
        }

        setData('items', newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate items - minimal harus ada service atau part
        const validItems = data.items.filter(item => item.service_id || item.parts.length > 0);
        if (validItems.length === 0) {
            toast.error('Tambahkan minimal 1 layanan atau sparepart!');
            return;
        }

        put(route('service-orders.update', order.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Service Order berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui service order!');
            },
        });
    };

    const calculateItemTotal = (item) => {
        let total = 0;
        if (item.service_id) {
            const service = services.find(s => s.id === parseInt(item.service_id));
            if (service) total += service.price || 0;
        }
        item.parts.forEach(part => {
            total += (parseInt(part.price || 0) * parseInt(part.qty || 1));
        });
        return total;
    };

    const calculateTotal = () => {
        return data.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <>
            <Head title="Edit Service Order" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Edit Service Order
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Order #{order.order_number}
                        </p>
                    </div>
                    <Link
                        href={route('service-orders.index')}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
                    >
                        <IconArrowLeft size={18} />
                        Kembali
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer & Vehicle Info */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Informasi Pelanggan & Kendaraan
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Autocomplete
                                    label="Pelanggan"
                                    value={data.customer_id}
                                    onChange={handleCustomerChange}
                                    options={customers}
                                    displayField={(customer) => `${customer.name} - ${customer.phone}`}
                                    searchFields={['name', 'phone', 'email']}
                                    placeholder="Cari pelanggan..."
                                    errors={errors.customer_id}
                                />
                            </div>

                            <div>
                                <Autocomplete
                                    label="Kendaraan"
                                    value={data.vehicle_id}
                                    onChange={(value) => setData('vehicle_id', value)}
                                    options={data.customer_id && customerVehicles.length > 0 ? customerVehicles : vehicles}
                                    displayField={(vehicle) => `${vehicle.brand} ${vehicle.model} - ${vehicle.plate_number}`}
                                    searchFields={['plate_number', 'brand', 'model']}
                                    placeholder="Cari kendaraan..."
                                    onCreateNew={(searchTerm) => {
                                        setVehicleSearchTerm(searchTerm);
                                        setShowVehicleModal(true);
                                    }}
                                    createLabel="Tambah Kendaraan"
                                    errors={errors.vehicle_id}
                                />
                            </div>

                            <div>
                                <Autocomplete
                                    label="Mekanik"
                                    value={data.mechanic_id}
                                    onChange={(value) => setData('mechanic_id', value)}
                                    options={mechanics}
                                    displayField={(mechanic) => `${mechanic.name} - ${mechanic.specialty}`}
                                    searchFields={['name', 'specialty']}
                                    placeholder="Cari mekanik..."
                                    errors={errors.mechanic_id}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    <option value="pending">Menunggu / Mengantri</option>
                                    <option value="in_progress">Sedang Dikerjakan</option>
                                    <option value="completed">Selesai Dikerjakan</option>
                                    <option value="paid">Sudah Dibayar</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Estimated Schedule */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Estimasi Waktu
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Estimasi Mulai
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.estimated_start_at}
                                    onChange={(e) => setData('estimated_start_at', e.target.value)}
                                    className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Estimasi Selesai
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.estimated_finish_at}
                                    onChange={(e) => setData('estimated_finish_at', e.target.value)}
                                    className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Service Items - New Structure */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Layanan & Sparepart
                            </h2>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                            >
                                <IconPlus size={16} />
                                Tambah Item
                            </button>
                        </div>

                        <div className="space-y-6">
                            {data.items.map((item, itemIndex) => (
                                <div
                                    key={itemIndex}
                                    className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                                >
                                    {/* Service Row */}
                                    <div className="mb-4 flex gap-4">
                                        <div className="flex-1">
                                            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                Layanan Service (Opsional)
                                            </label>
                                            <Autocomplete
                                                value={item.service_id}
                                                onChange={(serviceId) => handleServiceChange(itemIndex, serviceId)}
                                                options={services}
                                                displayField={(service) => `${service.title} - ${formatCurrency(service.price)}`}
                                                searchFields={['title', 'description']}
                                                placeholder="Cari layanan..."
                                                onCreateNew={(searchTerm) => {
                                                    setServiceSearchTerm(searchTerm);
                                                    setCurrentItemIndex(itemIndex);
                                                    setShowServiceModal(true);
                                                }}
                                                createLabel="Tambah Layanan"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(itemIndex)}
                                                className="rounded-lg bg-red-100 p-2 text-red-700 transition hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                                title="Hapus item beserta semua sparepart"
                                            >
                                                <IconTrash size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Service Price Display */}
                                    {item.service_id && (
                                        <div className="mb-4 rounded-lg bg-white p-3 dark:bg-gray-700">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Biaya Jasa: <span className="font-semibold text-gray-900 dark:text-white">
                                                    {formatCurrency(services.find(s => s.id === parseInt(item.service_id))?.price || 0)}
                                                </span>
                                            </p>
                                        </div>
                                    )}

                                    {/* Parts Section */}
                                    <div className="rounded-lg border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-700">
                                        <div className="mb-3 flex items-center justify-between">
                                            <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                                                Sparepart untuk Layanan Ini
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => handleAddPart(itemIndex)}
                                                className="inline-flex items-center gap-1 rounded-lg bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                                            >
                                                <IconPlus size={14} />
                                                Tambah Part
                                            </button>
                                        </div>

                                        {item.parts.length > 0 ? (
                                            <div className="space-y-3">
                                                {item.parts.map((part, partIndex) => (
                                                    <div key={partIndex} className="grid gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-600 md:grid-cols-12">
                                                        <div className="md:col-span-5">
                                                            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                Sparepart
                                                            </label>
                                                            <Autocomplete
                                                                value={part.part_id}
                                                                onChange={(partId) => handlePartChange(itemIndex, partIndex, 'part_id', partId)}
                                                                options={parts}
                                                                displayField={(p) => `${p.name} - ${formatCurrency(p.sell_price)}`}
                                                                searchFields={['name', 'sku', 'part_number']}
                                                                placeholder="Cari sparepart..."
                                                                onCreateNew={(searchTerm) => {
                                                                    setPartSearchTerm(searchTerm);
                                                                    setCurrentItemIndex(itemIndex);
                                                                    setCurrentPartIndex(partIndex);
                                                                    setShowPartModal(true);
                                                                }}
                                                                createLabel="Tambah Sparepart"
                                                            />
                                                        </div>

                                                        <div className="md:col-span-2">
                                                            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                Qty
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={part.qty}
                                                                onChange={(e) => handlePartChange(itemIndex, partIndex, 'qty', e.target.value)}
                                                                className="block w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                            />
                                                        </div>

                                                        <div className="md:col-span-3">
                                                            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                Harga
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={part.price}
                                                                onChange={(e) => handlePartChange(itemIndex, partIndex, 'price', e.target.value)}
                                                                className="block w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                            />
                                                        </div>

                                                        <div className="flex items-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemovePart(itemIndex, partIndex)}
                                                                className="rounded-lg bg-red-100 p-1.5 text-red-700 transition hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                                            >
                                                                <IconX size={14} />
                                                            </button>
                                                        </div>

                                                        {part.part_id && (
                                                            <div className="md:col-span-12">
                                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                    Subtotal: <span className="font-semibold text-gray-900 dark:text-white">
                                                                        {formatCurrency(part.price * part.qty)}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Belum ada sparepart. Klik "Tambah Part" untuk menambahkan.
                                            </p>
                                        )}
                                    </div>

                                    {/* Item Total */}
                                    {(item.service_id || item.parts.length > 0) && (
                                        <div className="mt-4 rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/30">
                                            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                                                Subtotal Item: {formatCurrency(calculateItemTotal(item))}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {errors.items && (
                            <p className="mt-2 text-sm text-red-600">{errors.items}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Catatan
                        </h2>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={4}
                            placeholder="Catatan tambahan untuk service order..."
                            className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>

                    {/* Total & Actions */}
                    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Biaya</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(calculateTotal())}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href={route('service-orders.index')}
                                className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <IconDeviceFloppy size={18} />
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Quick Create Vehicle Modal */}
            <QuickCreateVehicleModal
                isOpen={showVehicleModal}
                onClose={() => setShowVehicleModal(false)}
                initialPlateNumber={vehicleSearchTerm}
                onSuccess={handleVehicleCreated}
            />

            {/* Quick Create Service Modal */}
            <QuickCreateServiceModal
                isOpen={showServiceModal}
                onClose={() => {
                    setShowServiceModal(false);
                    setCurrentItemIndex(null);
                }}
                initialTitle={serviceSearchTerm}
                onSuccess={handleServiceCreated}
            />

            {/* Quick Create Part Modal */}
            <QuickCreatePartModal
                isOpen={showPartModal}
                onClose={() => {
                    setShowPartModal(false);
                    setCurrentItemIndex(null);
                    setCurrentPartIndex(null);
                }}
                initialName={partSearchTerm}
                onSuccess={handlePartCreated}
            />
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
