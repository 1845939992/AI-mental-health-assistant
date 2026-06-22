<template>
  <div class="emotionDiary-container">
    <!-- 头部 -->
    <div class="header-section">
      <div class="header-content">
        <span class="header-icon">❤️</span>
        <h2>情绪日记</h2>
      </div>
    </div>

    <!-- 正文 -->
    <div class="content">
      <div class="diary-card">
        <!-- 今日情绪评分 -->
        <div class="section">
          <div class="title">今日情绪评分</div>
          <p>您今天的整体情绪状态如何？(1-10分)</p>
          <div class="mood-score-row">
            <el-rate v-model="form.moodScore" :max="10" show-text
              :texts="['极差', '很差', '较差', '略差', '一般', '还行', '不错', '较好', '很好', '极好']" />
          </div>
        </div>

        <!-- 主要情绪 -->
        <div class="section">
          <div class="title">主要情绪</div>
          <div class="emotion-grid">
            <div v-for="emotion in emotionList" :key="emotion.value" class="emotion-card"
              :class="{ selected: form.dominantEmotion === emotion.label }"
              @click="form.dominantEmotion = emotion.label">
              <span class="emotion-icon">{{ emotion.icon }}</span>
              <div class="emotion-name">{{ emotion.label }}</div>
            </div>
          </div>
        </div>

        <!-- 详细记录 -->
        <div class="detail-form">
          <div class="title">详细记录</div>

          <div class="form-label">情绪触发因素</div>
          <el-input v-model="form.emotionTriggers" placeholder="今天什么事情影响了你的情绪？" maxlength="200" show-word-limit />

          <div class="form-label">今日感想</div>
          <el-input v-model="form.diaryContent" type="textarea" :rows="5" placeholder="写下你今天的想法、感受或发生的有意义的事情..."
            maxlength="1000" show-word-limit />

          <div class="life-indicators">
            <div class="indicator-group">
              <div class="form-label">睡眠质量</div>
              <el-select v-model="form.sleepQuality" placeholder="请选择">
                <el-option label="很差" value="1" />
                <el-option label="较差" value="2" />
                <el-option label="一般" value="3" />
                <el-option label="较好" value="4" />
                <el-option label="很好" value="5" />
              </el-select>
            </div>
            <div class="indicator-group">
              <div class="form-label">压力水平</div>
              <el-select v-model="form.stressLevel" placeholder="请选择">
                <el-option label="很低" value="1" />
                <el-option label="较低" value="2" />
                <el-option label="一般" value="3" />
                <el-option label="较高" value="4" />
                <el-option label="很高" value="5" />
              </el-select>
            </div>
          </div>

          <div class="action-buttons">
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" @click="handleSubmit">提交记录</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { addEmotionDiary } from '@/api/frontend'
import { ElMessage, dayjs } from 'element-plus'

const emotionList = [
  { label: '开心', value: 'happy', icon: '😊' },
  { label: '平静', value: 'calm', icon: '😌' },
  { label: '焦虑', value: 'anxious', icon: '😰' },
  { label: '悲伤', value: 'sad', icon: '😢' },
  { label: '兴奋', value: 'excited', icon: '🤩' },
  { label: '疲惫', value: 'tired', icon: '😴' },
  { label: '惊讶', value: 'surprised', icon: '😲' },
  { label: '困惑', value: 'confused', icon: '🤔' },
]

const form = reactive({
  diaryDate: dayjs().format('YYYY-MM-DD'),//记录日期,该方法可以获取当前日期的格式化字符串
  moodScore: 0, //情绪评分
  diaryContent: '', //今日感想
  emotionTriggers: '', //情绪触发因素
  sleepQuality: null, //睡眠质量
  stressLevel: null, //压力水平
  dominantEmotion: '', //主要情绪
})

// 提交记录
const handleSubmit = async () => {
  if (!form.moodScore) {
    ElMessage.error('请选择情绪评分')
    return
  }
  if (!form.dominantEmotion) {
    ElMessage.error('请选择主要情绪')
    return
  }
  try {
    await addEmotionDiary(form)
    ElMessage.success('记录提交成功')
    handleReset()
  } catch (err) {
    ElMessage.error(err?.msg || '记录提交失败')
  }
}

// 重置表单
const handleReset = () => {
  form.selectedEmotion = ''
  form.moodScore = 0
  form.diaryContent = ''
  form.emotionTriggers = ''
  form.sleepQuality = null
  form.stressLevel = null
  form.dominantEmotion = ''
  form.diaryDate = dayjs().format('YYYY-MM-DD')
}
</script>
<style lang="scss" scoped>
.emotionDiary-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);

  .header-section {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    background: linear-gradient(90deg,
        #7ED321 0%,
        #F5A623 25%,
        #E88A1A 40%,
        #F5A623 55%,
        #7ED321 70%,
        #4CAF50 85%,
        #7ED321 100%);
    background-size: 300% 100%;
    animation: gradient-flow 12s ease-in-out infinite;
    color: white;
    padding: 12px 48px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;

      .header-icon {
        font-size: 32px;
      }
    }
  }

  .content {
    margin: 0 auto;
    width: 980px;
    padding: 20px;

    .diary-card {
      margin-bottom: 20px;
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

      .title {
        margin-bottom: 20px;
        font-size: 25px;
        font-weight: 600;
        color: #374151;
      }

      .section {
        margin-bottom: 20px;

        p {
          font-size: 15px;
          color: #6B7280;
          margin-bottom: 15px;
        }

        .mood-score-row {
          display: flex;
          align-items: center;
        }
      }

      .emotion-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .emotion-card {
          padding: 15px;
          border: 2px solid #E5E7EB;
          border-radius: 15px;
          text-align: center;
          cursor: pointer;
          background: #F9FAFB;

          .emotion-icon {
            display: block;
            font-size: 28px;
            margin-bottom: 6px;
          }

          .emotion-name {
            margin-top: 10px;
            padding: 0 75px;
            color: #374151;
          }

          &.selected {
            position: relative;
            border-color: transparent;
            background: #F0FDF4;
            background-clip: padding-box;
            transform: translateY(-3px);

            &::before {
              content: '';
              position: absolute;
              inset: -3px;
              z-index: -1;
              border-radius: 18px;
              background: linear-gradient(90deg,
                  #ff6b6b, #ffa94d, #ffd43b, #69db7c,
                  #4dabf7, #9775fa, #f06595, #ff6b6b);
              background-size: 400% 100%;
              animation: border-flow 8s linear infinite;
            }
          }
        }
      }

      .detail-form {
        .form-label {
          margin: 10px 0;
          color: #374151;
        }

        .life-indicators {
          display: flex;
          gap: 20px;

          .indicator-group {
            flex: 1;
          }
        }

        .action-buttons {
          margin-top: 40px;
        }
      }
    }
  }
}

@keyframes gradient-flow {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@keyframes border-flow {
  to {
    background-position: 400% 50%;
  }
}
</style>
