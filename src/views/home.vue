<template>
  <div class="home-container">
    <div class="content">
      <!-- 左侧：品牌 Logo -->
      <div class="robot">
        <el-image :src="logoUrl" alt="AI Mental Health Assistant" class="robot-image" />
      </div>
      <!-- 右侧：文字区域 -->
      <div class="text">
        <h1 class="title">
          一次温暖的对话<br />
          <span class="highlight-text">化孤独为慰藉</span>
        </h1>
        <p class="description">
          每个深夜，每个焦虑的时刻，我们都在这里。不必独自承受，让心与心的连接温暖您的每一天
        </p>
        <div class="hero-actions">
          <el-button size="large" type="primary" class="hero-btn hero-btn--primary">开始倾诉，获得陪伴</el-button>
          <el-button size="large" class="hero-btn hero-btn--ghost">记录心情，释放情感</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'

const logoUrl = ref(new URL('../assets/logo.png', import.meta.url).href)

</script>

<style scoped lang="scss">
// ============================================================
//  Home — 首页 Hero 区域
//  布局: 左 Logo + 右文字，页面居中
// ============================================================

// -- 设计令牌 -------------------------------------------------
$color-primary:   #4A90E2;
$color-text:      #1F2937;
$color-muted:     #6B7280;
$color-accent:    #6366F1;
$color-rose:      #EC4899;
$max-width:       1120px;
$transition:      0.3s cubic-bezier(0.4, 0, 0.2, 1);

// -- 入场动画 -------------------------------------------------
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes popIn {
  0%   { opacity: 0; transform: scale(0.85); }
  70%  { transform: scale(1.03); }
  100% { opacity: 1; transform: scale(1); }
}

// ============================================================
//  容器 — 全屏居中
// ============================================================
.home-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px); // 减去导航栏高度
  margin: -32px -20px -48px;      // 抵消父 .main-content 的 padding，白色全覆盖
  padding: 40px 32px;
  background: white;
}

// ============================================================
//  内容区 — Logo 左 + 文字右，紧凑排列
// ============================================================
.content {
  display: flex;
  align-items: center;
  gap: 48px;
  max-width: $max-width;
}

// ============================================================
//  左侧 — Logo（先入场）
// ============================================================
.robot {
  flex-shrink: 0;
  animation: popIn 0.7s $transition both; // 弹入效果
}

.robot-image {
  width: 240px;
  height: 240px;

  :deep(img) {
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(99, 102, 241, 0.12);
  }
}

// ============================================================
//  右侧 — 文字（Logo 之后入场）
// ============================================================
.text {
  max-width: 520px; // 限制文字宽度，与 Logo 组合后整体视觉居中
  animation: fadeUp 0.7s $transition 0.2s both;
}

.title {
  margin: 0;
  font-size: 44px;
  font-weight: 800;
  line-height: 1.25;
  color: $color-text;
  letter-spacing: -0.03em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.06); // 微阴影增加立体感
}

// 渐变高亮文字 — 紫→蓝→青 三色渐变 + 发光阴影
.highlight-text {
  background: linear-gradient(
    135deg,
    $color-accent 0%,
    $color-primary 40%,
    #06B6D4 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  // 模拟发光：在渐变文字下方叠加一层半透明投影
  filter: drop-shadow(0 2px 6px rgba(99, 102, 241, 0.3));
}

.description {
  margin: 20px 0 0;
  max-width: 480px;
  font-size: 17px;
  font-weight: 400;
  line-height: 1.7;
  color: #4B5563; // 比纯灰深一点，提升可读性
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-top: 36px;
}

// ============================================================
//  按钮
// ============================================================
.hero-btn {
  transition: transform $transition, box-shadow $transition;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(74, 144, 226, 0.3);
  }

  &:active {
    transform: translateY(0) scale(0.97);
    transition: transform 0.1s ease;
  }
}

.hero-btn--ghost {
  border-color: $color-primary;
  color: $color-primary;
  background: transparent;

  &:hover {
    background: rgba(74, 144, 226, 0.06);
    color: $color-primary;
  }
}

// ============================================================
//  响应式 — 平板
// ============================================================
@media (max-width: 991px) {
  .home-container {
    margin: -24px -16px -40px; // 匹配平板 .main-content padding
  }

  .content {
    gap: 36px;
  }

  .title {
    font-size: 34px;
  }

  .description {
    font-size: 15px;
    max-width: 400px;
  }

  .robot-image {
    width: 180px;
    height: 180px;
  }

  .hero-actions {
    margin-top: 28px;
  }
}

// ============================================================
//  响应式 — 手机：垂直堆叠，Logo 在上
// ============================================================
@media (max-width: 767px) {
  .home-container {
    padding: 32px 20px;
    min-height: calc(100vh - 56px);
    margin: -20px -12px -32px; // 匹配手机 .main-content padding
  }

  .content {
    flex-direction: column; // Logo 在上，文字在下
    gap: 28px;
    text-align: center;
  }

  .text {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .title {
    font-size: 28px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }

  .description {
    font-size: 14px;
    max-width: 320px;
    margin-top: 14px;
  }

  .robot-image {
    width: 140px;
    height: 140px;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
    max-width: 280px;
    gap: 12px;
    margin-top: 24px;
  }

  .hero-btn {
    width: 100%;
  }
}
</style>