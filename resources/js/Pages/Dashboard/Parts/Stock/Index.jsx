import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import Pagination from '@/Components/Dashboard/Pagination';
import { IconDatabaseOff, IconHistory, IconPlus, IconArrowUp, IconArrowDown } from '@tabler/icons-react';

export default function Index({ movements }) {
    return (
        <>
            <Head title="Mutasi Stok" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <IconHistory size={28} className="text-primary-500" />
                        Mutasi Stok Sparepart
                    </h1>
                    <p className="text-sm text-slate-500">Riwayat penambahan dan pengurangan stok</p>
                </div>
                <div className="flex gap-2">
                    <Link href={route('parts.stock.in.create')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white"><IconArrowUp size={16} /> <span>Sparepart Masuk</span></Link>
                    <Link href={route('parts.stock.out.create')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-danger-500 text-white"><IconArrowDown size={16} /> <span>Sparepart Keluar</span></Link>
                </div>
            </div>

            {movements.data && movements.data.length > 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">No</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Waktu</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Part</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipe</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qty</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock Sebelum</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock Sesudah</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Supplier</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Oleh</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {movements.data.map((m, i) => (
                                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{i + 1 + ((movements.current_page || 1) - 1) * (movements.per_page || movements.data.length)}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(m.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">{m.part?.name}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{m.type}</td>
                                        <td className="px-4 py-4 text-center text-sm text-slate-600 dark:text-slate-400">{m.qty}</td>
                                        <td className="px-4 py-4 text-center text-sm text-slate-600 dark:text-slate-400">{m.before_stock}</td>
                                        <td className="px-4 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">{m.after_stock}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{m.supplier?.name || '-'}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{m.user?.name || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <IconDatabaseOff size={32} className="text-slate-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">Belum Ada Mutasi Stok</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Catatan mutasi stok akan muncul di sini setelah penambahan atau pengurangan.</p>
                </div>
            )}

            {movements.last_page !== 1 && <Pagination links={movements.links} />}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;