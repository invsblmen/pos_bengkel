import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import Pagination from "@/Components/Dashboard/Pagination";
import { IconDatabaseOff, IconFilter, IconSearch, IconX, IconCirclePlus } from '@tabler/icons-react';
import { Link } from '@inertiajs/react';

const defaultFilters = { q: '' };

export default function Index({ mechanics, filters }) {


    // edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', phone: '', employee_number: '', notes: '' });
    const [editing, setEditing] = useState(false);

    // filter state
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
        router.get(route('mechanics.index'), filterData, { preserveScroll: true, preserveState: true });
        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterData(defaultFilters);
        router.get(route('mechanics.index'), defaultFilters, { preserveScroll: true, preserveState: true, replace: true });
    };



    const openEdit = (m) => {
        setEditId(m.id);
        setEditForm({ name: m.name || '', phone: m.phone || '', employee_number: m.employee_number || '', notes: m.notes || '' });
        setEditModalOpen(true);
    };

    const submitEdit = async () => {
        if (!editForm.name) return toast.error('Nama mekanik diperlukan');
        setEditing(true);

        router.patch(route('mechanics.update', editId), editForm, {
            onSuccess: () => {
                toast.success('Mekanik diperbarui');
                setEditModalOpen(false);
                setEditForm({ name: '', phone: '', employee_number: '', notes: '' });
            },
            onError: () => {
                toast.error('Gagal memperbarui mekanik');
            },
            onFinish: () => setEditing(false),
        });
    };

    const remove = async (id) => {
        if (!confirm('Hapus mekanik ini?')) return;

        router.delete(route('mechanics.destroy', id), {
            onSuccess: () => {
                toast.success('Mekanik dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus mekanik');
            },
        });
    };

    return (
        <>
            <Head title="Mekanik" />

            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <div>
                        <h1 className="text-xl font-bold">Mekanik</h1>
                        <p className="text-sm text-slate-500">{mechanics?.total || 0} mekanik</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters || (filterData.q ? true : false) ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                            <IconFilter size={18} />
                            <span>Filter</span>
                            {filterData.q && <span className="w-2 h-2 rounded-full bg-primary-500"></span>}
                        </button>
                        <Link href={route('mechanics.create')} className="px-4 py-2 rounded-xl bg-primary-500 text-white inline-flex items-center gap-2"><IconCirclePlus size={16} /> <span>Tambah Mekanik</span></Link>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-4 animate-slide-up">
                        <form onSubmit={applyFilters}>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nama / Kontak</label>
                                    <input type="text" placeholder="Cari berdasarkan nama, phone, employee number..." value={filterData.q} onChange={(e) => handleChange('q', e.target.value)} className="w-full h-11 px-4 rounded-xl border" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button type="submit" className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"><IconSearch size={18} /><span>Cari</span></button>
                                    {filterData.q && <button type="button" onClick={resetFilters} className="h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border"> <IconX size={18} /> </button>}
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Mechanics List */}
                {mechanics.data && mechanics.data.length > 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">No</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kontak</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">No. Pegawai</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Catatan</th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {mechanics.data.map((m, idx) => (
                                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{idx + 1 + ((mechanics.current_page || 1) - 1) * (mechanics.per_page || mechanics.data.length)}</td>
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">{m.name}</td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{m.phone || '-'}</td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{m.employee_number || '-'}</td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{m.notes || '-'}</td>
                                            <td className="px-4 py-4 text-right">
                                                <button onClick={() => openEdit(m)} className="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm text-primary-600">Edit</button>
                                                <button onClick={() => remove(m.id)} className="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm text-danger-500">Hapus</button>
                                            </td>
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
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">Belum Ada Mekanik</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Mekanik akan muncul di sini setelah dibuat.</p>
                    </div>
                )}

                {/* Pagination */}
                {mechanics.last_page !== 1 && <Pagination links={mechanics.links} /> }
            </div>



            {editModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60" onClick={() => setEditModalOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-3">Edit Mekanik</h3>
                        <div className="space-y-3">
                            <input placeholder="Nama" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full h-10 rounded-xl border px-3" />
                            <input placeholder="Phone" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full h-10 rounded-xl border px-3" />
                            <input placeholder="Employee Number" value={editForm.employee_number} onChange={(e) => setEditForm({...editForm, employee_number: e.target.value})} className="w-full h-10 rounded-xl border px-3" />
                            <textarea placeholder="Notes" value={editForm.notes} onChange={(e) => setEditForm({...editForm, notes: e.target.value})} className="w-full rounded-xl border px-3 py-2" rows={3} />

                            <div className="flex justify-end gap-2">
                                <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 rounded-xl border">Batal</button>
                                <button onClick={submitEdit} disabled={editing} className="px-4 py-2 rounded-xl bg-primary-500 text-white">{editing ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
