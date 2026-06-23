<template>
  <!-- 情绪日记页面 -->
  <div class="emotionDiary-container">
    <!-- 头部 -->
    <div class="header-section">
      <div class="header-content">
        <span class="header-icon">❤️</span>
        <h2>情绪日记</h2>
        <p class="header-subtitle">记录当下，认识自己</p>
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
            <div v-for="(emotion, index) in emotionList" :key="emotion.value" class="emotion-card"
              :class="{ selected: form.dominantEmotion === emotion.label }"
              @click="form.dominantEmotion = emotion.label"
              :style="{ animationDelay: `${index * 0.04}s` }">
              <span class="emotion-icon">{{ emotion.icon }}</span>
              <div class="emotion-name">{{ emotion.label }}</div>
            </div>
          </div>
        </div>

        <!-- 详细记录 -->
        <div class="detail-form">
          <div class="title">详细记录</div>

          <div class="form-label">情绪触发因素</div>
          <el-input v-model="form.emotionTriggers" placeholder="今天什么事情影响了你的情绪？" maxlength="200" show-word-limit
            class="animated-input" />

          <div class="form-label">今日感想</div>
          <el-input v-model="form.diaryContent" type="textarea" :rows="5" placeholder="写下你今天的想法、感受或发生的有意义的事情..."
            maxlength="1000" show-word-limit class="animated-input" />

          <div class="life-indicators">
            <div class="indicator-group">
              <div class="form-label">睡眠质量</div>
              <el-select v-model="form.sleepQuality" placeholder="请选择" class="animated-select">
                <el-option label="很差" value="1" />
                <el-option label="较差" value="2" />
                <el-option label="一般" value="3" />
                <el-option label="较好" value="4" />
                <el-option label="很好" value="5" />
              </el-select>
            </div>
            <div class="indicator-group">
              <div class="form-label">压力水平</div>
              <el-select v-model="form.stressLevel" placeholder="请选择" class="animated-select">
                <el-option label="很低" value="1" />
                <el-option label="较低" value="2" />
                <el-option label="一般" value="3" />
                <el-option label="较高" value="4" />
                <el-option label="很高" value="5" />
              </el-select>
            </div>
          </div>

          <div class="action-buttons">
            <el-button @click="handleReset" :disabled="isSubmitting">重置</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="isSubmitting" class="submit-btn">
              {{ isSubmitting ? '提交中...' : '提交记录' }}
            </el-button>
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

// 提交加载状态
const isSubmitting = ref(false)

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
  isSubmitting.value = true
  try {
    await addEmotionDiary(form)
    ElMessage.success('记录提交成功')
    handleReset()
  } catch (err) {
    ElMessage.error(err?.msg || '记录提交失败')
  } finally {
    isSubmitting.value = false
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
/* =============================================================
   emotion-diary — 情绪日记页面
   结构: .emotionDiary-container
           ├── .header-section      (全屏宽渐变头部)
           │     └── .header-content (内容居中, max-width:1200px)
           └── .content             (表单区, max-width:980px)
   ============================================================= */

// -- 布局令牌 ---------------------------------------------------
$header-max-width: 1200px;
$content-max-width: 980px;

.emotionDiary-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
  animation: page-fade-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;

  /* ==================== HEADER ==================== */
  .header-section {
    // 始终撑满视口，不依赖父容器宽度（缩放安全）
    width: 100vw;
    position: relative;
    left: 50%;
    margin-left: -50vw;
    box-sizing: border-box;
    background: linear-gradient(90deg,
        #8b5cf6 0%,
        #ec4899 20%,
        #f59e0b 45%,
        #ec4899 70%,
        #8b5cf6 100%);
    background-size: 200% 100%;
    animation: header-shimmer 10s linear infinite, header-slide-down 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
    color: white;
    padding: 18px 48px;
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.25);

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: $header-max-width;
      margin: 0 auto;
      animation: header-content-fade 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;

      .header-icon {
        font-size: 32px;
        flex-shrink: 0;
        line-height: 1;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }

      h2 {
        flex-shrink: 0;
        font-size: 26px;
        font-weight: 800;
        margin: 0;
        line-height: 1.3;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      }

      .header-subtitle {
        margin: 0 0 0 auto;
        padding-left: 12px;
        font-size: 15px;
        opacity: 0.95;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: min(40vw, 300px);
        flex-shrink: 1;
      }
    }
  }

  /* ==================== CONTENT ==================== */
  .content {
    margin: 0 auto;
    width: $content-max-width;
    max-width: calc(100% - 40px);
    padding: 24px 20px;
    animation: content-slide-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;

    .diary-card {
      margin-bottom: 24px;
      background: rgba(255, 255, 255, 0.96);
      border-radius: 20px;
      padding: 28px;
      box-shadow:
        0 8px 30px rgba(0, 0, 0, 0.04),
        0 2px 8px rgba(139, 92, 246, 0.06);
      border: 1px solid rgba(139, 92, 246, 0.08);
      backdrop-filter: blur(10px);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.06),
          0 4px 12px rgba(139, 92, 246, 0.1);
      }

      .title {
        margin-bottom: 16px;
        font-size: 22px;
        font-weight: 700;
        color: #374151;
      }

      .section {
        margin-bottom: 28px;

        p {
          font-size: 15px;
          color: #6B7280;
          margin-bottom: 16px;
        }

        .mood-score-row {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: rgba(139, 92, 246, 0.04);
          border-radius: 12px;
          border: 1px solid rgba(139, 92, 246, 0.08);
        }
      }

      .emotion-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        .emotion-card {
          padding: 18px 14px;
          border: 2px solid #E5E7EB;
          border-radius: 18px;
          text-align: center;
          cursor: pointer;
          background: #F9FAFB;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: card-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.12);
            border-color: rgba(139, 92, 246, 0.3);
          }

          .emotion-icon {
            display: block;
            font-size: 30px;
            margin-bottom: 8px;
            transition: transform 0.3s ease;
          }

          .emotion-name {
            margin-top: 8px;
            padding: 0 60px;
            color: #374151;
            font-weight: 500;
          }

          &.selected {
            position: relative;
            border-color: transparent;
            background: #F0FDF4;
            background-clip: padding-box;
            transform: translateY(-4px);

            &::before {
              content: '';
              position: absolute;
              inset: -3px;
              z-index: -1;
              border-radius: 21px;
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
          margin: 16px 0 8px;
          color: #374151;
          font-weight: 500;
          font-size: 14px;
        }

        .animated-input,
        .animated-select {
          transition: transform 0.3s ease, box-shadow 0.3s ease;

          &:focus-within {
            transform: translateY(-1px);
          }
        }

        .life-indicators {
          display: flex;
          gap: 20px;
          margin-top: 8px;

          .indicator-group {
            flex: 1;
          }
        }

        .action-buttons {
          margin-top: 40px;
          display: flex;
          gap: 12px;

          .submit-btn {
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            border: none;
            transition: all 0.3s ease;

            &:hover:not(:disabled) {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
            }

            &:active:not(:disabled) {
              transform: translateY(0);
            }
          }
        }
      }
    }
  }
}

