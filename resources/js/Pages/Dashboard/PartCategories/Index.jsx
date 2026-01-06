import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IconPlus, IconSearch, IconPencil, IconTrash, IconPackage } from '@tabler/icons-react';
import toast from 'react-hot-toast';

function Index({ auth, categories }) {
    const [search, setSearch] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('part-categories.index'),
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleDelete = (id, name) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
            router.delete(route('part-categories.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Kategori sparepart berhasil dihapus!');
                },
                onError: () => {
                    toast.error('Gagal menghapus kategori sparepart!');
                },
            });
        }
    };

    return (
        <>
            <Head title="Kategori Sparepart" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                    Kategori Sparepart
                                </h2>
                                <Link
                                    href={route('part-categories.create')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                >
                                    <IconPlus size={18} />
                                    Tambah Kategori
                                </Link>
                            </div>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSearch} className="mb-6">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Cari kategori sparepart..."
                                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                        />
                                        <IconSearch
                                            size={20}
                                            className="absolute left-3 top-2.5 text-gray-400"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                    >
                                        Cari
                                    </button>
                                </div>
                            </form>

                            {categories.data.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Icon
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Nama Kategori
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Deskripsi
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Urutan
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                                {categories.data.map((category) => (
                                                    <tr
                                                        key={category.id}
                                                        className="transition hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    >
                                                        <td className="whitespace-nowrap px-6 py-4">
                                                            <span className="text-2xl">
                                                                {category.icon || '📦'}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {category.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {category.description || '-'}
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-center">
                                                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                                                {category.sort_order}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Link
                                                                    href={route('part-categories.edit', category.id)}
                                                                    className="inline-flex items-center gap-1 rounded bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 transition hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800"
                                                                >
                                                                    <IconPencil size={14} />
                                                                    Edit
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(category.id, category.name)}
                                                                    className="inline-flex items-center gap-1 rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                                                                >
                                                                    <IconTrash size={14} />
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {categories.links && (
                                        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                Menampilkan {categories.from} hingga {categories.to} dari{' '}
                                                {categories.total} data
                                            </div>
                                            <div className="flex gap-2">
                                                {categories.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`rounded px-3 py-1 text-sm ${
                                                            link.active
                                                                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                                        } ${!link.url && 'cursor-not-allowed opacity-50'}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-12 text-center">
                                    <IconPackage
                                        size={64}
                                        className="mx-auto mb-4 text-gray-400 dark:text-gray-600"
                                    />
                                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Belum ada kategori sparepart
                                    </h3>
                                    <p className="mb-6 text-gray-500 dark:text-gray-400">
                                        Mulai dengan menambahkan kategori sparepart pertama Anda.
                                    </p>
                                    <Link
                                        href={route('part-categories.create')}
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                    >
                                        <IconPlus size={18} />
                                        Tambah Kategori Pertama
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;

export default Index;
