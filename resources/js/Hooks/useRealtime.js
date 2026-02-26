import { useEffect, useCallback, useState } from 'react';
import { router } from '@inertiajs/react';

/**
 * Custom hook untuk real-time data updates menggunakan polling
 *
 * @param {Object} options - Configuration options
 * @param {number} options.interval - Polling interval dalam milliseconds (default: 5000)
 * @param {string[]} options.only - Array of props yang di-reload (untuk optimize)
 * @param {boolean} options.preserveScroll - Preserve scroll position (default: true)
 * @param {boolean} options.preserveState - Preserve component state (default: true)
 * @param {Function} options.onSuccess - Callback setelah reload berhasil
 * @param {boolean} options.enabled - Enable/disable polling (default: true)
 *
 * @example
 * // Basic usage
 * useRealtime({ interval: 3000 });
 *
 * @example
 * // Hanya reload data 'sales' dan 'parts'
 * useRealtime({
 *   only: ['sales', 'parts'],
 *   interval: 5000
 * });
 *
 * @example
 * // Dengan callback
 * useRealtime({
 *   interval: 3000,
 *   onSuccess: () => console.log('Data updated!')
 * });
 */
export function useRealtime({
    interval = 5000,
    only = [],
    preserveScroll = true,
    preserveState = true,
    onSuccess,
    enabled = true
} = {}) {
    const reload = useCallback(() => {
        if (!enabled) return;

        router.reload({
            only: only.length > 0 ? only : undefined,
            preserveScroll,
            preserveState,
            onSuccess: () => {
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                console.error('Failed to reload data:', errors);
            }
        });
    }, [only, preserveScroll, preserveState, onSuccess, enabled]);

    useEffect(() => {
        if (!enabled) return;

        const intervalId = setInterval(reload, interval);

        return () => {
            clearInterval(intervalId);
        };
    }, [reload, interval, enabled]);

    return { reload };
}

/**
 * Hook untuk manual reload dengan debounce
 * Berguna untuk reload setelah user action (create, update, delete)
 *
 * @param {Object} options - Configuration options
 * @param {number} options.delay - Delay sebelum reload (default: 500ms)
 * @param {string[]} options.only - Array of props yang di-reload
 *
 * @example
 * const { triggerReload } = useManualReload({ only: ['sales'] });
 *
 * // Setelah delete atau update
 * handleDelete(id).then(() => {
 *   triggerReload();
 * });
 */
export function useManualReload({
    delay = 500,
    only = [],
    preserveScroll = true
} = {}) {
    const triggerReload = useCallback(() => {
        setTimeout(() => {
            router.reload({
                only: only.length > 0 ? only : undefined,
                preserveScroll,
                preserveState: true
            });
        }, delay);
    }, [delay, only, preserveScroll]);

    return { triggerReload };
}

/**
 * Hook untuk conditional real-time
 * Hanya polling ketika kondisi tertentu terpenuhi
 *
 * @param {boolean} condition - Kondisi untuk enable polling
 * @param {Object} options - Configuration options (sama seperti useRealtime)
 *
 * @example
 * // Hanya polling ketika modal terbuka
 * const [isModalOpen, setIsModalOpen] = useState(false);
 * useConditionalRealtime(!isModalOpen, { interval: 3000 });
 */
export function useConditionalRealtime(condition, options = {}) {
    return useRealtime({
        ...options,
        enabled: condition
    });
}

/**
 * Hook untuk real-time dengan visibility detection
 * Pause polling ketika tab tidak aktif untuk save resources
 *
 * @param {Object} options - Configuration options (sama seperti useRealtime)
 *
 * @example
 * useVisibilityRealtime({ interval: 5000, only: ['orders'] });
 */
export function useVisibilityRealtime(options = {}) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return useRealtime({
        ...options,
        enabled: isVisible
    });
}
