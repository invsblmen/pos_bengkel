import React, { useEffect, useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import Pagination from '@/Components/Dashboard/Pagination';
import { IconDatabaseOff, IconFilter, IconSearch, IconX, IconCirclePlus, IconBox } from '@tabler/icons-react';

const defaultFilters = { q: '' };

export default function Index({ parts, suppliers, categories, filters }) {
    const [editing, setEditing] = useState(false);
    const [editErrors, setEditErrors] = useState({});

    // filters
    const [filterData, setFilterData] = useState({
        ...defaultFilters,
        ...(typeof filters !== 'undefined' ? filters : {}),
    });
    const [showFilters, setShowFilters] = useState(false);

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
        event.preventDefault();
        router.get(route('parts.index'), filterData, { preserveScroll: true, preserveState: true });
        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterData(defaultFilters);
        router.get(route('parts.index'), defaultFilters, { preserveScroll: true, preserveState: true, replace: true });
    };

    const remove = async (id) => {
        if (!confirm('Hapus part ini?')) return;
        try {
            await axios.delete(route('parts.destroy', id));
            toast.success('Part dihapus');
            window.location.reload();
        } catch (err) {
            toast.error('Gagal menghapus part');
        }
    };

    return (
        <>
            <Head title="Part" />

            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <div>
                        <h1 className="text-xl font-bold">Sparepart</h1>
                        <p className="text-sm text-slate-500">{parts?.total || 0} part</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters || (filterData.q ? true : false) ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                            <IconFilter size={18} />
                            <span>Filter</span>
                            {filterData.q && <span className="w-2 h-2 rounded-full bg-primary-500"></span>}
                        </button>
                        <Link href={route('parts.create')} className="px-4 py-2 rounded-xl bg-primary-500 text-white inline-flex items-center gap-2"><IconCirclePlus size={16} /> <span>Tambah Part</span></Link>
                    </div>
                </div>

                {showFilters && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-4 animate-slide-up">
                        <form onSubmit={applyFilters}>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nama / SKU</label>
                                    <input type="text" placeholder="Cari berdasarkan nama, SKU..." value={filterData.q} onChange={(e) => handleChange('q', e.target.value)} className="w-full h-11 px-4 rounded-xl border" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button type="submit" className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"><IconSearch size={18} /><span>Cari</span></button>
                                    {filterData.q && <button type="button" onClick={resetFilters} className="h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border"> <IconX size={18} /> </button>}
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {parts.data && parts.data.length > 0 ? (
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
                                            out: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
                                            low: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
                                            normal: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
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
                                                        <IconBox size={14} />
                                                        {p.stock}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-400">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.buy_price || 0)}</td>
                                                <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.sell_price || 0)}</td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Link href={route('parts.edit', p.id)} className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50 transition-colors">Edit</Link>
                                                        <button onClick={() => remove(p.id)} className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors">Hapus</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <IconDatabaseOff size={32} className="text-slate-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">Belum Ada Part</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Part akan muncul di sini setelah dibuat.</p>
                    </div>
                )}

                {parts.last_page !== 1 && <Pagination links={parts.links} />}

            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
