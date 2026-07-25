import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project Pages URL: https://hyperxfury1873.github.io/admitiq/
const base = process.env.GITHUB_PAGES === '1' ? '/admitiq/' : '/'

export default defineConfig({
  base,
  plugins: [react()],
  optimizeDeps: {
    include: ['qrcode'],
  },
})
