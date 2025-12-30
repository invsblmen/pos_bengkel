import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        // Enable CORS for all origins (useful for local development)
        cors: true,

        // OR, if you need to be specific for security:
        // proxy: {
        //   // Proxy API requests if you are accessing a backend server
        // }
    },
});
