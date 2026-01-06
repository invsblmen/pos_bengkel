import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import IconPicker from '@/Components/Dashboard/IconPicker';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import toast from 'react-hot-toast';

function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        icon: '',
        sort_order: 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('part-categories.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kategori sparepart berhasil ditambahkan!');
            },
            onError: () => {
                toast.error('Gagal menambahkan kategori sparepart!');
            },
        });
    };

    return (
        <>
            <Head title="Tambah Kategori Sparepart" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                    Tambah Kategori Sparepart
                                </h2>
                                <Link
                                    href={route('part-categories.index')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    <IconArrowLeft size={18} />
                                    Kembali
                                </Link>
                            </div>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Nama Kategori <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`mt-1 block w-full rounded-lg border ${
                                            errors.name
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'
                                        } bg-white px-4 py-2 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100`}
                                        placeholder="Contoh: Mesin & Komponen"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Deskripsi
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className={`mt-1 block w-full rounded-lg border ${
                                            errors.description
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'
                                        } bg-white px-4 py-2 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100`}
                                        placeholder="Masukkan deskripsi kategori..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <IconPicker
                                        label="Icon"
                                        value={data.icon}
                                        onChange={(value) => setData('icon', value)}
                                        errors={errors.icon}
                                    />

                                    <div>
                                        <label
                                            htmlFor="sort_order"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Urutan Tampil
                                        </label>
                                        <input
                                            type="number"
                                            id="sort_order"
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', e.target.value)}
                                            className={`mt-1 block w-full rounded-lg border ${
                                                errors.sort_order
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'
                                            } bg-white px-4 py-2 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100`}
                                            placeholder="0"
                                            min="0"
                                        />
                                        {errors.sort_order && (
                                            <p className="mt-1 text-sm text-red-500">{errors.sort_order}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                                    <Link
                                        href={route('part-categories.index')}
                                        className="rounded-lg bg-gray-100 px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                    >
                                        <IconDeviceFloppy size={18} />
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;

export default Create;
