<template>
  <div>
    <PageHead title="知识文章">
      <template #buttons>
        <el-button type="primary" @click="handleEdit({ })" >新增</el-button>
      </template>
    </PageHead>
    <TableSearch :formItem="formItem" @search="handleSearch"  />
    <el-table :data="tableData" style="width: 100%; margin-top: 25px;">
      <!-- 接收数据并通过#default="scope"循环给每一行 -->
    <!-- @vue-generic {User} -->
    <el-table-column label="文章标题" width="300"  fixed="left">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <el-icon><timer /></el-icon>
          <span style="margin-left: 10px">{{ scope.row.title }}</span>
        </div>
      </template>
    </el-table-column>
        <!-- @vue-generic {User} -->
    <el-table-column label="文章分类" width="200">
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <el-icon><Coin /></el-icon>
          <span style="margin-left: 10px">{{ scope.row.categoryName }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="authorName"  label="作者" width="200"> </el-table-column>
    <el-table-column prop="readCount"  label="阅读量" width="200"> </el-table-column>
    <el-table-column prop="updatedAt"  label="发布时间" width="200"> </el-table-column>
    <!-- @vue-generic {User} --> 
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="scope">
        <el-button size="small" text type="primary" @click="handleEdit(scope.row)">
          编辑
        </el-button>
        <el-button @click="handlePublish(scope.row)" v-if="scope.row.status === 0||scope.row.status === 2" size="small" type="success">
          发布
        </el-button>
        <el-button @click="handleUnPublish(scope.row)" v-if="scope.row.status === 1" size="small" type="warning">
          下线
        </el-button>
        <el-button size="small" type="danger" @click="handleDelete(scope.row)">
          删除
        </el-button>
      </template>
    </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top: 25px;"
      layout="prev, pager, next"
      :total="pagination.total"
       :page-size="pagination.size" 
      @change="handleChange"
    />
    <ArticleDialog 
    v-model:modelValue="dialogVisible"  
    :categories="categories" 
    @success="handleSuccess"
    :article="currentArticle"
    />
  </div>
</template>
<script setup>
import PageHead from '@/components/PageHead.vue'
import { categoryTree, articlePage, getArticleDetail,changeArticleStatus,deleteArticle } from '@/api/asmin'
import TableSearch from '@/components/TableSearch.vue'
import { onMounted, ref, reactive } from 'vue'
import ArticleDialog from '@/components/articleDialog.vue'
import { ElMessageBox,ElMessage } from 'element-plus'

const formItem = [{label: '文章标题',prop: 'title',comp: 'input',placeholder: '请输入文章标题',
                  },
                  {label: '文章分类',prop: 'categoryId',comp: 'select',placeholder: '请选择文章分类',options: [
                    {label: '全部',value: ''},
                  ]
                  },
                  {label: '文章状态',prop: 'status',comp: 'select',placeholder: '请选择文章状态',options:[
                    {label: '草稿',value: 0},
                    {label: '已发布',value: 1},
                  ]
}]
const tableData = ref([])
// 文章分类映射
const categoryMap = reactive([])
// 文章分类列表
const categories = ref([])
// 分页信息
const pagination = reactive({
  total: 0,  // 总条数
  size: 10,  // 每页多少条
  currentPage: 1,   // 当前页码
})
const dialogVisible = ref(false)// 文章详情弹窗是否显示
const currentArticle = ref(null)// 当前文章详情

// 文章新增/编辑成功后触发：重置到第1页并刷新列表
const handleSuccess = () => {
  dialogVisible.value = false
  pagination.currentPage = 1
  handleSearch({})
}

// 分页改变时触发
const handleChange = (val) => {
  pagination.currentPage = val
  handleSearch({})
}

// 搜索文章：后端按createdAt降序分页返回，前端再按updatedAt降序微调
const handleSearch = async (formData) => {
  const params = {
    currentPage: pagination.currentPage,
    size: pagination.size,
    sortField: 'createdAt',
    sortOrder: 'desc',
    ...formData,
  }
  const {records, total} = await articlePage(params)
  // 按发布时间降序排列（最新在前）
  tableData.value = (records || []).sort((a, b) => {
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
  })
  pagination.total = total
}

// 请求序号，防止竞态：点击"编辑"后再快速点"新增"时，旧请求可能覆盖 null
let editSeq = 0
const handleEdit = (row) => {
  if(row.id){
    const seq = ++editSeq
    getArticleDetail(row.id).then(res => {
      // 仅当没有更新的 handleEdit 调用时才赋值
      if (seq === editSeq) {
        currentArticle.value = res
        dialogVisible.value = true
      }
    })
  }
  else{
    ++editSeq // 使所有待处理的编辑请求失效
    currentArticle.value = null
    dialogVisible.value = true
  }
}


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
  handleSearch({})
})

// 发布文章
const handlePublish = (row) => {
ElMessageBox.confirm(
    '确认发布文章吗？',
    '提示',
    {
      confirmButtonText: '确认发布',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(() => {
      changeArticleStatus(row.id, 1).then(res => {
        ElMessage.success('文章发布成功')
        handleSearch()
      }).catch(error => {
        ElMessage.error(error?.msg || '文章发布失败，请重试')
      })
    })
}

// 下线文章
const handleUnPublish = (row) => {
ElMessageBox.confirm(
    '确认下线文章吗？',
    '提示',
    {
      confirmButtonText: '确认下线',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      changeArticleStatus(row.id, 2).then(res => {
        ElMessage.success('文章下线成功！')
        handleSearch()
      }).catch(error => {
        ElMessage.error(error?.msg || '文章下线失败，请重试')
      })
    })
}

// 删除文章
const handleDelete = (row) => {
ElMessageBox.confirm(
    '确认删除文章吗？',
    '提示',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'danger',
    }
  )
    .then(() => {
      deleteArticle(row.id).then(res => {
        ElMessage.success('文章删除成功！')
        handleSearch()
      }).catch(error => {
        ElMessage.error(error?.msg || '文章删除失败，请重试')
      })
    })
}
</script>

<style scoped>

</style>
