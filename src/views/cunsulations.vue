<template>
  <div>
    <PageHead title="咨询记录" />
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="会话ID" width="200">
        <template #default="scope">
          <el-avatar :src="scope.row.userNickname" :size="50">
            {{ scope.row.userNickname ? scope.row.userNickname : '匿名用户' }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="情绪日志">
        <template #default="scope">
          <div class="session-title">{{ scope.row.sessionTitle }}</div>
          <div class="session-preview">{{ scope.row.lastMessageContent }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="messageCount" label="消息数" width="100" />
      <el-table-column prop="lastMessageTime" label="最后消息时间" width="100" />
      <el-table-column prop="id" label="操作" width="100">
        <template #default="scope">
          <el-button type="primary" text @click="viewSessionDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination style="margin-top: 25px;" layout="prev, pager, next, jumper" :total="pagination.total"
      :page-size="pagination.pageSize" :current-page="pagination.pageNum" @current-change="handleChange" />
    <el-dialog v-model="showDetailDialog" title="会话详情" width="70%" :close-on-click-modal="false">
      <div class="session-detail">
        <div class="session-header">
          <div class="detail-row">
            <div class="detail-label">用户：</div>
            <div class="detail-value">{{ sessionDetail.userNickname || '匿名用户' }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">开始时间：</div>
            <div class="detail-value">{{ sessionDetail.startedAt }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">消息数：</div>
            <div class="detail-value">{{ sessionDetail.messageCount }}</div>
          </div>
        </div>
        <div class="messages-container">
          <div class="messages-header">
            <h4>对话记录</h4>
          </div>
          <div class="messages-list" v-loading="loadingMessages">
            <div v-for="msg in sessionMessages" :key="msg.id" class="message-item"
              :class="msg.senderType === 1 ? 'user-message' : 'ai-message'">
              <div class="message-header">
                <div class="sender">{{ msg.senderType === 1 ? '用户' : 'AI' }}</div>
                <div class="time">{{ msg.createdAt }}</div>
              </div>
              <div class="message-content">{{ msg.content }}</div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
/**
 * 咨询记录管理页面
 * 功能：分页展示所有用户的 AI 咨询会话列表，支持查看会话详情（对话记录回放）
 * 使用 getConsulationPage 获取分页数据，getConsulationDetail 获取单条会话完整对话
 */
import { getConsulationPage, getConsulationDetail } from '@/api/asmin'
import { onMounted, ref, reactive } from 'vue'
import PageHead from '@/components/PageHead.vue'

// --- 会话详情弹窗相关状态 ---
const showDetailDialog = ref(false)   // 控制详情弹窗显隐
const sessionDetail = ref({})         // 当前查看的会话元信息（用户、时间、消息数）
const sessionMessages = ref([])       // 会话中的全部对话消息
const loadingMessages = ref(false)    // 弹窗内消息加载中的 loading 状态

// --- 列表与分页 ---
const tableData = ref([])             // 当前页会话列表数据
const pagination = reactive({
  total: 0,       // 总条数（后端返回）
  size: 10,       // 每页显示条数
  currentPage: 1, // 当前页码
})

/**
 * 点击行「详情」按钮，弹窗展示该会话的完整对话记录
 * 先设置元信息并打开弹窗，再异步拉取消息列表
 */
const viewSessionDetail = (row) => {
  loadingMessages.value = true
  showDetailDialog.value = true
  sessionDetail.value = row // 先用整行数据填充元信息（标题、时间、消息数等）
  getConsulationDetail(row.id).then(res => {
    loadingMessages.value = false
    sessionMessages.value = res
  }).catch(() => {
    loadingMessages.value = false
  })
}

/** 分页页码变化时重新拉取数据 */
const handleChange = (page) => {
  pagination.currentPage = page
  handleSearch()
}

/** 根据当前分页参数请求会话列表，更新 tableData 和 total */
const handleSearch = () => {
  getConsulationPage(pagination).then(res => {
    const { total, records } = res
    tableData.value = records
    pagination.total = total
  })
}

// 页面挂载后首次加载数据
onMounted(() => {
  handleSearch()
})

</script>
<style lang="scss" scoped>
// ============================================================
//  Cunsulations — 咨询记录管理页样式
//  会话列表 + 详情弹窗（消息气泡式对话回放）
// ============================================================

// -- 表格统一样式：斑马纹 + 表头背景 --
:deep(.el-table) {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;

  .el-table__header-wrapper {
    th {
      background: #F9FAFB;
      color: #374151;
      font-weight: 600;
      font-size: 13px;
      border-bottom: 2px solid #E5E7EB;
    }
  }

  .el-table__body tr:hover>td {
    background: #EEF2FF !important;
  }

  td,
  th {
    padding: 14px 12px;
  }
}

// -- 列表区 -------------------------------------------------
.session-title {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 5px;
}

.session-preview {
  font-size: 13px;
  color: #6B7280;
}

// -- 操作按钮 --
:deep(.el-button--primary.is-text) {
  color: #6366F1;

  &:hover {
    color: #4F46E5;
  }
}

// -- 分页样式 --
:deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-end;

  .el-pager li {
    border-radius: 6px;
    transition: all 0.2s ease;

    &.is-active {
      background: #6366F1;
      color: #fff;
    }

    &:hover:not(.is-active) {
      color: #6366F1;
    }
  }
}

// -- 会话详情弹窗 -------------------------------------------
.session-detail {
  display: flex;
  flex-direction: column;
  height: 60vh;
}

// --- 弹窗头部：卡片化元信息 ---
.session-header {
  display: flex;
  gap: 24px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(99, 102, 241, 0.01) 50%, transparent 100%);
  border-radius: 10px;
  margin-bottom: 16px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #E5E7EB;
}

.detail-row {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.detail-label {
  color: #6B7280;
  margin-right: 6px;
  font-weight: 500;
}

.detail-value {
  color: #1F2937;
  font-weight: 600;
}

// --- 对话区域：可滚动消息列表 ---
.messages-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-header {
  flex-shrink: 0;

  h4 {
    margin: 0 0 12px 0;
    font-size: 15px;
    color: #1F2937;
    padding-left: 8px;
    border-left: 3px solid #6366F1;
  }
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 4px 0;

  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: rgba(99, 102, 241, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(99, 102, 241, 0.35);
    }
  }
}

// --- 消息条目：用户靠右蓝紫渐变，AI 靠左白色卡片 ---
.message-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  max-width: 75%;

  .message-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;

    .sender {
      font-size: 13px;
      font-weight: 600;
    }

    .time {
      font-size: 12px;
      color: #9CA3AF;
    }
  }

  .message-content {
    font-size: 14px;
    line-height: 1.6;
    padding: 12px 16px;
    border-radius: 10px;
    word-break: break-word;
  }
}

// --- 用户消息：靠右、靛蓝紫渐变气泡 ---
.user-message {
  align-self: flex-end;
  align-items: flex-end;

  .message-header {
    flex-direction: row-reverse;

    .sender {
      color: #6366F1;
    }
  }

  .message-content {
    background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%);
    color: #fff;
    border-bottom-right-radius: 4px;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
  }
}

// --- AI 消息：靠左、白色毛玻璃卡片 ---
.ai-message {
  align-self: flex-start;
  align-items: flex-start;

  .message-header {
    .sender {
      color: #10B981;
    }
  }

  .message-content {
    background: #FFFFFF;
    color: #1F2937;
    border: 1px solid #E5E7EB;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }
}
</style>
