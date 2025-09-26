import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/你的-repo-name/', // 這裡要改成你的 GitHub repo 名稱
  build: {
    target: 'es2021',
    rollupOptions: {
      input: {
        desktop: 'src/main.tsx'
      },
      output: {
        format: 'iife',
        entryFileNames: 'app.js'
      }
    }
  }
})
