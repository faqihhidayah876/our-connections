import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <--- INI YANG TADI TERHAPUS
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- INI JUGA KEMBALI
    VitePWA({
      registerType: 'autoUpdate',
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