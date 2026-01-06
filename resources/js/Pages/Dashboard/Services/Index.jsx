import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IconPlus, IconSearch, IconPencil, IconTrash, IconTools, IconEye } from '@tabler/icons-react';
import toast from 'react-hot-toast';

function Index({ auth, services }) {
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

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                    Daftar Layanan Bengkel
                                </h2>
                                <Link
                                    href={route('services.create')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                >
                                    <IconPlus size={18} />
                                    Tambah Layanan
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
                                            placeholder="Cari layanan..."
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

                            {services.data.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
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
                                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                                {services.data.map((service) => {
                                                    const complexityBadge = getComplexityBadge(service.complexity_level);
                                                    const statusBadge = getStatusBadge(service.status);

                                                    return (
                                                        <tr
                                                            key={service.id}
                                                            className="transition hover:bg-gray-50 dark:hover:bg-gray-700"
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
                                                            <td className="whitespace-nowrap px-6 py-4 text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <Link
                                                                        href={route('services.edit', service.id)}
                                                                        className="inline-flex items-center gap-1 rounded bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 transition hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800"
                                                                    >
                                                                        <IconPencil size={14} />
                                                                        Edit
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => handleDelete(service.id, service.name)}
                                                                        className="inline-flex items-center gap-1 rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                                                                    >
                                                                        <IconTrash size={14} />
                                                                        Hapus
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {services.links && (
                                        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                Menampilkan {services.from} hingga {services.to} dari{' '}
                                                {services.total} data
                                            </div>
                                            <div className="flex gap-2">
                                                {services.links.map((link, index) => (
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
                                    <IconTools
                                        size={64}
                                        className="mx-auto mb-4 text-gray-400 dark:text-gray-600"
                                    />
                                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Belum ada layanan
                                    </h3>
                                    <p className="mb-6 text-gray-500 dark:text-gray-400">
                                        Mulai dengan menambahkan layanan bengkel pertama Anda.
                                    </p>
                                    <Link
                                        href={route('services.create')}
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                    >
                                        <IconPlus size={18} />
                                        Tambah Layanan Pertama
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
