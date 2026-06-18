// 后端接口文档: https://xsl1e23zpk.apifox.cn/
// 后端地址: http://159.75.169.224:1235
// 详见 API_DOCS.md
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service = axios.create({
  baseURL: '/api',
  timeout: 5000
})
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
service.interceptors.response.use(
  response => {
    const { data, config } = response
    // 兼容后端返回字符串或数字类型的 code
    const code = String(data.code)
    if (code === '200') {
      return data.data
    }
    if (code === '-1') {
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
