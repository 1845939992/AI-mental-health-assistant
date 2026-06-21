 <template>
 <el-aside :width="isCollapse ? '64px' : '264px'">
 <el-menu
        :collapse="isCollapse"
        :collapse-transition="false"
        :default-active="activeMenu"
        class="menu-style"
      >
      <div class="brand">
        <el-image :src="logoUrl" alt="logo" class="logo"/>
        <div class="info-card" v-show="!isCollapse">
          <h1 class="brand-title">心理健康AI助手</h1>
          <p class="brand-subtitle">管理后台</p>
        </div>
      </div>
        <el-menu-item @click="selectMenu(item.path)" v-for="item in router.options.routes[0]?.children ?? []" :key="item.path" :index="item.path">
          <el-icon><component :is="item.meta?.icon" /></el-icon>
          <span>{{ item.meta?.title }}</span>
        </el-menu-item>
      </el-menu>
 </el-aside>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { computed } from 'vue'// 计算属性

const router = useRouter()
const route = useRoute()
const logoUrl = new URL('../assets/logo.png', import.meta.url).href

const adminStore = useAdminStore()
const isCollapse = computed(() => adminStore.isCollapse)// 计算属性，监听adminStore.isCollapse变化
const activeMenu = computed(() => route.path.split('/').pop())// 从当前路由提取子路径，与菜单 index 匹配

const selectMenu = (path) => {
const currentRouter = router.options.routes[0]
router.push(`${currentRouter?.path ?? ''}/${path}`)
}
</script>

<style  lang="scss" scoped>
.menu-style {
height: 100%;
.brand {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  border-bottom: 1px solid #e4e7ed;
  background-color: rgba(209, 209, 209, 0.094);
  .logo {
  :deep(.el-image__inner) {
    width: 60px;
    height: 60px;
  }
}
.info-card {
 .brand-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
}
.brand-subtitle {
  font-size: 14px;
  color: #999;
}
}
}
}
</style>
