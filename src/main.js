/**
 * 应用入口文件
 * 负责创建 Vue 应用实例并按顺序注册 Pinia、Vue Router
 * Element Plus 组件与图标已通过 vite.config.js 中的 unplugin-vue-components 实现按需自动引入，
 * 无需在此处全量注册
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

// 注册状态管理
app.use(pinia)
// 注册路由
app.use(router)

// 挂载到 DOM
app.mount('#app')
