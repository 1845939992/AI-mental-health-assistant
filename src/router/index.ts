import { createRouter, createWebHistory } from 'vue-router'
import BackenLayout from '@/components/BackenLayout.vue'
import { timePickerDefaultProps } from 'element-plus'

const backendRoutes = [{
  path: '/back',
  component: BackenLayout,
  children: [
    {
      path: 'dashboard',
      component: () => import('@/views/dashboard.vue'),
      meta:{
        title:'数据分析',
        icon:'PieChart'
      }
    },
    {
      path: 'knowledge',
      component: () => import('@/views/knowledge.vue'),
      meta:{
        title:'知识文章',
        icon:'ChatLineRound'
      }
    },
    {
      path: 'cunsulations',
      component: () => import('@/views/cunsulations.vue'),
      meta:{
        title:'咨询记录',
        icon:'Message'
      }
    },
    {
      path: 'emotional',
      component: () => import('@/views/emotional.vue'),
      meta:{
        title:'情绪日志',
        icon:'User'
      }
    },
  ]
}]

const router = createRouter({
  history: createWebHistory(),
  routes: backendRoutes
})

export default router