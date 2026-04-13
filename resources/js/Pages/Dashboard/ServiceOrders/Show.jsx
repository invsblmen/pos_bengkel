import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    IconArrowLeft,
    IconPencil,
    IconPrinter,
    IconShieldCheck,
    IconUser,
    IconCar,
    IconTool,
    IconClock,
    IconCurrencyDollar,
} from '@tabler/icons-react';
import { toDisplayDateTime } from '@/Utils/datetime';
import { useGoRealtime } from '@/Hooks/useGoRealtime';
import { useRealtimeToggle } from '@/Hooks/useRealtimeToggle';
import RealtimeControlBanner from '@/Components/Dashboard/RealtimeControlBanner';
import RealtimeToggleButton from '@/Components/Dashboard/RealtimeToggleButton';
import toast from 'react-hot-toast';

export default function Show({ order, warrantyRegistrations = {}, permissions = {} }) {
    const [liveOrder, setLiveOrder] = useState(order);
    const [goRealtimeEventMeta, setGoRealtimeEventMeta] = useState(null);
    const [highlightedPartIds, setHighlightedPartIds] = useState([]);
    const [highlightedServiceIds, setHighlightedServiceIds] = useState([]);
    const [highlightExpiresAt, setHighlightExpiresAt] = useState(null);
    const [countdownNow, setCountdownNow] = useState(Date.now());
    const [realtimeEnabled, setRealtimeEnabled] = useRealtimeToggle();
    const reloadTimerRef = useRef(null);
    const highlightTimerRef = useRef(null);

    useEffect(() => {
        setLiveOrder(order);
    }, [order]);

    useEffect(() => {
        return () => {
            if (reloadTimerRef.current) {
                clearTimeout(reloadTimerRef.current);
            }
            if (highlightTimerRef.current) {
                clearTimeout(highlightTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!highlightExpiresAt) {
            return undefined;
        }

        const interval = setInterval(() => {
            setCountdownNow(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, [highlightExpiresAt]);

    useEffect(() => {
        if (realtimeEnabled) return;
        if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        setHighlightedPartIds([]);
        setHighlightedServiceIds([]);
        setHighlightExpiresAt(null);
    }, [realtimeEnabled]);

    const currentOrder = liveOrder || order;

    const formatPrice = (price) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(price || 0));

    const formatDate = (dateString) => (dateString ? toDisplayDateTime(dateString) : '-');

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Menunggu' },
            in_progress: { color: 'bg-blue-100 text-blue-700', label: 'Dikerjakan' },
            completed: { color: 'bg-green-100 text-green-700', label: 'Selesai' },
            paid: { color: 'bg-purple-100 text-purple-700', label: 'Sudah Dibayar' },
            cancelled: { color: 'bg-red-100 text-red-700', label: 'Dibatalkan' },
        };
        return badges[status] || badges.pending;
    };

    const getWarrantyMeta = (detail) => {
        const registration = warrantyRegistrations?.[detail.id];
        if (!registration) {
            return {
                label: 'Tanpa Garansi',
                badgeClass: 'bg-slate-100 text-slate-700',
                canClaim: false,
                periodDays: 0,
                endDate: null,
                isNearExpiry: false,
            };
        }

        const endDate = registration.warranty_end_date ? new Date(registration.warranty_end_date) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(0, 0, 0, 0);

        if (registration.claimed_at || registration.status === 'claimed') {
            return {
                label: 'Sudah Diklaim',
                badgeClass: 'bg-blue-100 text-blue-700',
                canClaim: false,
                periodDays: Number(registration.warranty_period_days || 0),
                endDate: registration.warranty_end_date,
                isNearExpiry: false,
            };
        }

        if (!endDate || endDate < today) {
            return {
                label: 'Expired',
                badgeClass: 'bg-red-100 text-red-700',
                canClaim: false,
                periodDays: Number(registration.warranty_period_days || 0),
                endDate: registration.warranty_end_date,
                isNearExpiry: false,
            };
        }

        const warningThreshold = new Date(today);
        warningThreshold.setDate(warningThreshold.getDate() + 7);

        return {
            label: 'Aktif',
            badgeClass: 'bg-emerald-100 text-emerald-700',
            canClaim: true,
            periodDays: Number(registration.warranty_period_days || 0),
            endDate: registration.warranty_end_date,
            isNearExpiry: endDate <= warningThreshold,
        };
    };

    const handleClaimWarranty = (detail) => {
        const notes = window.prompt('Catatan klaim garansi (opsional):') || '';

        router.post(
            route('service-orders.details.claim-warranty', { id: currentOrder.id, detailId: detail.id }),
            { claim_notes: notes },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Klaim garansi berhasil dicatat'),
                onError: (errors) => toast.error(errors?.error || 'Gagal mencatat klaim garansi'),
            }
        );
    };

    const { status: goRealtimeStatus } = useGoRealtime({
        enabled: realtimeEnabled,
        domains: ['service_orders'],
        onEvent: (event) => {
            if (event?.domain !== 'service_orders') return;
            if (Number(event?.id || 0) !== Number(order?.id || 0)) return;

            const action = event?.action || '';
            const data = event?.data || {};

            if (action === 'deleted') {
                toast.error('Service order ini telah dihapus. Kembali ke daftar.');
                router.visit(route('service-orders.index'));
                return;
            }

            if (action === 'status_changed') {
                setLiveOrder((prev) => ({
                    ...prev,
                    status: data?.new_status || prev?.status,
                    odometer_km: data?.odometer_km ?? prev?.odometer_km,
                }));
            }

            if (action === 'items_changed' || action === 'updated') {
                const partIds = Array.from(
                    new Set([
                        ...(Array.isArray(data?.added_part_ids) ? data.added_part_ids : []),
                        ...(Array.isArray(data?.removed_part_ids) ? data.removed_part_ids : []),
                        ...(Array.isArray(data?.changed_qty_part_ids) ? data.changed_qty_part_ids : []),
                    ])
                )
                    .map((id) => Number(id))
                    .filter((id) => Number.isFinite(id) && id > 0);

                const serviceIds = Array.from(
                    new Set([
                        ...(Array.isArray(data?.added_service_ids) ? data.added_service_ids : []),
                        ...(Array.isArray(data?.removed_service_ids) ? data.removed_service_ids : []),
                    ])
                )
                    .map((id) => Number(id))
                    .filter((id) => Number.isFinite(id) && id > 0);

                setHighlightedPartIds(partIds);
                setHighlightedServiceIds(serviceIds);

                if (highlightTimerRef.current) {
                    clearTimeout(highlightTimerRef.current);
                }
                setHighlightExpiresAt(Date.now() + 6000);
                highlightTimerRef.current = setTimeout(() => {
                    setHighlightedPartIds([]);
                    setHighlightedServiceIds([]);
                    setHighlightExpiresAt(null);
                }, 6000);

                if (reloadTimerRef.current) {
                    clearTimeout(reloadTimerRef.current);
                }
                reloadTimerRef.current = setTimeout(() => {
                    router.reload({
                        only: ['order', 'warrantyRegistrations'],
                        preserveState: true,
                        preserveScroll: true,
                    });
                }, 450);
            }

            setGoRealtimeEventMeta({
                at: new Date().toLocaleTimeString('id-ID'),
                action,
            });
        },
    });

    const statusBadge = getStatusBadge(currentOrder.status);
    const details = currentOrder.details || [];
    const totalItems = details.reduce((sum, detail) => sum + Number(detail.qty || 0), 0);
    const subtotal = Number(currentOrder.total || 0);
    const discountAmount = Number(currentOrder.discount_amount || 0);
    const voucherAmount = Number(currentOrder.voucher_discount_amount || 0);
    const taxAmount = Number(currentOrder.tax_amount || 0);
    const grandTotal = Number(currentOrder.grand_total || currentOrder.total || 0);

    const warrantyActiveCount = details.reduce((sum, detail) => {
        const meta = getWarrantyMeta(detail);
        return meta.label === 'Aktif' ? sum + 1 : sum;
    }, 0);

    const getMechanicHref = (mechanicId) => {
        if (!mechanicId) return null;

        if (route().has('mechanics.show')) {
            return route('mechanics.show', mechanicId);
        }
        if (route().has('mechanics.performance.show')) {
            return route('mechanics.performance.show', mechanicId);
        }
        if (route().has('mechanics.index')) {
            return route('mechanics.index');
        }

        return null;
    };

    const mechanicHref = getMechanicHref(currentOrder.mechanic?.id);
    const highlightSecondsLeft = highlightExpiresAt
        ? Math.max(0, Math.ceil((highlightExpiresAt - countdownNow) / 1000))
        : 0;

    return (
        <>
            <Head title={`Service Order ${currentOrder.order_number}`} />

            <div className="space-y-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Service Order</p>
                            <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">Order #{currentOrder.order_number}</h1>
                            <p className="mt-1 text-sm text-gray-500">{currentOrder.customer?.name || 'Tanpa pelanggan'} - {currentOrder.vehicle?.plate_number || 'Tanpa kendaraan'}</p>
                            <RealtimeControlBanner enabled={realtimeEnabled} />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.color}`}>{statusBadge.label}</span>
                            <Link href={route('service-orders.print', currentOrder.id)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold">
                                <IconPrinter size={16} /> Cetak
                            </Link>
                            <Link href={route('service-orders.index')} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold">
                                <IconArrowLeft size={16} /> Kembali
                            </Link>
                            <Link href={route('service-orders.edit', currentOrder.id)} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-3 py-2 text-sm font-semibold text-white">
                                <IconPencil size={16} /> Edit
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span>
                            GO Realtime: <span className="font-semibold">{realtimeEnabled ? goRealtimeStatus : 'disabled'}</span>
                        </span>
                        <RealtimeToggleButton
                            enabled={realtimeEnabled}
                            onClick={() => setRealtimeEnabled((prev) => !prev)}
                        />
                        <span>
                            {goRealtimeEventMeta
                                ? `Event terakhir: ${goRealtimeEventMeta.action} (${goRealtimeEventMeta.at})`
                                : 'Belum ada event realtime masuk untuk order ini.'}
                        </span>
                        {highlightSecondsLeft > 0 && (
                            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                Highlight aktif ~{highlightSecondsLeft} dtk
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <p className="mb-1 inline-flex items-center gap-1 text-xs text-gray-500">
                            <IconCurrencyDollar size={14} /> Biaya Jasa
                        </p>
                        <p className="mt-1 text-xl font-bold">{formatPrice(currentOrder.labor_cost || 0)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <p className="mb-1 inline-flex items-center gap-1 text-xs text-gray-500">
                            <IconCar size={14} /> Biaya Part
                        </p>
                        <p className="mt-1 text-xl font-bold">{formatPrice(currentOrder.material_cost || 0)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <p className="mb-1 inline-flex items-center gap-1 text-xs text-gray-500">
                            <IconTool size={14} /> Item Pekerjaan
                        </p>
                        <p className="mt-1 text-xl font-bold">{totalItems}</p>
                        <p className="text-xs text-emerald-600">{warrantyActiveCount} item garansi aktif</p>
                    </div>
                    <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
                        <p className="text-xs text-primary-700">Total Akhir</p>
                        <p className="mt-1 text-xl font-bold text-primary-800 dark:text-primary-200">{formatPrice(grandTotal)}</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <IconUser size={14} /> Pelanggan
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{currentOrder.customer?.name || '-'}</p>
                        <p className="text-xs text-gray-500">{currentOrder.customer?.phone || 'No phone'}</p>
                        <p className="mt-1 text-xs text-gray-500">{currentOrder.customer?.email || '-'}</p>
                        {permissions?.can_view_customers && currentOrder.customer?.id && (
                            <div className="mt-3">
                                <Link
                                    href={route('customers.show', currentOrder.customer.id)}
                                    className="inline-flex items-center rounded-lg border border-primary-200 px-2.5 py-1.5 text-xs font-semibold text-primary-700"
                                >
                                    Lihat Detail
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <IconCar size={14} /> Kendaraan
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{currentOrder.vehicle ? `${currentOrder.vehicle.brand || ''} ${currentOrder.vehicle.model || ''}`.trim() : '-'}</p>
                        <p className="text-xs text-gray-500">Plat: {currentOrder.vehicle?.plate_number || '-'}</p>
                        <p className="mt-1 text-xs text-gray-500">Tahun: {currentOrder.vehicle?.year || '-'}</p>
                        {permissions?.can_view_vehicles && currentOrder.vehicle?.id && (
                            <div className="mt-3">
                                <Link
                                    href={route('vehicles.show', currentOrder.vehicle.id)}
                                    className="inline-flex items-center rounded-lg border border-primary-200 px-2.5 py-1.5 text-xs font-semibold text-primary-700"
                                >
                                    Lihat Detail
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <IconTool size={14} /> Mekanik
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{currentOrder.mechanic?.name || 'Belum ditentukan'}</p>
                        <p className="text-xs text-gray-500">Spesialisasi: {currentOrder.mechanic?.specialty || '-'}</p>
                        {permissions?.can_view_mechanics && mechanicHref && (
                            <div className="mt-3">
                                <Link
                                    href={mechanicHref}
                                    className="inline-flex items-center rounded-lg border border-primary-200 px-2.5 py-1.5 text-xs font-semibold text-primary-700"
                                >
                                    Lihat Detail
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Detail Layanan & Sparepart</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Item</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Qty</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Harga</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Garansi</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {details.map((detail) => {
                                    const warranty = getWarrantyMeta(detail);
                                    const partId = Number(detail.part?.id || 0);
                                    const serviceId = Number(detail.service?.id || 0);
                                    const isChanged =
                                        (partId > 0 && highlightedPartIds.includes(partId)) ||
                                        (serviceId > 0 && highlightedServiceIds.includes(serviceId));

                                    return (
                                        <tr
                                            key={detail.id}
                                            className={isChanged ? 'bg-amber-50/80 dark:bg-amber-900/20 transition-colors duration-500' : ''}
                                        >
                                            <td className="px-4 py-3 text-sm">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{detail.service?.title || detail.part?.name || '-'}</div>
                                                <div className="text-xs text-gray-500">
                                                    {detail.service ? 'Layanan' : detail.part ? 'Sparepart' : '-'}
                                                    {isChanged ? ' • update realtime' : ''}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm">{detail.qty}</td>
                                            <td className="px-4 py-3 text-right text-sm">{formatPrice(detail.price)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold ${warranty.badgeClass}`}>
                                                        <IconShieldCheck size={12} /> {warranty.label}
                                                    </span>
                                                    {warranty.canClaim && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleClaimWarranty(detail)}
                                                            className="rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                                                        >
                                                            Klaim
                                                        </button>
                                                    )}
                                                    {warranty.periodDays > 0 && (
                                                        <span className="text-[10px] text-gray-500">
                                                            {warranty.periodDays} hari, s.d. {formatDate(warranty.endDate)}
                                                        </span>
                                                    )}
                                                    {warranty.isNearExpiry && <span className="text-[10px] font-semibold text-amber-600">Mendekati expired</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold">{formatPrice((detail.price || 0) * (detail.qty || 0))}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <td colSpan="4" className="px-4 py-2 text-right text-xs text-gray-500">Subtotal</td>
                                    <td className="px-4 py-2 text-right text-sm font-semibold">{formatPrice(subtotal)}</td>
                                </tr>
                                {discountAmount > 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-2 text-right text-xs text-gray-500">
                                            Diskon {currentOrder.discount_type === 'percent' ? `(${currentOrder.discount_value || 0}%)` : '(Fixed)'}
                                        </td>
                                        <td className="px-4 py-2 text-right text-sm font-semibold text-red-600">-{formatPrice(discountAmount)}</td>
                                    </tr>
                                )}
                                {voucherAmount > 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-2 text-right text-xs text-gray-500">Voucher {currentOrder.voucher_code ? `(${currentOrder.voucher_code})` : ''}</td>
                                        <td className="px-4 py-2 text-right text-sm font-semibold text-violet-600">-{formatPrice(voucherAmount)}</td>
                                    </tr>
                                )}
                                {taxAmount > 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-2 text-right text-xs text-gray-500">Pajak</td>
                                        <td className="px-4 py-2 text-right text-sm font-semibold text-emerald-600">+{formatPrice(taxAmount)}</td>
                                    </tr>
                                )}
                                <tr className="border-t border-gray-300 dark:border-gray-600">
                                    <td colSpan="4" className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">Grand Total</td>
                                    <td className="px-4 py-3 text-right text-base font-bold text-primary-700 dark:text-primary-300">{formatPrice(grandTotal)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {currentOrder.notes && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Catatan</h2>
                        <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">{currentOrder.notes}</p>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <p className="mb-1 inline-flex items-center gap-1 text-xs text-gray-500">
                            <IconClock size={14} /> Estimasi Mulai
                        </p>
                        <p className="text-sm font-semibold">{formatDate(currentOrder.estimated_start_at)}</p>
                        <p className="mt-3 text-xs text-gray-500">Estimasi Selesai</p>
                        <p className="text-sm font-semibold">{formatDate(currentOrder.estimated_finish_at)}</p>
                        <p className="mt-3 text-xs text-gray-500">Dibuat</p>
                        <p className="text-sm font-semibold">{formatDate(currentOrder.created_at)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <p className="text-xs text-gray-500">Aktual Mulai</p>
                        <p className="text-sm font-semibold">{formatDate(currentOrder.actual_start_at)}</p>
                        <p className="mt-3 text-xs text-gray-500">Aktual Selesai</p>
                        <p className="text-sm font-semibold">{formatDate(currentOrder.actual_finish_at)}</p>
                        <p className="mt-3 text-xs text-gray-500">Odometer</p>
                        <p className="text-sm font-semibold">{currentOrder.odometer_km ? `${Number(currentOrder.odometer_km).toLocaleString('id-ID')} km` : '-'}</p>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = (page) => <DashboardLayout children={page} />;
