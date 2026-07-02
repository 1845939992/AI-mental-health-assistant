<template>
  <div class="frontend-layout">
    <!-- 头部：固定导航栏 -->
    <header class="navbar-container">
      <div class="brand-section">
        <router-link to="/home" class="brand-link">
          <el-image :src="logoUrl" fit="contain" alt="AI Mental Health Assistant" class="logo" />
        </router-link>
        <span class="brand-name">AI Mental Health Assistant</span>
      </div>
      <nav class="nav-section">
        <router-link to="/home" class="nav-link">首页</router-link>
        <router-link to="/ai-cunsulations" v-if="isLoggedIn" class="nav-link">AI咨询</router-link>
        <router-link to="/emotion-diary" v-if="isLoggedIn" class="nav-link">情绪日记</router-link>
        <router-link to="/f-knowledge" class="nav-link">知识库</router-link>
        <template v-if="isLoggedIn">
          <el-button type="primary" @click="handleLogout" class="logout-btn">退出登录</el-button>
        </template>
        <template v-else>
          <router-link to="/auth/login" class="nav-link nav-link--auth">
            <el-button type="primary" size="small">登录</el-button>
          </router-link>
          <router-link to="/auth/register">
            <el-button type="primary" size="small">注册</el-button>
          </router-link>
        </template>
      </nav>
    </header>

    <!-- 正文：自适应撑满 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 底部 -->
    <footer class="footer-container">
      <p>&copy; 2026 AI Mental Health Assistant</p>
    </footer>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/api/asmin'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const logoUrl = ref(new URL('../assets/logo.png', import.meta.url).href)
// 登录态从 userStore 派生，响应式自动同步
const isLoggedIn = computed(() => userStore.isLoggedIn)

const handleLogout = () => {
  logout()
    .then(() => {
      // 通过 userStore 统一清除登录态
      userStore.logout()
      router.push('/auth/login')
    })
}

</script>

<style scoped lang="scss">
// ============================================================
//  FrontendLayout — 前台页面外壳
//  结构: sticky-header → main(flex:1) → footer
// ============================================================

// -- 设计令牌 -------------------------------------------------
$nav-height: 64px;
$max-width: 1200px;
$color-primary: #6366F1;
$color-text: #1F2937;
$color-muted: #6B7280;
$color-bg: #FFFFFF;
$color-border: #F3F4F6;
$transition: 0.2s ease;
$transition-slow: 0.35s cubic-bezier(0.4, 0, 0.2, 1);

// ============================================================
//  关键帧动画
// ============================================================
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes underlineGrow {
  from {
    transform: translateX(-50%) scaleX(0);
  }

  to {
    transform: translateX(-50%) scaleX(1);
  }
}

// ============================================================
//  根容器 — 全高 flex 列布局
// ============================================================
.frontend-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #F9FAFB;
  overflow-x: hidden;
}

// ============================================================
//  头部 — sticky 固定 + 入场滑入动画
// ============================================================
.navbar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $nav-height;
  padding: 0 32px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid $color-border;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
  min-width: 0; // flex 子元素允许收缩

  // 入场：从顶部滑入
  animation: slideDown 0.5s $transition-slow both;
}

// ============================================================
//  品牌区域
// ============================================================
.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-link {
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: transform $transition-slow, box-shadow $transition-slow;

  &:hover {
    transform: scale(1.06);
  }

  &:active {
    transform: scale(0.96);
  }
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  transition: box-shadow $transition-slow;

  .brand-link:hover & {
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
  }
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  color: $color-text;
  letter-spacing: -0.01em;
  white-space: nowrap;
  animation: fadeIn 0.6s ease 0.15s both;
}

// ============================================================
//  导航链接区
// ============================================================
.nav-section {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-shrink: 0; // 导航区优先保持完整
  min-width: 0; // 允许内容截断

  // 高缩放级别时自动换行
  flex-wrap: wrap;
  justify-content: flex-end;
}

