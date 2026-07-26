import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Static SPA — no backend. Served at https://admitiq.logiclitz.org
export default defineConfig({
  base: '/',
  plugins: [react()],
  optimizeDeps: {
    include: ['qrcode'],
  },
})
