/**
 * 全局常量配置
 * fileBaseUrl: 后端文件服务基础地址，用于拼接封面图、头像等静态资源 URL
 * knowledgeUrl: 知识库默认占位图地址，当文章无封面时展示
 *
 * 优先从环境变量读取，未配置则使用默认值以确保向后兼容
 */
export const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || 'http://159.75.169.224:1235'
export const knowledgeUrl = import.meta.env.VITE_KNOWLEDGE_PLACEHOLDER_URL || 'https://file.itndedu.com/psychology_ai.png'
