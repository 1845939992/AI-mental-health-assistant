<template>
<div class="navbar" >
<div class="flex-box">
    <el-button>
      <el-icon @click="handleCollapse"><Expand /></el-icon>
    </el-button>
<p class="page-title">导航栏</p>
</div>
<div class="flex-box">
<el-dropdown @command="handleCommand">
    <div class="flex-box">
      <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" alt="avatar" />
      <p class="user-name">用户</p>
      <el-icon><ArrowDown /></el-icon>
    </div>
  <template #dropdown>
    <el-button>
      <el-dropdown-menu>
        <el-dropdown-item command="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </el-button>
  </template>
</el-dropdown>
</div>
</div>
</template>


<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { computed } from 'vue'// 计算属性
const adminStore = useAdminStore()

const router = useRouter()

const handleCommand = (command: string) => {
  if (command === 'logout') {

}
}


const handleCollapse = () => {
  adminStore.toCollapse()
}
</script>

<style  lang="scss" scoped>
.navbar {
height: 100%;
display: flex;
align-items: center;
justify-content: space-between;
background: white;
box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
border-bottom: 1px solid #e5e7eb;
}
.flex-box {
display: flex;
align-items: center;
justify-content: center;
}
.page-title {
margin-left: 20px;
font-size: 26px;
font-weight: bold;
color: □#1f2937;
}
</style>
