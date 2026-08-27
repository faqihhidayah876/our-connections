import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest', // Menggunakan custom service worker
      srcDir: 'src',
      filename: 'sw.js',            // File service worker utama kita nanti di folder src
      registerType: 'autoUpdate',
      
      // Pengaturan agar Service Worker aktif saat npm run dev
      devOptions: {
        enabled: true,
        type: 'module',
      },

      manifest: {
        name: 'Our Space',
        short_name: 'OurSpace',
        description: 'Private App for Faqih & Aii',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/logo_our.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo_our.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})