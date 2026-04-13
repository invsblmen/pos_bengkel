import React, { useState, useEffect, useRef } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Pagination from '@/Components/Dashboard/Pagination';
import { IconFilter, IconSearch, IconX, IconCirclePlus, IconEye, IconDatabaseOff } from '@tabler/icons-react';
import { toDisplayDate } from '@/Utils/datetime';
import { useGoRealtime } from '@/Hooks/useGoRealtime';
import { useRealtimeToggle } from '@/Hooks/useRealtimeToggle';
import RealtimeControlBanner from '@/Components/Dashboard/RealtimeControlBanner';
import RealtimeToggleButton from '@/Components/Dashboard/RealtimeToggleButton';

const defaultFilters = { q: '', supplier_id: '', status: '', date_from: '', date_to: '' };

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved: 'bg-blue-100 text-blue-700 border-blue-200',
    received: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    received: 'Received',
    cancelled: 'Cancelled',
};

export default function Index({ orders, suppliers, filters }) {
    const [filterData, setFilterData] = useState({
        ...defaultFilters,
        ...(typeof filters !== 'undefined' ? filters : {}),
    });
    const [showFilters, setShowFilters] = useState(false);
    const [liveItems, setLiveItems] = useState(orders.data || []);
    const [realtimeEnabled, setRealtimeEnabled] = useRealtimeToggle();
    const [highlightedIds, setHighlightedIds] = useState([]);
    const [highlightExpiresAt, setHighlightExpiresAt] = useState(null);
    const [countdownNow, setCountdownNow] = useState(Date.now());
    const [goRealtimeEventMeta, setGoRealtimeEventMeta] = useState(null);
    const reloadTimerRef = useRef(null);

    const highlightSecondsLeft = highlightExpiresAt ? Math.max(0, Math.ceil((highlightExpiresAt - countdownNow) / 1000)) : 0;

    useEffect(() => {
        setFilterData({
            ...defaultFilters,
            ...(typeof filters !== 'undefined' ? filters : {}),
        });
    }, [filters]);

    useEffect(() => {
        setLiveItems(orders.data || []);
    }, [orders.data]);

    const { status: goRealtimeStatus } = useGoRealtime({
        enabled: realtimeEnabled,
        domains: ['part_purchase_orders'],
        onEvent: (payload) => {
            const action = payload?.action || '';
            const incoming = payload?.data || {};
            const incomingId = String(payload?.id || incoming?.id || '');
            if (!incomingId) return;

            setGoRealtimeEventMeta({
                action,
                at: new Date(payload?.timestamp || Date.now()).toLocaleTimeString('id-ID'),
            });

            if (action === 'created') {
                setLiveItems((prev) => {
                    if (prev.some((o) => String(o.id) === incomingId)) return prev;
                    return [incoming, ...prev];
                });
            } else if (action === 'updated') {
                setLiveItems((prev) => prev.map((o) => (String(o.id) === incomingId ? { ...o, ...incoming } : o)));
            } else if (action === 'deleted') {
                setLiveItems((prev) => prev.filter((o) => String(o.id) !== incomingId));
            }

            setHighlightedIds((prev) => [...new Set([...prev, incomingId])]);
            setHighlightExpiresAt(Date.now() + 6000);
            setCountdownNow(Date.now());

            clearTimeout(reloadTimerRef.current);
            reloadTimerRef.current = setTimeout(() => {
                router.reload({ only: ['orders'], preserveScroll: true, preserveState: true });
            }, 300);
        },
    });

    const realtimeStatusMeta = {
        connected: { label: 'Terhubung', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
        connecting: { label: 'Menghubungkan...', className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
        disconnected: { label: 'Terputus', className: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
        error: { label: 'Error', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
    };
    const currentRealtimeStatus = realtimeEnabled
        ? (realtimeStatusMeta[goRealtimeStatus] || { label: goRealtimeStatus || 'Tidak diketahui', className: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' })
        : { label: 'Dimatikan', className: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' };

    useEffect(() => {
        if (!highlightExpiresAt) return;
        const interval = setInterval(() => {
            setCountdownNow(Date.now());
            if (Date.now() >= highlightExpiresAt) {
                setHighlightedIds([]);
                setHighlightExpiresAt(null);
                clearInterval(interval);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [highlightExpiresAt]);

    useEffect(() => {
        return () => clearTimeout(reloadTimerRef.current);
    }, []);

    const handleChange = (field, value) => {
        setFilterData((prev) => ({ ...prev, [field]: value }));
    };

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(route('part-purchase-orders.index'), filterData, {
            preserveScroll: true,
            preserveState: true
        });
        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterData(defaultFilters);
        router.get(route('part-purchase-orders.index'), defaultFilters, {
            preserveScroll: true,
            preserveState: true,
            replace: true
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString) => (dateString ? toDisplayDate(dateString) : '-');

    const hasActiveFilters = filterData.q || filterData.supplier_id || filterData.status || filterData.date_from || filterData.date_to;

    return (
        <>
            <Head title="Part Purchase Orders" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Part Purchase Orders (PO)</h1>
                        <p className="text-sm text-slate-500">{liveItems.length} purchase orders</p>
                        <RealtimeControlBanner enabled={realtimeEnabled} />
                    </div>
                    <div className="flex items-center gap-2">
                        <RealtimeToggleButton
                            enabled={realtimeEnabled}
                            goRealtimeStatus={goRealtimeStatus}
                            onClick={() => setRealtimeEnabled((prev) => !prev)}
                        />
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                                showFilters || hasActiveFilters
                                    ? "bg-primary-50 border-primary-200 text-primary-700"
                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            <IconFilter size={18} />
                            <span>Filter</span>
                            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary-500"></span>}
                        </button>
                        <Link
                            href={route('part-purchase-orders.create')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-medium"
                        >
                            <IconCirclePlus size={18} />
                            <span>Create PO</span>
                        </Link>
                    </div>
                </div>

                <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span>
                            GO Realtime: <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${currentRealtimeStatus.className}`}>{currentRealtimeStatus.label}</span>
                        </span>
                        <span>
                            {goRealtimeEventMeta
                                ? `Event terakhir: ${goRealtimeEventMeta.action} (${goRealtimeEventMeta.at})`
                                : 'Belum ada event realtime PO pembelian.'}
                        </span>
                        {highlightSecondsLeft > 0 && (
                            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                Highlight aktif ~{highlightSecondsLeft} dtk
                            </span>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <form onSubmit={applyFilters} className="mb-6 bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Search</label>
                                <input
                                    type="text"
                                    placeholder="PO Number or notes..."
                                    value={filterData.q}
                                    onChange={(e) => handleChange('q', e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Supplier</label>
                                <select
                                    value={filterData.supplier_id}
                                    onChange={(e) => handleChange('supplier_id', e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors"
                                >
                                    <option value="">All Suppliers</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <select
                                    value={filterData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="received">Received</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Date Range</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={filterData.date_from}
                                        onChange={(e) => handleChange('date_from', e.target.value)}
                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors"
                                    />
                                    <input
                                        type="date"
                                        value={filterData.date_to}
                                        onChange={(e) => handleChange('date_to', e.target.value)}
                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-medium"
                            >
                                Apply Filters
                            </button>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                )}

                {liveItems?.length > 0 ? (
                    <>
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">No</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">PO Number</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Supplier</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">PO Date</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Items</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Total</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Status</th>
                                            <th className="text-center py-4 px-6 text-sm font-semibold text-slate-700">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {liveItems.map((o, idx) => (
                                            <tr key={o.id} className={`transition-colors ${highlightedIds.includes(String(o.id)) ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-slate-50'}`}>
                                                <td className="py-4 px-6 text-sm">{orders.from + idx}</td>
                                                <td className="py-4 px-6 text-sm font-medium">{o.po_number}</td>
                                                <td className="py-4 px-6 text-sm">{o.supplier?.name}</td>
                                                <td className="py-4 px-6 text-sm">{formatDate(o.po_date)}</td>
                                                <td className="py-4 px-6 text-sm">{o.details_count || 0} items</td>
                                                <td className="py-4 px-6 text-sm font-medium">{formatCurrency(o.total_amount)}</td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[o.status]}`}>
                                                        {statusLabels[o.status]}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <Link
                                                        href={route('part-purchase-orders.show', o.id)}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors text-sm"
                                                    >
                                                        <IconEye size={16} />
                                                        <span>View</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Pagination links={orders.links} />
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <IconDatabaseOff className="mx-auto mb-4 text-slate-300" size={64} />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No Purchase Orders Found</h3>
                        <p className="text-sm text-slate-500 mb-6">Get started by creating your first purchase order</p>
                        <Link
                            href={route('part-purchase-orders.create')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-medium"
                        >
                            <IconCirclePlus size={18} />
                            <span>Create Purchase Order</span>
                        </Link>
                    </div>
                )}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
