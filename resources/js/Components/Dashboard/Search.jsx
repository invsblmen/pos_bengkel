import { useForm } from '@inertiajs/react';
import { IconSearch } from '@tabler/icons-react';
import React from 'react';

export default function Search({ route: routeUrl, url, placeholder = 'Cari...', initialValue = '' }) {
    const target = routeUrl || url || '';

    const { data, setData, get } = useForm({
        search: initialValue,
    });

    const searchData = (e) => {
        e.preventDefault();
        if (!target) return;
        get(`${target}?q=${data.search}`);
    };

    return (
        <form onSubmit={searchData}>
            <div className="relative">
                <input
                    type="text"
                    value={data.search}
                    onChange={(e) => setData('search', e.target.value)}
                    className="py-2 px-4 pr-11 block w-full rounded-lg text-sm border focus:outline-none focus:ring-0 focus:ring-gray-400 text-gray-700 bg-white border-gray-200 focus:border-gray-200 dark:focus:ring-gray-500 dark:focus:border-gray-800 dark:text-gray-200 dark:bg-gray-950 dark:border-gray-900"
                    placeholder={placeholder}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-4">
                    <IconSearch className="text-gray-500 w-5 h-5" />
                </div>
            </div>
        </form>
    );
}
