<template>
  <div class="consultation-container">
    <!-- 页面初始化加载状态 -->
    <div v-if="isLoading" class="page-loading-overlay">
      <div class="loading-content">
        <div class="spinner-ring"></div>
        <div class="loading-text">正在加载您的会话...</div>
        <div class="loading-subtext">清心AI助手准备中</div>
      </div>
    </div>

    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ 'loading': isLoading }">
      <!-- AI助手信息 -->
      <div class="ai-assistant-info">
        <div class="breathing-circle">
          <el-image :src="iconUrl" alt="AI助手" fit="contain" style="width: 25px; height: 25px;" />
        </div>
        <div class="assistant-name">清心AI助手</div>
        <div class="online-status">
          <div class="status-dot"></div>
          <div class="status-text">在线服务中</div>
        </div>
      </div>
      <!-- 情绪花园 -->
      <div class="emotion-garden">
        <div class="garden-header">
          <div class="garden-title">情绪花园</div>
          <div class="emotion-info">
            <div class="emotion-name">{{ currentEmotion.primaryEmotion }}</div>
            <div class="emotion-score"> {{ currentEmotion.emotionScore }}</div>
          </div>
          <div class="warm-tips">
            <div class="emotion-status-text">
              <span class="status-lable">今天感觉:</span>
              <span class="status-emotion">{{ currentEmotion.isNegative ? '需要关注' : '良好' }}</span>
            </div>
            <div class="emotion-intensity">
              <span class="intensity-dots">
                <span v-for="dot in 3" :key="dot" class="dot"
                  :class="{ 'active': getIntensityClass(currentEmotion.emotionScore) >= dot }"> </span>
              </span>
              <span class="intensity-text">{{ getRiskText(currentEmotion.riskLevel) }}</span>
            </div>
            <!-- 温暖建议卡片 -->
            <div class="warm-suggestion" v-if="currentEmotion.suggestion">
              <div class="suggestion-icon">💖</div>
              <div class="suggestion-content">
                <span class="suggestion-title">小建议:</span>
                <span class="suggestion-text">{{ currentEmotion.suggestion }}</span>
              </div>
            </div>
            <!-- 治愈小行动 -->
            <div class="healing-actions" v-if="currentEmotion.improvementSuggestions.length > 0">
              <div class="actions-title">治愈小行动</div>
              <div class="actions-list">
                <div class="action-item" v-for="action in currentEmotion.improvementSuggestions" :key="action">
                  <div class="action-icon">🌟</div>
                  <span class="action-text">{{ action }}</span>
                </div>
              </div>
            </div>
            <!-- 风险提示 -->
            <div class="risk-notice" v-if="currentEmotion.isNegative && currentEmotion.riskLevel > 1">
              <div class="notice-icon">⚠️</div>
              <div class="notice-content">
                <div class="notice-title">风险提示</div>
                <div class="notice-text">
                  {{ currentEmotion.riskDescription }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 会话列表 -->
      <div class="session-history">
        <h4 class="section-title">会话列表</h4>
        <div class="session-list">
          <div class="session-item" v-for="(session, index) in sessionList" :key="session.id"
            @click="handleSessionClick(session)"
            :class="{ 'active': currentSession && currentSession.sessionId === ('session_' + session.id) }"
            :style="{ animationDelay: `${index * 0.05}s` }">
            <div class="session-info">
              <div class="session-title">
                <span>{{ session.sessionTitle }}</span>
                <div class="session-meta">
                  <span class="session-time">{{ session.startedAt }}</span>
                </div>
                <div class="session-preview">
                  {{ session.lastMessageContent }}
                </div>
                <div class="session-stats">
                  <span>
                    <el-icon>
                      <ChatRound />
                    </el-icon>
                    {{ session.messageCount || 0 }}
                  </span>
                  <span>
                    <el-icon>
                      <Clock />
                    </el-icon>
                    {{ session.durationMinutes || 0 }}
                  </span>
                </div>
              </div>
              <div class="session-actions">
                <el-button text type="danger" size="small" @click.stop="handleDeleteSession(session.id)">
                  <el-icon>
                    <DeleteFilled />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 聊天主区域 -->
    <div class="chat-main">
      <!-- 聊天头 -->
      <div class="chat-header">
        <div class="header-left">
          <div class="chat-avatar">
            <el-image :src="iconUrl1" alt="爱心" fit="contain" style="width: 30px; height: 30px;" />
          </div>
          <div class="chat-info">
            <h2>清心AI助手</h2>
            <p>您的贴心AI心理助手，您可以与它进行咨询和互动</p>
          </div>
        </div>
        <div class="header-right">
          <el-button @click="createNewSession" title="新建会话" class="new-session-btn">
            <el-icon>
              <Plus />
            </el-icon>
          </el-button>
        </div>
      </div>
      <!-- 会话消息  -->
      <div class="chat-messages" ref="chatMessagesRef">
        <!-- 欢迎消息 -->
        <div v-if="messages.length === 0" class="message-item ai-message welcome-message">
          <div class="message-avatar">
            <el-image :src="iconUrl" alt="AI助手" fit="contain" style="width: 18px; height: 18px;" />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <p>您好！我是小暖，您的AI心理健康助手。很高兴陪伴您，为您提供温暖的心理支持。
                请告诉我，今天您感觉怎么样？有什么想要分享的吗？</p>
            </div>
            <div class="message-time"> {{ new Date().toLocaleString() }}</div>
          </div>
        </div>
        <div v-else class="message-assistant">
          <div v-for="message in messages" :key="message.id" class="message-item"
            :class="message.senderType === 1 ? 'user-message' : 'ai-message'">
            <div class="message-avatar">
              <el-image v-if="message.senderType === 1" :src="iconUrl2" alt="用户" fit="contain"
                style="width: 18px; height: 18px;" />
              <el-image v-else-if="message.senderType === 2" :src="iconUrl" alt="AI助手" fit="contain"
                style="width: 18px; height: 18px;" />
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <!-- AI思考中 -->
                <div v-if="message.senderType === 2 && isAItyping && !message.content" class="typing-indicator">
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                  <div class="typing-dot"></div>
                </div>
                <!-- AI错误提示 -->
                <div v-else-if="message.isError" class="error-message">
                  <p>{{ message.content }}</p>
                </div>
                <!-- AI正常消息 -->
                <MarkdownRenderer v-else-if="message.senderType === 2 && !message.isError" :content="message.content"
                  :isAiMessage="true" />
                <p v-else-if="message.senderType === 1" v-html="formatMessageContent(message.content)"></p>
              </div>
              <div class="message-time">
                {{ message.senderType === 2 && isAItyping && message === messages[messages.length - 1] ? '正在输入中...' :
                  message.createdAt }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 输入框 -->
      <div class="chat-input">
        <div class="input-wrapper">
          <div class="input-container">
            <el-input v-model="userMessage" placeholder="请输入您的想要分享的内容" class="message-input" type="textarea" :rows="3"
              :disabled="isAItyping" @keyup.enter="sendMessage" clearable maxlength="500" />
          </div>
          <div class="input-footer">
            <span>按Enter发送,Shift+Enter换行</span>
            <span>已输入{{ userMessage.length }}/500</span>
          </div>
        </div>
        <el-button type="primary" @click="sendMessage" class="send-btn" :disabled="isAItyping || !userMessage.trim()">
          <el-icon>
            <Promotion />
          </el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ChatRound, DeleteFilled, Plus, Promotion } from '@element-plus/icons-vue'
import { ref, onMounted, reactive, watch, nextTick, onUnmounted } from 'vue'
import { startSession, getSessionslist, deleteSession, getSessionMessages, getSessionEmotion } from '@/api/frontend'
import { ElMessage } from 'element-plus'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'

const iconUrl = new URL('@/assets/images/robot-fill.png', import.meta.url).href //AI助手图标
const iconUrl1 = new URL('@/assets/images/like.png', import.meta.url).href //爱心图标
const iconUrl2 = new URL('@/assets/images/users.png', import.meta.url).href //用户图标

// 页面初始化加载状态
const isLoading = ref(false)

// 定义一个用户输入的消息变量，用于存储用户输入的消息内容
const userMessage = ref('')
// 定义一个状态变量，用于判断ai是否正在输入中
const isAItyping = ref(false)
//定义会话消息数组，用于存储用户和ai的消息
const messages = ref([])
//定义一个当前会话对象，用于存储当前会话的会话ID、状态和标题等信息
const currentSession = ref(null)
//定义一个会话列表数组，用于存储所有会话的会话ID、状态和标题等信息
const sessionList = ref([])
//情绪花园
const currentEmotion = ref({
  primaryEmotion: '中性',//当前主要情绪
  emotionScore: 50,//当前情绪分数
  isNegative: false,//是否为负面情绪
  riskLevel: 0,//当前风险等级
  suggestion: '您当前的情绪状态为正常，无需关注。 ',//小建议
  improvementSuggestions: [],//小建议
})

// ==================== 自动滚动相关 ====================
const chatMessagesRef = ref(null) //聊天消息容器DOM引用
const isUserScrollingUp = ref(false) //用户是否正在向上滚动查看历史消息
let scrollLockTimer = null //定时器 ID,滚动锁定定时器，防止频繁触发
let lastScrollTime = 0 //上次滚动时间戳，用于节流

//判断当前是否已滚动到底部（允许一定误差阈值）
const isAtBottom = (threshold = 40) => {
  const el = chatMessagesRef.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold
}

//平滑滚动到底部
const scrollToBottom = () => {
  const el = chatMessagesRef.value
  if (!el) return
  //使用requestAnimationFrame确保在下一帧渲染后执行，避免跳动
  requestAnimationFrame(() => {
    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth' //平滑滚动效果
    })
  })
}

