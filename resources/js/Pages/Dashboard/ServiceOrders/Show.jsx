import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IconArrowLeft, IconPencil, IconUser, IconCar, IconTool, IconCalendar, IconClock, IconFileText } from '@tabler/icons-react';

export default function Show({ order }) {
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
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800', label: 'Menunggu' },
            in_progress: { color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800', label: 'Dikerjakan' },
            completed: { color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800', label: 'Selesai' },
            paid: { color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800', label: 'Sudah Dibayar' },
            cancelled: { color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800', label: 'Dibatalkan' },
        };
        return badges[status] || badges.pending;
    };

    const statusBadge = getStatusBadge(order.status);

    return (
        <>
            <Head title={`Service Order ${order.order_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Order #{order.order_number}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Detail Service Order
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={route('service-orders.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
                        >
                            <IconArrowLeft size={18} />
                            Kembali
                        </Link>
                        <Link
                            href={route('service-orders.edit', order.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                        >
                            <IconPencil size={18} />
                            Edit Order
                        </Link>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="inline-flex">
                    <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${statusBadge.color}`}>
                        {statusBadge.label}
                    </span>
                </div>

                {/* Main Info Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Customer Info */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4 flex items-center gap-2">
                            <IconUser size={20} className="text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Informasi Pelanggan
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nama</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {order.customer?.name || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Telepon</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {order.customer?.phone || '-'}
                                </p>
                            </div>
                            {order.customer?.email && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {order.customer.email}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4 flex items-center gap-2">
                            <IconCar size={20} className="text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Informasi Kendaraan
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Merek & Model</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model}` : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Plat Nomor</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {order.vehicle?.plate_number || '-'}
                                </p>
                            </div>
                            {order.vehicle?.year && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tahun</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {order.vehicle.year}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mechanic Info */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4 flex items-center gap-2">
                            <IconTool size={20} className="text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Mekanik
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nama Mekanik</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {order.mechanic?.name || 'Belum ditentukan'}
                                </p>
                            </div>
                            {order.mechanic?.specialty && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Spesialisasi</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {order.mechanic.specialty}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Schedule Info */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4 flex items-center gap-2">
                            <IconCalendar size={20} className="text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Jadwal
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Estimasi Mulai</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {formatDate(order.estimated_start_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Estimasi Selesai</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {formatDate(order.estimated_finish_at)}
                                </p>
                            </div>
                            {order.actual_start_at && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Aktual Mulai</p>
                                    <p className="font-medium text-blue-600 dark:text-blue-400">
                                        {formatDate(order.actual_start_at)}
                                    </p>
                                </div>
                            )}
                            {order.actual_finish_at && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Aktual Selesai</p>
                                    <p className="font-medium text-green-600 dark:text-green-400">
                                        {formatDate(order.actual_finish_at)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items Detail */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Detail Layanan & Sparepart
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                        Item
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                        Qty
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                        Harga Satuan
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                {order.details?.map((detail) => (
                                    <tr key={detail.id}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {detail.service?.title || detail.part?.name || '-'}
                                            </div>
                                            {detail.service && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Layanan Service
                                                </div>
                                            )}
                                            {detail.part && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Sparepart
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                                            {detail.qty}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                                            {formatPrice(detail.price)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                                            {formatPrice(detail.price * detail.qty)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                        Total
                                    </td>
                                    <td className="px-6 py-4 text-right text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                        {formatPrice(order.total || 0)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Notes */}
                {order.notes && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4 flex items-center gap-2">
                            <IconFileText size={20} className="text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Catatan
                            </h2>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {order.notes}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

Show.layout = (page) => <DashboardLayout children={page} />;
