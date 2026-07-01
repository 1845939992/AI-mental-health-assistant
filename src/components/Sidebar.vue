<template>
  <el-aside :width="isCollapse ? '64px' : '264px'">
    <el-menu :collapse="isCollapse" :collapse-transition="false" :default-active="activeMenu" class="menu-style">
      <div class="brand">
        <el-image :src="logoUrl" alt="logo" class="logo" />
        <div class="info-card" v-show="!isCollapse">
          <h1 class="brand-title">心理健康AI助手</h1>
          <p class="brand-subtitle">管理后台</p>
        </div>
      </div>
      <el-menu-item @click="selectMenu(item.path)" v-for="item in router.options.routes[0]?.children ?? []"
        :key="item.path" :index="item.path">
        <el-icon>
          <component :is="item.meta?.icon" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup>
/**
 * 后台侧边栏组件
 * 根据路由配置动态生成菜单项，支持折叠/展开（由 Pinia adminStore 控制）
 * activeMenu 从当前路由 path 的最后一段提取，与菜单 index 匹配实现高亮
 */
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()
const logoUrl = new URL('../assets/logo.png', import.meta.url).href

const adminStore = useAdminStore()
// 响应式折叠状态，由 Pinia store 驱动
const isCollapse = computed(() => adminStore.isCollapse)
// 从当前路由提取子路径，与菜单 index 匹配实现选中高亮
const activeMenu = computed(() => route.path.split('/').pop())

/** 点击菜单项：跳转到对应后台子页面 */
const selectMenu = (path) => {
  const currentRouter = router.options.routes[0]
  router.push(`${currentRouter?.path ?? ''}/${path}`)
}
</script>

<style lang="scss" scoped>
.menu-style {
  height: 100%;
  /* 侧边栏整体背景渐变 */
  background: linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%);

  .brand {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 16px 0;
    border-bottom: 1px solid #e5e7eb;
    /* 品牌区柔和渐变背景 */
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(99, 102, 241, 0.02) 100%);

    .logo {
      :deep(.el-image__inner) {
        width: 56px;
        height: 56px;
      }
    }

    .info-card {
      .brand-title {
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 4px;
        color: #1F2937;
      }

      .brand-subtitle {
        font-size: 12px;
        color: #6B7280;
      }
    }
  }
}

/* -- 菜单项样式覆盖 ---------------------------------------- */
:deep(.el-menu-item) {
  margin: 2px 8px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  color: #6B7280;

  /* 悬浮：浅靛蓝背景 + 微微右移 */
  &:hover {
    background: #EEF2FF !important;
    color: #6366F1;
    transform: translateX(2px);
  }

  /* 激活态：靛蓝浅色背景 + 左侧指示条 */
  &.is-active {
    background: linear-gradient(90deg, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.04) 100%) !important;
    color: #6366F1;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      border-radius: 0 3px 3px 0;
      background: #6366F1;
    }

    .el-icon {
      color: #6366F1;
    }
  }
}

/* 折叠状态：图标居中 */
.el-menu--collapse {
  :deep(.el-menu-item) {
    margin: 2px 6px;
    justify-content: center;

    &.is-active::before {
      left: 1px;
    }
  }
}
</style>
