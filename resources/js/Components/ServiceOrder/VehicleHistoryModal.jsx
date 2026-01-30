import React from 'react';
import { Link } from '@inertiajs/react';
import { IconX, IconCalendar, IconUser, IconTool, IconReceipt, IconCircleCheck, IconCircle, IconFileText } from '@tabler/icons-react';

export default function VehicleHistoryModal({ show, onClose, vehicle, serviceHistory }) {
    if (!show || !vehicle) return null;

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                color: 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                text: 'Menunggu'
            },
            in_progress: {
                color: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                text: 'Dikerjakan'
            },
            completed: {
                color: 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400',
                text: 'Selesai'
            },
            paid: {
                color: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
                text: 'Lunas'
            },
            cancelled: {
                color: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400',
                text: 'Dibatalkan'
            },
        };
        const config = statusConfig[status] || { color: 'border-gray-200 bg-gray-50 text-gray-700', text: status };
        return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${config.color}`}>{config.text}</span>;
    };

    const formatPrice = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value || 0);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/50 transition-opacity" />

                {/* Modal */}
                <div
                    className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header - Fixed */}
                    <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                                Riwayat Service Kendaraan
                            </h2>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {vehicle.formatted_plate_number || vehicle.plate_number} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <IconX size={20} />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {serviceHistory && serviceHistory.length > 0 ? (
                            <div className="relative space-y-6">
                                {/* Timeline line */}
                                <div className="absolute left-[13px] top-3 bottom-3 w-[2px] bg-slate-200 dark:bg-slate-800" />

                                {serviceHistory.map((order) => (
                                    <div
                                        key={order.id}
                                        className="relative rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                                    >
                                        {/* Timeline dot */}
                                        <div className="absolute -left-[7px] top-5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-primary-500 dark:bg-slate-900" />

                                        {/* Header */}
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
                                                    <IconTool size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                        Order #{order.order_number}
                                                    </p>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {formatDateTime(order.created_at)}
                                                    </p>
                                                    {order.mechanic && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            Mekanik: {order.mechanic.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {getStatusBadge(order.status)}
                                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                                                    Total {formatPrice(order.total)}
                                                </span>
                                                {order.odometer_km && (
                                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-800">
                                                        {order.odometer_km.toLocaleString('id-ID')} km
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Details */}
                                        {order.details && order.details.length > 0 && (
                                            <div className="mt-4 rounded-lg border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Rincian Item</p>
                                                <div className="space-y-1">
                                                    {order.details.map((detail, idx) => (
                                                        <div key={idx} className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                                                {detail.service ? (
                                                                    <IconCircleCheck size={14} className="text-emerald-500" />
                                                                ) : detail.part ? (
                                                                    <IconCircle size={14} className="text-amber-500" />
                                                                ) : null}
                                                                <span>{detail.service?.name || detail.part?.name || '-'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                                <span>{detail.quantity}x</span>
                                                                <span>{formatPrice(detail.price)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {order.notes && (
                                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                                    <span className="font-medium">Catatan:</span> {order.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <IconReceipt size={32} className="text-slate-400" />
                                </div>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Belum ada riwayat service untuk kendaraan ini
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer - Fixed */}
                    <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
