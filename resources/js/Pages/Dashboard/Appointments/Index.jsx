import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/Components/Card';
import {
    IconCalendar,
    IconClock,
    IconUser,
    IconCar,
    IconTool,
    IconFilter,
    IconCheck,
    IconX,
    IconTrash,
    IconFileExport,
    IconSearch,
    IconChevronLeft,
    IconChevronRight,
    IconPencil,
} from '@tabler/icons-react';
import { toDisplayDate, toDisplayTime, isPast as isPastDate } from '@/Utils/datetime';

const statusConfig = {
    scheduled: {
        label: 'Terjadwal',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: IconClock,
    },
    confirmed: {
        label: 'Dikonfirmasi',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: IconCheck,
    },
    completed: {
        label: 'Selesai',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: IconCheck,
    },
    cancelled: {
        label: 'Dibatalkan',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: IconX,
    },
};

export default function Index({ appointments }) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const handleStatusChange = (appointmentId, newStatus) => {
        if (confirm(`Ubah status appointment menjadi ${statusConfig[newStatus].label}?`)) {
            router.patch(route('appointments.updateStatus', appointmentId), {
                status: newStatus,
            }, {
                preserveScroll: true,
            });
        }
    };

    const handleDelete = (appointmentId) => {
        if (confirm('Yakin ingin membatalkan appointment ini?')) {
            router.delete(route('appointments.destroy', appointmentId), {
                preserveScroll: true,
            });
        }
    };

    const handleExport = (appointmentId) => {
        window.location.href = route('appointments.export', appointmentId);
    };

    const filteredAppointments = appointments.data?.filter((apt) => {
        const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
        const matchesSearch = !searchQuery ||
            apt.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.mechanic?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.vehicle?.plate_number?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <DashboardLayout>
            <Head title="Daftar Appointment" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Daftar Appointment</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Kelola semua appointment servis kendaraan
                        </p>
                    </div>
                    <Link
                        href={route('appointments.calendar')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <IconCalendar size={20} />
                        Lihat Kalender
                    </Link>
                </div>

                {/* Filters & Search */}
                <Card>
                    <CardBody>
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400">
                                        <IconSearch size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Cari pelanggan, mekanik, atau nomor plat..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <IconFilter size={18} className="text-gray-500" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                >
                                    <option value="all">Semua Status</option>
                                    {Object.entries(statusConfig).map(([key, { label }]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Appointments List */}
                <div className="space-y-4">
                    {filteredAppointments?.length ? (
                        filteredAppointments.map((apt) => {
                            const StatusIcon = statusConfig[apt.status]?.icon || IconClock;
                            const isPast = isPastDate(apt.scheduled_at);

                            return (
                                <Card key={apt.id}>
                                    <CardBody>
                                        <div className="flex flex-col lg:flex-row gap-4">
                                            {/* Left: Date & Time */}
                                            <div className="lg:w-48 flex flex-col items-start lg:items-center lg:justify-center lg:border-r lg:pr-4 dark:border-gray-700">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                                    <IconCalendar size={16} />
                                                    {toDisplayDate(apt.scheduled_at)}
                                                </div>
                                                <div className="flex items-center gap-2 text-2xl font-bold">
                                                    <IconClock size={20} />
                                                    {toDisplayTime(apt.scheduled_at) || '00:00'}
                                                </div>
                                                {isPast && apt.status !== 'completed' && apt.status !== 'cancelled' && (
                                                    <span className="text-xs text-red-600 mt-1">Lewat waktu</span>
                                                )}
                                            </div>

                                            {/* Middle: Details */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2">
                                                        {/* Customer */}
                                                        <div className="flex items-center gap-2">
                                                            <IconUser size={18} className="text-gray-400" />
                                                            <span className="font-semibold">
                                                                {apt.customer?.name || 'Belum dipilih'}
                                                            </span>
                                                        </div>

                                                        {/* Vehicle */}
                                                        {apt.vehicle && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                <IconCar size={18} className="text-gray-400" />
                                                                <span>{apt.vehicle.plate_number}</span>
                                                                <span className="text-gray-400">•</span>
                                                                <span>{apt.vehicle.brand} {apt.vehicle.model}</span>
                                                            </div>
                                                        )}

                                                        {/* Mechanic */}
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <IconTool size={18} className="text-gray-400" />
                                                            <span>Mekanik: <span className="font-medium">{apt.mechanic?.name || '-'}</span></span>
                                                            {apt.mechanic?.specialty && (
                                                                <>
                                                                    <span className="text-gray-400">•</span>
                                                                    <span className="text-xs">{apt.mechanic.specialty}</span>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Notes */}
                                                        {apt.notes && (
                                                            <div className="text-sm text-gray-500 italic mt-2 pl-6">
                                                                "{apt.notes}"
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[apt.status]?.color}`}>
                                                        <StatusIcon size={16} />
                                                        {statusConfig[apt.status]?.label}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Actions */}
                                            <div className="lg:w-48 flex lg:flex-col gap-2">
                                                {/* Status Actions */}
                                                {apt.status === 'scheduled' && (
                                                    <button
                                                        onClick={() => handleStatusChange(apt.id, 'confirmed')}
                                                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                                                    >
                                                        <IconCheck size={16} />
                                                        Konfirmasi
                                                    </button>
                                                )}
                                                {apt.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => handleStatusChange(apt.id, 'completed')}
                                                        className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-1"
                                                    >
                                                        <IconCheck size={16} />
                                                        Selesai
                                                    </button>
                                                )}
                                                {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                                                    <button
                                                        onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1"
                                                    >
                                                        <IconX size={16} />
                                                        Batal
                                                    </button>
                                                )}

                                                {/* Export ICS */}
                                                <button
                                                    onClick={() => handleExport(apt.id)}
                                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1"
                                                    title="Export ke Kalender"
                                                >
                                                    <IconFileExport size={16} />
                                                    ICS
                                                </button>

                                                {/* Edit */}
                                                {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                                                    <Link
                                                        href={route('appointments.edit', apt.id)}
                                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1"
                                                        title="Edit appointment"
                                                    >
                                                        <IconPencil size={16} />
                                                        Edit
                                                    </Link>
                                                )}

                                                {/* Delete */}
                                                {apt.status === 'cancelled' && (
                                                    <button
                                                        onClick={() => handleDelete(apt.id)}
                                                        className="flex-1 px-3 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-1"
                                                    >
                                                        <IconTrash size={16} />
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            );
                        })
                    ) : (
                        <Card>
                            <CardBody>
                                <div className="text-center py-12 text-gray-500">
                                    <IconCalendar size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium mb-2">
                                        {searchQuery || statusFilter !== 'all'
                                            ? 'Tidak ada appointment yang cocok dengan filter'
                                            : 'Belum ada appointment'
                                        }
                                    </p>
                                    <p className="text-sm">
                                        {searchQuery || statusFilter !== 'all'
                                            ? 'Coba ubah pencarian atau filter Anda'
                                            : 'Buat appointment baru dari kalender'
                                        }
                                    </p>
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>

                {/* Pagination */}
                {appointments.links && appointments.links.length > 3 && (
                    <Card>
                        <CardBody>
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Menampilkan {appointments.from || 0} - {appointments.to || 0} dari {appointments.total || 0} appointment
                                </div>
                                <div className="flex gap-2">
                                    {appointments.links.map((link, idx) => {
                                        if (!link.url) return null;

                                        const isFirst = idx === 0;
                                        const isLast = idx === appointments.links.length - 1;

                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveScroll
                                                className={`px-3 py-2 rounded border ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                            >
                                                {isFirst ? (
                                                    <IconChevronLeft size={16} />
                                                ) : isLast ? (
                                                    <IconChevronRight size={16} />
                                                ) : (
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
