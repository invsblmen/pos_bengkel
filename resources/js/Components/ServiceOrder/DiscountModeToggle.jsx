import React from 'react';
import { IconCurrencyDollar, IconPercentage } from '@tabler/icons-react';

export default function DiscountModeToggle({
    mode = 'nominal',
    onChange,
    className = ''
}) {
    const isNominal = mode === 'nominal';

    return (
        <div className={`inline-flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`}>
            <button
                type="button"
                onClick={() => onChange('nominal')}
                className={`p-2 rounded transition-all ${
                    isNominal
                        ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Diskon Nominal (Rp)"
            >
                <IconCurrencyDollar size={18} />
            </button>
            <button
                type="button"
                onClick={() => onChange('percent')}
                className={`p-2 rounded transition-all ${
                    !isNominal
                        ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Diskon Persen (%)"
            >
                <IconPercentage size={18} />
            </button>
        </div>
    );
}
