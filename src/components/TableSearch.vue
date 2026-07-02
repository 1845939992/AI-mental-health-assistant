<template>
  <el-form ref="ruleFormRef" :model="formData">
    <el-row :gutter="24">
      <template v-for="item in formItemAttr" :key="item.prop">
        <el-col v-bind="item.col">
          <el-form-item :label="item.label" :span="item.col" :prop="item.prop">
            <component :model-value="formData[item.prop] ?? ''" :is="isComp(item.comp)" :placeholder="item.placeholder"
              @update:model-value="(val) => formData[item.prop] = val">
              <template v-if="item.comp === 'select'">
                <el-option label="全部" value=""></el-option>
                <el-option v-for="option in item.options" :key="option.value" :label="option.label"
                  :value="option.value"></el-option>
              </template>
            </component>
          </el-form-item>
        </el-col>
      </template>
    </el-row>
    <el-row>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset(ruleFormRef)" class="reset-btn">重置</el-button>
      </el-form-item>
    </el-row>
  </el-form>
</template>
<script setup>
/**
 * 通用搜索表单组件
 * 通过 formItem 配置数组动态渲染输入框/下拉框，支持查询和重置
 * 子组件通过 emit('search', formData) 将表单数据传递给父组件
 * isComp 映射表将简写的 'input'/'select' 转为 Element Plus 的 'el-input'/'el-select'
 */
import { computed, reactive, ref, markRaw } from 'vue'
// 手动导入：因为 :is 动态组件使用字符串引用，auto-import 无法静态检测
import { ElInput, ElSelect } from 'element-plus'

const ruleFormRef = ref()
const formData = reactive({})
const emit = defineEmits(['search', 'reset'])
const props = defineProps({
  formItem: {
    type: Array,
    default: () => []
  },
})

// 为每个表单项注入响应式 col 布局属性（xs/sm/md 自适应）
const formItemAttr = computed(() => {
  const { formItem } = props
  formItem.forEach(item => {
    item.col = { xs: 24, sm: 12, md: 8, lg: 6, xl: 6, xxl: 6 }
  })
  return formItem
})

/** 查询：将 formData 浅拷贝后通过 search 事件传递给父组件 */
const handleSearch = () => {
  emit('search', { ...formData })
}

/** 重置：调用 Element Plus 的 resetFields 恢复初始值 */
const handleReset = (formEl) => {
  if (formEl) {
    formEl.resetFields()
  }
}

/** 组件名映射：将简写（input/select）映射为 Element Plus 组件实例（非字符串） */
const isComp = (comp) => {
  return {
    input: markRaw(ElInput),
    select: markRaw(ElSelect),
  }[comp] ?? comp
}
</script>
<style lang="scss" scoped>
/* -- 搜索表单卡片化：白色背景 + 圆角 + 阴影 -- */
.el-form {
  padding: 20px 20px 4px;
  background: #FFFFFF;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
}

/* 查询按钮：统一交互效果 */
:deep(.el-button--primary) {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  &:active {
    transform: translateY(0) scale(0.97);
  }
}

/* 重置按钮：增加边框 */
.reset-btn {
  border: 1px solid #D1D5DB;
  transition: all 0.3s ease;

  &:hover {
    border-color: #6366F1;
    color: #6366F1;
  }
}
</style>
