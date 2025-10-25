/**
 * Vite configuration for the online examination client.
 *
 * This config enables React support via `@vitejs/plugin-react`, sets up
 * the development server, and defines file system and alias
 * resolutions.  You can customise the base path, proxy settings and
 * additional plugins as needed for your project.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    resolve: {
      // Define aliases to simplify imports (e.g. '@/components/Button')
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
    },
    // Define environment variables accessible in the client.  Vite
    // automatically exposes variables prefixed with `VITE_` in
    // `import.meta.env`.
    define: {
      'process.env': {},
    },
    // Server configuration for development mode
    server: {
      port: 5173,
      open: true,
      // Example: proxy API requests to avoid CORS during development
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    // Build options (output directory, target format, etc.)
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
    },
    // Test configuration (if using Vitest)
    test: {
      environment: 'jsdom',
    },
  };
});