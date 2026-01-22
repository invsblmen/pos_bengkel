import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { IconArrowLeft, IconShoppingBag } from '@tabler/icons-react';
import { toDisplayDateTime } from '@/Utils/datetime';

export default function Show({ purchase }) {
    const totalFormatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' });

    return (
        <>
            <Head title={`Detail Pembelian ${purchase?.invoice || ''}`} />
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <IconShoppingBag size={22} />
                            Detail Pembelian Sparepart
                        </h1>
                        <p className="text-sm text-slate-500">Invoice: {purchase?.invoice}</p>
                    </div>
                    <Link href={route('parts.purchases.index')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600">
                        <IconArrowLeft size={16} />
                        Kembali
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Invoice</span>
                            <span className="font-medium">{purchase?.invoice || '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Supplier</span>
                            <span className="font-medium">{purchase?.supplier?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Tanggal</span>
                            <span className="font-medium">{purchase?.created_at ? toDisplayDateTime(purchase.created_at) : '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Dibuat oleh</span>
                            <span className="font-medium">{purchase?.user?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Catatan</span>
                            <span className="font-medium text-right">{purchase?.notes || '-'}</span>
                        </div>
                    </div>

                    {/* Summary Card with Discount/Tax Breakdown */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                        <h3 className="font-semibold text-slate-700 mb-3">Ringkasan Pembayaran</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="font-medium">{totalFormatter.format(purchase?.total || 0)}</span>
                            </div>

                            <div className="flex justify-between text-sm border-t border-slate-100 pt-2">
                                <span className="text-slate-500">
                                    Diskon {purchase?.discount_type === 'percent' ? `(${purchase?.discount_value}%)` : purchase?.discount_type === 'fixed' ? '(Fixed)' : '(Tidak Ada)'}
                                </span>
                                <span className={`font-medium ${(purchase?.discount_amount || 0) > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                                    {(purchase?.discount_amount || 0) > 0 ? `-${totalFormatter.format(purchase.discount_amount)}` : '-'}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm border-t border-slate-100 pt-2">
                                <span className="text-slate-500">
                                    Pajak {purchase?.tax_type === 'percent' ? `(${purchase?.tax_value}%)` : purchase?.tax_type === 'fixed' ? '(Fixed)' : '(Tidak Ada)'}
                                </span>
                                <span className={`font-medium ${(purchase?.tax_amount || 0) > 0 ? 'text-green-600' : 'text-slate-600'}`}>
                                    {(purchase?.tax_amount || 0) > 0 ? `+${totalFormatter.format(purchase.tax_amount)}` : '-'}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm border-t-2 border-slate-200 pt-2">
                                <span className="text-slate-700 font-semibold">Total Akhir</span>
                                <span className="font-bold text-lg text-primary-600">{totalFormatter.format(purchase?.grand_total || purchase?.total || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-[720px] w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Part</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Qty</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Harga Satuan</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Subtotal</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Diskon Item</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {purchase?.details?.map((d) => (
                                    <tr key={d.id}>
                                        <td className="py-3 px-4 text-sm">
                                            <div className="font-medium text-slate-800">{d.part?.name}</div>
                                            {d.discount_type && d.discount_type !== 'none' && (
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    Diskon: {d.discount_type === 'percent' ? `${d.discount_value}%` : `Rp ${new Intl.NumberFormat('id-ID').format(d.discount_value)}`}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center text-sm">{d.qty}</td>
                                        <td className="py-3 px-4 text-right text-sm">{totalFormatter.format(d.unit_price)}</td>
                                        <td className="py-3 px-4 text-right text-sm">{totalFormatter.format(d.subtotal)}</td>
                                        <td className="py-3 px-4 text-right text-sm">
                                            {(d.discount_amount || 0) > 0 ? (
                                                <span className="text-red-600 font-medium">-{totalFormatter.format(d.discount_amount)}</span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right text-sm font-semibold text-slate-900">{totalFormatter.format(d.final_amount || d.subtotal)}</td>
                                    </tr>
                                ))}
                                {(!purchase?.details || purchase.details.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="py-6 text-center text-sm text-slate-500">Tidak ada data</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = (page) => <DashboardLayout children={page} />;
