import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { sessionApiPlugin } from './vite-plugin-session-api'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), sessionApiPlugin(env)],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('react') || id.includes('scheduler')) return 'react-vendor'
            if (id.includes('@supabase')) return 'supabase-vendor'
            if (id.includes('html2canvas')) return 'capture-vendor'
            return 'vendor'
          },
        },
      },
    },
  }
})