//节流版滚动检测：监听用户手动滚动行为
const handleUserScroll = () => {
  const now = Date.now()
  //节流：100ms内只执行一次，避免高频触发导致卡顿
  if (now - lastScrollTime < 100) return
  lastScrollTime = now
  //如果用户向上滚动且不在底部，标记为手动查看历史
  if (!isAtBottom()) {
    isUserScrollingUp.value = true
    //清除旧的定时器，重新设置3秒锁定
    if (scrollLockTimer) clearTimeout(scrollLockTimer)
    scrollLockTimer = setTimeout(() => {
      isUserScrollingUp.value = false //3秒无操作后恢复自动滚动
    }, 3000)
  } else {
    //用户滚回底部了，立即恢复自动滚动
    isUserScrollingUp.value = false
    if (scrollLockTimer) {
      clearTimeout(scrollLockTimer)
      scrollLockTimer = null
    }
  }
}

//监听消息变化和AI输入状态，自动滚动到底部
watch(
  [messages, isAItyping],
  () => {
    //如果用户正在查看历史消息，不强制滚动
    if (isUserScrollingUp.value) return
    //等待DOM更新完成后再滚动，确保内容已渲染
    nextTick(() => {
      scrollToBottom()
    })
  },
  { deep: true } //深度监听，捕获message.content的流式更新
)

