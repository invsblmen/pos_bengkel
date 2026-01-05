import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Input from '@/Components/Dashboard/Input';
import Textarea from '@/Components/Dashboard/TextArea';
import toast from 'react-hot-toast';
import { IconUserSquare, IconDeviceFloppy, IconArrowLeft } from '@tabler/icons-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        contact_person: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('suppliers.store'), {
            onSuccess: () => toast.success('Supplier berhasil dibuat'),
            onError: () => toast.error('Gagal membuat supplier'),
        });
    };

    return (
        <>
            <Head title="Tambah Supplier" />

            <div className="mb-6">
                <Link href={route('suppliers.index')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-3">
                    <IconArrowLeft size={16} />
                    Kembali ke Supplier
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconUserSquare size={28} className="text-primary-500" />
                    Tambah Supplier Baru
                </h1>
            </div>

            <form onSubmit={submit}>
                <div className="max-w-2xl">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="space-y-4">
                            <Input label="Nama Supplier" placeholder="Masukkan nama" value={data.name} onChange={(e) => setData('name', e.target.value)} errors={errors.name} />
                            <Input label="Phone" placeholder="No. phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} errors={errors.phone} />
                            <Input label="Email" placeholder="Email" value={data.email} onChange={(e) => setData('email', e.target.value)} errors={errors.email} />
                            <Input label="Contact Person" placeholder="Nama PIC" value={data.contact_person} onChange={(e) => setData('contact_person', e.target.value)} errors={errors.contact_person} />
                            <Textarea label="Alamat" placeholder="Alamat supplier" value={data.address} onChange={(e) => setData('address', e.target.value)} errors={errors.address} rows={4} />
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <Link href={route('suppliers.index')} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">Batal</Link>
                            <button type="submit" disabled={processing} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50"><IconDeviceFloppy size={18} />{processing ? 'Menyimpan...' : 'Simpan'}</button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;