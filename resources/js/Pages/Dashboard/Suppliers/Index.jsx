import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import Pagination from '@/Components/Dashboard/Pagination';
import { IconDatabaseOff, IconFilter, IconSearch, IconX, IconCirclePlus } from '@tabler/icons-react';
import { Link } from '@inertiajs/react';


// Filters
const defaultFilters = { q: '' };

export default function Index({ suppliers, filters }) {

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', address: '', contact_person: '' });
    const [editing, setEditing] = useState(false);
    const [editErrors, setEditErrors] = useState({});

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
        router.get(route('suppliers.index'), filterData, { preserveScroll: true, preserveState: true });
        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterData(defaultFilters);
        router.get(route('suppliers.index'), defaultFilters, { preserveScroll: true, preserveState: true, replace: true });
    };



    const openEdit = (s) => {
        setEditId(s.id);
        setEditForm({ name: s.name || '', phone: s.phone || '', email: s.email || '', address: s.address || '', contact_person: s.contact_person || '' });
        setEditErrors({});
        setEditModalOpen(true);
    };

    const submitEdit = async () => {
        if (!editForm.name) return toast.error('Nama supplier diperlukan');
        setEditing(true);
        setEditErrors({});

        router.patch(route('suppliers.update', editId), editForm, {
            onSuccess: (page) => {
                toast.success('Supplier diperbarui');
                setEditModalOpen(false);
                setEditForm({ name: '', phone: '', email: '', address: '', contact_person: '' });
            },
            onError: (errors) => {
                setEditErrors(errors);
                toast.error('Gagal memperbarui supplier');
            },
            onFinish: () => setEditing(false),
        });
    };

    const remove = async (id) => {
        if (!confirm('Hapus supplier ini?')) return;

        router.delete(route('suppliers.destroy', id), {
            onSuccess: () => {
                toast.success('Supplier dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus supplier');
            },
        });
    };

    return (
        <>
            <Head title="Supplier" />
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <div>
                        <h1 className="text-xl font-bold">Supplier</h1>
                        <p className="text-sm text-slate-500">{suppliers?.total || 0} supplier</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters || (filterData.q ? true : false) ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                            <IconFilter size={18} />
                            <span>Filter</span>
                            {filterData.q && <span className="w-2 h-2 rounded-full bg-primary-500"></span>}
                        </button>
                        <Link href={route('suppliers.create')} className="px-4 py-2 rounded-xl bg-primary-500 text-white inline-flex items-center gap-2"><IconCirclePlus size={16} /> <span>Tambah Supplier</span></Link>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-4 animate-slide-up">
                        <form onSubmit={applyFilters}>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nama / Kontak</label>
                                    <input type="text" placeholder="Cari berdasarkan nama, phone, email..." value={filterData.q} onChange={(e) => handleChange('q', e.target.value)} className="w-full h-11 px-4 rounded-xl border" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button type="submit" className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"><IconSearch size={18} /><span>Cari</span></button>
                                    {filterData.q && <button type="button" onClick={resetFilters} className="h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border"> <IconX size={18} /> </button>}
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Supplier List */}
                {suppliers.data && suppliers.data.length > 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">No</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kontak</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact Person</th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {suppliers.data.map((s, idx) => (
                                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{idx + 1 + ((suppliers.current_page || 1) - 1) * (suppliers.per_page || suppliers.data.length)}</td>
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">{s.name}</td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{s.phone || '-'}<div className="text-xs text-slate-400">{s.email || ''}</div></td>
                                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{s.contact_person || '-'}</td>
                                            <td className="px-4 py-4 text-right">
                                                <button onClick={() => openEdit(s)} className="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm text-primary-600">Edit</button>
                                                <button onClick={() => remove(s.id)} className="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm text-danger-500">Hapus</button>
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
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">Belum Ada Supplier</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Supplier akan muncul di sini setelah dibuat.</p>
                    </div>
                )}

                {suppliers.last_page !== 1 && <Pagination links={suppliers.links} />}
            </div>



            {editModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60" onClick={() => setEditModalOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-3">Edit Supplier</h3>
                        <div className="space-y-3">
                            <input placeholder="Nama" value={editForm.name} onChange={(e) => { setEditForm({...editForm, name: e.target.value}); setEditErrors(prev => ({...prev, name: undefined})); }} className="w-full h-10 rounded-xl border px-3" />
                            {editErrors.name && <div className="text-xs text-danger-500 mt-1">{editErrors.name[0]}</div>}
                            <input placeholder="Phone" value={editForm.phone} onChange={(e) => { setEditForm({...editForm, phone: e.target.value}); setEditErrors(prev => ({...prev, phone: undefined})); }} className="w-full h-10 rounded-xl border px-3" />
                            {editErrors.phone && <div className="text-xs text-danger-500 mt-1">{editErrors.phone[0]}</div>}
                            <input placeholder="Email" value={editForm.email} onChange={(e) => { setEditForm({...editForm, email: e.target.value}); setEditErrors(prev => ({...prev, email: undefined})); }} className="w-full h-10 rounded-xl border px-3" />
                            {editErrors.email && <div className="text-xs text-danger-500 mt-1">{editErrors.email[0]}</div>}
                            <input placeholder="Contact Person" value={editForm.contact_person} onChange={(e) => { setEditForm({...editForm, contact_person: e.target.value}); setEditErrors(prev => ({...prev, contact_person: undefined})); }} className="w-full h-10 rounded-xl border px-3" />
                            {editErrors.contact_person && <div className="text-xs text-danger-500 mt-1">{editErrors.contact_person[0]}</div>}
                            <textarea placeholder="Address" value={editForm.address} onChange={(e) => { setEditForm({...editForm, address: e.target.value}); setEditErrors(prev => ({...prev, address: undefined})); }} className="w-full rounded-xl border px-3 py-2" rows={3} />
                            {editErrors.address && <div className="text-xs text-danger-500 mt-1">{editErrors.address[0]}</div> }

                            <div className="flex justify-end gap-2">
                                <button onClick={() => { setEditModalOpen(false); setEditErrors({}); }} className="px-4 py-2 rounded-xl border">Batal</button>
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
