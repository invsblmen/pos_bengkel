import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import toast from 'react-hot-toast';

function Edit({ auth, service, categories }) {
    const { data, setData, put, processing, errors } = useForm({
        service_category_id: service.service_category_id || '',
        name: service.name || '',
        description: service.description || '',
        price: service.price || '',
        duration: service.duration || '',
        complexity_level: service.complexity_level || 'simple',
        required_tools: service.required_tools ? service.required_tools.join(', ') : '',
        status: service.status || 'active',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert required_tools from comma-separated string to array
        const formData = {
            ...data,
            required_tools: data.required_tools
                ? data.required_tools.split(',').map(tool => tool.trim()).filter(Boolean)
                : [],
        };

        put(route('services.update', service.id), {
            data: formData,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Layanan berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui layanan!');
            },
        });
    };

    return (
        <>
            <Head title="Edit Layanan" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                    Edit Layanan
                                </h2>
                                <Link
                                    href={route('services.index')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    <IconArrowLeft size={18} />
                                    Kembali
                                </Link>
                            </div>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="service_category_id"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Kategori Layanan <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="service_category_id"
                                            value={data.service_category_id}
                                            onChange={(e) => setData('service_category_id', e.target.value)}
                                            className={`mt-1 block w-full rounded-lg border ${
                                                errors.service_category_id
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'
                                            } bg-white px-4 py-2 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100`}
                                        >
                                            <option value="">Pilih Kategori</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.icon} {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.service_category_id && (
                                            <p className="mt-1 text-sm text-red-500">{errors.service_category_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Nama Layanan <span className="text-red-500">*</span>
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
                                            placeholder="Contoh: Ganti Oli Mesin"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                                        )}
                                    </div>
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
                                        rows={3}
                                        className={`mt-1 block w-full rounded-lg border ${
                                            errors.description
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'
                                        } bg-white px-4 py-2 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100`}
                                        placeholder="Masukkan deskripsi layanan..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div>
                                        <label
                                            htmlFor="price"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Harga (Rp) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="price"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            className={`mt-1 block w-full rounded-lg border ${
                                                errors.price
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'
                                            } bg-white px-4 py-2 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100`}
                                            placeholder="50000"
                                            min="0"
                                            step="1000"
                                        />
                                        {errors.price && (
                                            <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="duration"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Durasi (menit) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="duration"
                                            value={data.duration}
                                            onChange={(e) => setData('duration', e.target.value)}
                                            className={`mt-1 block w-full rounded-lg border ${
                                                errors.duration
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'
                                            } bg-white px-4 py-2 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100`}
                                            placeholder="30"
                                            min="1"
                                        />
                                        {errors.duration && (
                                            <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="complexity_level"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Kompleksitas
                                        </label>
                                        <select
                                            id="complexity_level"
                                            value={data.complexity_level}
                                            onChange={(e) => setData('complexity_level', e.target.value)}
                                            className={`mt-1 block w-full rounded-lg border ${
                                                errors.complexity_level
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'
                                            } bg-white px-4 py-2 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100`}
                                        >
                                            <option value="simple">Sederhana</option>
                                            <option value="medium">Menengah</option>
                                            <option value="complex">Kompleks</option>
                                        </select>
                                        {errors.complexity_level && (
                                            <p className="mt-1 text-sm text-red-500">{errors.complexity_level}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="required_tools"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Alat yang Dibutuhkan
                                        </label>
                                        <input
                                            type="text"
                                            id="required_tools"
                                            value={data.required_tools}
                                            onChange={(e) => setData('required_tools', e.target.value)}
                                            className={`mt-1 block w-full rounded-lg border ${
                                                errors.required_tools
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'
                                            } bg-white px-4 py-2 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100`}
                                            placeholder="Kunci pas, Kunci inggris, Dongkrak (pisahkan dengan koma)"
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Pisahkan dengan koma untuk beberapa alat
                                        </p>
                                        {errors.required_tools && (
                                            <p className="mt-1 text-sm text-red-500">{errors.required_tools}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="status"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className={`mt-1 block w-full rounded-lg border ${
                                                errors.status
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'
                                            } bg-white px-4 py-2 text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100`}
                                        >
                                            <option value="active">Aktif</option>
                                            <option value="inactive">Nonaktif</option>
                                        </select>
                                        {errors.status && (
                                            <p className="mt-1 text-sm text-red-500">{errors.status}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                                    <Link
                                        href={route('services.index')}
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
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
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

Edit.layout = (page) => <DashboardLayout children={page} />;

export default Edit;
