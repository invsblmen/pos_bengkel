import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Input from '@/Components/Dashboard/Input';
import Textarea from '@/Components/Dashboard/TextArea';
import toast from 'react-hot-toast';
import { IconBox, IconDeviceFloppy, IconArrowLeft } from '@tabler/icons-react';

export default function Create({ suppliers }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        sku: '',
        supplier_id: '',
        buy_price: '',
        sell_price: '',
        stock: 0,
        description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('parts.store'), {
            onSuccess: () => toast.success('Part berhasil dibuat'),
            onError: () => toast.error('Gagal membuat part'),
        });
    };

    return (
        <>
            <Head title="Tambah Part" />

            <div className="mb-6">
                <Link href={route('parts.index')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-3">
                    <IconArrowLeft size={16} />
                    Kembali ke Sparepart
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconBox size={28} className="text-primary-500" />
                    Tambah Sparepart Baru
                </h1>
            </div>

            <form onSubmit={submit}>
                <div className="max-w-2xl">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="space-y-4">
                            <Input label="Nama" placeholder="Nama part" value={data.name} onChange={(e) => setData('name', e.target.value)} errors={errors.name} />
                            <Input label="SKU" placeholder="SKU" value={data.sku} onChange={(e) => setData('sku', e.target.value)} errors={errors.sku} />

                            <select value={data.supplier_id} onChange={(e) => setData('supplier_id', e.target.value)} className="w-full h-11 rounded-xl border px-3">
                                <option value="">Pilih Supplier (opsional)</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>

                            <div className="grid grid-cols-3 gap-2">
                                <Input label="Harga Beli" placeholder="Harga beli" value={data.buy_price} onChange={(e) => setData('buy_price', e.target.value)} errors={errors.buy_price} />
                                <Input label="Harga Jual" placeholder="Harga jual" value={data.sell_price} onChange={(e) => setData('sell_price', e.target.value)} errors={errors.sell_price} />
                                <Input label="Stok" placeholder="Stok" value={data.stock} onChange={(e) => setData('stock', e.target.value)} errors={errors.stock} />
                            </div>

                            <Textarea label="Deskripsi" placeholder="Deskripsi" value={data.description} onChange={(e) => setData('description', e.target.value)} errors={errors.description} rows={4} />
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <Link href={route('parts.index')} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">Batal</Link>
                            <button type="submit" disabled={processing} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50"><IconDeviceFloppy size={18} />{processing ? 'Menyimpan...' : 'Simpan'}</button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;