import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import Pagination from '@/Components/Dashboard/Pagination';
import { IconShoppingCart, IconPlus } from '@tabler/icons-react';

export default function Index({ sales }) {
    return (
        <>
            <Head title="Penjualan Sparepart" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <IconShoppingCart size={28} className="text-primary-500" />
                        Penjualan Sparepart
                    </h1>
                    <p className="text-sm text-slate-500">Riwayat penjualan sparepart</p>
                </div>
                <div>
                    <Link href={route('parts.sales.create')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white"><IconPlus size={16} /> <span>Buat Penjualan</span></Link>
                </div>
            </div>

            {sales.data && sales.data.length > 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">No</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invoice</th>
                                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Oleh</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Waktu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {sales.data.map((s, i) => (
                                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{i + 1 + ((sales.current_page || 1) - 1) * (sales.per_page || sales.data.length)}</td>
                                        <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">{s.invoice}</td>
                                        <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white text-right">{s.total}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{s.user?.name || '-'}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(s.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">Belum Ada Penjualan</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Buat penjualan untuk mengurangi stok sparepart.</p>
                </div>
            )}

            {sales.last_page !== 1 && <Pagination links={sales.links} />}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
