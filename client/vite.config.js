import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Allow tunnel domains (cloudflared / ngrok) so a quick public link works
    // without further config. Subdomains are matched by leading-dot prefix.
    allowedHosts: [
      'localhost',
      '.trycloudflare.com',
      '.ngrok-free.app',
      '.ngrok.app',
      '.ngrok.io',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
