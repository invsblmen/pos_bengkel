import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Pagination from '@/Components/Dashboard/Pagination';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconPackage } from '@tabler/icons-react';
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

            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kategori Sparepart</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Kelola kategori sparepart untuk pengorganisasian inventory
                            </p>
                        </div>
                        <Link
                            href={route('part-categories.create')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                        >
                            <IconPlus size={20} />
                            <span>Tambah Kategori</span>
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <IconSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari kategori sparepart..."
                                    className="w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {categories.data.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                                    Icon
                                                </th>
                                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                                    Nama Kategori
                                                </th>
                                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                                    Deskripsi
                                                </th>
                                                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                                    Urutan
                                                </th>
                                                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {categories.data.map((category) => (
                                                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-2xl">{category.icon || '📦'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {category.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {category.description || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                            {category.sort_order}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Link
                                                                href={route('part-categories.edit', category.id)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-lg transition-colors"
                                                            >
                                                                <IconEdit size={16} />
                                                                <span>Edit</span>
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(category.id, category.name)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-sm font-medium rounded-lg transition-colors"
                                                            >
                                                                <IconTrash size={16} />
                                                                <span>Hapus</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {categories.links && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                                        <Pagination links={categories.links} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-16 text-center">
                                <IconPackage size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Belum ada kategori sparepart
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Mulai dengan menambahkan kategori sparepart pertama Anda
                                </p>
                                <Link
                                    href={route('part-categories.create')}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                                >
                                    <IconPlus size={20} />
                                    <span>Tambah Kategori Pertama</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;

export default Index;
