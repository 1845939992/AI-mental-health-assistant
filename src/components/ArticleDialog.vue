<template>
  <el-dialog
    :title="isEdit ? '编辑文章' : '查看文章详情'"
    :model-value="modelValue"
    @close="handleClose"
    width="50%"
  >
    <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
      <el-form-item label="文章标题" prop="title">
        <el-input type="primary" v-model="formData.title" placeholder="请输入文章标题" maxlength="20" clearable />
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryId">
        <el-select v-model="formData.categoryId" placeholder="请选择文章分类" clearable>
          <el-option v-for="item in categories" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="文章摘要" prop="summary">
        <el-input type="textarea" v-model="formData.summary" placeholder="请输入文章摘要(可选)" maxlength="1000" show-word-limit clearable />
      </el-form-item>
      <el-form-item label="标签" prop="tags">
        <el-select  v-model="formData.tagArray" placeholder="请选择标签(可选)"
                 multiple  filterable  allow-create script:width="100%" clearable> 
          <el-option v-for="item in commonTags" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="封面图片" prop="coverImage">
        <div class="cover-upload">
        <el-upload v-model="formData.coverImage" 
                         action="#"
                         :before-upload="beforeUpload"  
                         :http-request="uploadAvatar"
                         :show-file-list="false"
                         accept="image/*">
             <div v-if="!imgURL" class="cover-placeholder"><p>点击上传封面</p></div>
             <img v-else :src="imgURL" alt="封面图片" class="cover-image"> 
        </el-upload>
             <div v-if="imgURL">
               <el-button type="danger" @click="handleDeleteCover">删除</el-button>
             </div>
        </div>
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <RichTextEditor 
          v-model="formData.content" 
          placeholder="请输入文章内容，支持富文本格式\n\n可以使用加粗、斜体、列表、标题等格式来丰富文章内容。"
          :maxLength="5000"
          @change="handleContentChange"
          @create="handleEditorCreated"
          min_height="400px"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div>
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading" :disabled="loading">{{ isEdit ? '更新' : '提交' }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { fileBaseUrl } from '@/config/index.js'
import service from '@/utils/request' // Axios 实例，用于发送 HTTP 请求
import RichTextEditor from '@/components/RichTextEditor.vue'
import { createArticle, updateArticle } from '@/api/asmin.js'

const formData = ref({
  title: '',
  content: '',
  coverImage: '',
  categoryId: null,
  summary: '',
  tags: '',
  tagArray: [],
  id: ''
})
const imgURL = ref('')
const editorRef = ref(null)//富文本编辑器实例
const loading = ref(false)
const businessId = ref('')

const formRules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' },
    { max: 20, message: '文章标题最多20个字符', trigger: 'blur' }
  ],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' },
    { max: 5000, message: '文章内容最多5000个字符', trigger: 'blur' }
  ], 
  coverImage: [{ required: true, message: '请输入文章封面', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
  summary: [{ required: false, message: '请输入文章摘要', trigger: 'blur' }],
  tags: [{ required: true, message: '请输入文章标签', trigger: 'change' }],
}
const formRef = ref(null)
const commonTags = [
'情绪管理', '焦虑', '抑郁', '压力', 
'睡眠', '冥想', '正念', '放松', '心理健康', 
'自我成长', '人际关系', '工作压力', '学习方法', '生活技巧'
  ]

const emit = defineEmits(['update:modelValue','success'])
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  article: {
    type: Object,
    default: null,
  }
})

// tagArray 变化时同步到 tags 字符串，供校验使用
watch(() => formData.value.tagArray, (val) => {
  formData.value.tags = (val || []).join(',')
})

//上传封面图片前的校验
const beforeUpload = (file) => {
  //只能是JPG/PNG格式，且大小不能超过50MB
    const isJPG = file.type === 'image/jpeg'
    const isPNG = file.type === 'image/png'
    const isLt50M = file.size / 1024 / 1024 < 50
    if ((!isJPG && !isPNG) || !isLt50M) {
      ElMessage.error('上传图片只能是 JPG/PNG 格式，且大小不能超过50MB!')
      return false
    }
    return true
  }

