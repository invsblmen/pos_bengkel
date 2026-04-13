import React from 'react';

export default function RealtimeToggleButton({ enabled, goRealtimeStatus, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                enabled
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            }`}
        >
            {enabled ? 'Realtime ON' : 'Realtime OFF'}
        </button>
    );
}
