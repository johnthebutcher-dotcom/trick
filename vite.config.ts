/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Preview builds (npm run build:preview) are static demos; no service worker.
      disable: process.env.PREVIEW_BUILD === '1',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png', 'felt.webp'],
      manifest: {
        // Per app: update name, short_name, description and theme_color
        // (theme_color should match the active preset's --primary).
        name: 'Trick',
        short_name: 'Trick',
        description: 'Five-minute bridge drills, one idea at a time.',
        start_url: '/',
        display: 'standalone',
        background_color: '#1d3a26',
        theme_color: '#1d3a26',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // App shell is precached; everything else goes to the network.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        // Never serve cached responses for Supabase; auth and data must be live.
        navigateFallbackDenylist: [/^\/auth\/callback/],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    // React + Supabase + router land around 600 KB minified (~175 KB gzipped).
    // Lazy-load heavy feature routes with React.lazy before raising this again.
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
})
