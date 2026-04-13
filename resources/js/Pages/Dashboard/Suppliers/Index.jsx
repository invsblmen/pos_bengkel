import React, { useEffect, useState, useRef } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import toast from 'react-hot-toast';
import Pagination from '@/Components/Dashboard/Pagination';
import { useGoRealtime } from '@/Hooks/useGoRealtime';
import { useRealtimeToggle } from '@/Hooks/useRealtimeToggle';
import RealtimeControlBanner from '@/Components/Dashboard/RealtimeControlBanner';
import RealtimeToggleButton from '@/Components/Dashboard/RealtimeToggleButton';
import {
    IconDatabaseOff,
    IconFilter,
    IconSearch,
    IconX,
    IconCirclePlus,
    IconChevronDown,
    IconTruck,
    IconPhone,
    IconMail,
    IconMapPin,
    IconEdit,
    IconTrash
} from '@tabler/icons-react';


// Filters
const defaultFilters = { q: '' };

export default function Index({ suppliers, filters }) {
    // filter state
    const [filterData, setFilterData] = useState({
        ...defaultFilters,
        ...(typeof filters !== 'undefined' ? filters : {}),
    });
    const [showFilters, setShowFilters] = useState(false);
    const [liveItems, setLiveItems] = useState(suppliers?.data || []);







    // Realtime state
    const [realtimeEnabled, setRealtimeEnabled] = useRealtimeToggle();
    const [highlightedIds, setHighlightedIds] = useState([]);
    const [highlightExpiresAt, setHighlightExpiresAt] = useState(null);
    const [countdownNow, setCountdownNow] = useState(Date.now());
    const [goRealtimeEventMeta, setGoRealtimeEventMeta] = useState(null);
    const reloadTimerRef = useRef(null);
    const highlightTimerRef = useRef(null);

    const highlightSecondsLeft = highlightExpiresAt ? Math.max(0, Math.ceil((highlightExpiresAt - countdownNow) / 1000)) : 0;
    const realtimeStatusMeta = {
        connected: { label: 'Terhubung', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
        connecting: { label: 'Menghubungkan...', className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
        disconnected: { label: 'Terputus', className: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
        error: { label: 'Error', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
    };

    // GO Realtime Hook
    const { status: goRealtimeStatus } = useGoRealtime({
        enabled: realtimeEnabled,
        domains: ['suppliers'],
        onEvent: (payload) => {
            const incoming = payload?.data || {};
            const action = payload?.action || '';
            const incomingId = String(payload?.id || incoming?.id || '');
            if (!incomingId) return;
            setGoRealtimeEventMeta({
                action: action || 'updated',
                at: new Date(payload?.timestamp || Date.now()).toLocaleTimeString('id-ID'),
            });

            // Handle different event types
            if (action === 'created' || action === 'updated') {
                setHighlightedIds(prev => [...new Set([...prev, incomingId])]);
                setHighlightExpiresAt(Date.now() + 6000);
                setCountdownNow(Date.now());

                if (action === 'created') {
                    setLiveItems(prev => {
                        if (prev.some(i => String(i.id) === incomingId)) return prev;
                        return [incoming, ...prev];
                    });
                } else {
                    setLiveItems(prev => prev.map(i => String(i.id) === incomingId ? { ...i, ...incoming } : i));
                }
            } else if (action === 'deleted') {
                setLiveItems(prev => prev.filter(i => String(i.id) !== incomingId));
                setHighlightedIds(prev => prev.filter(id => String(id) !== incomingId));
            }

            // Debounce reload
            clearTimeout(reloadTimerRef.current);
            reloadTimerRef.current = setTimeout(() => {
                router.reload({ preserveScroll: true, preserveState: true });
            }, 300);
        },
    });

    const currentRealtimeStatus = realtimeEnabled
        ? (realtimeStatusMeta[goRealtimeStatus] || { label: goRealtimeStatus || 'Tidak diketahui', className: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' })
        : { label: 'Dimatikan', className: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' };

    // Countdown timer
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

    // Cleanup
    useEffect(() => {
        return () => {
            clearTimeout(reloadTimerRef.current);
            clearTimeout(highlightTimerRef.current);
        };
    }, []);
    useEffect(() => {
        setFilterData({
            ...defaultFilters,
            ...(typeof filters !== 'undefined' ? filters : {}),
        });
    }, [filters]);

    const handleChange = (field, value) => {
        setFilterData((prev) => ({ ...prev, [field]: value }));
    };

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(route('suppliers.index'), filterData, { preserveScroll: true, preserveState: true });
        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterData(defaultFilters);
        router.get(route('suppliers.index'), defaultFilters, { preserveScroll: true, preserveState: true, replace: true });
    };

    const remove = async (id) => {
        if (!confirm('Hapus supplier ini?')) return;

        router.delete(route('suppliers.destroy', id), {
            onSuccess: () => {
                toast.success('Supplier dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus supplier');
            },
        });
    };

    const activeFiltersCount = Object.values(filterData).filter(v => v !== '').length;

    return (
        <>
            <Head title="Supplier" />

            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-8 mb-6 shadow-lg">
                <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/3 translate-x-1/3 rounded-full bg-white/10"></div>
                <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                            <IconTruck size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Daftar Supplier</h1>
                            <p className="mt-1 text-sm text-white/80">{liveItems.length} supplier terdaftar</p>
                            <RealtimeControlBanner enabled={realtimeEnabled} />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <RealtimeToggleButton
                            enabled={realtimeEnabled}
                            goRealtimeStatus={goRealtimeStatus}
                            onClick={() => setRealtimeEnabled((prev) => !prev)}
                        />
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                                showFilters || activeFiltersCount > 0
                                    ? 'bg-white text-primary-700'
                                    : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'
                            }`}
                        >
                            <IconFilter size={18} />
                            <span>Filter</span>
                            {activeFiltersCount > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                                    {activeFiltersCount}
                                </span>
                            )}
                            <IconChevronDown
                                size={16}
                                className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
                            />
                        </button>
                        <Link
                            href={route('suppliers.create')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-white/90"
                        >
                            <IconCirclePlus size={18} />
                            Tambah Supplier
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                        GO Realtime: <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${currentRealtimeStatus.className}`}>{currentRealtimeStatus.label}</span>
                    </span>
                    <span>
                        {goRealtimeEventMeta
                            ? `Event terakhir: ${goRealtimeEventMeta.action} (${goRealtimeEventMeta.at})`
                            : 'Belum ada event realtime supplier.'}
                    </span>
                    {highlightSecondsLeft > 0 && (
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                            Highlight aktif ~{highlightSecondsLeft} dtk
                        </span>
                    )}
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                    <div className="border-b border-slate-200 bg-gradient-to-r from-primary-50 to-primary-100/50 px-6 py-4 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/50">
                                <IconFilter size={20} className="text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Filter Pencarian</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Cari supplier berdasarkan kriteria</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <form onSubmit={applyFilters}>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Pencarian
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Cari nama, phone, email, atau contact person..."
                                        value={filterData.q}
                                        onChange={(e) => handleChange('q', e.target.value)}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button
                                        type="submit"
                                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-6 font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:shadow-xl hover:shadow-primary-500/40"
                                    >
                                        <IconSearch size={18} />
                                        Cari
                                    </button>
                                    {activeFiltersCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 font-medium text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                                        >
                                            <IconX size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Supplier List */}
            {suppliers.data && suppliers.data.length > 0 ? (
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                        No
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                        Supplier
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                        Kontak
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                        Alamat
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {liveItems.map((s, idx) => (
                                    <tr
                                        key={s.id}
                                            className={`transition-colors ${highlightedIds.includes(String(s.id)) ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                    >
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {idx + 1 + ((suppliers.current_page || 1) - 1) * (suppliers.per_page || liveItems.length)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/50">
                                                    <IconTruck size={20} className="text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {s.name}
                                                    </div>
                                                    {s.contact_person && (
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            PIC: {s.contact_person}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {s.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                        <IconPhone size={14} className="text-slate-400" />
                                                        {s.phone}
                                                    </div>
                                                )}
                                                {s.email && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                        <IconMail size={14} className="text-slate-400" />
                                                        {s.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {s.address ? (
                                                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <IconMapPin size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                                                    <span className="line-clamp-2">{s.address}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('suppliers.edit', s.id)}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-100 dark:bg-primary-900/50 dark:text-primary-400 dark:hover:bg-primary-900"
                                                >
                                                    <IconEdit size={16} />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => remove(s.id)}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700 transition hover:bg-danger-100 dark:bg-danger-900/50 dark:text-danger-400 dark:hover:bg-danger-900"
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
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <IconDatabaseOff size={40} className="text-slate-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-slate-800 dark:text-slate-200">
                        Belum Ada Supplier
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Supplier akan muncul di sini setelah dibuat
                    </p>
                </div>
            )}

            {suppliers.last_page !== 1 && <Pagination links={suppliers.links} />}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
