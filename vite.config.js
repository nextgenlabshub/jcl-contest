import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Jangan lompat ke port lain secara senyap — beri error jelas jika 5173
    // sudah diduduki (biasanya oleh panel Launch Claude Code). Tukar port
    // untuk run manual: npm run dev -- --port 5180
    strictPort: true,
  },
})
