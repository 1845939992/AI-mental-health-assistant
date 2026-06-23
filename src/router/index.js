// 网络层路由选择
import { createRouter, createWebHistory } from 'vue-router'
import BackenLayout from '@/components/BackenLayout.vue'
import FrontendLayout from '@/components/FrontendLayout.vue'
//后台路由
const backendRoutes = [
  {
    path: '/back',
    redirect: '/back/dashboard',// 默认跳转到数据分析页面
    component: BackenLayout,
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard.vue'),
        meta: {
          title: '数据分析',
          icon: 'PieChart'
        }
      },
      {
        path: 'knowledge',
        component: () => import('@/views/knowledge.vue'),
        meta: {
          title: '知识文章',
          icon: 'ChatLineRound'
        }
      },
      {
        path: 'cunsulations',
        component: () => import('@/views/cunsulations.vue'),
        meta: {
          title: '咨询记录',
          icon: 'Message'
        }
      },
      {
        path: 'emotional',
        component: () => import('@/views/emotional.vue'),
        meta: {
          title: '情绪日志',
          icon: 'User'
        }
      },
    ]
  },
  {
    path: '/auth',
    component: () => import('@/components/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        component: () => import('@/views/login.vue'),
        meta: {
          title: '登录',
          icon: 'Login'
        }
      },
      {
        path: 'register',
        component: () => import('@/views/register.vue'),
        meta: {
          title: '注册',
          icon: 'User'
        }
      },
    ]

  }]
//前台路由
const frontendRoutes = [
  {
    path: '/',
    redirect: '/home',
    component: FrontendLayout,
    children: [
      {
        path: 'home',
        component: () => import('@/views/home.vue'),
        meta: {
          title: '首页',
          icon: 'Home'
        }
      },
      {
        path: 'ai-cunsulations',
        component: () => import('@/views/ai-cunsulations.vue'),
        meta: {
          title: 'AI咨询',
          icon: 'Message'
        }
      },
      {
        path: 'emotion-diary',
        component: () => import('@/views/emotion-diary.vue'),
        meta: {
          title: '情绪日记',
          icon: 'User'
        }
      },
      {
        path: 'f-knowledge',
        component: () => import('@/views/f-knowledge.vue'),
        meta: {
          title: '知识库',
          icon: 'ChatLineRound'
        }
      },
      {
        path: 'f-knowledge/article/:id',
        component: () => import('@/views/articleDetail.vue'),
        meta: {
          title: '知识库文章详情',
          icon: 'ChatLineRound'
        }
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...backendRoutes, ...frontendRoutes]
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/auth/login' || to.path === '/auth/register') {
    next()
  } else {
    const token = localStorage.getItem('token')
    //是否登录
    if (token) {
      //是否是后台用户
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      //是后台用户
      if (userInfo.userType === 2) {
        if (to.path.startsWith('/back')) {
          next()
        } else {
          next('/back/dashboard')
        }
        //前台用户
      } else if (userInfo.userType === 1) {
        if (to.path.startsWith('/back') || to.path.startsWith('/auth')) {
          next('/')
        } else {
          next()
        }
      }
    } else {
      next()
    }
  }
})

export default router
