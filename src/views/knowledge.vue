<template>
  <div>
    <PageHead title="知识文章">
      <template #buttons>
        <el-button type="primary">新增</el-button>
      </template>
    </PageHead>
    <TableSearch :formItem="formItem" @search="handleSearch" />
  </div>
</template>
<script setup lang="ts">
import PageHead from '@/components/PageHead.vue'
import TableSearch from '@/components/TableSearch.vue'
const formItem = [{
  label: '文章标题',
  prop: 'title',
  comp: 'input',
  placeholder: '请输入文章标题',
},
{
  label: '文章分类',
  prop: 'categoryId',
  comp: 'select',
  options: [
    {
      label: '心理健康基础',
      value: 'mentalHealthBasic'
    },
    {
      label: '情绪管理',
      value: 'emotionManagement'
    },
  ],
  placeholder: '请选择文章分类',
},
{
  label: '文章状态',
  prop: 'status',
  comp: 'select',
  options: [
    {
      label: '草稿',
      value: 'draft'
    },
    {
      label: '已发布',
      value: 'published'
    },
  ],
  placeholder: '请选择文章状态',
}
]

const handleSearch = (formData: any) => {
  console.log(formData)
}
</script>

<style scoped>

</style>
