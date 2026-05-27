<template>
<div class="container">
<div class="title">
  <div class="back-home">
    <el-icon class="icon" @click="handleBackHome"><Back /></el-icon>
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
      <el-input v-model="formData.username" placeholder="请输入用户名或邮箱" size="large" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="formData.password" placeholder="请输入密码" size="large" type="password" show-password />
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
import { ArrowLeft, Back} from '@element-plus/icons-vue'
import { login } from '@/api/asmin'
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const formData = reactive({
  username: '',
  password: ''
})
const ruleFormRef = ref()
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})

const handleBackHome = () => {

}
//登录
const submitForm = async () => {
  if (!ruleFormRef) return
  await ruleFormRef.value.validate((valid, fields) => {
    if (valid) {
      login(formData).then((data) => {
           if(!data.token){
             //登录失败
           return console.error('登录失败')
           }
           //登录成功,保存token和用户信息到localStorage,跳转到首页
           else {
           //存储登录信息
           localStorage.setItem('token', data.token)
           //存储用户信息
           localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
           //根据用户角色决定跳转的路径
           if(data.userInfo.userType === 2){
             router.push('/back/dashboard')
           }
           else{
             router.push('/back/dashboard/knowledge')
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
.container {
width: 384px;
  .title {
    text-align: center;
    .back-home {
   margin-bottom: 60px;
   text-align: left;
             }
    .title-text {
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
   .form-container {
    margin-top: 40px;
    .btn {
      margin-top: 40px;
      width: 100%;
    }
    .footer {
      padding: 20px 0;
      text-align: center;
    }
    }
}
</style>
