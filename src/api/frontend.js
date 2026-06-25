/**
 * 前台用户端 API 集合
 * 封装前端用户模块所需接口，包括认证、AI 咨询会话、情绪日记及知识库文章
 */
import service from '@/utils/request'

// ==================== 用户认证 ====================
// 注册
export function register(data) {
  return service.post('/user/add', data)
}

// ==================== AI 咨询会话 ====================
// 新建会话
export function startSession(data) {
  return service.post('/psychological-chat/session/start', data)
}

// 分页查询咨询会话
export function getSessionslist(params) {
  return service.get('/psychological-chat/sessions', {params})
}

// 删除咨询会话  sessionId
export function deleteSession(sessionId) {
  return service.delete(`/psychological-chat/sessions/${sessionId}`)
}

// 查询咨询会话消息
export function getSessionMessages(sessionId) {
  return service.get(`/psychological-chat/sessions/${sessionId}/messages`)
}

// 获取会话情绪分析结果
export function getSessionEmotion(sessionId) {
  return service.get(`/psychological-chat/session/${sessionId}/emotion`)
}

// ==================== 情绪日记 ====================
// 创建或更新情绪日记
export function addEmotionDiary(data) {
  return service.post('/emotion-diary', data)
}

// ==================== 知识库文章 ====================
// 获取文章分页列表
export function getKnowledgelist(params) {
  return service.get('/knowledge/article/page', { params })
}

// 获取文章详情
export function getKnowledgeDetail(id) {
  return service.get(`/knowledge/article/${id}`)
}
