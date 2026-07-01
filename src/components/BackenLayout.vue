<template>
  <!--
    后台管理端通用布局壳层
    结构：左侧 Sidebar 侧边导航 + 右侧（顶部 Navbar 导航栏 + 下方 router-view 内容区）
    所有 /back/* 路由的子页面均在此布局内渲染
  -->
  <div class="backend-layout">
    <el-container class="main-container">
      <Sidebar />
      <el-container>
        <el-header class="navbar-header">
          <Navbar />
        </el-header>
        <el-main class="main-content">
          <!-- 子路由出口：根据当前路径渲染对应的管理页面 -->
          <router-view class="content-container">
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script setup>
/** 后台布局外壳：仅引入侧边栏和导航栏两个子组件，业务页面由 router-view 动态渲染 */
import Sidebar from '@/components/Sidebar.vue'
import Navbar from '@/components/Navbar.vue'

</script>
<style lang="scss" scoped>
/**
 * 后台布局样式
 * 全屏高度 + 左侧固定侧边栏 + 右侧弹性内容区
 * 渐变背景 + 卡片化内容区，主题色: #6366F1
 */
.backend-layout {
  width: auto;
  min-height: auto;
  height: 100vh;
  /* 撑满视口高度，防止内容不足时页面塌陷 */

  .el-header {
    height: 74px !important;
    /* 覆盖 Element Plus 默认 header 高度 */
  }

  .main-container {
    height: 100%;
    /* 柔和渐变背景：径向光斑 + 线性渐变，营造层次感 */
    background:
      radial-gradient(ellipse 60% 50% at 20% 0%, rgba(99, 102, 241, 0.04), transparent),
      radial-gradient(ellipse 50% 40% at 80% 100%, rgba(99, 102, 241, 0.03), transparent),
      linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%);

    .content-container {
      padding: 20px;
      margin: 8px 16px 16px 8px;
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
      min-height: calc(100% - 80px);
      /* 保证内容区至少填满剩余高度 */
    }
  }

  .navbar-header {
    padding: 0 !important;
    /* 消除 Element Plus 默认 header 内边距 */
  }
}
</style>