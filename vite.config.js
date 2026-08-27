import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Our Space',
        short_name: 'OurSpace',
        description: 'Private App for Faqih & Aii',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // Membuatnya tampil full screen tanpa URL bar di HP
        icons: [
          {
            // NAMA FILE DISESUAIKAN DI SINI 👇
            src: '/logo_our.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            // NAMA FILE DISESUAIKAN DI SINI 👇
            src: '/logo_our.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})