import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
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
        post(route('service-categories.store'), {
            onSuccess: () => toast.success('Kategori berhasil dibuat'),
            onError: () => toast.error('Gagal membuat kategori'),
        });
    };

    return (
        <>
            <Head title="Tambah Kategori Layanan" />

            <div className="py-6">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route('service-categories.index')}
                            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Kembali
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Tambah Kategori Layanan Servis
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Isi form di bawah untuk menambah kategori baru
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nama Kategori <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                    placeholder="Contoh: Tune Up & Maintenance"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Deskripsi
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                                        errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                    placeholder="Deskripsi singkat tentang kategori ini"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Icon */}
                            <div>
                                <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Icon (Opsional)
                                </label>
                                <input
                                    type="text"
                                    id="icon"
                                    value={data.icon}
                                    onChange={(e) => setData('icon', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="wrench, engine, brake"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Nama icon untuk ditampilkan (gunakan Tabler Icons atau Font Awesome)
                                </p>
                            </div>

                            {/* Sort Order */}
                            <div>
                                <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Urutan Tampilan
                                </label>
                                <input
                                    type="number"
                                    id="sort_order"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Kategori dengan urutan lebih kecil akan tampil lebih dulu
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Kategori'}
                                </button>
                                <Link
                                    href={route('service-categories.index')}
                                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
                                >
                                    Batal
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;

export default Create;