//关于AI流式对话功能的实现：
// 各种变量和函数的功能已有注释，不重复说明
// 重点在于startAIResponse()函数的messages.value.push(aiMessage)，
// 这一步是将ai的响应内容添加到消息数组中，用于显示在聊天主区域中，
// 同时由于返回的数据是流式的，fetchEventSource函数的onmessage会不断地得到一个新的消息，转化后得到payload，
// 先通过const aiMessage = messages.value[messages.value.length - 1]获取到已经接收到的最新的ai消息，
// 然后通过aiMessage.content += payload.data.content添加后端返回的下一个字段到ai消息的content中，
// onmessage在循环中实时更新消息数组，正好通过messages的响应式效果显示在聊天主区域中，
// 从而实现一个字一个字往外蹦的流式效果。其他部分的代码大多是传递参数处理错误以及判断是否是历史会话消息

//获取会话情绪分析结果
const getEmotionData = async (sessionId) => {
  const id = sessionId.toString().startsWith('session_') ? sessionId : 'session_' + sessionId
  if (!currentSession.value) return
  try {
    const response = await getSessionEmotion(id)  // ← await 等待并拿到结果
    currentEmotion.value = response                // ← 无需 .then()
  } catch (error) {
    ElMessage.error('获取情绪分析结果失败')          // ← 现在能捕获了
  }
}

