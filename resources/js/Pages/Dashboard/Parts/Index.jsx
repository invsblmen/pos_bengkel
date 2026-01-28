import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Button from '@/Components/Dashboard/Button';
import Search from '@/Components/Dashboard/Search';
import Pagination from '@/Components/Dashboard/Pagination';
import {
    IconDatabaseOff, IconCirclePlus, IconPencilCog, IconTrash,
    IconLayoutGrid, IconList, IconPackage
} from '@tabler/icons-react';

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);

// Part Card for Grid View
function PartCard({ part }) {
    const stockStatus = part.stock === 0 ? 'out' : (part.stock <= (part.reorder_level || 10) ? 'low' : 'normal');
    const stockBadge = {
        out: { class: 'bg-danger-500 text-white', label: 'Habis' },
        low: { class: 'bg-warning-500 text-white', label: `Rendah: ${part.stock}` },
        normal: { class: 'bg-success-500 text-white', label: `Stok: ${part.stock}` }
    }[stockStatus];

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-md">
                        {part.category?.name || 'Uncategorized'}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${stockBadge.class}`}>
                        {stockBadge.label}
                    </span>
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1 line-clamp-2">{part.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">SKU: {part.sku || '-'}</p>
                {part.description && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{part.description}</p>}
                {part.supplier && <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">Supplier: <span className="font-medium">{part.supplier.name}</span></div>}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mb-3">
                    <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Harga Beli</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{formatCurrency(part.buy_price || 0)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 dark:text-slate-500">Harga Jual</p>
                        <p className="text-base font-bold text-primary-600 dark:text-primary-400">{formatCurrency(part.sell_price || 0)}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={route('parts.edit', part.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-warning-100 text-warning-600 hover:bg-warning-200 dark:bg-warning-900/50 dark:text-warning-400 text-sm font-medium transition-colors">
                        <IconPencilCog size={16} /> <span>Edit</span>
                    </Link>
                    <Button type={"delete"} icon={<IconTrash size={16} />} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-danger-100 text-danger-600 hover:bg-danger-200 dark:bg-danger-900/50 dark:text-danger-400 text-sm font-medium" url={route('parts.destroy', part.id)} label="Hapus" />
                </div>
            </div>
        </div>
    );
}

export default function Index({ parts }) {
    const [viewMode, setViewMode] = useState('list');

    return (
        <>
            <Head title="Part" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sparepart</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{parts?.total || 0} part tersedia</p>
                </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                title="Grid View"
                            >
                                <IconLayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                title="List View"
                            >
                                <IconList size={18} />
                            </button>
                        </div>
                        <Search route={route('parts.index')} />
                        <Button type="link" href={route('parts.create')} icon={<IconCirclePlus size={18} />} label="Tambah Part" />
                    </div>
                </div>

                {parts.data && parts.data.length > 0 ? (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {parts.data.map((part) => (
                                    <PartCard key={part.id} part={part} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">No</th>
                                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Part</th>
                                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SKU</th>
                                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kategori</th>
                                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Supplier</th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stok</th>
                                                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Harga Beli</th>
                                                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Harga Jual</th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {parts.data.map((p, idx) => {
                                                const stockStatus = p.stock === 0 ? 'out' : (p.stock <= (p.reorder_level || 10) ? 'low' : 'normal');
                                                const stockBadge = {
                                                    out: 'bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300',
                                                    low: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300',
                                                    normal: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300'
                                                }[stockStatus];

                                                return (
                                                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{idx + 1 + ((parts.current_page || 1) - 1) * (parts.per_page || parts.data.length)}</td>
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</div>
                                                            {p.description && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{p.description}</div>}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">{p.sku || '-'}</td>
                                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{p.category?.name || '-'}</td>
                                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{p.supplier?.name || '-'}</td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${stockBadge}`}>
                                                                <IconPackage size={14} />
                                                                {p.stock}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-400">{formatCurrency(p.buy_price || 0)}</td>
                                                        <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(p.sell_price || 0)}</td>
                                                        <td className="px-4 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <Link href={route('parts.edit', p.id)} className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium text-warning-700 bg-warning-50 hover:bg-warning-100 dark:bg-warning-900/30 dark:text-warning-300 dark:hover:bg-warning-900/50 transition-colors">
                                                                    <IconPencilCog size={14} className="mr-1" /> Edit
                                                                </Link>
                                                                <Button type="delete" icon={<IconTrash size={14} />} className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium text-danger-700 bg-danger-50 hover:bg-danger-100 dark:bg-danger-900/30 dark:text-danger-300 dark:hover:bg-danger-900/50" url={route('parts.destroy', p.id)} label="Hapus" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <IconDatabaseOff size={32} className="text-slate-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">Belum Ada Part</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Part akan muncul di sini setelah dibuat.</p>
                        <Button type="link" href={route('parts.create')} icon={<IconCirclePlus size={18} />} label="Tambah Part Pertama" />
                    </div>
                )}

            {parts.last_page > 1 && <Pagination links={parts.links} />}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
