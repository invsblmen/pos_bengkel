import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Input from '@/Components/Dashboard/Input';
import Select from '@/Components/Dashboard/Select';
import toast from 'react-hot-toast';
import { IconArrowLeft, IconDeviceFloppy, IconPlus } from '@tabler/icons-react';

export default function Create({ parts, suppliers }) {
    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '',
        notes: '',
        items: [
            { part_id: '', qty: 1, unit_price: '' },
        ],
    });

    const partsMap = Object.fromEntries(parts.map(p => [String(p.id), p]));

    const addRow = () => {
        setData('items', [...data.items, { part_id: '', qty: 1, unit_price: '' }]);
    };

    const updateItem = (index, key, value) => {
        const items = [...data.items];
        items[index][key] = value;

        if (key === 'part_id') {
            const p = partsMap[value];
            if (p && (!items[index].unit_price || items[index].unit_price === '')) {
                items[index].unit_price = p.buy_price ?? '';
            }
        }

        setData('items', items);
    };

    const computeSubtotal = (it) => {
        const q = Number(it.qty) || 0;
        const up = Number(it.unit_price) || 0;
        return q * up;
    };

    const grandTotal = data.items.reduce((acc, it) => acc + computeSubtotal(it), 0);

    const formatCurrency = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

    const removeRow = (index) => {
        const items = data.items.filter((_, i) => i !== index);
        setData('items', items);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('parts.purchases.store'), {
            onSuccess: () => {
                toast.success('Pembelian tersimpan');
            },
            onError: () => toast.error('Gagal menyimpan pembelian'),
        });
    };

    return (
        <>
            <Head title="Buat Pembelian Sparepart" />

            <div className="mb-6">
                <Link href={route('parts.purchases.index')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-3">
                    <IconArrowLeft size={16} />
                    Kembali ke Pembelian
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconPlus size={28} className="text-primary-500" />
                    Buat Pembelian Sparepart
                </h1>
            </div>

            <form onSubmit={submit}>
                <div className="max-w-3xl">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                        <Select label="Supplier (opsional)" value={data.supplier_id} onChange={(e) => setData('supplier_id', e.target.value)} errors={errors.supplier_id}>
                            <option value="">Pilih Supplier</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>

                        <div className="space-y-3">
                            {data.items.map((it, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-6">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sparepart</label>
                                        <select value={it.part_id} onChange={(e) => updateItem(idx, 'part_id', e.target.value)} className="w-full h-11 rounded-xl border px-3">
                                            <option value="">Pilih sparepart</option>
                                            {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <Input label="Qty" type="number" value={it.qty} onChange={(e) => updateItem(idx, 'qty', e.target.value)} />
                                    </div>
                                    <div className="col-span-3">
                                        <Input label="Harga Satuan" value={it.unit_price} onChange={(e) => updateItem(idx, 'unit_price', e.target.value)} />
                                    </div>
                                    <div className="col-span-1 flex items-end">
                                        <button type="button" onClick={() => removeRow(idx)} className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-slate-100 hover:bg-slate-200">
                                            &times;
                                        </button>
                                    </div>

                                    <div className="col-span-12 text-right">
                                        <div className="text-sm font-medium">Subtotal: {formatCurrency(computeSubtotal(it))}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={addRow} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm"><IconPlus size={16} /> Tambah Baris</button>
                        </div>

                        <Input label="Catatan" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />

                        {grandTotal > 0 && (
                            <div className="text-right text-lg font-semibold">Total: {formatCurrency(grandTotal)}</div>
                        )}

                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <Link href={route('parts.purchases.index')} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">Batal</Link>
                            <button type="submit" disabled={processing || grandTotal <= 0} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50"><IconDeviceFloppy size={18} />{processing ? 'Menyimpan...' : 'Simpan Pembelian'}</button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
