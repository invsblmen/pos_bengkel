import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PaginationLinks from '@/Components/PaginationLinks';

export default function Index({ sales, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || '');

    const handleFilter = () => {
        const query = {};
        if (search) query.search = search;
        if (status) query.status = status;
        if (paymentStatus) query.payment_status = paymentStatus;
        
        router.get(route('part-sales.index'), query);
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setPaymentStatus('');
        router.get(route('part-sales.index'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Penjualan Sparepart" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Penjualan Sparepart</h1>
                        <Link
                            href={route('part-sales.create')}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <span>+ Penjualan Baru</span>
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Penjualan</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nomor penjualan..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="confirmed">Dikonfirmasi</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
                                <select
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Semua Pembayaran</option>
                                    <option value="unpaid">Belum Bayar</option>
                                    <option value="partial">Sebagian</option>
                                    <option value="paid">Lunas</option>
                                </select>
                            </div>

                            <div className="flex items-end gap-2">
                                <button
                                    onClick={handleFilter}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Filter
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nomor Penjualan</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pelanggan</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Pembayaran</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sales.data.length > 0 ? (
                                    sales.data.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-blue-600">
                                                <Link href={route('part-sales.show', sale.id)}>
                                                    {sale.sale_number}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {sale.customer?.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {new Date(sale.sale_date).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                                                Rp {(sale.grand_total / 1000).toLocaleString('id-ID')}K
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    sale.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    sale.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {sale.status === 'confirmed' ? 'Dikonfirmasi' :
                                                     sale.status === 'draft' ? 'Draft' :
                                                     'Dibatalkan'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    sale.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                    sale.payment_status === 'partial' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {sale.payment_status === 'paid' ? 'Lunas' :
                                                     sale.payment_status === 'partial' ? 'Sebagian' :
                                                     'Belum Bayar'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link
                                                    href={route('part-sales.show', sale.id)}
                                                    className="text-blue-600 hover:text-blue-900 text-sm"
                                                >
                                                    Lihat
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada data penjualan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {sales.data.length > 0 && (
                        <div className="mt-6">
                            <PaginationLinks links={sales.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
