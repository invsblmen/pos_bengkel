import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IconPlus, IconSearch, IconEye, IconClock, IconCalendar, IconTool, IconPencil, IconChevronDown } from '@tabler/icons-react';
import toast from 'react-hot-toast';

export default function Index({ orders }) {
    const [search, setSearch] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('service-orders.index'),
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', label: 'Menunggu' },
            in_progress: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', label: 'Dikerjakan' },
            completed: { color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', label: 'Selesai' },
            paid: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', label: 'Sudah Dibayar' },
            cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', label: 'Dibatalkan' },
        };
        return badges[status] || badges.pending;
    };

    const handleStatusChange = (orderId, newStatus) => {
        router.post(
            route('service-orders.update-status', orderId),
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Status berhasil diperbarui!');
                },
                onError: () => {
                    toast.error('Gagal memperbarui status!');
                },
            }
        );
    };

    return (
        <>
            <Head title="Service Orders" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Order Layanan
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Kelola pesanan layanan bengkel
                        </p>
                    </div>
                    <Link
                        href={route('service-orders.create')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors shadow-lg shadow-primary-500/30"
                    >
                        <IconPlus size={18} />
                        <span>Order Baru</span>
                    </Link>
                </div>

                {/* Search & Content */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handleSearch} className="mb-6">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari order (nomor order, pelanggan)..."
                                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    />
                                    <IconSearch
                                        size={20}
                                        className="absolute left-3 top-2.5 text-gray-400"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                >
                                    Cari
                                </button>
                            </div>
                        </form>

                            {orders.data && orders.data.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        No. Order
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Pelanggan & Kendaraan
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Mekanik
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Tanggal
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Biaya
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                                {orders.data.map((order) => {
                                                    const statusBadge = getStatusBadge(order.status);
                                                    const totalCost = parseFloat(order.total || 0);
                                                    const laborCost = parseFloat(order.labor_cost || 0);
                                                    const materialCost = parseFloat(order.material_cost || 0);

                                                    return (
                                                        <tr
                                                            key={order.id}
                                                            className="transition hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            <td className="whitespace-nowrap px-6 py-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {order.order_number}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {order.customer?.name || '-'}
                                                                </div>
                                                                {order.vehicle && (
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {order.vehicle.brand} {order.vehicle.model} - {order.vehicle.plate_number}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                    {order.mechanic?.name || 'Belum ditentukan'}
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-center">
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                                        <IconCalendar size={14} />
                                                                        {formatDate(order.estimated_start_at || order.created_at)}
                                                                    </div>
                                                                    {order.actual_start_at && (
                                                                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                                                                            <IconClock size={14} />
                                                                            Mulai: {formatDate(order.actual_start_at)}
                                                                        </div>
                                                                    )}
                                                                    {order.actual_finish_at && (
                                                                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                                            <IconClock size={14} />
                                                                            Selesai: {formatDate(order.actual_finish_at)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-center">
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                        {formatPrice(totalCost)}
                                                                    </div>
                                                                    {(laborCost > 0 || materialCost > 0) && (
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                            Jasa: {formatPrice(laborCost)}
                                                                            <br />
                                                                            Part: {formatPrice(materialCost)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-center">
                                                                <div className="relative inline-block">
                                                                    <select
                                                                        value={order.status}
                                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                                        className={`appearance-none cursor-pointer rounded-full px-3 py-1 pr-7 text-xs font-semibold ${statusBadge.color} border-0 focus:ring-2 focus:ring-indigo-500`}
                                                                    >
                                                                        <option value="pending">Menunggu</option>
                                                                        <option value="in_progress">Dikerjakan</option>
                                                                        <option value="completed">Selesai</option>
                                                                        <option value="paid">Sudah Dibayar</option>
                                                                        <option value="cancelled">Dibatalkan</option>
                                                                    </select>
                                                                    <IconChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <Link
                                                                        href={route('service-orders.edit', order.id)}
                                                                        className="inline-flex items-center gap-1 rounded bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800"
                                                                    >
                                                                        <IconPencil size={14} />
                                                                        Edit
                                                                    </Link>
                                                                    <Link
                                                                        href={route('service-orders.show', order.id)}
                                                                        className="inline-flex items-center gap-1 rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                                                                    >
                                                                        <IconEye size={14} />
                                                                        Detail
                                                                    </Link>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {orders.links && (
                                        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                Menampilkan {orders.from} hingga {orders.to} dari{' '}
                                                {orders.total} data
                                            </div>
                                            <div className="flex gap-2">
                                                {orders.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`rounded px-3 py-1 text-sm ${
                                                            link.active
                                                                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                                        } ${!link.url && 'cursor-not-allowed opacity-50'}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-12 text-center">
                                    <IconTool
                                        size={64}
                                        className="mx-auto mb-4 text-gray-400 dark:text-gray-600"
                                    />
                                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Belum ada order layanan
                                    </h3>
                                    <p className="mb-6 text-gray-500 dark:text-gray-400">
                                        Mulai dengan membuat order layanan pertama Anda.
                                    </p>
                                    <Link
                                        href={route('service-orders.create')}
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                    >
                                        <IconPlus size={18} />
                                        Tambah Order Pertama
                                    </Link>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
