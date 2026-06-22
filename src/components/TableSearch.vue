<template>
  <el-form ref="ruleFormRef" :model="formData">
    <el-row :gutter="24">
      <template v-for="item in formItemAttr" :key="item.prop">
      <el-col v-bind="item.col">
    <el-form-item  :label="item.label" :span="item.col" :prop="item.prop">
      <component
        :model-value="formData[item.prop] ?? ''"
        :is="isComp(item.comp)"
        :placeholder="item.placeholder"
        @update:model-value="(val) => formData[item.prop] = val"
      >
        <template v-if="item.comp === 'select'">
          <el-option label="全部" value=""></el-option>
          <el-option v-for="option in item.options" :key="option.value" :label="option.label" :value="option.value"></el-option>
        </template>
      </component>
    </el-form-item>
    </el-col>
    </template>
    </el-row>
    <el-row>
    <el-form-item>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset(ruleFormRef)">重置</el-button>
    </el-form-item>
    </el-row>
  </el-form>
</template>
<script setup>
import { computed, reactive, ref } from 'vue'

const ruleFormRef = ref()
const formData = reactive({})
const emit = defineEmits(['search', 'reset'])
const props = defineProps({
  formItem: {
    type: Array,
    default: () => []
  },
})

const formItemAttr = computed(() => {
  const {formItem} = props
  formItem.forEach(item => {
   item.col = {xs: 24, sm: 12, md: 8, lg: 6, xl: 6, xxl: 6}
})
return formItem
})

const handleSearch = () => {
  emit('search', { ...formData })
}

const handleReset = (formEl) => {
  if (formEl) {
    formEl.resetFields()
  }
}

const isComp = (comp) => {
  return {
    input: 'el-input',
    select: 'el-select',
  }[comp] ?? comp
}
</script>

