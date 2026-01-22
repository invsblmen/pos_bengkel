import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function Show({ sale }) {
    const { flash } = usePage().props;
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [errors, setErrors] = useState({});

    const handlePayment = (e) => {
        e.preventDefault();
        
        router.post(route('part-sales.update-payment', sale.id), {
            payment_amount: parseInt(paymentAmount) || 0,
        }, {
            onSuccess: () => {
                setPaymentAmount('');
                setShowPaymentForm(false);
            },
            onError: (err) => setErrors(err),
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const statusColor = {
        draft: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    const paymentStatusColor = {
        unpaid: 'bg-gray-100 text-gray-800',
        partial: 'bg-blue-100 text-blue-800',
        paid: 'bg-green-100 text-green-800',
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Invoice ${sale.sale_number}`} />
            
            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
                            <p className="text-gray-600">{sale.sale_number}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Cetak
                            </button>
                            {sale.status === 'draft' && (
                                <Link
                                    href={route('part-sales.edit', sale.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Edit
                                </Link>
                            )}
                            <Link
                                href={route('part-sales.index')}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Kembali
                            </Link>
                        </div>
                    </div>

                    {/* Invoice Content */}
                    <div className="bg-white rounded-lg shadow-md p-8 print:shadow-none">
                        {/* Invoice Header */}
                        <div className="grid grid-cols-3 gap-8 mb-8 pb-8 border-b">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">BENGKEL</h2>
                                <p className="text-sm text-gray-600">Jl. Raya No. 123</p>
                                <p className="text-sm text-gray-600">Surabaya</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold">INVOICE</p>
                                <p className="text-2xl font-bold text-gray-900">{sale.sale_number}</p>
                            </div>
                            <div className="text-right">
                                <div className="space-y-1">
                                    <p><span className="font-semibold">Tanggal:</span> {new Date(sale.sale_date).toLocaleDateString('id-ID')}</p>
                                    <p><span className="font-semibold">Dibuat:</span> {new Date(sale.created_at).toLocaleDateString('id-ID')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">BILL TO:</h3>
                                <p className="font-semibold text-gray-900">{sale.customer?.name}</p>
                                <p className="text-sm text-gray-600">{sale.customer?.email}</p>
                                <p className="text-sm text-gray-600">{sale.customer?.phone}</p>
                                <p className="text-sm text-gray-600">{sale.customer?.address}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">STATUS:</h3>
                                <div className="flex gap-2">
                                    <span className={`px-3 py-1 rounded text-sm font-semibold ${statusColor[sale.status]}`}>
                                        {sale.status === 'confirmed' ? 'Dikonfirmasi' :
                                         sale.status === 'draft' ? 'Draft' :
                                         'Dibatalkan'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="mb-8">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b-2">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Item</th>
                                        <th className="px-4 py-2 text-center">Qty</th>
                                        <th className="px-4 py-2 text-right">Harga Satuan</th>
                                        <th className="px-4 py-2 text-right">Diskon</th>
                                        <th className="px-4 py-2 text-right">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {sale.details && sale.details.map((detail, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3">{detail.part?.name}</td>
                                            <td className="px-4 py-3 text-center">{detail.quantity}</td>
                                            <td className="px-4 py-3 text-right">Rp {detail.unit_price.toLocaleString('id-ID')}</td>
                                            <td className="px-4 py-3 text-right">
                                                {detail.discount_amount > 0 ? (
                                                    <span className="text-red-600">-Rp {detail.discount_amount.toLocaleString('id-ID')}</span>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">Rp {detail.final_amount.toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end mb-8">
                            <div className="w-80">
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between py-2 border-b">
                                        <span>Subtotal</span>
                                        <span>Rp {sale.subtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    {sale.discount_amount > 0 && (
                                        <div className="flex justify-between py-2 text-red-600 border-b">
                                            <span>Diskon ({sale.discount_type === 'percent' ? sale.discount_value + '%' : 'Fixed'})</span>
                                            <span>-Rp {sale.discount_amount.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    {sale.tax_amount > 0 && (
                                        <div className="flex justify-between py-2 text-blue-600 border-b">
                                            <span>Pajak ({sale.tax_type === 'percent' ? sale.tax_value + '%' : 'Fixed'})</span>
                                            <span>+Rp {sale.tax_amount.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-3 text-lg font-bold bg-gray-100 px-3">
                                        <span>TOTAL</span>
                                        <span>Rp {sale.grand_total.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="bg-blue-50 p-4 rounded mt-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Dibayar</span>
                                            <span className="font-semibold">Rp {sale.paid_amount.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Sisa</span>
                                            <span className="font-semibold">Rp {sale.remaining_amount.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between mt-2 py-2 border-t">
                                            <span className="font-semibold">Status</span>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${paymentStatusColor[sale.payment_status]}`}>
                                                {sale.payment_status === 'paid' ? 'Lunas' :
                                                 sale.payment_status === 'partial' ? 'Sebagian' :
                                                 'Belum Bayar'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {sale.notes && (
                            <div className="border-t pt-4 mb-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Catatan:</h4>
                                <p className="text-gray-600 whitespace-pre-wrap">{sale.notes}</p>
                            </div>
                        )}

                        {/* Payment Recording */}
                        {sale.payment_status !== 'paid' && (
                            <div className="border-t pt-4 mt-4">
                                {!showPaymentForm ? (
                                    <button
                                        onClick={() => setShowPaymentForm(true)}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Catat Pembayaran
                                    </button>
                                ) : (
                                    <form onSubmit={handlePayment} className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Pembayaran (Rp)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max={sale.remaining_amount}
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                placeholder="Masukkan jumlah pembayaran"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                            <InputError message={errors.payment_amount} />
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                            >
                                                Simpan Pembayaran
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowPaymentForm(false)}
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body {
                        background: white;
                    }
                    .py-6 {
                        padding: 0;
                    }
                    button, a {
                        display: none;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
