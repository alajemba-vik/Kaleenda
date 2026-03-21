import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { sessionApiPlugin } from './vite-plugin-session-api'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), sessionApiPlugin(env)],
  }
})
