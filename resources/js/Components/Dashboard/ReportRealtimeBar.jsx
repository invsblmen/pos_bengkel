import React from 'react';
import RealtimeControlBanner from '@/Components/Dashboard/RealtimeControlBanner';
import RealtimeToggleButton from '@/Components/Dashboard/RealtimeToggleButton';

export default function ReportRealtimeBar({ enabled, status, eventMeta, highlightSecondsLeft = 0, onToggle }) {
    return (
        <div className="space-y-2">
            <RealtimeControlBanner enabled={enabled} />
            <div className={`rounded-xl border px-4 py-2.5 text-xs transition-colors ${enabled && highlightSecondsLeft > 0 ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                        GO Realtime: <span className="font-semibold">{enabled ? status : 'disabled'}</span>
                    </span>
                    <RealtimeToggleButton enabled={enabled} onClick={onToggle} />
                    <span>
                        {eventMeta
                            ? `Event terakhir: ${eventMeta.action} (${eventMeta.at})`
                            : 'Belum ada event realtime reports.'}
                    </span>
                    {highlightSecondsLeft > 0 && (
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                            Highlight aktif ~{highlightSecondsLeft} dtk
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
