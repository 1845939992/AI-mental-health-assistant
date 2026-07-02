<template>
  <!-- 情绪日记页面 -->
  <div class="emotionDiary-container">
    <!-- 头部：分层设计，图标 + 标题 + 功能说明 + 底部曲线过渡 -->
    <div class="header-section">
      <div class="header-bg-dots"></div>
      <div class="header-content">
        <div class="header-icon-circle">
          <span class="header-icon">❤️</span>
        </div>
        <div class="header-text-group">
          <h2>情绪日记</h2>
          <p class="header-desc">每天花几分钟记录情绪变化，AI 将为您生成个性化的情绪分析与改善建议</p>
        </div>
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
              @click="form.dominantEmotion = emotion.label" :style="{ animationDelay: `${index * 0.04}s` }">
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
/**
 * 情绪日记填写页（前台）
 * 用户选择情绪评分、主要情绪，填写触发因素、感想及生活质量指标后提交。
 * 提交成功后自动重置表单，可继续记录新的一天。
 */
import { reactive, ref, onMounted } from 'vue'
import { addEmotionDiary } from '@/api/frontend'
import { ElMessage, dayjs } from 'element-plus'

// 可选情绪列表：label 用于展示与提交，icon 用于卡片表情
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
$content-max-width: 1150px;

