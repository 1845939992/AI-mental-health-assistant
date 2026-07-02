// 后端接口文档: https://xsl1e23zpk.apifox.cn/
// 后端地址: http://159.75.169.224:1235
// 详见 API_DOCS.md
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 Axios 实例，统一配置 baseURL 与超时时间
// 配置项优先从环境变量读取，未配置则使用默认值以保证兼容性
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 5000
})

// 存储当前进行中的请求，key 为 "方法:路径:参数"（含 query/body 以区分不同参数的请求）
// 用于防止用户重复点击导致同一个接口短时间内发出多次请求
const pendingMap = new Map()

/** 生成请求唯一标识：method + path + 序列化参数 */
function getRequestKey(config) {
  const params = config.params ? JSON.stringify(config.params) : ''
  const data = config.data ? JSON.stringify(config.data) : ''
  return `${config.method}:${config.url}:${params}:${data}`
}

// 请求拦截器：取消重复请求 + 自动注入本地存储的 token
service.interceptors.request.use(
  config => {
    // --- 重复请求取消：同一个接口+相同参数有旧请求在进行则取消旧的 ---
    const key = getRequestKey(config)
    if (pendingMap.has(key)) {   //判断 key 是否存在，返回 boolean
      pendingMap.get(key).abort()  //.abort()调用 AbortController的方法，向关联的 HTTP 请求发出"取消"信号。
    }
    const controller = new AbortController()
    config.signal = controller.signal
    pendingMap.set(key, controller)
    // --- 重复请求取消结束 ---

    const token = localStorage.getItem('token')
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理后端状态码
service.interceptors.response.use(
  response => {
    // 请求完成，从待处理列表中移除
    const key = getRequestKey(response.config)
    pendingMap.delete(key)

    const { data, config } = response
    // 兼容后端返回字符串或数字类型的 code
    const code = String(data.code)
    if (code === '200') {
      return data.data
    }
    if (code === '-1') {
      // 注册接口的 -1 业务错误交给页面自行处理，不清 token 不跳转
      if (config.url?.includes('/user/add')) {
        return Promise.reject(data)
      }
      if (!config.url?.includes('/login')) {
        ElMessage.error(data.msg || '登录过期，请重新登录')
        // 同步清除 Pinia user store（配合 stores/user.js）
        clearUserStore()
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        window.location.href = '/auth/login'
        return Promise.reject(data)
      }
      else {
        ElMessage.error(data.msg || '登录过期，请重新登录')
        return Promise.reject(data)
      }
    }
    // 非成功响应，统一 reject 让调用方感知错误
    return Promise.reject(data)
  },
  error => {
    // 被取消的请求（重复请求触发的 abort）静默丢弃
    if (axios.isCancel(error)) {
      return new Promise(() => { })
    }
    // 网络错误等异常情况也需清理 pendingMap
    if (error.config) {
      const key = getRequestKey(error.config)
      pendingMap.delete(key)
    }
    return Promise.reject(error)
  }
)

/**
 * 清除 Pinia user store 中的用户状态
 * 延迟导入避免循环依赖（request.js 是底层模块，不应在顶层直接 import store）
 */
function clearUserStore() {
  import('@/stores/user').then(module => {
    const store = module.useUserStore()
    store.logout()
  }).catch(() => {
    // store 未注册时静默忽略，兼容非标准初始化场景
  })
}

export default service
