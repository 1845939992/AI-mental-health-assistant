/**
 * 用户状态 Store
 * 集中管理 token、userInfo 与角色信息，替代零散的 localStorage 直读
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(loadUserInfo())

  function loadUserInfo() {
    try {
      const raw = localStorage.getItem('userInfo')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  const userType = computed(() => userInfo.value?.userType ?? 0)
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userType.value === 2)

  function setLoginData(data) {
    token.value = data.token
    userInfo.value = data.userInfo
    localStorage.setItem('token', data.token)
    localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { token, userInfo, userType, isLoggedIn, isAdmin, setLoginData, logout }
})