//获取情绪强度的类名
const getIntensityClass = (score) => {
  if (score >= 61) {
    return 3
  } else if (score >= 31) {
    return 2
  }
  return 1
}

//获取情绪强度的文本
const getRiskText = (level) => {
  if (level === 0) {
    return '正常'
  } else if (level === 1) {
    return '关注'
  }
  else if (level === 2) {
    return '预警'
  }
  else if (level === 3) {
    return '危机'
  }
  else {
    return '未知风险'
  }
}


// 新建会话
const createNewSession = () => {
  const newSession = {
    sessionId: 'temp_' + Date.now(),
    status: 'TEMP',//该状态为临时会话
    sessionTitle: '新对话'
  }
  currentSession.value = newSession
  messages.value = []   //清空消息列表，显示欢迎页
  // 重置情绪花园为初始默认值
  currentEmotion.value = {
    primaryEmotion: '中性',
    emotionScore: 50,
    isNegative: false,
    riskLevel: 0,
    suggestion: '您当前的情绪状态为正常，无需关注。',
    improvementSuggestions: [],
  }
  userMessage.value = '' // 清空输入框
  isAItyping.value = false // 重置AI输入状态
}

// 抬起回车时发送消息
const sendMessage = () => {
  if (userMessage.value.trim() === '') return
  if (isAItyping.value) {
    ElMessage.error('Ai助手输入中，请稍后再发送')
    return
  }
  const message = userMessage.value.trim() //处理用户输入的消息内容，将首尾空格去掉，转换为Markdown格式 
  userMessage.value = ''
  //没有会话或临时会话，新建会话
  if (!currentSession.value || currentSession.value.status === 'TEMP') {
    startNewSession(message)
  } else {
    //添加用户消息到消息数组中
    messages.value.push({
      id: Date.now(),
      senderType: 1,
      content: message,
      createdAt: new Date().toISOString()
    })
    //已有会话，直接发送消息
    startAIResponse(currentSession.value.sessionId, message)
  }
}

//当前会话为临时会话，需要把临时 id 替换成真实 id
const startNewSession = (message) => {
  //构建会话参数
  const sessionParams = {
    initialMessage: message,
    sessionTitle: '',
  }
  //如果会话标题为新对话，会话标题为当前时间
  if (currentSession.value.sessionTitle === '新对话') {
    sessionParams.sessionTitle = `清心AI助手 - ${new Date().toLocaleString()}`
  }
  //历史会话
  else {
    sessionParams.sessionTitle = currentSession.value.sessionTitle
  }
  //发送会话参数
  startSession(sessionParams).then(res => {
    //将后端返回数据转换为前端需要的格式
    const sessionData = {
      sessionId: res.sessionId,
      status: res.status,//该状态为历史会话
      sessionTitle: sessionParams.sessionTitle
    }
    //如果是临时会话，更新当前会话对象
    if (currentSession.value && currentSession.value.status === 'TEMP') {
      //更新为正式会话
      Object.assign(currentSession.value, sessionData)
    }
    else {
      currentSession.value = sessionData
    }
    //更新会话列表
    getSessionPage()
    //添加用户消息到消息数组中
    messages.value.push({
      id: Date.now(),
      senderType: 1,
      content: message,
      createdAt: new Date().toLocaleString()
    })
    //开始流式对话流
    startAIResponse(sessionData.sessionId, message)
  })
}

