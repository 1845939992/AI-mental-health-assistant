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
<style  lang="scss" scoped>
/**
 * 后台布局样式
 * 全屏高度 + 左侧固定侧边栏 + 右侧弹性内容区
 */
.backend-layout {
  width: auto;
  min-height: auto;
  height: 100vh; /* 撑满视口高度，防止内容不足时页面塌陷 */

  .el-header {
    height: 74px !important; /* 覆盖 Element Plus 默认 header 高度 */
  }

  .main-container {
    height: 100%;
    background-color: #efeff0; /* 整体浅灰底色，与白色内容区形成层次 */

    .content-container {
      padding: 15px;
      background-color: #fff;
      min-height: calc(100% - 64px); /* 保证内容区至少填满剩余高度 */
    }
  }

  .navbar-header {
    padding: 0 !important; /* 消除 Element Plus 默认 header 内边距 */
  }
}
</style>