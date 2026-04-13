import React from 'react';

export default function RealtimeControlBanner({ enabled }) {
    if (enabled) return null;

    return (
        <p className="mt-2 inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            Realtime dimatikan manual
        </p>
    );
}
