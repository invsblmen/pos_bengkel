import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { IconArrowLeft, IconPrinter, IconPencil, IconEdit, IconCheck, IconX, IconCash } from '@tabler/icons-react';
import toast from 'react-hot-toast';

const statusColors = {
    confirmed: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-100',
    draft: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-100',
    completed: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-100',
    cancelled: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-100',
};

const paymentColors = {
    paid: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-100',
    partial: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-100',
    unpaid: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800/60 dark:text-gray-100',
};

export default function Show({ sale }) {
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState(sale.status || 'draft');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [updatingPayment, setUpdatingPayment] = useState(false);

    const formatCurrency = (value = 0) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);

    const formatDate = (value) =>
        value
            ? new Date(value).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
              })
            : '-';

    const calculateItemSubtotal = (detail) => (detail.quantity || 0) * (detail.unit_price || 0);
    const calculateItemDiscount = (detail) => detail.discount_amount || 0;
    const calculateItemTotal = (detail) =>
        detail.final_amount !== null && detail.final_amount !== undefined
            ? detail.final_amount
            : calculateItemSubtotal(detail) - calculateItemDiscount(detail);

    const subtotal = sale.subtotal ?? sale.details.reduce((sum, detail) => sum + calculateItemTotal(detail), 0);
    const discountAmount = sale.discount_amount || 0;
    const taxAmount = sale.tax_amount || 0;
    const grandTotal = sale.grand_total ?? subtotal - discountAmount + taxAmount;
    const paidAmount = sale.paid_amount || 0;
    const remainingAmount = sale.remaining_amount ?? Math.max(0, grandTotal - paidAmount);

    const handlePrint = () => window.print();

    const canChangeStatus = () => !['completed', 'cancelled'].includes(sale.status);

    const updateStatus = () => {
        if (newStatus === sale.status) {
            setShowStatusModal(false);
            return;
        }

        setUpdatingStatus(true);
        router.post(
            route('part-sales.update-status', sale.id),
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Status penjualan berhasil diperbarui');
                    setShowStatusModal(false);
                },
                onError: (errors) => {
                    toast.error(errors?.error || 'Gagal memperbarui status');
                },
                onFinish: () => setUpdatingStatus(false),
            }
        );
    };

    const handleUpdatePayment = () => {
        const amount = Number(paymentAmount || 0);
        if (amount <= 0) {
            toast.error('Masukkan jumlah pembayaran');
            return;
        }

        setUpdatingPayment(true);
        router.post(
            route('part-sales.update-payment', sale.id),
            { payment_amount: amount },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Pembayaran berhasil dicatat');
                    setPaymentAmount('');
                },
                onError: (errors) => {
                    toast.error(errors?.error || 'Gagal mencatat pembayaran');
                },
                onFinish: () => setUpdatingPayment(false),
            }
        );
    };

    return (
        <DashboardLayout>
            <Head title={`Penjualan ${sale.sale_number}`} />

            <div className="space-y-6 print:hidden">
                <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white shadow-lg">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Link href={route('part-sales.index')} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold">
                                <IconArrowLeft size={18} /> Kembali
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">{sale.sale_number}</h1>
                                <p className="text-sm text-white/80">{formatDate(sale.sale_date || sale.created_at)}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${
                                statusColors[sale.status] || 'bg-white/10 text-white border-white/20'
                            }`}>
                                {sale.status === 'confirmed'
                                    ? 'Dikonfirmasi'
                                    : sale.status === 'draft'
                                        ? 'Draft'
                                        : sale.status === 'completed'
                                            ? 'Selesai'
                                            : 'Dibatalkan'}
                            </span>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow hover:bg-white/90"
                            >
                                <IconPrinter size={18} /> Cetak
                            </button>
                            {sale.status === 'draft' && (
                                <Link
                                    href={route('part-sales.edit', sale.id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold"
                                >
                                    <IconPencil size={18} /> Edit
                                </Link>
                            )}
                            {canChangeStatus() && (
                                <button
                                    onClick={() => setShowStatusModal(true)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold"
                                >
                                    <IconEdit size={18} /> Update Status
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Detail Penjualan</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Sparepart</th>
                                            <th className="px-6 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Qty</th>
                                            <th className="px-6 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Harga</th>
                                            <th className="px-6 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Diskon</th>
                                            <th className="px-6 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {sale.details.map((detail) => (
                                            <tr key={detail.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                                <td className="px-6 py-3">
                                                    <div className="font-medium text-slate-900 dark:text-white">{detail.part?.name || '-'}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{detail.part?.part_number || '-'}</div>
                                                </td>
                                                <td className="px-6 py-3 text-right text-slate-900 dark:text-white">{detail.quantity}</td>
                                                <td className="px-6 py-3 text-right text-slate-900 dark:text-white">{formatCurrency(detail.unit_price)}</td>
                                                <td className="px-6 py-3 text-right text-rose-600">-{formatCurrency(calculateItemDiscount(detail))}</td>
                                                <td className="px-6 py-3 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(calculateItemTotal(detail))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {sale.notes && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Catatan</h3>
                                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{sale.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Informasi</h3>
                            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex items-center justify-between">
                                    <span>Pelanggan</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{sale.customer?.name || '-'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Dibuat oleh</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{sale.creator?.name || '-'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Status Pembayaran</span>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                        paymentColors[sale.payment_status] || paymentColors.unpaid
                                    }`}>
                                        {sale.payment_status === 'paid' ? 'Lunas' : sale.payment_status === 'partial' ? 'Sebagian' : 'Belum Bayar'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Ringkasan</h3>
                            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex items-center justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Diskon</span>
                                    <span className="font-medium text-rose-600">-{formatCurrency(discountAmount)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Pajak</span>
                                    <span className="font-medium text-emerald-600">+{formatCurrency(taxAmount)}</span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-base font-bold">
                                    <span>Total</span>
                                    <span className="text-slate-900 dark:text-white">{formatCurrency(grandTotal)}</span>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex items-center justify-between">
                                    <span>Sudah Bayar</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(paidAmount)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Sisa</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(remainingAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {remainingAmount > 0 && sale.status !== 'draft' && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Catat Pembayaran</h3>
                                <div className="space-y-3">
                                    <input
                                        type="number"
                                        min="1"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="Masukkan jumlah pembayaran"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleUpdatePayment}
                                        disabled={updatingPayment}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 text-white py-2.5 text-sm font-semibold hover:bg-primary-700 disabled:opacity-70"
                                    >
                                        <IconCash size={16} /> Simpan Pembayaran
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="hidden print:block">
                <div className="space-y-6 text-slate-900">
                    <div className="flex items-start justify-between border-b border-slate-300 pb-4">
                        <div>
                            <h1 className="text-2xl font-bold">Invoice Penjualan Sparepart</h1>
                            <p className="text-sm text-slate-600">{sale.sale_number}</p>
                        </div>
                        <div className="text-sm text-slate-600">
                            <p>Tanggal: {formatDate(sale.sale_date || sale.created_at)}</p>
                            <p>Status: {sale.status}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-semibold">Pelanggan</p>
                            <p>{sale.customer?.name || '-'}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold">Pembayaran</p>
                            <p>{sale.payment_status}</p>
                        </div>
                    </div>

                    <table className="w-full text-sm border border-slate-300">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-3 py-2 text-left border-b border-slate-300">Sparepart</th>
                                <th className="px-3 py-2 text-right border-b border-slate-300">Harga</th>
                                <th className="px-3 py-2 text-right border-b border-slate-300">Qty</th>
                                <th className="px-3 py-2 text-right border-b border-slate-300">Diskon</th>
                                <th className="px-3 py-2 text-right border-b border-slate-300">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.details.map((detail) => (
                                <tr key={detail.id} className="border-b border-slate-200">
                                    <td className="px-3 py-2">{detail.part?.name || '-'}</td>
                                    <td className="px-3 py-2 text-right">{formatCurrency(detail.unit_price)}</td>
                                    <td className="px-3 py-2 text-right">{detail.quantity}</td>
                                    <td className="px-3 py-2 text-right">-{formatCurrency(calculateItemDiscount(detail))}</td>
                                    <td className="px-3 py-2 text-right">{formatCurrency(calculateItemTotal(detail))}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end">
                        <div className="w-72 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Diskon</span>
                                <span>-{formatCurrency(discountAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Pajak</span>
                                <span>+{formatCurrency(taxAmount)}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-300 pt-2 font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>
                    </div>

                    {sale.notes && (
                        <div className="text-sm text-slate-700">
                            <p className="font-semibold">Catatan:</p>
                            <p>{sale.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {showStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Update Status</h3>
                            <button onClick={() => setShowStatusModal(false)} className="text-slate-500 hover:text-slate-700">
                                <IconX size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status Baru</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="confirmed">Dikonfirmasi</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setShowStatusModal(false)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={updateStatus}
                                disabled={updatingStatus}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-70"
                            >
                                <IconCheck size={16} /> Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
