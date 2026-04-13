import { useEffect, useRef, useState } from 'react';

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

export function useGoRealtime({
    enabled = true,
    token = import.meta.env.VITE_GO_WS_TOKEN || '',
    domains = ['service_orders'],
    onEvent,
} = {}) {
    const wsRef = useRef(null);
    const reconnectRef = useRef(null);
    const onEventRef = useRef(onEvent);
    const [status, setStatus] = useState('disconnected');

    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        let closedByCleanup = false;

        const connect = () => {
            const wsUrl = resolveWsUrl(token);
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            setStatus('connecting');

            ws.onopen = () => {
                setStatus('connected');
                if (Array.isArray(domains) && domains.length > 0) {
                    ws.send(
                        JSON.stringify({
                            type: 'subscribe',
                            domains,
                        })
                    );
                }
            };

            ws.onmessage = (message) => {
                try {
                    const payload = JSON.parse(message.data);
                    if (onEventRef.current) {
                        onEventRef.current(payload);
                    }
                } catch (err) {
                    console.error('GO realtime parse error:', err);
                }
            };

            ws.onerror = () => {
                setStatus('error');
            };

            ws.onclose = () => {
                wsRef.current = null;
                if (closedByCleanup) {
                    return;
                }
                setStatus('disconnected');
                reconnectRef.current = setTimeout(connect, 3000);
            };
        };

        connect();

        return () => {
            closedByCleanup = true;
            if (reconnectRef.current) {
                clearTimeout(reconnectRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [enabled, token, JSON.stringify(domains)]);

    return { status };
}