.emotionDiary-container {
  min-height: 100vh;
  /* 统一色彩：紫粉金径向光斑 + 线性渐变，与头部流动渐变色协调 */
  background:
    radial-gradient(circle at 10% 15%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 85% 20%, rgba(236, 72, 153, 0.06) 0%, transparent 35%),
    radial-gradient(circle at 90% 85%, rgba(245, 158, 11, 0.05) 0%, transparent 40%),
    linear-gradient(180deg, #faf5ff 0%, #fdf2f8 30%, #fff7ed 70%, #f8fafc 100%);
  animation: page-fade-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;

  /* ==================== HEADER ==================== */
  // -- 分层头部：渐变底 + 点阵纹理 + 图标圆形容器 + 标题组 + 底部波浪曲线 --
  .header-section {
    /* 与内容区同宽，不再全宽铺满 */
    width: 100%;
    max-width: $content-max-width;
    margin: -34px auto 0;
    box-sizing: border-box;
    will-change: transform; /* 浮动动画 GPU 合成层提示 */
    /* 粉色强调的流动渐变（与知识库的紫色强调形成差异） */
    background: linear-gradient(135deg,
        #a78bfa 0%,
        #ec4899 25%,
        #f59e0b 50%,
        #ec4899 75%,
        #8b5cf6 100%);
    background-size: 200% 200%;
    animation: header-shimmer 12s ease-in-out infinite, header-slide-down 0.7s cubic-bezier(0.22, 1, 0.36, 1) both, header-float 4s ease-in-out infinite 0.7s;
    color: white;
    padding: 22px 48px 22px 60px;
    overflow: hidden;

    /* 多层阴影：立体悬浮效果 */
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.10),
      0 2px 8px rgba(0, 0, 0, 0.06),
      0 16px 48px rgba(236, 72, 153, 0.25);

    /* 点阵背景纹理解码层 */
    .header-bg-dots {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(circle at 15% 30%, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
        radial-gradient(circle at 75% 20%, rgba(255, 255, 255, 0.1) 1.5px, transparent 1.5px),
        radial-gradient(circle at 85% 70%, rgba(255, 255, 255, 0.12) 1px, transparent 1px),
        radial-gradient(circle at 30% 75%, rgba(255, 255, 255, 0.08) 2px, transparent 2px);
      background-size:
        80px 80px,
        120px 120px,
        100px 100px,
        140px 140px;
      opacity: 0.6;
    }

    .header-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: $header-max-width;
      margin: 0 auto;
      animation: header-content-fade 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;

      /* 图标圆形容器：毛玻璃 + 呼吸动画 */
      .header-icon-circle {
        width: 52px;
        height: 52px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(12px);
        box-shadow:
          0 4px 16px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
        animation: icon-float 3s ease-in-out infinite;

        .header-icon {
          font-size: 26px;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
        }
      }

      /* 标题组：标题 + 功能说明文字，清楚传达页面用途 */
      .header-text-group {
        display: flex;
        flex-direction: column;
        gap: 4px;

        h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          line-height: 1.2;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
          letter-spacing: -0.01em;
        }

        /* 功能说明：帮助用户理解页面用途和操作方式 */
        .header-desc {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          opacity: 0.9;
          font-weight: 400;
          max-width: 360px;
        }
      }
    }

    /* 底部波浪曲线：平滑过渡到内容区 */
  }

  /* 整体圆角：底部大弧度减少棱角，平滑过渡到内容区 */
  border-radius: 60px;

  /* ==================== CONTENT ==================== */
  // -- 内容区：情绪日记表单卡片 --
  .content {
    margin: 0 auto;
    width: $content-max-width;
    max-width: calc(100% - 40px);
    padding: 24px 20px;
    animation: content-slide-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;

    // -- 日记卡片：毛玻璃背景 + 柔和阴影 + 渐变光晕边框 --
    .diary-card {
      margin-bottom: 24px;
      background: rgba(255, 255, 255, 0.96);
      border-radius: 20px;
      padding: 32px;
      position: relative;
      box-shadow:
        0 8px 30px rgba(0, 0, 0, 0.04),
        0 2px 8px rgba(139, 92, 246, 0.06);
      border: 1px solid rgba(139, 92, 246, 0.1);
      backdrop-filter: blur(10px);
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;

      /* 卡片顶部渐变色条装饰 */
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 20px;
        right: 20px;
        height: 3px;
        border-radius: 0 0 3px 3px;
        background: linear-gradient(90deg, #8b5cf6, #ec4899, #f59e0b);
        opacity: 0.7;
      }

      &:hover {
        border-color: rgba(139, 92, 246, 0.2);
        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.06),
          0 4px 16px rgba(139, 92, 246, 0.1),
          0 0 0 1px rgba(139, 92, 246, 0.06);
      }

      .title {
        // 各区块标题（今日情绪评分 / 主要情绪 / 详细记录）
        margin-bottom: 16px;
        font-size: 20px;
        font-weight: 700;
        color: #1F2937;
        /* 左侧渐变装饰条 */
        padding-left: 14px;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 20px;
          border-radius: 2px;
          background: linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%);
        }
      }

      .section {
        // 表单分区，控制区块间距
        margin-bottom: 28px;

        p {
          font-size: 15px;
          color: #6B7280;
          margin-bottom: 16px;
          margin-left: 14px;
        }

        .mood-score-row {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(236, 72, 153, 0.03) 100%);
          border-radius: 14px;
          border: 1px solid rgba(139, 92, 246, 0.1);
          transition: box-shadow 0.3s ease, border-color 0.3s ease;

          &:hover {
            border-color: rgba(139, 92, 246, 0.2);
            box-shadow: 0 2px 12px rgba(139, 92, 246, 0.08);
          }
        }
      }

      // -- 情绪选择网格：8 种情绪卡片平铺 --
      .emotion-grid {
        // 情绪选择卡片网格：8 种情绪平铺展示
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        // -- 单个情绪卡片：悬浮上浮 + 选中彩虹边框 --
        .emotion-card {
          padding: 20px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          text-align: center;
          cursor: pointer;
          background: linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: card-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(139, 92, 246, 0.15);
            border-color: rgba(139, 92, 246, 0.4);
            background: linear-gradient(180deg, #faf5ff 0%, #fdf2f8 100%);
          }

          .emotion-icon {
            display: block;
            font-size: 32px;
            margin-bottom: 8px;
            transition: transform 0.3s ease;
          }

          &:hover .emotion-icon {
            transform: scale(1.15);
          }

          .emotion-name {
            margin-top: 8px;
            padding: 0 60px;
            color: #374151;
            font-weight: 600;
            font-size: 14px;
          }

          &.selected {
            position: relative;
            border-color: transparent;
            background: linear-gradient(180deg, #faf5ff 0%, #fef3c7 100%);
            background-clip: padding-box;
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);

            &::before {
              content: '';
              position: absolute;
              inset: -3px;
              z-index: -1;
              border-radius: 19px;
              background: linear-gradient(90deg,
                  #8b5cf6, #ec4899, #f59e0b, #06b6d4, #8b5cf6);
              background-size: 400% 100%;
              animation: border-flow 6s linear infinite;
            }

            .emotion-icon {
              animation: selected-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
          }
        }
      }

      // -- 详细记录区：触发因素、感想、睡眠质量、压力水平 --
      .detail-form {

        // 详细记录区：触发因素、感想、睡眠质量、压力水平
        .form-label {
          margin: 20px 0 8px;
          color: #374151;
          font-weight: 600;
          font-size: 14px;
          /* 左侧彩色装饰点 */
          padding-left: 12px;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #8b5cf6;
          }

          &:nth-child(3)::before {
            background: #ec4899;
          }
        }

        .animated-input,
        .animated-select {
          transition: transform 0.3s ease, box-shadow 0.3s ease;

          :deep(.el-input__wrapper) {
            border-radius: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 0 0 1px #E5E7EB inset;

            &:hover {
              box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.3) inset;
            }

            &.is-focus {
              box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3) inset;
            }
          }

          :deep(.el-textarea__inner) {
            border-radius: 10px;
            transition: all 0.3s ease;

            &:hover {
              border-color: rgba(139, 92, 246, 0.3);
            }

            &:focus {
              border-color: rgba(139, 92, 246, 0.5);
              box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.08);
            }
          }

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

            .el-select {
              width: 100%;
            }
          }
        }

        // -- 操作按钮：重置 + 提交 --
        .action-buttons {
          margin-top: 40px;
          display: flex;
          gap: 14px;
          justify-content: flex-end;

          /* 重置按钮：紫粉边框 + 文字色 */
          :deep(.el-button:not(.submit-btn)) {
            border: 1.5px solid rgba(139, 92, 246, 0.3);
            color: #8b5cf6;
            background: transparent;
            border-radius: 12px;
            padding: 10px 24px;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

            &:hover {
              background: rgba(139, 92, 246, 0.06);
              border-color: rgba(139, 92, 246, 0.6);
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(139, 92, 246, 0.12);
            }

            &:active {
              transform: translateY(0) scale(0.97);
            }
          }

          // 提交按钮：紫粉渐变 + 悬浮放大阴影
          .submit-btn {
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            border: none;
            border-radius: 12px;
            padding: 10px 28px;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

            &:hover:not(:disabled) {
              transform: translateY(-2px);
              box-shadow: 0 8px 24px rgba(139, 92, 246, 0.35);
            }

            &:active:not(:disabled) {
              transform: translateY(0) scale(0.97);
            }

            &:disabled {
              background: linear-gradient(135deg, #c4b5fd 0%, #f9a8d4 100%);
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
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 头部浮动：使用 transform(GPU 合成层)替代 top(Layout)，零重排 */
@keyframes header-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(6px);
  }
}

@keyframes header-shimmer {
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

/* 图标圆形容器浮动 */
@keyframes icon-float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
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

/* 情绪卡片选中弹跳 */
@keyframes selected-bounce {
  0% {
    transform: scale(1);
  }

  40% {
    transform: scale(1.3);
  }

  70% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
  }
}

/* ==================== RESPONSIVE — 平板 ==================== */
@media (max-width: 991px) {
  .emotionDiary-container {
    .header-section {
      padding: 20px 24px 18px 52px;
      border-radius: 48px;

      .header-content {
        gap: 12px;

        .header-icon-circle {
          width: 44px;
          height: 44px;

          .header-icon {
            font-size: 22px;
          }
        }

        .header-text-group {
          h2 {
            font-size: 20px;
          }

          .header-desc {
            font-size: 12px;
            max-width: 280px;
          }
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
      padding: 18px 16px 14px 42px;
      border-radius: 36px;

      .header-content {
        gap: 10px;

        .header-icon-circle {
          width: 38px;
          height: 38px;

          .header-icon {
            font-size: 18px;
          }
        }

        .header-text-group {
          h2 {
            font-size: 18px;
          }

          .header-desc {
            font-size: 12px;
            max-width: none;
          }
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
      padding: 14px 12px 12px 34px;
      border-radius: 28px;

      .header-content {
        .header-icon-circle {
          width: 32px;
          height: 32px;

          .header-icon {
            font-size: 16px;
          }
        }

        .header-text-group {
          h2 {
            font-size: 16px;
          }

          .header-desc {
            font-size: 11px;
          }
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
      padding: 28px 64px 28px 68px;
      border-radius: 60px;

      .header-content {
        .header-icon-circle {
          width: 60px;
          height: 60px;

          .header-icon {
            font-size: 30px;
          }
        }

        .header-text-group {
          h2 {
            font-size: 26px;
          }

          .header-desc {
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
