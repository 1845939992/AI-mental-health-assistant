<template>
  <div class="backend-layout">
    <el-container class="main-container">
       <Sidebar />
      <el-container>
        <el-header class="navbar-header">
          <Navbar />
        </el-header>
        <el-main class="main-content">
          <router-view class="content-container">
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import Navbar from '@/components/Navbar.vue'

</script>
<style  lang="scss" scoped>
.backend-layout {
  width: auto;
  min-height: auto;
  height: 100vh;
  .el-header {
    height: 74px !important;
  }
.main-container {
  height: 100%;
  background-color: #e1e4e7;
  .content-container {
    padding: 15px;// 内容区域内边距为15px
    background-color: #fff;
    min-height: calc(100% - 64px);
  }
}
.navbar-header {
  padding: 0 !important;
}
}
</style>