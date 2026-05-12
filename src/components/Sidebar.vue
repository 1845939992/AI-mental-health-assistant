 <template>
 <el-aside width="264px">
 <el-menu
        default-active="2"
        class="menu-style"
      >
      <div class="brand">
        <el-image :src="logoUrl" alt="logo" class="logo"/>
        <div class="info-card">
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

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

 const logoUrl = new URL('../assets/logo.png', import.meta.url).href

const selectMenu = (path: string) => {
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