.nav-link {
  position: relative;
  font-size: 15px;
  font-weight: 500;
  color: $color-muted;
  text-decoration: none;
  transition: color $transition, transform 0.15s ease;
  white-space: nowrap;

  // 各链接依次淡入
  animation: fadeUp 0.45s ease both;

  &:nth-child(1) {
    animation-delay: 0.1s;
  }

  &:nth-child(2) {
    animation-delay: 0.17s;
  }

  &:nth-child(3) {
    animation-delay: 0.24s;
  }

  &:nth-child(4) {
    animation-delay: 0.31s;
  }

  &:hover {
    color: $color-primary;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  // 当前路由激活态 — 文字变色 + 底部短线（展开动画）
  &.router-link-active {
    color: $color-primary;

    &::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      width: 20px;
      height: 3px;
      border-radius: 2px;
      background: $color-primary;
      transform-origin: center;
      animation: underlineGrow 0.3s $transition-slow both;
    }
  }
}

.nav-link--auth {
  margin-right: 4px;
}

// ============================================================
//  按钮 — 悬浮上浮 + 点击按压反馈
// ============================================================
.logout-btn {
  margin-left: 8px;
  transition: transform $transition-slow, box-shadow $transition-slow;
  animation: fadeUp 0.45s ease 0.38s both;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
  }

  &:active {
    transform: translateY(0) scale(0.97);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
    transition: transform 0.1s ease, box-shadow 0.1s ease;
  }
}

// 注册按钮同上
.nav-section>a>.el-button {
  transition: transform $transition-slow, box-shadow $transition-slow;
  animation: fadeUp 0.45s ease 0.38s both;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
  }

  &:active {
    transform: translateY(0) scale(0.97);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
    transition: transform 0.1s ease, box-shadow 0.1s ease;
  }
}

// ============================================================
//  正文 — 弹性撑满，内容居中（淡入上浮入场）
// ============================================================
.main-content {
  flex: 1;
  width: 100%;
  margin: 0 auto;
  padding: calc($nav-height + 32px) 20px 48px;

  animation: fadeUp 0.5s $transition-slow 0.2s both;
}

// ============================================================
//  底部 — 淡入
// ============================================================
.footer-container {
  padding: 24px 0;
  text-align: center;
  background: $color-text;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  letter-spacing: 0.02em;

  animation: fadeIn 0.5s ease 0.35s both;
}

// ============================================================
//  高分辨率大屏优化
// ============================================================
@media (min-width: 1600px) {
  .navbar-container {
    padding: 0 64px;
  }
}

// ============================================================
//  响应式 — 平板横屏 / 窄桌面 (≤1200px)
// ============================================================
@media (max-width: 1200px) {
  .nav-section {
    gap: 24px;
  }

  .main-content {
    padding: calc($nav-height + 28px) 20px 44px;
  }
}

// ============================================================
//  响应式 — 平板竖屏 (≤991px)
// ============================================================
@media (max-width: 991px) {
  .navbar-container {
    padding: 0 20px;
  }

  .nav-section {
    gap: 18px;
  }

  .nav-link {
    font-size: 14px;
  }

  .brand-name {
    font-size: 16px;
  }

  .main-content {
    padding: calc($nav-height + 24px) 16px 40px;
  }
}

// ============================================================
//  响应式 — 手机横屏 / 平板小屏 (≤767px)
// ============================================================
@media (max-width: 767px) {
  .navbar-container {
    height: auto;
    min-height: 56px;
    padding: 10px 16px;
    flex-wrap: wrap;
    gap: 8px;
    row-gap: 8px;
  }

  .brand-name {
    display: none;
  }

  .nav-section {
    gap: 10px;
  }

  .nav-link {
    font-size: 13px;

    &.router-link-active::after {
      bottom: -4px;
      width: 16px;
      height: 2px;
    }
  }

  .main-content {
    padding: calc(56px + 20px) 12px 32px;
  }

  .footer-container {
    padding: 18px 12px;
    font-size: 12px;
  }
}

// ============================================================
//  响应式 — 小手机 (≤480px) — 导航紧凑排列
// ============================================================
@media (max-width: 480px) {
  .navbar-container {
    padding: 8px 10px;
    justify-content: center;
  }

  .brand-section {
    flex-shrink: 0;
  }

  .nav-section {
    gap: 8px;
    justify-content: center;
  }

  .nav-link {
    font-size: 12px;
  }

  .logout-btn,
  .nav-section>a>.el-button {
    font-size: 12px;
  }
}
</style>
