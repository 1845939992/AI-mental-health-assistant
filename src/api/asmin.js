/**
 * 管理端 API 集合
 * 封装后台管理模块所需的后端接口调用，包括认证、知识文章、咨询记录、情绪日记及数据分析
 */
import service from '@/utils/request'

// ==================== 认证相关 ====================
// 登录
export function login(data) {
  return service.post('/user/login', data)
}
// ==================== 知识文章相关 ====================
// 获取文章分类树
export function categoryTree() {
  return service.get('/knowledge/category/tree')
}
// 获取文章分页列表
export function articlePage(params) {
  return service.get('/knowledge/article/page', { params })
}
// 上传文件
export function uploadFile(file, businessType) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('businessType', 'ARTICLE')
  formData.append('businessId', businessType.businessTypeId)
  formData.append('businessField', 'cover')
  return service.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
// 创建文章
export function createArticle(data) {
  return service.post('/knowledge/article', data)
}
// 获取文章详情
export function getArticleDetail(id) {
  return service.get(`/knowledge/article/${id}`)
}
// 更新文章
export function updateArticle(id, data) {
  return service.put(`/knowledge/article/${id}`, data)
}
// 更新文章状态
export function changeArticleStatus(id, status) {
  return service.put(`/knowledge/article/${id}/status`, { status })
}

// 删除文章
export function deleteArticle(id) {
  return service.delete(`/knowledge/article/${id}`)
}

// ==================== 咨询记录相关 ====================
// 获取咨询记录分页列表
export function getConsulationPage(params) {
  return service.get('/psychological-chat/sessions', { params })
}

// 获取咨询记录详情
export function getConsulationDetail(id) {
  return service.get(`/psychological-chat/sessions/${id}/messages`)
}

// ==================== 情绪日记相关 ====================
// 获取情绪日记分页列表
export function getEmotionDiaryPage(params) {
  return service.get('/emotion-diary/admin/page', { params })
}

// 删除情绪日记
export function deleteEmotionDiary(id) {
  return service.delete(`/emotion-diary/admin/${id}`)
}

// ==================== 数据分析相关 ====================
//获取综合数据分析
export function getAnalyticsOverview() {
  return service.get(`/data-analytics/overview`)
}

// ==================== 认证相关 ====================
// 退出登录
export function logout() {
  return service.post('/user/logout')
}

