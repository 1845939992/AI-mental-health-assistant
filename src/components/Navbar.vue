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
import { useAdminStore } from '@/stores/admin'
import { ElMessage } from 'element-plus'
import { logout } from '@/api/asmin'
import { computed } from 'vue'// 计算属性
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const adminStore = useAdminStore()

const router = useRouter()
const route = useRoute()
 
const handleCommand = (command) => {
  if (command === 'logout') {
// 确认退出登录 并调用退出登录接口
    ElMessageBox.confirm('确定退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      logout().then(() => {
        // 退出登录成功后，清空本地存储中的token和userInfo信息
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        ElMessage.success('退出登录成功')
        router.push('/auth/login' )
      })
    }).catch(() => {
      ElMessage.info('已取消退出登录')
    })
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
color: #1f2937;
}
</style>
