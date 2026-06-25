<template>
  <div class="auth-layout">
    <div class="left-section">
      <div class="content">
        <h2 class="title">AI心理助手</h2>
        <div class="divider" />
        <p class="text">每个深夜，每个焦虑的时刻，我们都在这里。不必独自承受，让心与心的连接温暖您的每一天</p>
        <div class="robot">
          <el-image :src="logoUrl" alt="robot" fit="contain" style="width: 120px; height: 120px;" />
        </div>
      </div>
    </div>
    <div class="right-section">
      <router-view></router-view>
    </div>
  </div>
</template>
<script setup>
/**
 * 认证页公共布局（登录 / 注册）
 * 左右分屏：左侧展示品牌文案与 Logo，右侧通过 router-view 渲染登录/注册表单
 * 移动端自动切换为上下堆叠布局，并减少动画以提升可访问性
 */
const logoUrl = new URL('../assets/logo.png', import.meta.url).href

</script>
<style scoped lang="scss">
// ============================================================
//  AuthLayout — 登录/注册页面公共布局
//  结构: 左侧品牌文案 + 右侧表单，移动端上下堆叠
// ============================================================

// -- 设计令牌 -------------------------------------------------
$color-accent: #d4a574;
$color-text: #2c2418;
$color-muted: #8a8076;

// -- 入场动画关键帧 ------------------------------------------
@keyframes fadeRiseIn {
  0% {
    opacity: 0;
    transform: translateY(24px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes softReveal {
  0%   { opacity: 0; transform: scale(0.92); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes gentleFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}

@keyframes strokeExtend {
  0%   { width: 0; opacity: 0; }
  100% { width: 56px; opacity: 1; }
}

@keyframes slideInRight {
  0% {
    opacity: 0;
    transform: translateX(40px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes lineGrowVertical {
  0%   { height: 0; opacity: 0; }
  100% { height: 280px; opacity: 1; }
}

// -- 根容器：全屏水平分屏 --
.auth-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
  background: #ffffff;
}

// -- 左侧品牌区域：装饰角标 + 品牌文案 + Logo --
.left-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 56px;
    right: 64px;
    width: 28px;
    height: 28px;
    border-top: 1px solid #e8e0d5;
    border-right: 1px solid #e8e0d5;
    opacity: 0;
    animation: fadeIn 0.9s 0.6s ease-out forwards;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 64px;
    left: 72px;
    width: 48px;
    height: 48px;
    border-bottom: 1px solid #d4ccc0;
    border-left: 1px solid #d4ccc0;
    opacity: 0;
    animation: fadeIn 0.9s 0.75s ease-out forwards;
  }
}

// -- 品牌文案居中卡片 --
.content {
  // 品牌文案居中卡片，限制最大宽度保证可读性
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 48px;
  max-width: 400px;
  position: relative;
  z-index: 2;

  &::before {
    content: '';
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 1px;
    background: #d4a574;
    animation: strokeExtend 0.8s 0.25s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  }
}

.title {
  // 品牌大标题：带字间距与淡入动画
  color: $color-text;
  font-size: 38px;
  font-weight: 500;
  letter-spacing: 10px;
  margin: 0;
  line-height: 1.25;
  opacity: 0;
  animation: fadeRiseIn 1s 0.2s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;

  &::after {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #d4a574;
    margin: 16px auto 0;
    opacity: 0;
    animation: fadeIn 0.6s 0.55s ease-out forwards;
  }
}

.divider {
  // 标题与文案之间的装饰分割线
  width: 48px;
  height: 1px;
  background: $color-accent;
  border: none;
  margin: 4px 0 0;
  flex-shrink: 0;
  opacity: 0;
  animation: fadeIn 0.6s 0.35s ease-out forwards;
}

// -- 品牌副文案 --
.text {
  color: $color-muted;
  font-size: 14px;
  line-height: 2.2;
  text-align: center;
  max-width: 300px;
  margin: 0;
  letter-spacing: 2px;
  opacity: 0;
  animation: fadeRiseIn 0.9s 0.45s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;

  &::after {
    content: '';
    display: block;
    width: 18px;
    height: 1px;
    background: #e0d6c8;
    margin: 20px auto 0;
  }
}

// -- 品牌 Logo 浮动动画 --
.robot {
  margin-top: 4px;
  position: relative;
  opacity: 0;
  animation: softReveal 0.8s 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;

  :deep(.el-image) {
    width: 110px !important;
    height: 110px !important;
  }
}

// -- 右侧表单区域：从右侧滑入，带中线分隔 --
.right-section {
  // 右侧表单区域：从右侧滑入
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  position: relative;
  opacity: 0;
  animation: slideInRight 0.9s 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 0;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(212, 165, 116, 0.25) 15%,
      rgba(212, 165, 116, 0.4) 50%,
      rgba(212, 165, 116, 0.25) 85%,
      transparent 100%
    );
    animation: lineGrowVertical 1s 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  }

  &::after {
    content: '';
    position: absolute;
    top: 48px;
    left: 48px;
    width: 10px;
    height: 10px;
    background: #d4a574;
    opacity: 0;
    animation: fadeIn 0.6s 0.8s ease-out forwards;
  }
}

// -- 移动端适配：左右布局改为上下堆叠 --
@media (max-width: 768px) {
  .auth-layout {
    flex-direction: column;
  }

  .left-section {
    flex: 0 0 auto;
    padding: 32px 24px 16px;

    &::before,
    &::after {
      display: none;
    }
  }

  .right-section {
    flex: 1;
    animation: fadeRiseIn 0.8s 0.4s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;

    &::before,
    &::after {
      display: none;
    }
  }

  .content {
    padding: 24px;
    gap: 12px;

    &::before {
      top: 8px;
    }
  }

  .title {
    font-size: 28px;
    letter-spacing: 6px;
  }

  .text {
    font-size: 13px;
    letter-spacing: 1.2px;
    max-width: 260px;
  }

  .robot {
    :deep(.el-image) {
      width: 80px !important;
      height: 80px !important;
    }
  }
}

// -- 减少动画偏好：关闭所有动画，提升可访问性 --
@media (prefers-reduced-motion: reduce) {
  .left-section,
  .right-section,
  .title,
  .divider,
  .text,
  .robot,
  .content::before,
  .right-section::before,
  .right-section::after {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }

  .right-section::before {
    height: 280px;
  }
}
</style>
