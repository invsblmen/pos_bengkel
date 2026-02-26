/**
 * Real-time Configuration
 *
 * Konfigurasi default untuk auto-refresh/polling pada semua halaman
 * yang menggunakan useRealtime hooks
 */

export const realtimeConfig = {
    /**
     * Interval default untuk polling (dalam milliseconds)
     * @default 5000 (5 detik)
     */
    defaultInterval: 5000,

    /**
     * Interval untuk halaman dengan traffic tinggi seperti POS/Transactions
     * @default 3000 (3 detik)
     */
    highPriorityInterval: 3000,

    /**
     * Interval untuk dashboard dan statistics
     * @default 10000 (10 detik)
     */
    lowPriorityInterval: 10000,

    /**
     * Enable/disable real-time globally
     * Set false untuk mematikan semua real-time updates
     * @default true
     */
    enabled: true,

    /**
     * Pause polling ketika tab tidak aktif
     * Menghemat resource ketika user pindah tab
     * @default true
     */
    pauseOnInactive: true,

    /**
     * Preserve scroll position saat reload
     * @default true
     */
    preserveScroll: true,

    /**
     * Preserve component state saat reload
     * @default true
     */
    preserveState: true,
};

/**
 * Interval per halaman (override default)
 * Uncomment dan sesuaikan jika perlu custom interval per halaman
 */
export const pageIntervals = {
    // 'transactions': 3000,     // POS - refresh setiap 3 detik
    // 'service-orders': 5000,   // Service Orders - refresh setiap 5 detik
    // 'part-sales': 5000,       // Part Sales - refresh setiap 5 detik
    // 'parts': 5000,            // Parts Inventory - refresh setiap 5 detik
    // 'customers': 5000,        // Customers - refresh setiap 5 detik
    // 'suppliers': 5000,        // Suppliers - refresh setiap 5 detik
    // 'categories': 5000,       // Categories - refresh setiap 5 detik
    // 'dashboard': 10000,       // Dashboard - refresh setiap 10 detik
};

/**
 * Helper untuk mendapatkan interval berdasarkan nama halaman
 */
export const getIntervalForPage = (pageName) => {
    return pageIntervals[pageName] || realtimeConfig.defaultInterval;
};

export default realtimeConfig;
