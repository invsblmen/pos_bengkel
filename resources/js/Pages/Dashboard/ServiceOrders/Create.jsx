import React, { useEffect, useMemo, useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Autocomplete from '@/Components/Dashboard/Autocomplete';
import QuickCreateVehicleModal from '@/Components/Dashboard/QuickCreateVehicleModal';
import QuickCreateServiceModal from '@/Components/Dashboard/QuickCreateServiceModal';
import QuickCreatePartModal from '@/Components/Dashboard/QuickCreatePartModal';
import { IconArrowLeft, IconDeviceFloppy, IconTrash, IconPlus, IconX } from '@tabler/icons-react';
import toast from 'react-hot-toast';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export default function Create({ customers, mechanics, services, parts, vehicles, tags }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        vehicle_id: '',
        mechanic_id: '',
        status: 'pending',
        odometer_km: '',
        estimated_start_at: '',
        estimated_finish_at: '',
        notes: '',
        maintenance_type: '',
        next_service_km: '',
        next_service_date: '',
        tags: [],
        items: [{ service_id: '', service_discount_type: 'none', service_discount_value: 0, parts: [] }],
        discount_type: 'none',
        discount_value: 0,
        tax_type: 'none',
        tax_value: 0,
    });

    const [customerVehicles, setCustomerVehicles] = useState([]);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [vehicleSearchTerm, setVehicleSearchTerm] = useState('');
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [serviceSearchTerm, setServiceSearchTerm] = useState('');
    const [currentItemIndex, setCurrentItemIndex] = useState(null);
    const [showPartModal, setShowPartModal] = useState(false);
    const [partSearchTerm, setPartSearchTerm] = useState('');
    const [currentPartIndex, setCurrentPartIndex] = useState(null);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [checkIn, setCheckIn] = useState({ odometer_km: '', notes: '' });
    const [insights, setInsights] = useState({ last_km: {}, vehicle_km: null, last_order_km: null });
    const [vehicleHistory, setVehicleHistory] = useState({ recent_orders: [] });
    const [vehicleRecommendations, setVehicleRecommendations] = useState({ recommended_parts: [], recommended_services: [] });

    const prevKm = useMemo(() => {
        const vals = [insights.vehicle_km, insights.last_order_km].filter((v) => v !== null && v !== undefined);
        return vals.length ? Math.max(...vals) : null;
    }, [insights]);

    const recommendations = useMemo(() => {
        const km = parseInt(data.odometer_km || 0);
        if (Number.isNaN(km) || km < 0) return { due: [], upcoming: [] };
        const categories = [
            { key: 'oil', title: 'Ganti Oli Mesin', interval: 2500 },
            { key: 'air', title: 'Bersihkan/Ganti Filter Udara', interval: 5000 },
            { key: 'spark', title: 'Periksa/Ganti Busi', interval: 8000 },
            { key: 'brakepad', title: 'Cek Kampas Rem', interval: 5000 },
            { key: 'belt', title: 'Cek/Ganti Belt (CVT/Drive)', interval: 20000 },
        ];
        const all = categories.map((c) => {
            const lastRaw = insights.last_km?.[c.key];
            const last = (lastRaw === null || lastRaw === undefined) ? 0 : lastRaw;
            const since = Math.max(km - last, 0);
            const dueIn = Math.max(c.interval - since, 0);
            const isDue = since >= c.interval;
            return { ...c, last: lastRaw ?? null, since, dueIn, isDue };
        });
        const due = all.filter((c) => c.isDue).sort((a, b) => a.dueIn - b.dueIn);
        const upcoming = all.filter((c) => !c.isDue).sort((a, b) => a.dueIn - b.dueIn);
        return { due, upcoming };
    }, [data.odometer_km, insights]);

    useEffect(() => {
        if (!data.vehicle_id) {
            setInsights({ last_km: {}, vehicle_km: null, last_order_km: null });
            setVehicleHistory({ recent_orders: [] });
            setVehicleRecommendations({ recommended_parts: [], recommended_services: [] });
            return;
        }
        // Fetch insights, history, and recommendations
        Promise.all([
            fetch(route('vehicles.maintenance.insights', data.vehicle_id), {
                headers: { 'Accept': 'application/json' },
            }).then((r) => r.json()),
            fetch(route('vehicles.with-history', data.vehicle_id), {
                headers: { 'Accept': 'application/json' },
            }).then((r) => r.json()),
            fetch(route('vehicles.recommendations', data.vehicle_id), {
                headers: { 'Accept': 'application/json' },
            }).then((r) => r.json()),
        ])
            .then(([insightsData, historyData, recommendationsData]) => {
                setInsights(insightsData);
                setVehicleHistory(historyData);
                setVehicleRecommendations(recommendationsData);
            })
            .catch(() => {
                setInsights({ last_km: {}, vehicle_km: null, last_order_km: null });
                setVehicleHistory({ recent_orders: [] });
                setVehicleRecommendations({ recommended_parts: [], recommended_services: [] });
            });
    }, [data.vehicle_id]);

    const handleCustomerChange = (customerId) => {
        setData('customer_id', customerId);

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
        // Refresh page to get updated vehicles list
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
            { service_id: '', service_discount_type: 'none', service_discount_value: 0, parts: [] }
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
        newItems[index].parts.push({ part_id: '', qty: 1, price: 0, discount_type: 'none', discount_value: 0 });
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

        // Odometer required at intake
        if (data.odometer_km === '' || data.odometer_km === null) {
            toast.error('Odometer (Km) wajib diisi saat membuat order.');
            return;
        }
        // Cannot be less than previous known km
        if (prevKm !== null && parseInt(data.odometer_km) < prevKm) {
            toast.error(`Odometer tidak boleh kurang dari KM sebelumnya (${prevKm.toLocaleString('id-ID')} km).`);
            return;
        }

        post(route('service-orders.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Service Order berhasil dibuat!');
            },
            onError: () => {
                toast.error('Gagal membuat service order!');
            },
        });
    };

    const calcDiscount = (amount, type = 'none', value = 0) => {
        const numericValue = Number(value) || 0;
        if (type === 'percent') return amount * (numericValue / 100);
        if (type === 'fixed') return numericValue;
        return 0;
    };

    const calculateItemTotal = (item) => {
        let total = 0;

        if (item.service_id) {
            const service = services.find((s) => s.id === parseInt(item.service_id));
            const base = service ? Number(service.price) || 0 : 0;
            const discount = calcDiscount(base, item.service_discount_type, item.service_discount_value);
            total += Math.max(0, base - discount);
        }

        item.parts.forEach((part) => {
            const base = (Number(part.price) || 0) * (Number(part.qty) || 0);
            const discount = calcDiscount(base, part.discount_type, part.discount_value);
            total += Math.max(0, base - discount);
        });

        return total;
    };

    const itemsSubtotal = data.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

    const transactionDiscount = (() => {
        const discountValue = Number(data.discount_value) || 0;
        if (data.discount_type === 'percent') {
            return itemsSubtotal * (discountValue / 100);
        } else if (data.discount_type === 'fixed') {
            return discountValue;
        }
        return 0;
    })();

    const afterDiscount = Math.max(0, itemsSubtotal - transactionDiscount);

    const taxAmount = (() => {
        const taxValue = Number(data.tax_value) || 0;
        if (data.tax_type === 'percent') {
            return afterDiscount * (taxValue / 100);
        } else if (data.tax_type === 'fixed') {
            return taxValue;
        }
        return 0;
    })();

    const grandTotal = afterDiscount + taxAmount;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <>
            <Head title="Tambah Service Order" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Order Service Baru
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Buat service order untuk pelanggan
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowCheckIn(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
                        >
                            Check-in
                        </button>
                        <Link
                            href={route('service-orders.index')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-xl transition-colors"
                        >
                            <IconArrowLeft size={18} />
                            Kembali
                        </Link>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Status & Info */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Status & Informasi
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status Order
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
                                </select>
                            </div>

                            <div>
                                <Autocomplete
                                    label="Mekanik"
                                    value={data.mechanic_id}
                                    onChange={(value) => setData('mechanic_id', value)}
                                    options={mechanics}
                                    displayField={(mechanic) => `${mechanic.name} - ${mechanic.specialty}`}
                                    searchFields={['name', 'specialty']}
                                    placeholder="Ketik nama mekanik..."
                                    errors={errors.mechanic_id}
                                />
                            </div>
                        </div>
                    </div>

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
                                    searchFields={['name', 'phone']}
                                    placeholder="Ketik nama atau telepon pelanggan..."
                                    errors={errors.customer_id}
                                />
                            </div>

                            <div>
                                <Autocomplete
                                    label="Kendaraan"
                                    value={data.vehicle_id}
                                    onChange={(value) => setData('vehicle_id', value)}
                                    options={data.customer_id && customerVehicles.length > 0 ? customerVehicles : vehicles}
                                    displayField={(vehicle) => `${vehicle.plate_number} - ${vehicle.brand} ${vehicle.model}`}
                                    searchFields={['plate_number', 'brand', 'model']}
                                    placeholder="Ketik plat nomor atau merek..."
                                    onCreateNew={(searchTerm) => {
                                        setVehicleSearchTerm(searchTerm);
                                        setShowVehicleModal(true);
                                    }}
                                    createLabel="Tambah Kendaraan"
                                    errors={errors.vehicle_id}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Odometer (Km saat Service)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.odometer_km}
                                    onChange={(e) => setData('odometer_km', e.target.value)}
                                    placeholder="contoh: 12500"
                                    className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {prevKm !== null ? `KM sebelumnya: ${prevKm.toLocaleString('id-ID')} km (tidak boleh kurang dari ini).` : 'Wajib diisi saat check-in. Rekomendasi perawatan akan muncul berdasarkan Km.'}
                                </p>
                                {errors.odometer_km && (
                                    <p className="mt-1 text-sm text-red-600">{errors.odometer_km}</p>
                                )}
                            </div>
                            <div className="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-700">
                                <p className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Rekomendasi Berdasarkan Km</p>
                                {data.odometer_km ? (
                                    recommendations.due.length > 0 ? (
                                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                            {recommendations.due.map((r) => (
                                                <li key={r.key} className="flex items-center justify-between">
                                                    <span>{r.title}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{r.dueIn === 0 ? 'Jatuh tempo' : `± ${r.dueIn.toLocaleString('id-ID')} km lagi`}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Belum ada yang jatuh tempo. Jadwal berikutnya:</p>
                                            <ul className="space-y-2">
                                                {recommendations.upcoming.slice(0, 5).map((r) => (
                                                    <li key={r.key} className="flex items-center justify-between">
                                                        <span>{r.title}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">± {r.dueIn.toLocaleString('id-ID')} km lagi</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Masukkan odometer untuk melihat rekomendasi.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Vehicle History */}
                    {data.vehicle_id && vehicleHistory.recent_orders && vehicleHistory.recent_orders.length > 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                Riwayat Service Terakhir
                            </h2>
                            <div className="space-y-3">
                                {vehicleHistory.recent_orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                #{order.order_number}
                                            </p>
                                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                                <span>{order.created_at}</span>
                                                {order.odometer_km && <span>KM: {order.odometer_km.toLocaleString('id-ID')}</span>}
                                                {order.mechanic && <span>Mekanik: {order.mechanic.name}</span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                {formatCurrency(order.total_cost)}
                                            </p>
                                            <span className={`mt-1 inline-block rounded px-2 py-1 text-xs font-medium ${
                                                order.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                                order.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                order.status === 'in_progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300'
                                            }`}>
                                                {order.status === 'paid' ? 'Dibayar' :
                                                 order.status === 'completed' ? 'Selesai' :
                                                 order.status === 'in_progress' ? 'Dikerjakan' : 'Menunggu'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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

                    {/* Notes */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Catatan
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows="3"
                            placeholder="Masukkan catatan atau keluhan pelanggan..."
                            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Tags & Maintenance Scheduling */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Tags */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                Tag Order
                            </h3>
                            <div className="space-y-2">
                                {tags && tags.map((tag) => (
                                    <label key={tag.id} className="flex items-center gap-3 cursor-pointer rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                                        <input
                                            type="checkbox"
                                            checked={data.tags.includes(tag.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setData('tags', [...data.tags, tag.id]);
                                                } else {
                                                    setData('tags', data.tags.filter(t => t !== tag.id));
                                                }
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-${tag.color}-100 text-${tag.color}-700 dark:bg-${tag.color}-900/30 dark:text-${tag.color}-300`}>
                                            {tag.name}
                                        </span>
                                        {tag.description && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{tag.description}</span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Maintenance Scheduling */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                Jadwal Service Berikutnya
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Tipe Maintenance
                                    </label>
                                    <select
                                        value={data.maintenance_type}
                                        onChange={(e) => setData('maintenance_type', e.target.value)}
                                        className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    >
                                        <option value="">Pilih tipe...</option>
                                        <option value="routine">Rutin</option>
                                        <option value="emergency">Darurat</option>
                                        <option value="warranty">Garansi</option>
                                        <option value="recall">Recall</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Service Berikutnya (Km)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.next_service_km}
                                        onChange={(e) => setData('next_service_km', e.target.value)}
                                        placeholder="contoh: 15000"
                                        className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Service Berikutnya (Tanggal)
                                    </label>
                                    <input
                                        type="date"
                                        value={data.next_service_date}
                                        onChange={(e) => setData('next_service_date', e.target.value)}
                                        className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations Panel */}
                    {data.vehicle_id && vehicleRecommendations && vehicleRecommendations.recommended_parts && vehicleRecommendations.recommended_services && (vehicleRecommendations.recommended_parts.length > 0 || vehicleRecommendations.recommended_services.length > 0) && (
                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900 dark:text-blue-300">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Rekomendasi Berdasarkan Riwayat
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                {vehicleRecommendations.recommended_services && vehicleRecommendations.recommended_services.length > 0 && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-semibold text-blue-800 dark:text-blue-400">Layanan yang Sering Digunakan</h4>
                                        <ul className="space-y-2">
                                            {vehicleRecommendations.recommended_services.map((service) => (
                                                <li key={service.id} className="flex items-center justify-between text-sm text-blue-900 dark:text-blue-200">
                                                    <span>{service.name}</span>
                                                    <span className="text-xs text-blue-700 dark:text-blue-400">{formatCurrency(service.price)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {vehicleRecommendations.recommended_parts && vehicleRecommendations.recommended_parts.length > 0 && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-semibold text-blue-800 dark:text-blue-400">Sparepart yang Sering Diganti</h4>
                                        <ul className="space-y-2">
                                            {vehicleRecommendations.recommended_parts.map((part) => (
                                                <li key={part.id} className="flex items-center justify-between text-sm text-blue-900 dark:text-blue-200">
                                                    <span>{part.name}</span>
                                                    <span className="text-xs text-blue-700 dark:text-blue-400">{formatCurrency(part.price)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Items */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Layanan & Sparepart
                            </h2>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors"
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
                                                onCreateNew={() => {
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
                                        <div className="mb-4 rounded-lg bg-white p-3 space-y-3 dark:bg-gray-700">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Biaya Jasa: <span className="font-semibold text-gray-900 dark:text-white">
                                                    {formatCurrency(services.find(s => s.id === parseInt(item.service_id))?.price || 0)}
                                                </span>
                                            </p>
                                            <div className="grid gap-3 md:grid-cols-12">
                                                <div className="md:col-span-4">
                                                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        Diskon Jasa
                                                    </label>
                                                    <select
                                                        value={item.service_discount_type}
                                                        onChange={(e) => {
                                                            const newItems = [...data.items];
                                                            newItems[itemIndex].service_discount_type = e.target.value;
                                                            setData('items', newItems);
                                                        }}
                                                        className="block w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs text-gray-900 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                    >
                                                        <option value="none">Tidak Ada</option>
                                                        <option value="percent">Persen (%)</option>
                                                        <option value="fixed">Nilai Tetap</option>
                                                    </select>
                                                </div>
                                                {item.service_discount_type !== 'none' && (
                                                    <div className="md:col-span-4">
                                                        <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                            {item.service_discount_type === 'percent' ? 'Nilai Diskon (%)' : 'Nilai Diskon (Rp)'}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={item.service_discount_value}
                                                            onChange={(e) => {
                                                                const newItems = [...data.items];
                                                                newItems[itemIndex].service_discount_value = e.target.value;
                                                                setData('items', newItems);
                                                            }}
                                                            className="block w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs text-gray-900 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                        />
                                                    </div>
                                                )}
                                            </div>
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
                                                                displayField={(p) => {
                                                                    const code = p.sku || p.part_number || 'Tanpa Kode';
                                                                    const category = p.category?.name ? ` • ${p.category.name}` : '';
                                                                    const barcode = p.barcode ? ` • ${p.barcode}` : '';
                                                                    return `${p.name} (${code})${category}${barcode} — ${formatCurrency(p.sell_price)}`;
                                                                }}
                                                                searchFields={['name', 'sku', 'part_number', 'barcode']}
                                                                placeholder="Cari sparepart..."
                                                                onCreateNew={() => {
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

                                                        <div className="md:col-span-12 grid gap-2 md:grid-cols-12 pt-2 border-t border-gray-200 dark:border-gray-500/50">
                                                            <div className="md:col-span-4">
                                                                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Diskon Part</label>
                                                                <select
                                                                    value={part.discount_type}
                                                                    onChange={(e) => handlePartChange(itemIndex, partIndex, 'discount_type', e.target.value)}
                                                                    className="block w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs text-gray-900 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                                >
                                                                    <option value="none">Tidak Ada</option>
                                                                    <option value="percent">Persen (%)</option>
                                                                    <option value="fixed">Nilai Tetap</option>
                                                                </select>
                                                            </div>
                                                            {part.discount_type !== 'none' && (
                                                                <div className="md:col-span-4">
                                                                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">{part.discount_type === 'percent' ? 'Nilai Diskon (%)' : 'Nilai Diskon (Rp)'}</label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={part.discount_value}
                                                                        onChange={(e) => handlePartChange(itemIndex, partIndex, 'discount_value', e.target.value)}
                                                                        className="block w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs text-gray-900 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className={`${part.discount_type !== 'none' ? 'md:col-span-4' : 'md:col-span-8'} text-right self-center space-y-0.5`}>
                                                                {(() => {
                                                                    const base = (Number(part.price) || 0) * (Number(part.qty) || 0);
                                                                    const discount = calcDiscount(base, part.discount_type, part.discount_value);
                                                                    const total = Math.max(0, base - discount);
                                                                    return (
                                                                        <>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-300">Subtotal: {formatCurrency(base)}</div>
                                                                            {discount > 0 && (
                                                                                <div className="text-xs text-red-600">Diskon: -{formatCurrency(discount)}</div>
                                                                            )}
                                                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">Total: {formatCurrency(total)}</div>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
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

                    {/* Total & Actions */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-6">
                        {/* Transaction Summary with Discount/Tax */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Ringkasan Transaksi</h3>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Subtotal Items:</span>
                                    <span className="font-medium">{formatCurrency(itemsSubtotal)}</span>
                                </div>

                                {/* Transaction Discount */}
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                                    <div className="grid grid-cols-12 gap-3 items-end mb-2">
                                        <div className="col-span-4">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Diskon Transaksi</label>
                                            <select value={data.discount_type} onChange={(e) => setData('discount_type', e.target.value)} className="w-full h-11 rounded-xl border px-3 text-sm">
                                                <option value="none">Tidak Ada</option>
                                                <option value="percent">Persen (%)</option>
                                                <option value="fixed">Nilai Tetap</option>
                                            </select>
                                        </div>
                                        {data.discount_type !== 'none' && (
                                            <div className="col-span-4">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    {data.discount_type === 'percent' ? 'Nilai Diskon (%)' : 'Nilai Diskon (Rp)'}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={data.discount_value}
                                                    onChange={(e) => setData('discount_value', e.target.value)}
                                                    placeholder={data.discount_type === 'percent' ? '0-100' : '0'}
                                                    className="w-full h-11 px-3 rounded-xl border"
                                                />
                                            </div>
                                        )}
                                        <div className={`${data.discount_type !== 'none' ? 'col-span-4' : 'col-span-8'} text-right`}>
                                            {transactionDiscount > 0 && (
                                                <span className="text-sm text-red-600 font-medium">-{formatCurrency(transactionDiscount)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Setelah Diskon:</span>
                                    <span className="font-medium">{formatCurrency(afterDiscount)}</span>
                                </div>

                                {/* Tax */}
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                                    <div className="grid grid-cols-12 gap-3 items-end mb-2">
                                        <div className="col-span-4">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pajak</label>
                                            <select value={data.tax_type} onChange={(e) => setData('tax_type', e.target.value)} className="w-full h-11 rounded-xl border px-3 text-sm">
                                                <option value="none">Tidak Ada</option>
                                                <option value="percent">Persen (%)</option>
                                                <option value="fixed">Nilai Tetap</option>
                                            </select>
                                        </div>
                                        {data.tax_type !== 'none' && (
                                            <div className="col-span-4">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    {data.tax_type === 'percent' ? 'Nilai Pajak (%)' : 'Nilai Pajak (Rp)'}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={data.tax_value}
                                                    onChange={(e) => setData('tax_value', e.target.value)}
                                                    placeholder={data.tax_type === 'percent' ? '0-100' : '0'}
                                                    className="w-full h-11 px-3 rounded-xl border"
                                                />
                                            </div>
                                        )}
                                        <div className={`${data.tax_type !== 'none' ? 'col-span-4' : 'col-span-8'} text-right`}>
                                            {taxAmount > 0 && (
                                                <span className="text-sm text-green-600 font-medium">+{formatCurrency(taxAmount)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between text-lg font-bold border-t-2 border-slate-300 dark:border-slate-600 pt-2">
                                    <span className="text-slate-900 dark:text-white">Total Akhir:</span>
                                    <span className="text-primary-600 text-2xl">{formatCurrency(grandTotal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end">
                            <Link
                                href={route('service-orders.index')}
                                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-xl transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <IconDeviceFloppy size={18} />
                                {processing ? 'Menyimpan...' : 'Simpan Order'}
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

            {/* Check-in Modal */}
            {showCheckIn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowCheckIn(false)} />
                    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Check-in Kendaraan</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Odometer (Km)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={checkIn.odometer_km}
                                    onChange={(e) => setCheckIn({ ...checkIn, odometer_km: e.target.value })}
                                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Keluhan/Catatan</label>
                                <textarea
                                    rows="3"
                                    value={checkIn.notes}
                                    onChange={(e) => setCheckIn({ ...checkIn, notes: e.target.value })}
                                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowCheckIn(false)}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!checkIn.odometer_km) {
                                        toast.error('Isi odometer terlebih dahulu');
                                        return;
                                    }
                                    if (prevKm !== null && parseInt(checkIn.odometer_km) < prevKm) {
                                        toast.error(`Odometer tidak boleh kurang dari KM sebelumnya (${prevKm.toLocaleString('id-ID')} km).`);
                                        return;
                                    }
                                    setData('odometer_km', checkIn.odometer_km);
                                    if (checkIn.notes) {
                                        setData('notes', (data.notes ? data.notes + '\n' : '') + checkIn.notes);
                                    }
                                    setShowCheckIn(false);
                                }}
                                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                            >
                                Simpan & Isi Form
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
