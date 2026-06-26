<template>
  <div>
    <PageHead title="情绪日志" />
    <TableSearch :formItem="formItem" @search="handleSearch" />
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="userId" label="用户ID" width="80" />
      <el-table-column label="会话ID" width="85" align="center">
        <template #default="scope">
          <el-avatar :size="28" :style="{ fontSize: '11px' }">{{ scope.row.id }}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="diaryDate" label="记录日期" width="120" />
      <el-table-column prop="moodScore" label="情绪评分">
        <template #default="scope">
          <el-rate v-model="scope.row.moodScore" disabled show-score text-color="#ff9900"
            score-template="{value} points" :max="10" />
        </template>
      </el-table-column>
      <el-table-column label="生活指标" width="120">
        <template #default="scope">
          <div>
            <p>睡眠质量：{{ scope.row.sleepQuality }} / 5</p>
            <p>压力等级：{{ scope.row.stressLevel }} / 5</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="emotionTriggers" label="情绪触发因素" width="120" />
      <el-table-column prop="diaryContent" label="日记内容" width="250" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" text type="primary" @click="handleEdit(scope.row)">详情</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination style="margin-top: 25px;" layout="prev, pager, next" :total="pagination.total"
      :page-size="pagination.size" v-model:current-page="pagination.current" @current-change="handleChange" />

    <!-- 详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="情绪日记详情" width="760px" :close-on-click-modal="false" destroy-on-close>
      <div class="detail-body" v-if="currentDetail">
        <!-- 用户信息 -->
        <el-descriptions title="用户信息" :column="2" border>
          <el-descriptions-item label="用户名">{{ currentDetail.username || '-' }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ currentDetail.userId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ currentDetail.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="记录日期">{{ currentDetail.diaryDate || '-' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 情绪状态 -->
        <el-descriptions title="情绪状态" :column="2" border style="margin-top: 16px;">
          <el-descriptions-item label="情绪评分">
            <el-rate :model-value="currentDetail.moodScore || 0" disabled show-score text-color="#ff9900"
              score-template="{value}" :max="10" />
          </el-descriptions-item>
          <el-descriptions-item label="主要情绪">
            <el-tag v-if="currentDetail.dominantEmotion" type="primary" size="small">{{
              currentDetail.dominantEmotion }}</el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="睡眠质量">{{ currentDetail.sleepQuality ? `${currentDetail.sleepQuality}/5` : '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="压力水平">{{ currentDetail.stressLevel ? `${currentDetail.stressLevel}/5` : '-'
          }}</el-descriptions-item>
        </el-descriptions>

        <!-- 日记内容 -->
        <el-descriptions title="日记内容" :column="1" border style="margin-top: 16px;" :label-style="{ width: '100px' }">
          <el-descriptions-item label="情绪触发因素">{{ currentDetail.emotionTriggers || '无' }}</el-descriptions-item>
          <el-descriptions-item label="日记内容">
            <div class="diary-body">{{ currentDetail.diaryContent || '无内容' }}</div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- AI情绪分析结果 -->
        <el-descriptions title="AI情绪分析结果" :column="2" border style="margin-top: 16px;">
          <template #title>
            <span>AI情绪分析结果</span>
            <el-tag v-if="currentDetail.aiAnalysisStatus === 'PENDING'" type="warning" size="small"
              style="margin-left: 8px;">分析中...</el-tag>
          </template>
          <el-descriptions-item label="主要情绪">
            <el-tag :type="getEmotionTagType(aiData.primaryEmotion)" size="small">{{ aiData.primaryEmotion ||
              '-' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="情绪强度">
            <el-progress :percentage="aiData.emotionScore || 0" :stroke-width="8" :show-text="true"
              :color="getIntensityColor(aiData.emotionScore)" />
          </el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag :type="getRiskTagType(aiData.riskLevel)" size="small" effect="plain">{{
              aiData.riskLevel }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="情绪标签">
            <el-tag :type="getMoodTagType(aiData.isNegative)" size="small" effect="plain">{{ aiData.isNegative ? '负面' :
              '正面'
            }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 专业建议 -->
        <div class="section-title">专业建议</div>
        <div class="suggestion-box">{{ aiData.suggestion || '暂无分析建议' }}</div>

        <!-- 风险描述 -->
        <div class="section-title">风险描述</div>
        <div class="suggestion-box risk-box">{{ aiData.riskDescription || '当前情绪状态稳定，无需特别关注' }}</div>

        <!-- 改善建议 -->
        <div class="section-title">改善建议</div>
        <ul v-if="aiData.improvementSuggestions && aiData.improvementSuggestions.length" class="improvement-list">
          <li v-for="(item, index) in aiData.improvementSuggestions" :key="index">{{ item }}</li>
        </ul>
        <div v-else class="suggestion-box">暂无改善建议</div>

        <!-- 时间信息 -->
        <el-descriptions title="时间信息" :column="2" border style="margin-top: 16px;">
          <el-descriptions-item label="创建时间">{{ currentDetail.createdAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentDetail.updatedAt || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 弹窗底部按钮 -->
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="danger" :loading="deleting" @click="handleDialogDelete">删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
/**
 * 情绪日志管理页（后台）
 * 功能：分页展示用户情绪日记，支持按用户ID和情绪评分筛选；
 *       点击「详情」弹窗展示用户信息、情绪状态、AI 分析结果及建议；
 *       支持列表页删除和弹窗内删除。
 */
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHead from '@/components/PageHead.vue'
import TableSearch from '@/components/TableSearch.vue'
import { getEmotionDiaryPage, deleteEmotionDiary } from '@/api/asmin'

const formItem = [{
  label: '用户ID ', prop: 'userId', comp: 'input', placeholder: '请输入用户ID',
},
{
  label: '情绪评分', prop: 'moodScoreRange', comp: 'select', placeholder: '请选择情绪评分', options: [
    { label: '低分（1-3）', value: '1-3' },
    { label: '中分（4-6）', value: '4-6' },
    { label: '高分（7-10）', value: '7-10' },
  ]
}]

const dialogVisible = ref(false)// 详情弹窗是否显示
const currentDetail = ref(null)// 存储当前查看的详情数据
const deleting = ref(false)// 删除请求中

const tableData = ref([])// 表格数据
const pagination = reactive({
  total: 0,  // 总条数
  size: 10,  // 每页多少条
  currentPage: 1,   // 当前页码
})
const aiData = ref(null)// 存储AI情绪分析结果

// 打开详情弹窗
const handleEdit = (row) => {
  currentDetail.value = row
  if (row.aiAnalysisStatus === "COMPLETED") {
    aiData.value = JSON.parse(row.aiEmotionAnalysis)
  }
  else if (row.aiAnalysisStatus === "PENDING") {
    aiData.value = {
      primaryEmotion: '分析中',
      emotionScore: 50,
      riskLevel: 0,
      isNegative: false,
      suggestion: 'AI正在进行分析，请稍后查看',
      riskDescription: 'AI正在进行分析，请稍后查看',
      improvementSuggestions: ['AI正在进行分析，请稍后查看'],
    }
  }
  else {
    aiData.value = {
      primaryEmotion: '-',
      emotionScore: 0,
      riskLevel: 0,
      isNegative: false,
      suggestion: '暂无分析数据',
      riskDescription: '暂无分析数据',
      improvementSuggestions: [],
    }
  }
  dialogVisible.value = true
}

// 列表页删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该条情绪日记吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return // 用户取消
  }

  try {
    await deleteEmotionDiary(row.id)
    ElMessage.success('删除成功')
    handleSearch({})// 刷新列表
  } catch (err) {
    ElMessage.error(err?.msg || '删除失败，请稍后重试')
  }
}

// 弹窗内删除
const handleDialogDelete = async () => {
  if (!currentDetail.value) return
  try {
    await ElMessageBox.confirm('确定要删除这条情绪日记吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return // 用户取消
  }

  deleting.value = true
  try {
    await deleteEmotionDiary(currentDetail.value.id)
    ElMessage.success('删除成功')
    dialogVisible.value = false
    handleSearch({})// 刷新列表
  } catch (err) {
    ElMessage.error(err?.msg || '删除失败，请稍后重试')
  } finally {
    deleting.value = false
  }
}

const handleChange = (val) => {
  pagination.currentPage = val
  handleSearch({})
}
// 查询情绪日志
const handleSearch = async (formData) => {
  // 将 moodScoreRange（如"1-3"）拆分为后端需要的 minMoodScore + maxMoodScore
  const params = {
    currentPage: pagination.currentPage,
    size: pagination.size,
    ...(formData || {}),
  }
  if (params.moodScoreRange) {
    const [min, max] = params.moodScoreRange.split('-')
    params.minMoodScore = min
    params.maxMoodScore = max
    delete params.moodScoreRange// 移除前端字段名，只保留后端需要的参数
  }
  try {
    const { records, total } = await getEmotionDiaryPage(params)
    tableData.value = records || []
    pagination.total = total || 0
  } catch {
    // 请求失败
    ElMessage.error('查询失败')
    return
  }
}

onMounted(() => {
  handleSearch({})
})

// 根据AI情绪类型返回tag颜色
const getEmotionTagType = (emotion) => {
  const map = { '开心': 'success', '平静': 'info', '焦虑': 'warning', '悲伤': 'info', '兴奋': 'success', '疲惫': 'danger', '中性': 'info' }
  return map[emotion] || 'info'
}

// 根据情绪强度百分比返回进度条颜色
const getIntensityColor = (val) => {
  if (!val) return '#409eff'
  if (val <= 30) return '#67c23a'
  if (val <= 60) return '#e6a23c'
  return '#f56c6c'
}

// 根据风险等级返回tag类型
const getRiskTagType = (level) => {
  const map = { 1: 'success', 2: 'info', 3: 'warning', 4: 'danger' }
  return map[level] || 'info'
}

// 风险等级中文标签
const getRiskLabel = (level) => {
  const map = { 1: '低', 2: '中低', 3: '中等', 4: '高' }
  return map[level] || '-'
}

// 情绪标签颜色
const getMoodTagType = (tag) => {
  if (tag === true) return 'danger'
  if (tag === false) return 'success'
  return 'info' // 无数据时默认信息色
}
</script>
<style lang="scss" scoped>
// ============================================================
//  Emotional — 情绪日志管理页样式
//  表格列表 + 详情弹窗（el-descriptions 分块展示）
// ============================================================

// -- 详情弹窗主体：限制最大高度，分块展示用户信息 / 情绪状态 / AI 分析 / 建议 --
.detail-body {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 4px;

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #374151;
    margin: 16px 0 10px;
  }

  .diary-body {
    min-height: 50px;
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-all;
    font-size: 13px;
  }

  // -- 建议/风险描述文本框 --
  .suggestion-box {
    padding: 10px 14px;
    background: #f9fafb;
    border-radius: 6px;
    color: #374151;
    font-size: 13px;
    line-height: 1.8;
    margin-bottom: 12px;

    // 风险描述增加左侧橙色警示条
    &.risk-box {
      border-left: 3px solid #e6a23c;
    }
  }

  // -- 改善建议列表：自定义绿色圆点 --
  .improvement-list {
    list-style: none;
    padding: 0;
    margin: 0 0 12px;

    li {
      position: relative;
      padding: 6px 0 6px 18px;
      color: #374151;
      font-size: 13px;
      line-height: 1.6;

      &::before {
        content: '';
        position: absolute;
        left: 4px;
        top: 13px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #7ED321;
      }
    }
  }
}
</style>
