import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function Index({ orders }) {
    return (
        <>
            <Head title="Service Orders" />
            <div className="p-6">
                <h1 className="text-xl font-bold mb-4">Service Orders</h1>
                <div className="space-y-3">
                    {orders.data?.length ? (
                        orders.data.map((o) => (
                            <div key={o.id} className="p-4 bg-white rounded shadow">
                                <div className="flex justify-between">
                                    <div>
                                        <div className="font-semibold">{o.order_number}</div>
                                        <div className="text-sm text-slate-500">{o.customer?.name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm">{o.status}</div>
                                        <Link href={route('service-orders.show', o.id)} className="text-xs text-primary-600">Lihat</Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-slate-500">No service orders.</div>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
