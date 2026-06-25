/**
 * 应用入口文件
 * 负责创建 Vue 应用实例并按顺序注册 Pinia、Vue Router、Element Plus 及全部图标组件
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

// 注册状态管理
app.use(pinia)
// 注册路由
app.use(router)
// 注册 Element Plus 组件库
app.use(ElementPlus)
// 全局注册 Element Plus 图标组件，供模板中直接使用 <el-icon><IconName /></el-icon>
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 挂载到 DOM
app.mount('#app')
