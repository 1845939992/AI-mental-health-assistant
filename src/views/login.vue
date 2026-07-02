<template>
  <div class="container">
    <div class="title">
      <div class="back-home" @click="handleBackHome">
        <el-icon class="icon">
          <Back />
        </el-icon>
        <span>返回首页</span>
      </div>
      <div class="title-text">
        <h2>登录您的账户</h2>
        <p>输入您的用户名和密码以登录</p>
      </div>
    </div>
    <div class="form-container">
      <el-form :model="formData" ref="ruleFormRef" :rules="rules" label-position="top">
        <el-form-item label="用户名或邮箱" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名或邮箱" size="large" @keyup.enter="focusPassword" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input ref="passwordInputRef" v-model="formData.password" placeholder="请输入密码" size="large"
            @keyup.enter="submitForm" type="password" show-password />
        </el-form-item>
        <el-button class="btn" size="large" type="primary" @click="submitForm">登录</el-button>
      </el-form>
      <div class="footer">
        <p>还没有账号？<router-link to="/auth/register">注册</router-link></p>
      </div>
    </div>
  </div>
</template>
<script setup>
/**
 * 登录页面
 * 支持用户名/邮箱登录，成功后按 userType 分流：
 *   userType=1 → 前台首页 /home
 *   userType=2 → 后台看板 /back/dashboard
 * 用户信息通过 userStore 集中管理，不再直接操作 localStorage
 */
import { ArrowLeft, Back } from '@element-plus/icons-vue'
import { login } from '@/api/asmin'
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
const router = useRouter()
const userStore = useUserStore()
const formData = reactive({
  username: '',
  password: ''
})
const ruleFormRef = ref()
const passwordInputRef = ref() // 密码输入框引用，用于用户名回车后自动聚焦密码框
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})

// 用户名输入框回车时焦点切换到密码输入框
const focusPassword = () => {
  passwordInputRef.value?.focus()
}

const handleBackHome = () => {
  router.push('/home')
}

/**
 * 登录提交：
 * 1. 表单校验 → 2. 调用 login API → 3. 通过 userStore 集中存储 token + userInfo
 * → 4. 按 userType 分流路由（userType=2 管理端，否则前台首页）
 */
const submitForm = async () => {
  if (!ruleFormRef) return
  await ruleFormRef.value.validate((valid, fields) => {
    if (valid) {
      login(formData).then((data) => {
        if (!data.token) {
          return console.error('登录失败')
        }
        else {
          // 通过 userStore 集中管理登录态（不再直接操作 localStorage）
          userStore.setLoginData(data)
          // 根据用户角色决定跳转的路径
          if (data.userInfo.userType === 2) {
            router.push('/back')
          }
          else {
            router.push('/home')
          }
        }
      }).catch((error) => {
        console.error('登录请求失败', error)
        ElMessage.error('登录失败，请检查用户名或密码')
      })
    }
  })
}


</script>
<style scoped lang="scss">
// ============================================================
//  Login — 登录页表单样式
//  窄卡片居中布局，包含返回首页、标题、表单卡片、底部链接
//  统一按钮交互 + 表单淡入动画 + 输入框焦点光晕
// ============================================================

$primary: #6366F1;

@keyframes formFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.container {
  width: 384px;

  .title {
    text-align: center;

    .back-home {
      margin-bottom: 48px;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      color: #6b7280;
      transition: color 0.2s, transform 0.2s;

      &:hover {
        color: $primary;
        transform: translateX(-3px);
      }

      &:active {
        transform: translateX(-3px) scale(0.95);
      }
    }

    .title-text {
      text-align: center;

      h2 {
        font-size: 36px;
        margin-bottom: 10px;
        /* 靛蓝紫渐变标题，与全局主题统一 */
        background: linear-gradient(135deg, $primary 0%, #8b5cf6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      p {
        font-size: 18px;
        color: #6b7280;
      }
    }
  }

  .form-container {
    margin-top: 36px;
    /* 半透明卡片背景，增强视觉层次 */
    padding: 32px 28px;
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(8px);
    border-radius: 16px;
    border: 1px solid rgba(99, 102, 241, 0.08);
    box-shadow: 0 4px 24px rgba(99, 102, 241, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
    /* 表单淡入动画 */
    animation: formFadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;

    /* 表单项间距优化 */
    :deep(.el-form-item) {
      margin-bottom: 22px;
    }

    /* 输入框焦点：靛蓝光晕边框 */
    :deep(.el-input__wrapper) {
      transition: box-shadow 0.3s ease;
      border-radius: 8px;

      &.is-focus {
        box-shadow: 0 0 0 1px $primary inset;
      }
    }

    .btn {
      margin-top: 32px;
      width: 100%;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
      }

      &:active {
        transform: translateY(0) scale(0.97);
        transition: transform 0.1s ease;
      }
    }

    .footer {
      padding: 18px 0 4px;
      text-align: center;

      a {
        color: $primary;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;

        &:hover {
          color: #4F46E5;
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
