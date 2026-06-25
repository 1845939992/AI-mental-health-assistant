<template>
<div class="navbar" >
<div class="flex-box">
    <el-button @click="handleCollapse">
      <el-icon><Expand /></el-icon>
    </el-button>
<p class="page-title">{{ route.meta.title }}</p>
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


<script setup>
/**
 * 后台导航栏组件
 * 左侧：折叠/展开侧边栏按钮 + 当前路由标题
 * 右侧：用户头像下拉菜单（退出登录），确认后调用 logout API 并清除 token
 */
import { useAdminStore } from '@/stores/admin'
import { ElMessage } from 'element-plus'
import { logout } from '@/api/asmin'
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const adminStore = useAdminStore()

const router = useRouter()
const route = useRoute()

/** 下拉菜单命令处理：点击退出登录 → 确认弹窗 → 调用 logout API → 清 token → 跳登录页 */
const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      logout().then(() => {
        // 清空本地存储中的 token 和 userInfo
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        ElMessage.success('退出登录成功')
        router.push('/auth/login')
      })
    }).catch(() => {
      ElMessage.info('已取消退出登录')
    })
  }
}

/** 切换侧边栏折叠状态（由 Pinia store 统一管理） */
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
color: #1f2937;
}
</style>
