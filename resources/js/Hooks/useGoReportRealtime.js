import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

function resolveWsUrl(token) {
    const envUrl = import.meta.env.VITE_GO_WS_URL;
    const base = envUrl && envUrl.trim() !== '' ? envUrl.trim() : 'ws://127.0.0.1:8081/ws';

    if (!token) {
        return base;
    }

    const hasQuery = base.includes('?');
    const separator = hasQuery ? '&' : '?';
    return `${base}${separator}token=${encodeURIComponent(token)}`;
}

export function useGoReportRealtime({ enabled = true, debounceMs = 1000 } = {}) {
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [eventMeta, setEventMeta] = useState(null);
    const [highlightExpiresAt, setHighlightExpiresAt] = useState(null);
    const [countdownNow, setCountdownNow] = useState(Date.now());
    const wsRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const highlightTimerRef = useRef(null);

    const scheduleReload = useCallback(() => {
        if (!enabled) return;

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            router.reload({
                preserveScroll: true,
                preserveState: true,
            });
        }, debounceMs);
    }, [enabled, debounceMs]);

    const connect = useCallback(() => {
        if (wsRef.current) {
            return;
        }

        try {
            const token = import.meta.env.VITE_GO_WS_TOKEN || '';
            const wsUrl = resolveWsUrl(token);
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('[GO Realtime] Reports connected');
                setConnectionStatus('connected');
                reconnectAttemptsRef.current = 0;

                // Subscribe to reports domain
                ws.send(JSON.stringify({
                    type: 'subscribe',
                    domains: ['reports'],
                }));
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    const triggerHighlight = () => {
                        const expiresAt = Date.now() + 6000;
                        setHighlightExpiresAt(expiresAt);
                        setCountdownNow(Date.now());

                        if (highlightTimerRef.current) {
                            clearTimeout(highlightTimerRef.current);
                        }
                        highlightTimerRef.current = setTimeout(() => {
                            setHighlightExpiresAt(null);
                        }, 6000);
                    };

                    // Handle report update events
                    if (message.domain === 'reports' && message.type === 'report.updated') {
                        setEventMeta({
                            action: message.action || 'report.updated',
                            at: new Date(message.timestamp || Date.now()).toLocaleTimeString('id-ID'),
                        });
                        triggerHighlight();
                        scheduleReload();
                    }
                    // Also handle related domain events that affect reports
                    else if (['service_orders', 'part_sales', 'part_purchases', 'appointments'].includes(message.domain)) {
                        setEventMeta({
                            action: message.action || message.type || 'updated',
                            at: new Date(message.timestamp || Date.now()).toLocaleTimeString('id-ID'),
                        });
                        triggerHighlight();
                        scheduleReload();
                    }
                } catch (err) {
                    console.error('[GO Realtime] Message parse error:', err);
                }
            };

            ws.onerror = (error) => {
                console.error('[GO Realtime] Connection error:', error);
                setConnectionStatus('error');
            };

            ws.onclose = () => {
                console.log('[GO Realtime] Reports disconnected');
                setConnectionStatus('disconnected');
                wsRef.current = null;

                // Attempt reconnection with exponential backoff
                if (enabled && reconnectAttemptsRef.current < 10) {
                    const backoff = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                    reconnectAttemptsRef.current += 1;
                    reconnectTimeoutRef.current = setTimeout(connect, backoff);
                }
            };

            wsRef.current = ws;
        } catch (err) {
            console.error('[GO Realtime] Connection setup error:', err);
            setConnectionStatus('error');
        }
    }, [enabled, scheduleReload]);

    useEffect(() => {
        if (!enabled) {
            setHighlightExpiresAt(null);
            return undefined;
        }

        if (!highlightExpiresAt) {
            return undefined;
        }

        const interval = setInterval(() => {
            setCountdownNow(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, [enabled, highlightExpiresAt]);

    useEffect(() => {
        if (!enabled) {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            if (highlightTimerRef.current) {
                clearTimeout(highlightTimerRef.current);
            }
            setHighlightExpiresAt(null);
            return;
        }

        connect();

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (highlightTimerRef.current) {
                clearTimeout(highlightTimerRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [enabled, connect]);

    const highlightSecondsLeft = highlightExpiresAt ? Math.max(0, Math.ceil((highlightExpiresAt - countdownNow) / 1000)) : 0;

    return { connectionStatus, eventMeta, highlightSecondsLeft, isHighlightActive: highlightSecondsLeft > 0 };
}
