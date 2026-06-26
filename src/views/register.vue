<template>
  <div class="register-container">
    <div class="register-content">
      <div class="back-home" @click="handleBackHome">
        <el-icon class="icon">
          <Back />
        </el-icon>
        <span>返回首页</span>
      </div>
      <div class="register-title">
        <h2>创建您的账号</h2>
        <p>请填写注册信息</p>
      </div>
    </div>
    <div class="register-form">
      <el-form :model="formData" :rules="rules" ref="submitFormRef" label-width="120px" label-position="top"
        @submit.prevent>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" size="large" @keyup.enter="focusEmail" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input ref="emailInputRef" v-model="formData.email" placeholder="请输入邮箱" size="large"
            @keyup.enter="focusNickname" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input ref="nicknameInputRef" v-model="formData.nickname" placeholder="请输入昵称" size="large"
            @keyup.enter="focusPhone" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input ref="phoneInputRef" v-model="formData.phone" placeholder="请输入手机号" size="large"
            @keyup.enter="focusPassword" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input ref="passwordInputRef" v-model="formData.password" type="password" placeholder="请输入密码" size="large"
            @keyup.enter="focusConfirmPassword" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input ref="confirmPasswordInputRef" v-model="formData.confirmPassword" type="password" placeholder="请确认密码"
            size="large" @keyup.enter="submitForm(submitFormRef)" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(submitFormRef)" size="large" class="register-btn">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script setup>
/**
 * 注册页面
 * 提交 formData 到 /api/user/add 接口创建新用户（userType 固定为 1 前台用户）
 * 注册成功后自动跳转到登录页
 */
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Back } from '@element-plus/icons-vue'
import { register } from '@/api/frontend'
import { ElMessage } from 'element-plus'

const router = useRouter()

const handleBackHome = () => {
  router.push('/home')
}

// 注册表单引用（用于 validate / resetFields）
const submitFormRef = ref(null)
// 各输入框引用，用于回车自动切换焦点
const emailInputRef = ref()
const nicknameInputRef = ref()
const phoneInputRef = ref()
const passwordInputRef = ref()
const confirmPasswordInputRef = ref()

// 回车切换焦点到下一个输入框（与登录页一致的交互模式）
const focusEmail = () => emailInputRef.value?.focus()
const focusNickname = () => nicknameInputRef.value?.focus()
const focusPhone = () => phoneInputRef.value?.focus()
const focusPassword = () => passwordInputRef.value?.focus()
const focusConfirmPassword = () => confirmPasswordInputRef.value?.focus()

// 注册表单数据：所有字段均为必填，userType 固定 1（前台用户）
const formData = ref({
  username: "",
  email: "",
  nickname: "",
  phone: "",
  password: "",
  confirmPassword: "",
  gender: 0, //（1 男 2 女）
  userType: 1  // 固定为前台用户
})

// 邮箱格式正则：包含 @，域名至少含一个点号，且整体符合标准邮箱结构
const emailReg = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

// 表单校验规则：所有输入框必填，邮箱额外校验格式
const rules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: emailReg, message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

/** 注册提交：表单校验通过后 POST /api/user/add，成功跳登录页 */
const submitForm = async (formEl) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (!valid) return
    try {
      await register(formData.value)
      ElMessage.success('注册成功')
      router.push('/auth/login')
    } catch (err) {
      ElMessage.error('注册失败，你的注册信息可能已被使用！')
    }
  })
}
</script>
<style scoped lang="scss">
// ============================================================
//  Register — 注册页表单样式
//  窄卡片居中布局，字段较多，标签顶部对齐
// ============================================================
.register-container {
  width: 384px;

  .register-content {
    .back-home {
      margin-bottom: 40px;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      color: #6b7280;
      transition: color 0.2s, transform 0.2s;

      &:hover {
        color: #4A90E2;
        transform: translateX(-3px);
      }

      &:active {
        transform: translateX(-3px) scale(0.95);
      }
    }

    .register-title {
      // 注册标题与副标题
      text-align: center;

      h2 {
        font-size: 36px;
        margin-bottom: 10px;
      }

      p {
        font-size: 18px;
        color: #6b7280;
      }
    }
  }

  .register-form {
    // 注册表单区域：注册按钮通栏
    margin-top: 40px;

    .register-btn {
      width: 100%;
    }
  }
}
</style>