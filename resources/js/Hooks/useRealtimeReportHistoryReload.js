import { useCallback, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

const DEFAULT_SUBSCRIPTIONS = [
    { channel: 'workshop.serviceorders', events: ['serviceorder.created', 'serviceorder.updated', 'serviceorder.deleted'] },
    { channel: 'workshop.partpurchases', events: ['partpurchase.created', 'partpurchase.updated'] },
    { channel: 'workshop.partsales', events: ['partsale.created'] },
    { channel: 'workshop.parts', events: ['part.created', 'part.updated', 'part.deleted'] },
    { channel: 'workshop.partpurchaseorders', events: ['partpurchaseorder.created', 'partpurchaseorder.deleted'] },
    { channel: 'workshop.partsalesorders', events: ['partsalesorder.created', 'partsalesorder.deleted'] },
    { channel: 'workshop.mechanics', events: ['mechanic.created', 'mechanic.updated', 'mechanic.deleted'] },
    { channel: 'workshop.products', events: ['product.created', 'product.updated', 'product.deleted'] },
];

export function useRealtimeReportHistoryReload({
    enabled = true,
    debounceMs = 800,
    subscriptions = DEFAULT_SUBSCRIPTIONS,
    only = [],
    preserveScroll = true,
    preserveState = true,
} = {}) {
    const debounceTimerRef = useRef(null);

    const scheduleReload = useCallback(() => {
        if (!enabled) return;

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            router.reload({
                only: only.length > 0 ? only : undefined,
                preserveScroll,
                preserveState,
            });
        }, debounceMs);
    }, [enabled, debounceMs, only, preserveScroll, preserveState]);

    useEffect(() => {
        if (!enabled) return;
        if (!window.Echo || !Array.isArray(subscriptions) || subscriptions.length === 0) return;

        const listeners = [];

        subscriptions.forEach(({ channel, events }) => {
            if (!channel || !Array.isArray(events) || events.length === 0) return;

            const echoChannel = window.Echo.channel(channel);

            events.forEach((eventName) => {
                const prefixedEvent = `.${eventName}`;
                echoChannel.listen(prefixedEvent, scheduleReload);
                listeners.push({ echoChannel, prefixedEvent });
            });
        });

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            listeners.forEach(({ echoChannel, prefixedEvent }) => {
                echoChannel.stopListening(prefixedEvent);
            });
        };
    }, [enabled, scheduleReload, subscriptions]);
}
