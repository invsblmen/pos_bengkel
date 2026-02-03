import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Pagination from '@/Components/Dashboard/Pagination';
import { IconFilter, IconSearch, IconX, IconCirclePlus, IconDatabaseOff, IconLayoutGrid, IconList, IconPencil } from '@tabler/icons-react';

const defaultFilters = { search: '', status: '', payment_status: '', customer_id: '' };

const statusColors = {
    confirmed: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-100',
    draft: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-100',
    cancelled: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-100',
};

const paymentColors = {
    paid: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-100',
    partial: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-100',
    unpaid: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800/60 dark:text-gray-100',
};

export default function Index({ sales, filters, customers = [] }) {
    const [filterData, setFilterData] = useState({
        ...defaultFilters,
        ...(typeof filters !== 'undefined' ? filters : {}),
    });
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('card');

    useEffect(() => {
        setFilterData({
            ...defaultFilters,
            ...(typeof filters !== 'undefined' ? filters : {}),
        });
    }, [filters]);

    const handleChange = (field, value) => {
        setFilterData((prev) => ({ ...prev, [field]: value }));
    };

    const applyFilters = (event) => {
        event?.preventDefault?.();
        router.get(route('part-sales.index'), filterData, {
            preserveScroll: true,
            preserveState: true,
        });
        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterData(defaultFilters);
        router.get(route('part-sales.index'), defaultFilters, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const formatCurrency = (value = 0) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    const hasActiveFilters = filterData.search || filterData.status || filterData.payment_status || filterData.customer_id;

    return (
        <>
            <Head title="Penjualan Sparepart" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Penjualan Sparepart</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{sales?.total || 0} penjualan</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode('card')}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    viewMode === 'card'
                                        ? 'bg-primary-600 text-white'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                                title="Card view"
                            >
                                <IconLayoutGrid size={16} />
                                <span className="hidden sm:inline">Card</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    viewMode === 'table'
                                        ? 'bg-primary-600 text-white'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                                title="Table view"
                            >
                                <IconList size={16} />
                                <span className="hidden sm:inline">List</span>
                            </button>
                        </div>
                        <button
                            onClick={() => setShowFilters((v) => !v)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                                showFilters || hasActiveFilters
                                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200'
                            }`}
                        >
                            <IconFilter size={18} />
                            <span>Filter</span>
                            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                        </button>
                        <Link href={route('part-sales.create')}>
                            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold shadow hover:bg-primary-700">
                                <IconCirclePlus size={18} /> Penjualan Baru
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
                        <form onSubmit={applyFilters}>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cari</label>
                                    <div className="relative">
                                        <IconSearch size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            value={filterData.search}
                                            onChange={(e) => handleChange('search', e.target.value)}
                                            placeholder="Nomor penjualan, catatan..."
                                            className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pelanggan</label>
                                    <select
                                        value={filterData.customer_id}
                                        onChange={(e) => handleChange('customer_id', e.target.value)}
                                        className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Semua Pelanggan</option>
                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                    <select
                                        value={filterData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="draft">Draft</option>
                                        <option value="confirmed">Dikonfirmasi</option>
                                        <option value="cancelled">Dibatalkan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status Pembayaran</label>
                                    <select
                                        value={filterData.payment_status}
                                        onChange={(e) => handleChange('payment_status', e.target.value)}
                                        className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Semua Pembayaran</option>
                                        <option value="unpaid">Belum Bayar</option>
                                        <option value="partial">Sebagian</option>
                                        <option value="paid">Lunas</option>
                                    </select>
                                </div>
                                <div className="flex items-end gap-2 md:col-span-2 lg:col-span-1">
                                    <button
                                        type="submit"
                                        className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium"
                                    >
                                        <IconSearch size={18} /> Terapkan
                                    </button>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                                        >
                                            <IconX size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    {sales.data.length > 0 ? (
                        viewMode === 'card' ? (
                            <div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
                                {sales.data.map((sale) => (
                                    <div key={sale.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition">
                                        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center justify-between">
                                                <Link href={route('part-sales.show', sale.id)} className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                                    {sale.sale_number}
                                                </Link>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                                    statusColors[sale.status] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-gray-200'
                                                }`}>
                                                    {sale.status === 'confirmed'
                                                        ? 'Dikonfirmasi'
                                                        : sale.status === 'draft'
                                                            ? 'Draft'
                                                            : sale.status === 'completed'
                                                                ? 'Selesai'
                                                                : 'Dibatalkan'}
                                                </span>
                                            </div>
                                            <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                                <div className="flex items-center justify-between">
                                                    <span>Pelanggan</span>
                                                    <span className="font-medium text-slate-900 dark:text-white">{sale.customer?.name || '-'}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Tanggal</span>
                                                    <span>{sale.sale_date ? new Date(sale.sale_date).toLocaleDateString('id-ID') : '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
                                                <span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(sale.grand_total)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-500 dark:text-slate-400">Pembayaran</span>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                                    paymentColors[sale.payment_status] || paymentColors.unpaid
                                                }`}>
                                                    {sale.payment_status === 'paid' ? 'Lunas' : sale.payment_status === 'partial' ? 'Sebagian' : 'Belum Bayar'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <Link
                                                    href={route('part-sales.show', sale.id)}
                                                    className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
                                                >
                                                    Lihat
                                                </Link>
                                                {sale.status === 'draft' && (
                                                    <Link
                                                        href={route('part-sales.edit', sale.id)}
                                                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                        title="Edit"
                                                    >
                                                        <IconPencil size={16} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nomor Penjualan</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pelanggan</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pembayaran</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {sales.data.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                <Link href={route('part-sales.show', sale.id)}>
                                                    {sale.sale_number}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{sale.customer?.name || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                                                {sale.sale_date ? new Date(sale.sale_date).toLocaleDateString('id-ID') : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-semibold text-slate-900 dark:text-white">
                                                {formatCurrency(sale.grand_total)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                                    statusColors[sale.status] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-gray-200'
                                                }`}>
                                                    {sale.status === 'confirmed'
                                                        ? 'Dikonfirmasi'
                                                        : sale.status === 'draft'
                                                            ? 'Draft'
                                                            : sale.status === 'completed'
                                                                ? 'Selesai'
                                                                : 'Dibatalkan'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                                    paymentColors[sale.payment_status] || paymentColors.unpaid
                                                }`}>
                                                    {sale.payment_status === 'paid' ? 'Lunas' : sale.payment_status === 'partial' ? 'Sebagian' : 'Belum Bayar'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-2">
                                                    <Link
                                                        href={route('part-sales.show', sale.id)}
                                                        className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-md text-sm text-primary-600 hover:bg-primary-50 dark:text-primary-400"
                                                    >
                                                        Lihat
                                                    </Link>
                                                    {sale.status === 'draft' && (
                                                        <Link
                                                            href={route('part-sales.edit', sale.id)}
                                                            className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-md text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                                        >
                                                            Edit
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    ) : (
                        <div className="p-12 text-center">
                            <IconDatabaseOff size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Tidak ada penjualan</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {hasActiveFilters ? 'Coba sesuaikan filter' : 'Buat penjualan pertama Anda'}
                            </p>
                            {!hasActiveFilters && (
                                <Link
                                    href={route('part-sales.create')}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700"
                                >
                                    <IconCirclePlus size={16} /> Penjualan Baru
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {sales.data.length > 0 && (
                    <div className="pt-4">
                        <Pagination links={sales.links} />
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
