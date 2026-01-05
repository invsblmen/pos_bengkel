import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function Index({ appointments }) {
    return (
        <>
            <Head title="Appointments" />
            <div className="p-6">
                <h1 className="text-xl font-bold mb-4">Appointments</h1>
                <div className="space-y-3">
                    {appointments.data?.length ? (
                        appointments.data.map((a) => (
                            <div key={a.id} className="p-4 bg-white rounded shadow">
                                <div className="flex justify-between">
                                    <div>
                                        <div className="font-semibold">{new Date(a.scheduled_at).toLocaleString()}</div>
                                        <div className="text-sm text-slate-500">{a.customer?.name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm">{a.status}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-slate-500">No appointments.</div>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
