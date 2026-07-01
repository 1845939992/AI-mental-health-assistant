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

// 请求拦截器：在请求发送前自动注入本地存储的 token
service.interceptors.request.use(
  config => {
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
    return Promise.reject(error)
  }
)
export default service
