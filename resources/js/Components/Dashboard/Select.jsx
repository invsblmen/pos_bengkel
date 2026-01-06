import React from 'react';

export default function Select({ label, value, onChange, errors, children, required = false, ...props }) {
    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <select
                value={value}
                onChange={onChange}
                className={`w-full h-11 rounded-xl border px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                    errors ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700'
                }`}
                {...props}
            >
                {children}
            </select>
            {errors && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors}</p>
            )}
        </div>
    );
}
