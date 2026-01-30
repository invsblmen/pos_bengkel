import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconCar, IconCalendar, IconFilter, IconX, IconChevronDown, IconArrowUp, IconArrowDown, IconArrowsSort } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { toDisplayDate } from '@/Utils/datetime';
import Button from '@/Components/Dashboard/Button';
import Search from '@/Components/Dashboard/Search';

export default function Index({ vehicles, filters }) {
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        brand: filters?.brand || '',
        year: filters?.year || '',
        transmission: filters?.transmission || '',
        service_status: filters?.service_status || '',
    });

    const handleSort = (column) => {
        const currentSort = filters?.sort_by;
        const currentDirection = filters?.sort_direction || 'desc';

        let newDirection = 'asc';
        if (currentSort === column && currentDirection === 'asc') {
            newDirection = 'desc';
        }

        router.get(route('vehicles.index'), {
            ...filters,
            sort_by: column,
            sort_direction: newDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getSortIcon = (column) => {
        if (filters?.sort_by !== column) {
            return <IconArrowsSort size={14} className="opacity-50" />;
        }
        return filters?.sort_direction === 'asc'
            ? <IconArrowUp size={14} className="text-primary-600 dark:text-primary-400" />
            : <IconArrowDown size={14} className="text-primary-600 dark:text-primary-400" />;
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

    const handleFilterChange = (key, value) => {
        const newFilters = { ...activeFilters, [key]: value };
        setActiveFilters(newFilters);

        // Apply filters
        router.get(route('vehicles.index'), {
            search: filters?.search || '',
            ...newFilters,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setActiveFilters({
            brand: '',
            year: '',
            transmission: '',
            service_status: '',
        });

        router.get(route('vehicles.index'), {
            search: filters?.search || '',
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

    const formatDate = (dateString) => (dateString ? toDisplayDate(dateString) : '-');

    return (
        <>
            <Head title="Kendaraan" />
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kendaraan</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {vehicles.total || vehicles.data?.length || 0} kendaraan terdaftar
                        </p>
                    </div>
                    <Button
                        type="link"
                        icon={<IconPlus size={18} strokeWidth={1.5} />}
                        className="bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30"
                        label="Tambah Kendaraan"
                        href={route('vehicles.create')}
                    />
                </div>

                {/* Search and Filters */}
                <div className="mb-4 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                        <div className="flex-1 max-w-md">
                            <Search
                                url={route('vehicles.index')}
                                placeholder="Cari nomor plat, merek, model, atau pelanggan..."
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                                hasActiveFilters || showFilters
                                    ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/30'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                            }`}
                        >
                            <IconFilter size={18} />
                            Filter
                            {hasActiveFilters && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                                    {Object.values(activeFilters).filter(v => v !== '').length}
                                </span>
                            )}
                            <IconChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/50">
                                            <IconFilter size={20} className="text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                Filter Kendaraan
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Saring data berdasarkan kriteria
                                            </p>
                                        </div>
                                    </div>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="inline-flex items-center gap-2 rounded-xl bg-danger-100 px-4 py-2 text-sm font-medium text-danger-700 transition hover:bg-danger-200 dark:bg-danger-900/30 dark:text-danger-300 dark:hover:bg-danger-900/50"
                                        >
                                            <IconX size={16} />
                                            Hapus Filter
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid gap-6 md:grid-cols-4">
                                    {/* Brand Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Merek
                                        </label>
                                        <select
                                            value={activeFilters.brand}
                                            onChange={(e) => handleFilterChange('brand', e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        >
                                            <option value="">Semua Merek</option>
                                            <option value="Honda">Honda</option>
                                            <option value="Yamaha">Yamaha</option>
                                            <option value="Suzuki">Suzuki</option>
                                            <option value="Kawasaki">Kawasaki</option>
                                            <option value="TVS">TVS</option>
                                            <option value="Viar">Viar</option>
                                        </select>
                                    </div>

                                    {/* Year Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Tahun
                                        </label>
                                        <select
                                            value={activeFilters.year}
                                            onChange={(e) => handleFilterChange('year', e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        >
                                            <option value="">Semua Tahun</option>
                                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Transmission Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Transmisi
                                        </label>
                                        <select
                                            value={activeFilters.transmission}
                                            onChange={(e) => handleFilterChange('transmission', e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        >
                                            <option value="">Semua Transmisi</option>
                                            <option value="manual">Manual</option>
                                            <option value="automatic">Automatic</option>
                                            <option value="semi-automatic">Semi-Automatic</option>
                                        </select>
                                    </div>

                                    {/* Service Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Status Service
                                        </label>
                                        <select
                                            value={activeFilters.service_status}
                                            onChange={(e) => handleFilterChange('service_status', e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        >
                                            <option value="">Semua Status</option>
                                            <option value="serviced">Pernah Service</option>
                                            <option value="never">Belum Pernah</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    {vehicles.data && vehicles.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-900">
                                        <tr>
                                            <th
                                                onClick={() => handleSort('plate_number')}
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>No. Plat</span>
                                                    {getSortIcon('plate_number')}
                                                </div>
                                            </th>
                                            <th
                                                onClick={() => handleSort('brand')}
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>Kendaraan</span>
                                                    {getSortIcon('brand')}
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                Pemilik
                                            </th>
                                            <th
                                                onClick={() => handleSort('year')}
                                                className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <span>Spesifikasi</span>
                                                    {getSortIcon('year')}
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                Service Terakhir
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                                        {vehicles.data.map((vehicle) => (
                                            <tr
                                                key={vehicle.id}
                                                className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                                                            <IconCar size={20} className="text-primary-600 dark:text-primary-400" />
                                                        </div>
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                            {vehicle.plate_number}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        {vehicle.brand} {vehicle.model}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {vehicle.year && `Tahun ${vehicle.year}`}
                                                        {vehicle.color && ` • ${vehicle.color}`}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        {vehicle.customer?.name || '-'}
                                                    </div>
                                                    {vehicle.customer?.phone && (
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            {vehicle.customer.phone}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                                    <div className="text-xs text-slate-600 dark:text-slate-400">
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
                                                                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                                                    <IconCalendar size={14} />
                                                                    {formatDate(vehicle.last_service_date)}
                                                                </div>
                                                                {vehicle.next_service_date && (
                                                                    <div className="text-xs text-primary-600 dark:text-primary-400">
                                                                        Next: {formatDate(vehicle.next_service_date)}
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">Belum pernah</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={route('vehicles.show', vehicle.id)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 px-3 py-2 text-xs font-medium text-blue-700 transition-all hover:shadow-sm dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                                                        >
                                                            <IconCar size={16} />
                                                            Detail
                                                        </Link>
                                                        <Link
                                                            href={route('vehicles.edit', vehicle.id)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 px-3 py-2 text-xs font-medium text-amber-700 transition-all hover:shadow-sm dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                                                        >
                                                            <IconEdit size={16} />
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(vehicle.id, vehicle.plate_number)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-red-100 hover:bg-red-200 px-3 py-2 text-xs font-medium text-red-700 transition-all hover:shadow-sm dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                                                        >
                                                            <IconTrash size={16} />
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
                                <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                                    <div className="text-sm text-slate-700 dark:text-slate-300">
                                        Menampilkan {vehicles.from} hingga {vehicles.to} dari{' '}
                                        {vehicles.total} data
                                    </div>
                                    <div className="flex gap-2">
                                        {vehicles.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`rounded-lg px-3 py-1.5 text-sm ${
                                                    link.active
                                                        ? 'bg-primary-500 text-white'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                                } ${!link.url && 'cursor-not-allowed opacity-50'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <IconCar size={32} className="text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                Belum ada data kendaraan
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                Mulai dengan menambahkan kendaraan pertama Anda
                            </p>
                            <Link
                                href={route('vehicles.create')}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 font-medium text-white transition hover:bg-primary-600 shadow-sm"
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
