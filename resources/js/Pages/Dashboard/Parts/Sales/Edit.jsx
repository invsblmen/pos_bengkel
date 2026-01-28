import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Button from '@/Components/Dashboard/Button';
import { IconArrowLeft } from '@tabler/icons-react';

// Placeholder edit page to keep navigation consistent; form can be expanded as needed.
export default function Edit() {
    return (
        <DashboardLayout>
            <Head title="Edit Penjualan Sparepart" />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('part-sales.index')}>
                        <Button icon={<IconArrowLeft size={20} />} variant="secondary">
                            Kembali
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Penjualan Sparepart</h1>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6">
                    <p className="text-gray-700 dark:text-gray-300">
                        Form edit belum diimplementasikan. Silakan gunakan fitur lihat atau buat baru sementara ini.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
