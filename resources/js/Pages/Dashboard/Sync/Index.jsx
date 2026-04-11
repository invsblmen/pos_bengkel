import React, { useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Pagination from "@/Components/Dashboard/Pagination";
import { toDisplayDateTime } from "@/Utils/datetime";
import { IconClock, IconCloudCheck, IconCloudX, IconRefresh, IconRepeat } from "@tabler/icons-react";

function SummaryCard({ title, value, icon, tone = "slate" }) {
    const toneClass = {
        slate: "bg-slate-50 border-slate-200 text-slate-700",
        emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
        red: "bg-red-50 border-red-200 text-red-700",
        amber: "bg-amber-50 border-amber-200 text-amber-700",
        blue: "bg-blue-50 border-blue-200 text-blue-700",
    };

    return (
        <div className={`rounded-2xl border p-4 ${toneClass[tone] ?? toneClass.slate}`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{title}</p>
                {icon}
            </div>
            <p className="text-2xl font-bold">{value ?? 0}</p>
        </div>
    );
}

function statusBadge(status) {
    const map = {
        acknowledged: "bg-emerald-100 text-emerald-700",
        received: "bg-blue-100 text-blue-700",
        duplicate: "bg-amber-100 text-amber-700",
        invalid: "bg-red-100 text-red-700",
        failed: "bg-red-100 text-red-700",
    };

    return map[status] || "bg-slate-100 text-slate-700";
}

export default function Index({ filters = {}, summary = {}, batches, scopes = [], statuses = [] }) {
    const currentFilters = useMemo(() => ({
        status: filters.status || "all",
        scope: filters.scope || "all",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
    }), [filters]);

    const applyFilters = (next) => {
        router.get(route("sync.index"), next, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    return (
        <DashboardLayout>
            <Head title="Sinkronisasi Local ke Hosting" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sinkronisasi Local ke Hosting</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Pantau batch yang diterima dari Go local dan status acknowledgment di hosting.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.reload({ preserveScroll: true })}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    >
                        <IconRefresh size={16} />
                        Refresh
                    </button>
                </div>

                <div className="grid gap-3 md:grid-cols-5">
                    <SummaryCard title="Total Diterima" value={summary.received_total} icon={<IconCloudCheck size={18} />} tone="blue" />
                    <SummaryCard title="Terkonfirmasi" value={summary.acknowledged_total} icon={<IconCloudCheck size={18} />} tone="emerald" />
                    <SummaryCard title="Duplicate" value={summary.duplicate_total} icon={<IconRepeat size={18} />} tone="amber" />
                    <SummaryCard title="Gagal" value={summary.failed_total} icon={<IconCloudX size={18} />} tone="red" />
                    <SummaryCard title="Pending Local" value={summary.pending_total} icon={<IconClock size={18} />} tone="slate" />
                </div>

                <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-4">
                    <select
                        value={currentFilters.status}
                        onChange={(e) => applyFilters({ ...currentFilters, status: e.target.value })}
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                        {statuses.map((status) => (
                            <option key={status} value={status}>{status === "all" ? "Semua Status" : status}</option>
                        ))}
                    </select>
                    <select
                        value={currentFilters.scope}
                        onChange={(e) => applyFilters({ ...currentFilters, scope: e.target.value })}
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                        {scopes.map((scope) => (
                            <option key={scope} value={scope}>{scope === "all" ? "Semua Scope" : scope}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={currentFilters.date_from}
                        onChange={(e) => applyFilters({ ...currentFilters, date_from: e.target.value })}
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <input
                        type="date"
                        value={currentFilters.date_to}
                        onChange={(e) => applyFilters({ ...currentFilters, date_to: e.target.value })}
                        className="h-10 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/60">
                                <tr>
                                    <th className="px-4 py-3 text-left">Batch</th>
                                    <th className="px-4 py-3 text-left">Scope</th>
                                    <th className="px-4 py-3 text-left">Payload</th>
                                    <th className="px-4 py-3 text-left">Source Date</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Received At</th>
                                    <th className="px-4 py-3 text-left">Ack At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {batches?.data?.length ? batches.data.map((batch) => (
                                    <tr key={batch.id}>
                                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{batch.sync_batch_id}</td>
                                        <td className="px-4 py-3">{batch.scope}</td>
                                        <td className="px-4 py-3">{batch.payload_type}</td>
                                        <td className="px-4 py-3">{batch.source_date || "-"}</td>
                                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadge(batch.status)}`}>{batch.status}</span></td>
                                        <td className="px-4 py-3">{toDisplayDateTime(batch.received_at)}</td>
                                        <td className="px-4 py-3">{toDisplayDateTime(batch.acknowledged_at)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Belum ada data sinkron diterima.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {batches?.links?.length ? (
                        <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                            <Pagination links={batches.links} />
                        </div>
                    ) : null}
                </div>
            </div>
        </DashboardLayout>
    );
}