/* ==================== KEYFRAMES ==================== */
@keyframes border-flow {
  to {
    background-position: 400% 50%;
  }
}

@keyframes page-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes header-slide-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes header-content-fade {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes header-shimmer {
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 200% 50%;
  }
}

@keyframes content-slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes card-pop {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ==================== RESPONSIVE — 平板 ==================== */
@media (max-width: 991px) {
  .emotionDiary-container {
    .header-section {
      padding: 16px 24px;

      .header-content {
        gap: 10px;

        .header-icon {
          font-size: 28px;
        }

        h2 {
          font-size: 22px;
        }

        .header-subtitle {
          font-size: 14px;
          max-width: min(35vw, 250px);
        }
      }
    }

    .content {
      padding: 18px;

      .diary-card {
        padding: 22px;
      }
    }
  }
}

/* ==================== RESPONSIVE — 手机 ==================== */
@media (max-width: 767px) {
  .emotionDiary-container {
    .header-section {
      padding: 14px 16px;

      .header-content {
        flex-wrap: wrap;
        gap: 4px;
        row-gap: 6px;

        .header-icon {
          font-size: 24px;
        }

        h2 {
          font-size: 18px;
        }

        .header-subtitle {
          flex-basis: 100%;
          margin: 0;
          padding-left: 0;
          max-width: none;
          font-size: 13px;
          opacity: 0.9;
        }
      }
    }

    .content {
      padding: 14px;

      .diary-card {
        padding: 18px;
        border-radius: 16px;

        .title {
          font-size: 20px;
          margin-bottom: 16px;
        }

        .emotion-card {
          padding: 14px 10px;

          .emotion-icon {
            font-size: 26px;
          }

          .emotion-name {
            padding: 0 24px;
          }
        }

        .life-indicators {
          flex-direction: column;
          gap: 12px;
        }
      }
    }
  }
}

/* ==================== RESPONSIVE — 小手机 ==================== */
@media (max-width: 480px) {
  .emotionDiary-container {
    .header-section {
      padding: 12px;

      .header-content {
        .header-icon {
          font-size: 20px;
        }

        h2 {
          font-size: 16px;
        }

        .header-subtitle {
          font-size: 12px;
        }
      }
    }

    .content .diary-card {
      padding: 14px;
      border-radius: 14px;

      .title {
        font-size: 18px;
      }

      .emotion-card {
        padding: 12px 8px;

        .emotion-name {
          padding: 0 16px;
        }
      }
    }
  }
}

/* ==================== 高分辨率大屏优化 ==================== */
@media (min-width: 1600px) {
  .emotionDiary-container {
    .header-section {
      padding: 22px 64px;

      .header-content {
        .header-icon {
          font-size: 36px;
        }

        h2 {
          font-size: 28px;
        }

        .header-subtitle {
          font-size: 16px;
        }
      }
    }
  }
}
</style>
