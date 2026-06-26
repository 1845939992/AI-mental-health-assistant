import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// 配置代理
export default defineConfig({
  // 配置插件
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 配置接口代理
  server: {
    proxy: {
      '/api': {
        target: 'http://159.75.169.224:1235',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
