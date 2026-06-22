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
      <el-form :model="formData" :rules="rules" ref="submitFormRef" label-width="120px" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" size="large" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" size="large" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称(可选)" size="large" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号(可选)" size="large" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" size="large" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="formData.confirmPassword" type="password" placeholder="请确认密码" size="large" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(submitFormRef)" size="large" class="register-btn">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Back } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()

const handleBackHome = () => {
  router.push('/home')
}

// 注册表单引用
const submitFormRef = ref(null)

// 注册表单数据
const formData = ref({
  "username": "",
  "email": "",
  "nickname": "",
  "phone": "",
  "password": "",
  "confirmPassword": "",
  "gender": 0, //（1 男 2 女）
  "userType": 1
})

// 注册表单验证规则
const rules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }],
})

// 注册表单提交
const submitForm = async (formEl) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (!valid) return
    try {
      const res = await axios.post('/api/user/add', formData.value)
      const data = res.data
      console.log('注册响应：', data)
      if (String(data.code) === '200') {
        ElMessage.success('注册成功')
        router.push('/auth/login')
      } else {
        ElMessage.error(data.msg || data.message || '注册失败')
      }
    } catch {
      ElMessage.error('网络错误，请稍后重试')
    }
  })
}
</script>
<style scoped lang="scss">
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
    margin-top: 40px;

    .register-btn {
      width: 100%;
    }
  }
}
</style>