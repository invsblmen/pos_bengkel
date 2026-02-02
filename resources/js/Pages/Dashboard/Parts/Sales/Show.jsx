import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Button from '@/Components/Dashboard/Button';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';

export default function Show({ sale }) {
    const calculateItemSubtotal = (detail) => (detail.quantity || 0) * (detail.unit_price || 0);
    const totalAmount = sale.details.reduce((sum, detail) => sum + calculateItemSubtotal(detail), 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <DashboardLayout>
            <Head title={`Penjualan ${sale.sale_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('part-sales.index')}>
                            <Button icon={<IconArrowLeft size={20} />} variant="secondary">
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {sale.sale_number}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(sale.sale_date || sale.created_at).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition print:hidden"
                    >
                        <IconPrinter size={18} />
                        Cetak
                    </button>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Items Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Detail Penjualan
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                                                Sparepart
                                            </th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                                                Jumlah
                                            </th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                                                Harga Satuan
                                            </th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                        {sale.details.map((detail) => (
                                            <tr key={detail.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                                                <td className="px-6 py-3">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {detail.part?.name || 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {detail.part?.part_number || 'N/A'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-right text-gray-900 dark:text-white">
                                                    {detail.quantity}
                                                </td>
                                                <td className="px-6 py-3 text-right text-gray-900 dark:text-white">
                                                    Rp {(detail.unit_price || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-white">
                                                    Rp {calculateItemSubtotal(detail).toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                                        <tr>
                                            <td colSpan="3" className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-white">
                                                Total:
                                            </td>
                                            <td className="px-6 py-3 text-right font-bold text-lg text-gray-900 dark:text-white">
                                                Rp {totalAmount.toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Notes */}
                        {sale.notes && (
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Catatan
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                    {sale.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Info Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-4">
                                Informasi
                            </h4>
                            <dl className="space-y-3">
                                <div>
                                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        User
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white font-medium">
                                        {sale.user?.name || '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Total Item
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white font-medium">
                                        {sale.details.reduce((sum, d) => sum + (d.quantity || 0), 0)} pcs
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Total Penjualan
                                    </dt>
                                    <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Rp {totalAmount.toLocaleString('id-ID')}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Actions */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-4">
                                Aksi
                            </h4>
                            <div className="space-y-2">
                                <Link href={route('part-sales.edit', sale.id)} className="block">
                                    <Button variant="primary" className="w-full">
                                        Edit
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body {
                        background: white;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}
