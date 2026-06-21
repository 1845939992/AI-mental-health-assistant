<template>
  <div class="consultation-container">
    <!-- 侧边栏 -->
    <div class="sidebar">
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
        <!-- <h4 class="section-title">情绪花园</h4>
        <div class="emotion-list">
          <div class="emotion-item" v-for="emotion in emotionList" :key="emotion.id">
            <div class="emotion-icon">
              <el-image :src="emotion.icon" alt="情绪图标" fit="contain" style="width: 25px; height: 25px;" />
            </div>
            <div class="emotion-name">{{ emotion.name }}</div>
          </div>
        </div> -->
      </div>
      <!-- 会话列表 -->
      <div class="session-history">
          <h4 class="section-title">会话列表</h4>
          <div class="session-list">
            <div class="session-item" v-for="session in sessionList" :key="session.id"
              @click="handleSessionClick(session)">
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
          <el-button @click="createNewSession" title="新建会话">
            <el-icon>
              <Plus />
            </el-icon>
          </el-button>
        </div>
      </div>
      <!-- 会话消息  -->
      <div class="chat-messages">
        <!-- 欢迎消息 -->
        <div v-if="messages.length === 0" class="message-item ai-message">
          <div class="message-avatar">
            <el-image :src="iconUrl" alt="AI助手" fit="contain" style="width: 18px; height: 18px;" />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <p>您好！我是小暖，您的AI心理健康助手。很高兴陪伴您，为您提供温暖的心理支持。
                请告诉我，今天您感觉怎么样？有什么想要分享的吗？</p>
            </div>
            <div class="message-time">10:00</div>
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
        <el-button type="primary" @click="sendMessage" class="send-btn">
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
import { ref, onMounted, reactive } from 'vue'
import { startSession, getSessionslist, deleteSession, getSessionMessages } from '@/api/frontend'
import { ElMessage } from 'element-plus'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'

const iconUrl = new URL('@/assets/images/robot-fill.png', import.meta.url).href //AI助手图标
const iconUrl1 = new URL('@/assets/images/like.png', import.meta.url).href //爱心图标
const iconUrl2 = new URL('@/assets/images/users.png', import.meta.url).href //用户图标

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

// 新建会话
const createNewSession = () => {
  const newSession = {
    sessionId: 'temp_' + Date.now(),
    status: 'TEMP',//该状态为临时会话
    sessionTitle: '新对话'
  }
  currentSession.value = newSession
  messages.value = []   //清空消息列表，显示欢迎页
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
  //创建ai消息
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
      console.log(event)
      const raw = event.data.trim()
      if (raw === '') return
      const eventName = event.event
      //获取当前会话的AI消息
      const aiMessage = messages.value[messages.value.length - 1]

      //如果事件名为data，说明是数据消息，更新ai消息内容
      if (eventName === 'done') {
        ctrl.abort()
        isAItyping.value = false
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
}

//获取所有会话列表
const getSessionPage = () => {
  getSessionslist({
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

onMounted(() => {
  getSessionPage()
  createNewSession()
})

</script>
<style scoped lang="scss">
.consultation-container {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  gap: 20px;
  padding: 20px;

  .sidebar {
    width: 320px;

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

          &:hover {
            background: #f8f9ff;
            border-color: #e6f0ff;
          }

          &.active {
            background: #e6f0ff;
            border-color: #4096ff;
          }

          .session-info {
            flex: 1;

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
              top: 10px;
              right: 12px;
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
      background: linear-gradient(135deg, #fef9e7 0%, #fcf4e6 50%, #f6f0e8 100%);
      border-radius: 20px;
      padding: 16px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(252, 244, 230, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
      min-height: 300px;

      .garden-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        position: relative;
        z-index: 2;

        .garden-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #8b4513;
        }
      }

      .emotion-info {
        margin: 0 auto;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.8);
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
        color: #fff;

        .emotion-name {
          font-size: 15px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 2px;
        }

        .emotion-score {
          font-size: 14px;
          font-weight: 700;
          opacity: 0.9;
        }
      }

      .warm-tips {
        text-align: center;
        margin-bottom: 16px;

        .emotion-status-text {
          margin-bottom: 12px;

          .status-label {
            font-size: 14px;
            color: #8b7355;
            margin-right: 8px;
          }

          .status-emotion {
            font-size: 16px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 16px;
            display: inline-block;
          }
        }

        .emotion-intensity {
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          .intensity-dots {
            display: flex;
            gap: 4px;

            .dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #e0e0e0;
              transition: all 0.3s ease;

              &.active {
                background: linear-gradient(135deg, #ff9a9e, #fecfef);
                transform: scale(1.2);
                box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
              }
            }
          }

          .intensity-text {
            font-size: 12px;
            color: #8b7355;
            font-weight: 500;
          }
        }

        .warm-suggestion {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
          border-radius: 16px;
          padding: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);

          .suggestion-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .suggestion-content {
            text-align: left;
            flex: 1;

            .suggestion-title {
              font-size: 14px;
              font-weight: 600;
              color: #8b7355;
              margin-bottom: 6px;
            }

            .suggestion-text {
              font-size: 13px;
              color: #6b5b47;
              line-height: 1.5;
            }
          }
        }

        .healing-actions {
          margin-bottom: 16px;

          .actions-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #8b7355;
            margin-bottom: 16px;
          }

          .actions-list {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .action-item {
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
              border-radius: 12px;
              padding: 12px;
              display: flex;
              align-items: center;
              gap: 10px;
              border: 1px solid rgba(255, 255, 255, 0.5);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
              text-align: left;

              .action-icon {
                font-size: 14px;
                color: #ffd700;
                flex-shrink: 0;
              }

              .action-text {
                font-size: 12px;
                color: #6b5b47;
                line-height: 1.4;
                flex: 1;
              }
            }
          }
        }

        .risk-notice {
          background: linear-gradient(135deg, #fff9e6, #ffeaa7);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid rgba(255, 234, 167, 0.6);
          box-shadow: 0 6px 20px rgba(255, 234, 167, 0.3);

          .notice-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .notice-content {
            flex: 1;

            .notice-title {
              font-size: 14px;
              font-weight: 600;
              color: #d4840f;
              margin-bottom: 6px;
            }

            .notice-text {
              font-size: 13px;
              color: #b8740c;
              line-height: 1.5;
            }
          }
        }
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

    .chat-header {
      background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
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
      max-height: calc(100vh - 200px);
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
          .message-avatar {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
          }
        }

        .message-content {
          max-width: 70%;

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
        transition: all 0.3s ease;
      }

    }

  }
}
</style>
