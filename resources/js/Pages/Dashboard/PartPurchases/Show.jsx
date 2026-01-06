import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IconArrowLeft, IconCalendar, IconTruck, IconUser } from '@tabler/icons-react';

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    ordered: 'bg-blue-100 text-blue-700 border-blue-200',
    received: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const statusLabels = {
    pending: 'Pending',
    ordered: 'Ordered',
    received: 'Received',
    cancelled: 'Cancelled',
};

export default function Show({ purchase }) {
    const [updating, setUpdating] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState(purchase.status);
    const [actualDeliveryDate, setActualDeliveryDate] = useState(purchase.actual_delivery_date || new Date().toISOString().split('T')[0]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const canChangeStatus = () => {
        return purchase.status !== 'cancelled' && purchase.status !== 'received';
    };

    const updateStatus = async () => {
        if (newStatus === purchase.status) {
            setShowStatusModal(false);
            return;
        }

        setUpdating(true);
        try {
            await axios.post(route('part-purchases.update-status', purchase.id), {
                status: newStatus,
                actual_delivery_date: newStatus === 'received' ? actualDeliveryDate : null,
            });
            toast.success('Status updated successfully');
            setShowStatusModal(false);
            window.location.reload();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <>
            <Head title={`Purchase ${purchase.purchase_number}`} />
            <div className="p-6">
                <div className="mb-6">
                    <button
                        onClick={() => router.visit(route('part-purchases.index'))}
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-2"
                    >
                        <IconArrowLeft size={16} />
                        <span>Back to Purchases</span>
                    </button>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold">{purchase.purchase_number}</h1>
                            <p className="text-sm text-slate-500 mt-1">Purchase details and items</p>
                        </div>
                        {canChangeStatus() && (
                            <button
                                onClick={() => setShowStatusModal(true)}
                                className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                            >
                                Update Status
                            </button>
                        )}
                    </div>
                </div>

                {/* Purchase Info */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-semibold mb-4">Purchase Information</h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <IconUser size={20} className="text-slate-400 mt-0.5" />
                                <div>
                                    <div className="text-sm text-slate-500">Supplier</div>
                                    <div className="font-semibold text-slate-900">{purchase.supplier?.name || '-'}</div>
                                    {purchase.supplier?.phone && (
                                        <div className="text-sm text-slate-500">{purchase.supplier.phone}</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <IconCalendar size={20} className="text-slate-400 mt-0.5" />
                                <div>
                                    <div className="text-sm text-slate-500">Purchase Date</div>
                                    <div className="font-semibold text-slate-900">{formatDate(purchase.purchase_date)}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <IconTruck size={20} className="text-slate-400 mt-0.5" />
                                <div>
                                    <div className="text-sm text-slate-500">Expected Delivery</div>
                                    <div className="font-semibold text-slate-900">{formatDate(purchase.expected_delivery_date)}</div>
                                </div>
                            </div>
                            {purchase.actual_delivery_date && (
                                <div className="flex items-start gap-3">
                                    <IconCalendar size={20} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-slate-500">Actual Delivery</div>
                                        <div className="font-semibold text-slate-900">{formatDate(purchase.actual_delivery_date)}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-semibold mb-4">Status & Notes</h2>
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm text-slate-500 mb-2">Status</div>
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${statusColors[purchase.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                    {statusLabels[purchase.status] || purchase.status}
                                </span>
                            </div>
                            {purchase.notes && (
                                <div>
                                    <div className="text-sm text-slate-500 mb-2">Notes</div>
                                    <div className="text-slate-900">{purchase.notes}</div>
                                </div>
                            )}
                            <div>
                                <div className="text-sm text-slate-500 mb-2">Total Amount</div>
                                <div className="text-2xl font-bold text-primary-600">{formatCurrency(purchase.total_amount)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-lg font-semibold">Purchase Items</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">No</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Part</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unit Price</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {purchase.details && purchase.details.map((detail, idx) => (
                                    <tr key={detail.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{idx + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-slate-900 dark:text-white">{detail.part?.name || '-'}</div>
                                            <div className="text-xs text-slate-500">
                                                SKU: {detail.part?.sku || '-'}
                                                {detail.part?.category && ` | ${detail.part.category.name}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-400">{detail.quantity}</td>
                                        <td className="px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-400">{formatCurrency(detail.unit_price)}</td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(detail.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-slate-300">
                                    <td colSpan="4" className="px-6 py-4 text-right text-base font-semibold text-slate-900">
                                        Total:
                                    </td>
                                    <td className="px-6 py-4 text-right text-base font-bold text-primary-600">
                                        {formatCurrency(purchase.total_amount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-lg font-semibold">Update Purchase Status</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    New Status
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="ordered">Ordered</option>
                                    <option value="received">Received</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            {newStatus === 'received' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Actual Delivery Date
                                    </label>
                                    <input
                                        type="date"
                                        value={actualDeliveryDate}
                                        onChange={(e) => setActualDeliveryDate(e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        When status is set to "Received", part stock will be updated automatically.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowStatusModal(false)}
                                disabled={updating}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={updateStatus}
                                disabled={updating}
                                className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
                            >
                                {updating ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Show.layout = (page) => <DashboardLayout children={page} />;
