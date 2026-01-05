import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function Show({ order }) {
    return (
        <>
            <Head title={`Service Order ${order.order_number}`} />
            <div className="p-6">
                <h1 className="text-xl font-bold mb-2">{order.order_number}</h1>
                <div className="mb-4">Status: {order.status}</div>
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="font-semibold mb-2">Details</h3>
                    <ul className="list-disc pl-5 text-sm text-slate-600">
                        {order.details?.map((d) => (
                            <li key={d.id}>{d.service?.title || d.part?.name} × {d.qty} - Rp {d.price}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}

Show.layout = (page) => <DashboardLayout children={page} />;
