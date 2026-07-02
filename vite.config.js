import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// Element Plus 按需引入：自动导入组件与图标，无需在 main.js 中全量注册
import Components from 'unplugin-vue-components/vite' //unplugin-vue-components插件自动在编译产物里加上对应的 import 语句
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers' //插件的"解析器"，告诉插件遇到不同引用就去对应目录下找组件和样式

// 配置代理与构建参数，支持按 mode 加载环境变量
export default defineConfig(({ mode }) => {
  // 加载当前 mode 对应的环境变量（.env / .env.[mode] / .env.[mode].local）
  const env = loadEnv(mode, process.cwd(), '')

  // 是否启用 Vue DevTools（开发调试插件，生产环境应关闭）
  const enableDevtools = env.VITE_ENABLE_DEVTOOLS === 'true'

  // 开发代理目标：从环境变量读取，未配置则使用默认后端地址
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://159.75.169.224:1235'

  // 基础插件数组
  const plugins = [
    vue(),
    // Element Plus 组件与图标按需自动引入：
    // - 模板中使用 <el-button>、<el-table> 等组件时，自动导入并注入对应样式
    // - 模板中使用 <el-icon><ArrowLeft /></el-icon> 时，自动导入图标组件
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'css', //每个组件配一个独立的 CSS 文件，自动注入。用了 el-button ，就自动注入 el-button.css
        }),
      ],
    }),
  ]
  if (enableDevtools) {
    plugins.push(vueDevTools())
  }

  return {
    // 配置插件
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    // 配置接口代理（仅在开发环境 dev server 生效）
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // 生产环境关闭 sourcemap，减小构建体积并避免源码泄露
      sourcemap: mode !== 'production',
    },
  }
})
