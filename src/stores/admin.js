import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * 管理端全局状态 store
 * 目前仅用于维护后台侧边栏的折叠/展开状态，供 Sidebar 与 Navbar 共享
 */
export const useAdminStore = defineStore('admin', () => {
  // 侧边栏是否折叠（true=折叠，false=展开）
  const isCollapse = ref(false)

  /** 切换侧边栏折叠状态 */
  const toCollapse = () => {
    isCollapse.value = !isCollapse.value
  }

  return { isCollapse, toCollapse }
})
