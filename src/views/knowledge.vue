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
<script setup>
import PageHead from '@/components/PageHead.vue'
import { categoryTree } from '@/api/asmin'
import TableSearch from '@/components/TableSearch.vue'
import { onMounted, ref, reactive } from 'vue'


const formItem = [{label: '文章标题',prop: 'title',comp: 'input',placeholder: '请输入文章标题',
                  },
                  {label: '文章分类',prop: 'categoryId',comp: 'select',placeholder: '请选择文章分类',
                  },
                  {label: '文章状态',prop: 'status',comp: 'select',placeholder: '请选择文章状态',options:[
                    {label: '草稿',value: 0},
                    {label: '已发布',value: 1},
                  ]
}]

const handleSearch = (formData) => {
  console.log(formData)
}
// 文章分类映射
const categoryMap = reactive([])
// 文章分类列表
const categories = reactive([])



onMounted(async () => {
  const data =  await categoryTree()
    categories.value = data.map((item) => {
    categoryMap[item.id] = item.categoryName
    return {
      label: item.categoryName,
      value: item.id
    }
    formItem[1].options = categories.value
  })
})
</script>

<style scoped>

</style>