//上传封面图片
const uploadAvatar = async ({ file }) => {
  businessId.value = crypto.randomUUID()
  const formDataUpload = new FormData()
  formDataUpload.append('file', file)
  formDataUpload.append('businessType', "ARTICLE")
  formDataUpload.append('businessId', businessId.value)
  formDataUpload.append('businessField', "cover")

  try {
    const res = await service.post('/file/upload', formDataUpload)
    imgURL.value = fileBaseUrl + res.filePath
    formData.value.coverImage = res.filePath
  } catch (error) {
    ElMessage.error(error?.msg || '上传失败，请重试')
  }
}
//删除封面图片
const handleDeleteCover = () => {
  imgURL.value = ''
  formData.value.coverImage = ''
}

//富文本内容改变时触发
const handleContentChange = (html) => {
  formData.value.content = html
}

//富文本编辑器创建时触发
const handleEditorCreated = (editor) => {
  editorRef.value = editor
  //编辑内容时，设置富文本编辑器内容
  if (formData.value.content && editorRef.value) {
    nextTick(() => {
      editorRef.value.setHTML(formData.value.content)
    })
  }
}

//提交表单
const handleSubmit = () => {
  formRef.value.validate((valid, fields) => {
    if (!valid) {
      return
    }
    loading.value = true
    // 显式构造 submitData，只取表单字段，避免意外携带文章详情中的额外字段
    const submitData = {
      title: formData.value.title,
      content: formData.value.content,
      coverImage: formData.value.coverImage,
      categoryId: formData.value.categoryId,
      summary: formData.value.summary,
      tags: formData.value.tags,
    }

    if (isEdit.value) {
      updateArticle(props.article?.id, submitData).then(res => {
        loading.value = false
        ElMessage.success('文章更新成功')
        emit('success')
        handleClose()
      }).catch(error => {
        ElMessage.error(error?.msg || '文章更新失败，请重试')
      }).finally(() => {
      })
    } else {
      submitData.id = businessId.value
      createArticle(submitData).then(res => {
       ElMessage.success('文章创建成功')
       loading.value = false
       emit('success')
       handleClose()
     }).catch(error => {
       ElMessage.error(error?.msg || '文章创建失败，请重试')
     }).finally(() => {
     })
    }
  })
}

//关闭弹窗
const handleClose = () => {
  //重置表单数据
  formRef.value.resetFields()
  // 重置封面图片
  handleDeleteCover()
  // 重置业务ID
  businessId.value = ''
  // 重置标签数组
  formData.value.tagArray = []
  emit('update:modelValue', false)
}

const isEdit = computed(() => !!props.article?.id)//是否是编辑文章状况

// 监听 props.article 变化，更新 formData（仅编辑模式有效文章对象才执行）
watch(() => props.article, (newVal) => {
  if (newVal?.id) {
    formData.value = {
      title: newVal.title || '',
      content: newVal.content || '',
      coverImage: newVal.coverImage || '',
      categoryId: newVal.categoryId ?? null,
      summary: newVal.summary || '',
      tags: newVal.tags || '',
      tagArray: newVal.tags ? newVal.tags.split(',') : [],
      id: newVal.id
    }
    businessId.value = newVal.id
    imgURL.value = newVal.coverImage ? fileBaseUrl + newVal.coverImage : ''
  }
})

</script>

<style scoped>
// ============================================================
//  ArticleDialog — 文章编辑/详情弹窗样式
//  封面上传占位区、预览图、弹窗主体间距
// ============================================================

.el-dialog__body {
  padding: 20px;
}

// -- 封面上传区域 -------------------------------------------
.cover-placeholder {
  width: 200px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8b949e;
  background: #f6f8fa;
}
.cover-image {
  width: 200px;
  height: 120px;
  display: block;
}
</style>
