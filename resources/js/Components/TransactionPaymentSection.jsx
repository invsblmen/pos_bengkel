import React from 'react';
import { IconCash, IconCreditCard, IconReceipt, IconAlertCircle } from '@tabler/icons-react';

const currencyFormat = (value = 0) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function TransactionPaymentSection({
    title = 'Pembayaran',
    paymentMethod = 'cash',
    paidAmount = 0,
    totalAmount = 0,
    onPaymentMethodChange,
    onPaidAmountChange,
    formatCurrency = currencyFormat,
    note = 'Pilih cash untuk menerima uang dan kembalian otomatis. Pilih kredit bila pembayaran belum diterima saat transaksi dibuat.',
}) {
    const normalizedPaid = Number(paidAmount || 0);
    const normalizedTotal = Number(totalAmount || 0);
    const changeAmount = Math.max(0, normalizedPaid - normalizedTotal);
    const remainingAmount = Math.max(0, normalizedTotal - normalizedPaid);
    const isCash = paymentMethod !== 'credit';

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

            <div className="space-y-4">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Metode Pembayaran
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => onPaymentMethodChange?.('cash')}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                isCash
                                    ? 'border-emerald-500 bg-emerald-600 text-white shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                            }`}
                        >
                            <IconCash size={18} />
                            Cash
                        </button>
                        <button
                            type="button"
                            onClick={() => onPaymentMethodChange?.('credit')}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                !isCash
                                    ? 'border-emerald-500 bg-emerald-600 text-white shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                            }`}
                        >
                            <IconCreditCard size={18} />
                            Kredit
                        </button>
                    </div>
                </div>

                {isCash ? (
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Uang diterima
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={paidAmount}
                            onChange={(event) => onPaidAmountChange?.(event.target.value)}
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                            placeholder="Masukkan nominal uang diterima"
                        />
                        {changeAmount > 0 && (
                            <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800/40 dark:bg-blue-950/20">
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Kembalian otomatis</p>
                                <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(changeAmount)}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/20">
                        <div className="flex items-start gap-2">
                            <IconAlertCircle size={18} className="mt-0.5 text-amber-600 dark:text-amber-400" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Pembayaran kredit</p>
                                <p className="text-xs leading-5 text-amber-700/90 dark:text-amber-200/80">
                                    Tidak ada uang diterima saat ini. Tagihan akan tercatat sebagai piutang sebesar {formatCurrency(remainingAmount)}.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-sm dark:bg-slate-950">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Sisa pembayaran</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(remainingAmount)}</span>
                </div>
            </div>
        </div>
    );
}