//获取流式对话流数据
const startAIResponse = (sessionId, message) => {
  //防止重复发送
  if (isAItyping.value) {
    ElMessage.error('Ai助手输入中，请稍后再发送')
    return
  }
  isAItyping.value = true
  //创建ai消息，用于存储ai的响应内容
  const aiMessage = {
    id: 'ai_' + Date.now() + crypto.randomUUID(),
    senderType: 2,
    content: '',
    createdAt: new Date().toLocaleString()
  }
  //将ai消息添加到消息数组中
  messages.value.push(aiMessage)
  //调用流式对话接口，获取对话流
  const ctrl = new AbortController(); //创建一个AbortController实例，用于取消请求
  fetchEventSource('/api/psychological-chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Token': localStorage.getItem('token'),
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify({
      sessionId: sessionId,
      userMessage: message
    }),
    signal: ctrl.signal, //添加取消信号
    //连接成功后，收到服务器第一个响应头时触发回调函数
    onopen: (response) => {
      if (response.headers.get('Content-Type') !== 'text/event-stream') {
        ElMessage.error('服务端返回非流式数据')
      }
    },
    //每次服务器推送数据片段到达时触发回调函数
    onmessage: (event) => {
      const raw = event.data.trim()
      if (raw === '') return
      const eventName = event.event
      //获取当前会话的AI消息
      const aiMessage = messages.value[messages.value.length - 1]

      //如果事件名为done，说明是完成消息，更新ai消息内容为完成提示
      if (eventName === 'done') {
        ctrl.abort()
        isAItyping.value = false
        getEmotionData(currentSession.value.sessionId)
        return
      }
      const payload = JSON.parse(raw)
      const ok = String(payload.code) === '200'
      if (ok && payload.data.content && payload.data) {
        aiMessage.content += payload.data.content
      }
      else if (!ok) {
        handleError(payload.message || '未知错误')
      }
    },
    onError: (error) => {
      handleError(error || '未知错误')
      throw error
    },
    onclose: () => {
      //开始情绪分析
      getEmotionData(currentSession.value.sessionId)
    }
  })
}

//错误处理函数
const handleError = (error) => {
  //获取当前会话的AI消息
  const aiMessage = messages.value[messages.value.length - 1]
  if (aiMessage) {
    //将错误信息添加到ai消息内容中
    aiMessage.content = 'AI助手错误：请重试'
  }
  isAItyping.value = false
  ElMessage.error(error)
}

//点击会话列表项，切换当前会话并获取会话消息
const handleSessionClick = (session) => {
  //获取会话消息
  getSessionMessages(session.id).then(res => {
    messages.value = res  //messages.senderType 1为用户，2为ai
  })
  //切换当前会话
  const sessionData = {
    sessionId: "session_" + session.id,
    // sessionId: session.id,
    status: 'ACTIVE',//该状态为历史会话
    sessionTitle: session.sessionTitle
  }
  //更新当前会话对象
  currentSession.value = sessionData
  //获取会话情绪分析结果
  getEmotionData(sessionData.sessionId)
}

//获取所有会话列表
const getSessionPage = () => {
  return getSessionslist({
    pageNum: 1,
    pageSize: 10,
  }).then(res => {
    sessionList.value = res.records
  })
}


//删除会话
const handleDeleteSession = (sessionId) => {
  deleteSession(sessionId).then(res => {
    ElMessage.success('删除成功')
    //删除成功后，更新会话列表
    getSessionPage()
  })
}

//格式化消息内容，将Markdown转换为HTML
const formatMessageContent = (content) => {
  return content.replace(/\n/g, '<br>')
}

onMounted(async () => {
  isLoading.value = true
  try {
    await getSessionPage()
    createNewSession()
  } catch (error) {
    ElMessage.error('会话加载失败')
  } finally {
    isLoading.value = false
  }
  //绑定用户手动滚动检测事件
  nextTick(() => {
    const el = chatMessagesRef.value
    if (el) el.addEventListener('scroll', handleUserScroll, { passive: true })
  })
})

//组件卸载时清理定时器和事件监听，防止内存泄漏
onUnmounted(() => {
  if (scrollLockTimer) clearTimeout(scrollLockTimer)
  const el = chatMessagesRef.value
  if (el) el.removeEventListener('scroll', handleUserScroll)
})

