import React from 'react';
import { IconCash, IconCreditCard, IconReceipt, IconReceiptRefund } from '@tabler/icons-react';

const currencyFormat = (value = 0) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const paymentDestinationLabels = {
    qris: 'QRIS',
    transfer_bni: 'Transfer BNI',
    transfer_bca: 'Transfer BCA',
    transfer_bri: 'Transfer BRI',
    edc_bri: 'EDC BRI',
    bni: 'Transfer BNI',
    bca: 'Transfer BCA',
    bri: 'Transfer BRI',
};

export default function TransactionPaymentSection({
    title = 'Pembayaran',
    paymentMethod = 'cash',
    paidAmount = 0,
    totalAmount = 0,
    transferDestination = '',
    formatCurrency = currencyFormat,
    onOpenPaymentModal,
    note = 'Tekan tombol terima pembayaran untuk mengisi pecahan cash atau memilih metode non-tunai.',
}) {
    const totalPaid = Number(paidAmount || 0);
    const remainingAmount = Math.max(0, Number(totalAmount || 0) - totalPaid);
    const isPaid = totalPaid >= Number(totalAmount || 0) && Number(totalAmount || 0) > 0;

    const paymentLabel = paymentMethod === 'cash'
        ? 'Cash'
        : paymentMethod === 'mixed'
            ? 'Campuran'
            : 'Kredit / Non-Tunai';

    return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                    <IconReceipt size={20} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{note}</p>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-slate-950">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Metode Saat Ini</p>
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {paymentMethod === 'cash' ? <IconCash size={16} /> : <IconCreditCard size={16} />}
                        {paymentLabel}
                    </div>
                    {transferDestination && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Tujuan: {paymentDestinationLabels[transferDestination] || transferDestination}
                        </p>
                    )}
                </div>

                <div className="rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-slate-950">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status Pembayaran</p>
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        <IconReceiptRefund size={16} />
                        {isPaid ? 'Lunas' : remainingAmount > 0 ? 'Belum Lunas' : 'Belum Dibayar'}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {remainingAmount > 0 ? `Sisa ${formatCurrency(remainingAmount)}` : `Total ${formatCurrency(totalAmount)}`}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Dibayar</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(totalPaid)}</p>
                </div>
                <button
                    type="button"
                    onClick={onOpenPaymentModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                    <IconReceipt size={16} />
                    Terima Pembayaran
                </button>
            </div>
        </div>
    );
}
