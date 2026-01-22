import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Pagination from '@/Components/Dashboard/Pagination';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconTools } from '@tabler/icons-react';
import toast from 'react-hot-toast';

function Index({ auth, services, categories, filters }) {
    const [search, setSearch] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('services.index'),
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleDelete = (id, name) => {
        if (confirm(`Apakah Anda yakin ingin menghapus layanan "${name}"?`)) {
            router.delete(route('services.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Layanan berhasil dihapus!');
                },
                onError: () => {
                    toast.error('Gagal menghapus layanan!');
                },
            });
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getComplexityBadge = (level) => {
        const badges = {
            simple: { color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', label: 'Sederhana' },
            medium: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', label: 'Menengah' },
            complex: { color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', label: 'Kompleks' },
        };
        return badges[level] || badges.simple;
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: { color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', label: 'Aktif' },
            inactive: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300', label: 'Nonaktif' },
        };
        return badges[status] || badges.active;
    };

    return (
        <>
            <Head title="Daftar Layanan" />

            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daftar Layanan Bengkel</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Kelola layanan servis yang ditawarkan bengkel
                            </p>
                        </div>
                        <Link
                            href={route('services.create')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                        >
                            <IconPlus size={20} />
                            <span>Tambah Layanan</span>
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
                                    placeholder="Cari layanan..."
                                    className="w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {services.data.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Nama Layanan
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Kategori
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Harga
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Durasi
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Kompleksitas
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {services.data.map((service) => {
                                                const complexityBadge = getComplexityBadge(service.complexity_level);
                                                const statusBadge = getStatusBadge(service.status);

                                                return (
                                                    <tr
                                                        key={service.id}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                    >
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {service.name}
                                                                </div>
                                                                {service.description && (
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {service.description.substring(0, 60)}
                                                                        {service.description.length > 60 ? '...' : ''}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4">
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                    {service.category?.icon || '🔧'}
                                                                    <span>{service.category?.name || '-'}</span>
                                                                </span>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-center">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {formatPrice(service.price)}
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-center">
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                    {service.duration} menit
                                                                </span>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-center">
                                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${complexityBadge.color}`}>
                                                                    {complexityBadge.label}
                                                                </span>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-center">
                                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadge.color}`}>
                                                                    {statusBadge.label}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <Link
                                                                        href={route('services.edit', service.id)}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-lg transition-colors"
                                                                    >
                                                                        <IconEdit size={16} />
                                                                        <span>Edit</span>
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => handleDelete(service.id, service.name)}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-sm font-medium rounded-lg transition-colors"
                                                                    >
                                                                        <IconTrash size={16} />
                                                                        <span>Hapus</span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {services.links && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                                        <Pagination links={services.links} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-16 text-center">
                                <IconTools size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Belum ada layanan
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Mulai dengan menambahkan layanan bengkel pertama Anda
                                </p>
                                <Link
                                    href={route('services.create')}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                                >
                                    <IconPlus size={20} />
                                    <span>Tambah Layanan Pertama</span>
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