</script>
<style scoped lang="scss">
.consultation-container {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 64px); // 减去顶部导航栏高度，约束整体不超出视口
  position: relative;
  animation: page-fade-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;

  .page-loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(250, 251, 252, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: overlay-fade-in 0.3s ease-out;

    .loading-content {
      text-align: center;
      animation: loading-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;

      .spinner-ring {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: 4px solid rgba(139, 92, 246, 0.15);
        border-top-color: #8b5cf6;
        margin: 0 auto 20px;
        animation: spinner-rotate 1s linear infinite;
      }

      .loading-text {
        font-size: 16px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 6px;
      }

      .loading-subtext {
        font-size: 13px;
        color: #6b7280;
      }
    }
  }

  .sidebar {
    width: 320px;
    overflow-y: auto; // 侧边栏独立滚动
    animation: sidebar-slide-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;

    &.loading {
      opacity: 0.7;
      pointer-events: none;
    }

    .ai-assistant-info {
      margin-bottom: 20px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(251, 146, 60, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(251, 146, 60, 0.08);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      .breathing-circle {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        animation: breathing 4s ease-in-out infinite;
        box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
        position: relative;
      }

      .assistant-name {
        font-size: 16px;
        font-weight: 700;
        background: linear-gradient(135deg, #fb923c, #f59e0b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        background-clip: text;
        margin: 0 0 12px;
      }

      .online-status {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #059669;
        font-size: 12px;
        font-weight: 600;

        .status-dot {
          width: 8px;
          height: 8px;
          background: #059669;
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s infinite;
          box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
        }
      }
    }

    .session-history {
      background: white;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      min-height: 250px;
      display: flex;
      flex-direction: column;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;

      }

      .session-list {
        overflow-y: auto;
        max-height: 200px;
        scrollbar-width: thin;
        scrollbar-color: rgba(64, 150, 255, 0.3) transparent;

        .session-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          animation: session-item-fade 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;

          &:hover {
            background: #f8f9ff;
            border-color: #e6f0ff;
            transform: translateX(4px);
          }

          &.active {
            background: #e6f0ff;
            border-color: #4096ff;
          }

          .session-info {
            flex: 1;
            padding-right: 36px;

            .session-title {
              font-weight: 500;
              font-size: 14px;
              color: #333;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;

              .session-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;

                .session-time {
                  font-size: 12px;
                  color: #999;
                }
              }

              .session-preview {
                width: 200px;
                font-size: 12px;
                color: #666;
                margin-bottom: 6px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .session-stats {
                display: flex;
                align-items: center;
                gap: 12px;

                span {
                  font-size: 12px;
                  color: #999;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }
              }
            }

            .session-actions {
              position: absolute;
              top: 15%;
              right: -2px;
              transform: translateY(-50%);
            }
          }
        }

        .no-sessions-text {
          text-align: center;
          font-size: 14px;
          color: #999;
        }
      }
    }

    .emotion-garden {
      background: linear-gradient(165deg, #fdf6ee 0%, #fef3e4 40%, #fcf0dd 100%);
      border-radius: 20px;
      padding: 20px 18px;
      margin-bottom: 20px;
      box-shadow:
        0 2px 8px rgba(180, 130, 80, 0.06),
        0 8px 32px rgba(200, 160, 110, 0.12);
      border: 1px solid rgba(210, 180, 140, 0.15);
      position: relative;
      overflow: hidden;
      min-height: 300px;

      // 背景装饰纹理
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 15% 20%, rgba(255, 182, 140, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 85% 75%, rgba(180, 220, 160, 0.06) 0%, transparent 50%);
        pointer-events: none;
      }

      .garden-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 24px;
        position: relative;
        z-index: 2;

        .garden-title {
          font-size: 16px;
          font-weight: 600;
          color: #b07040;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
      }

      .emotion-info {
        margin: 0 auto 20px;
        width: 90px;
        height: 90px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        position: relative;
        box-shadow:
          0 8px 32px rgba(255, 154, 158, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 0.4);
        border: 2.5px solid rgba(255, 255, 255, 0.85);
        background: linear-gradient(145deg, #ffb6a3 0%, #f8a4c8 50%, #d4a8e0 100%);
        color: #fff;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;

        &:hover {
          transform: scale(1.05);
          box-shadow:
            0 12px 40px rgba(255, 154, 158, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        // 外圈呼吸光晕
        &::after {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 182, 163, 0.35);
          animation: emotion-breathe 3s ease-in-out infinite;
          pointer-events: none;
        }

        .emotion-name {
          font-size: 14px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 3px;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }

        .emotion-score {
          font-size: 18px;
          font-weight: 700;
          opacity: 0.95;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }
      }

      .warm-tips {
        text-align: center;
        margin-bottom: 0;

        .emotion-status-text {
          margin-bottom: 14px;

          .status-label {
            font-size: 13px;
            color: #a08c6e;
            margin-right: 6px;
          }

          .status-emotion {
            font-size: 14px;
            font-weight: 600;
            padding: 4px 14px;
            border-radius: 20px;
            display: inline-block;
            background: rgba(180, 220, 160, 0.2);
            color: #6b8e5a;
            transition: all 0.3s ease;
          }
        }

        .emotion-intensity {
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;

          .intensity-dots {
            display: flex;
            gap: 5px;

            .dot {
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: #e8ddd0;
              transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

              &.active {
                background: linear-gradient(135deg, #ffb6a3, #d4a8e0);
                transform: scale(1.3);
                box-shadow: 0 2px 10px rgba(255, 154, 158, 0.35);
              }
            }
          }

          .intensity-text {
            font-size: 12px;
            color: #a09078;
            font-weight: 500;
          }
        }

        .warm-suggestion {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(8px);
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 14px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid rgba(210, 180, 140, 0.2);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          transition: box-shadow 0.3s ease, transform 0.3s ease;

          &:hover {
            box-shadow: 0 6px 22px rgba(0, 0, 0, 0.07);
            transform: translateY(-1px);
          }

          .suggestion-icon {
            font-size: 22px;
            flex-shrink: 0;
            margin-top: 0;
          }

          .suggestion-content {
            text-align: left;
            flex: 1;

            .suggestion-title {
              font-size: 13px;
              font-weight: 600;
              color: #9a7b5a;
              margin-bottom: 4px;
            }

            .suggestion-text {
              font-size: 13px;
              color: #7a6548;
              line-height: 1.55;
            }
          }
        }

        .healing-actions {
          margin-bottom: 14px;

          .actions-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 600;
            color: #9a7b5a;
            margin-bottom: 12px;
            letter-spacing: 0.3px;
          }

          .actions-list {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .action-item {
              background: rgba(255, 255, 255, 0.7);
              backdrop-filter: blur(6px);
              border-radius: 12px;
              padding: 11px 13px;
              display: flex;
              align-items: center;
              gap: 10px;
              border: 1px solid rgba(210, 180, 140, 0.15);
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
              text-align: left;
              transition: all 0.3s ease;

              &:hover {
                background: rgba(255, 255, 255, 0.9);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                transform: translateX(3px);
                border-color: rgba(210, 180, 140, 0.3);
              }

              .action-icon {
                font-size: 16px;
                flex-shrink: 0;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
              }

              .action-text {
                font-size: 12px;
                color: #7a6548;
                line-height: 1.45;
                flex: 1;
              }
            }
          }
        }

        .risk-notice {
          background: linear-gradient(135deg, #fff8eb, #ffecb3);
          border-radius: 14px;
          padding: 14px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid rgba(230, 180, 80, 0.35);
          box-shadow: 0 4px 18px rgba(230, 180, 80, 0.15);
          transition: box-shadow 0.3s ease;
          animation: notice-fade-in 0.5s ease-out;

          &:hover {
            box-shadow: 0 6px 24px rgba(230, 180, 80, 0.22);
          }

          .notice-icon {
            font-size: 18px;
            flex-shrink: 0;
            margin-top: 1px;
          }

          .notice-content {
            flex: 1;

            .notice-title {
              font-size: 13px;
              font-weight: 600;
              color: #c4760a;
              margin-bottom: 4px;
            }

            .notice-text {
              font-size: 12px;
              color: #a3630a;
              line-height: 1.5;
            }
          }
        }
      }
    }

    // 呼吸动画
    @keyframes emotion-breathe {

      0%,
      100% {
        transform: scale(1);
        opacity: 0.35;
      }

      50% {
        transform: scale(1.12);
        opacity: 0.65;
      }
    }

    @keyframes notice-fade-in {
      from {
        opacity: 0;
        transform: translateY(6px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  .chat-main {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 252, 250, 0.98) 100%);
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(251, 146, 60, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(251, 146, 60, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
    animation: chat-slide-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;

    .chat-header {
      background: linear-gradient(90deg, #fb923c 0%, #f59e0b 40%, #f472b6 80%, #fb923c 100%);
      background-size: 200% 100%;
      animation: header-shimmer 8s linear infinite;
      color: white;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      flex-shrink: 0;

      .header-left {
        display: flex;
        align-items: center;

        .chat-avatar {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
        }

        .chat-info {
          h2 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          p {
            font-size: 14px;
            opacity: 0.95;
          }
        }
      }

      .header-right {
        .new-session-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%; // 圆角
          background: rgba(255, 255, 255, 0.2);
          border: 1.5px solid rgba(255, 255, 255, 0.35); // 边框
          color: #fff;
          font-size: 18px;
          backdrop-filter: blur(6px);
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.35);
            border-color: rgba(255, 255, 255, 0.6);
            transform: rotate(90deg);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          }

          &:active {
            transform: rotate(90deg) scale(0.92); // 点击时旋转并缩小到 92%
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        }
      }
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 252, 248, 0.05) 100%);
      min-height: 0;
      scrollbar-width: thin;
      scrollbar-color: rgba(251, 146, 60, 0.3) transparent;

      .message-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
        }

        &.ai-message {
          .message-avatar {
            background: linear-gradient(135deg, #fb923c, #f59e0b);
            box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
          }
        }

        &.user-message {
          flex-direction: row-reverse;

          .message-avatar {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
          }

          .message-content {
            align-items: flex-end;

            .message-bubble {
              background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
              color: white;
              border: none;
            }
          }
        }

        &.welcome-message {
          animation: welcome-fade-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .message-content {
          max-width: 70%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;

          .message-bubble {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
            border-radius: 16px;
            padding: 12px 16px;
            position: relative;
            animation: fadeInUp 0.4s ease-out;
            border: 1px solid rgba(251, 146, 60, 0.1);
            box-shadow: 0 4px 16px rgba(251, 146, 60, 0.05);

            .typing-indicator {
              display: flex;
              gap: 4px;
              padding: 8px 0;

              .typing-dot {
                width: 8px;
                height: 8px;
                background: #ccc;
                border-radius: 50%;
                animation: typing 1.5s ease-in-out infinite;

                &:nth-child(2) {
                  animation-delay: 0.2s;
                }

                &:nth-child(3) {
                  animation-delay: 0.4s;
                }
              }
            }

            /* 错误消息样式 */
            .error-message {
              background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%);
              border: 1px solid #F87171;
              border-radius: 12px;
              padding: 12px 16px;
              color: #991B1B;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 8px;
            }
          }

          .message-time {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
          }
        }
      }
    }

    .chat-input {
      border-top: 1px solid rgba(251, 146, 60, 0.1);
      padding: 20px 24px;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 252, 248, 0.7) 100%);
      backdrop-filter: blur(10px);
      flex-shrink: 0;

      .input-wrapper {
        flex: 1;
      }

      .input-container {
        flex: 1;
      }

      .input-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #78716c;
        font-weight: 500;
        margin-top: 4px;
      }

      .send-btn {
        height: 60px;
        width: 60px;
        border-radius: 16px;
        background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%) !important;
        border: none !important;
        box-shadow: 0 6px 20px rgba(251, 146, 60, 0.25);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

        &:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 10px 28px rgba(251, 146, 60, 0.4);
        }

        &:active:not(:disabled) {
          transform: translateY(-1px) scale(0.98);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

    }

  }
}

// 全局动画关键帧
@keyframes breathing {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(5, 150, 105, 0); }
  100% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(-5px); opacity: 1; }
}

@keyframes btn-breathe {
  0%, 100% { box-shadow: 0 6px 22px rgba(251, 146, 60, 0.28); }
  50% { box-shadow: 0 10px 34px rgba(251, 146, 60, 0.45); }
}

@keyframes header-btn-glow {
  0%, 100% { box-shadow: 0 0 0 rgba(255, 255, 255, 0); }
  50% { box-shadow: 0 0 18px rgba(255, 255, 255, 0.25); }
}

@keyframes orbit-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes core-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

@keyframes text-breathe {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

@keyframes overlay-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes page-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes sidebar-slide-in {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes chat-slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes header-shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@keyframes session-item-fade {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes spinner-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes loading-bounce {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes welcome-fade-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
