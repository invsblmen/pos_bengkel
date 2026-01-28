import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    IconArrowLeft,
    IconPencil,
    IconUser,
    IconCar,
    IconTool,
    IconCalendar,
    IconClock,
    IconFileText,
    IconCircleCheck,
    IconCurrencyDollar,
    IconPrinter
} from '@tabler/icons-react';
import { toDisplayDateTime } from '@/Utils/datetime';

export default function Show({ order }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString) => (dateString ? toDisplayDateTime(dateString) : '-');

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
                            href={route('service-orders.print', order.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
                        >
                            <IconPrinter size={18} />
                            Cetak Nota
                        </Link>
                        <Link
                            href={route('service-orders.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
                        >
                            <IconArrowLeft size={18} />
                            Kembali
                        </Link>
                        <Link
                            href={route('service-orders.edit', order.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-600"
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
                            <IconUser size={20} className="text-primary-600 dark:text-primary-400" />
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
                            <IconCar size={20} className="text-primary-600 dark:text-primary-400" />
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
                            <IconTool size={20} className="text-primary-600 dark:text-primary-400" />
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
                            <IconCalendar size={20} className="text-primary-600 dark:text-primary-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Jadwal
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Odometer (Km)</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {order.odometer_km ? `${order.odometer_km.toLocaleString('id-ID')} km` : '-'}
                                </p>
                            </div>
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

                {/* Cost Breakdown */}
                <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm dark:border-gray-800 dark:from-primary-900/10 dark:to-gray-900">
                    <div className="mb-4 flex items-center gap-2">
                        <IconCurrencyDollar size={20} className="text-primary-600 dark:text-primary-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Rincian Biaya
                        </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                                    <IconTool size={20} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Biaya Jasa</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {formatPrice(order.labor_cost || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30">
                                    <IconCar size={20} className="text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Biaya Part</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {formatPrice(order.material_cost || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl bg-primary-100 p-4 shadow-sm dark:bg-primary-900/30">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary-200 p-3 dark:bg-primary-800">
                                    <IconCurrencyDollar size={20} className="text-primary-700 dark:text-primary-300" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-primary-700 dark:text-primary-300">Total</p>
                                    {(order.discount_amount > 0 || order.tax_amount > 0) ? (
                                        <div>
                                            <p className="text-sm line-through text-primary-700 dark:text-primary-400">{formatPrice(order.total || 0)}</p>
                                            <p className="text-xl font-bold text-primary-900 dark:text-primary-100">
                                                {formatPrice(order.grand_total || order.total || 0)}
                                            </p>
                                            {order.discount_amount > 0 && (
                                                <p className="text-xs text-red-600">Diskon: -{formatPrice(order.discount_amount)}</p>
                                            )}
                                            {order.tax_amount > 0 && (
                                                <p className="text-xs text-green-600">Pajak: +{formatPrice(order.tax_amount)}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xl font-bold text-primary-900 dark:text-primary-100">
                                            {formatPrice(order.total || 0)}
                                        </p>
                                    )}
                                </div>
                            </div>
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
                                    <td colSpan="3" className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                                        Subtotal
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                                        {formatPrice(order.total || 0)}
                                    </td>
                                </tr>
                                {order.discount_amount > 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                                            Diskon {order.discount_type === 'percent' ? `(${order.discount_value}%)` : '(Fixed)'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-red-600">
                                            -{formatPrice(order.discount_amount)}
                                        </td>
                                    </tr>
                                )}
                                {order.tax_amount > 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                                            Pajak {order.tax_type === 'percent' ? `(${order.tax_value}%)` : '(Fixed)'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-green-600">
                                            +{formatPrice(order.tax_amount)}
                                        </td>
                                    </tr>
                                )}
                                <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                                    <td colSpan="3" className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                        Total Akhir
                                    </td>
                                    <td className="px-6 py-4 text-right text-lg font-bold text-primary-600 dark:text-primary-400">
                                        {formatPrice(order.grand_total || order.total || 0)}
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
                            <IconFileText size={20} className="text-primary-600 dark:text-primary-400" />
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
