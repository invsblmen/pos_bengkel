import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconCar, IconCalendar } from '@tabler/icons-react';
import toast from 'react-hot-toast';

export default function Index({ vehicles }) {
    const [search, setSearch] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('vehicles.index'),
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleDelete = (id, plateNumber) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kendaraan ${plateNumber}?`)) {
            router.delete(route('vehicles.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Kendaraan berhasil dihapus!');
                },
                onError: () => {
                    toast.error('Gagal menghapus kendaraan!');
                },
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <>
            <Head title="Kendaraan" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Kendaraan
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Kelola data kendaraan pelanggan
                        </p>
                    </div>
                    <Link
                        href={route('vehicles.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                    >
                        <IconPlus size={20} />
                        Tambah Kendaraan
                    </Link>
                </div>

                {/* Search */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Cari berdasarkan nomor plat, merek, model, atau nama pelanggan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
                        >
                            <IconSearch size={20} />
                            Cari
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                    {vehicles.data && vehicles.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                No. Plat
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                Kendaraan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                Pemilik
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                Spesifikasi
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                Service Terakhir
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                        {vehicles.data.map((vehicle) => (
                                            <tr
                                                key={vehicle.id}
                                                className="transition hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                                            <IconCar size={20} className="text-blue-600 dark:text-blue-300" />
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {vehicle.plate_number}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {vehicle.brand} {vehicle.model}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {vehicle.year && `Tahun ${vehicle.year}`}
                                                        {vehicle.color && ` • ${vehicle.color}`}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                                        {vehicle.customer?.name || '-'}
                                                    </div>
                                                    {vehicle.customer?.phone && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {vehicle.customer.phone}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {vehicle.engine_type && (
                                                            <div>Mesin: {vehicle.engine_type}</div>
                                                        )}
                                                        {vehicle.cylinder_volume && (
                                                            <div>{vehicle.cylinder_volume} cc</div>
                                                        )}
                                                        {vehicle.transmission_type && (
                                                            <div className="capitalize">{vehicle.transmission_type}</div>
                                                        )}
                                                        {vehicle.km && (
                                                            <div className="mt-1 font-medium">
                                                                {vehicle.km.toLocaleString('id-ID')} km
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        {vehicle.last_service_date ? (
                                                            <>
                                                                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                                    <IconCalendar size={14} />
                                                                    {formatDate(vehicle.last_service_date)}
                                                                </div>
                                                                {vehicle.next_service_date && (
                                                                    <div className="text-xs text-blue-600 dark:text-blue-400">
                                                                        Next: {formatDate(vehicle.next_service_date)}
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">Belum pernah</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={route('vehicles.edit', vehicle.id)}
                                                            className="inline-flex items-center gap-1 rounded bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 transition hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800"
                                                        >
                                                            <IconEdit size={14} />
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(vehicle.id, vehicle.plate_number)}
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

                            {/* Pagination */}
                            {vehicles.links && (
                                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Menampilkan {vehicles.from} hingga {vehicles.to} dari{' '}
                                        {vehicles.total} data
                                    </div>
                                    <div className="flex gap-2">
                                        {vehicles.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`rounded px-3 py-1 text-sm ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
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
                        <div className="flex flex-col items-center justify-center py-12">
                            <IconCar size={64} className="text-gray-300 dark:text-gray-600" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Belum ada data kendaraan
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Mulai dengan menambahkan kendaraan pertama Anda
                            </p>
                            <Link
                                href={route('vehicles.create')}
                                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                            >
                                <IconPlus size={20} />
                                Tambah Kendaraan
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
