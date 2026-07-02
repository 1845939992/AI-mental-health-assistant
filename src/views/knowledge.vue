<template>
  <div>
    <PageHead title="知识文章">
      <template #buttons>
        <el-button type="primary" @click="handleEdit({})">新增</el-button>
      </template>
    </PageHead>
    <TableSearch :formItem="formItem" @search="handleSearch" />
    <el-table :data="tableData" style="width: 100%; margin-top: 25px;">
      <!-- 接收数据并通过#default="scope"循环给每一行 -->
      <!-- @vue-generic {User} -->
      <el-table-column label="文章标题" width="300" fixed="left">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-icon>
              <Timer />
            </el-icon>
            <span style="margin-left: 10px">{{ scope.row.title }}</span>
          </div>
        </template>
      </el-table-column>
      <!-- @vue-generic {User} -->
      <el-table-column label="文章分类" width="200">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-icon>
              <Coin />
            </el-icon>
            <span style="margin-left: 10px">{{ scope.row.categoryName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="authorName" label="作者" width="200"> </el-table-column>
      <el-table-column prop="readCount" label="阅读量" width="200"> </el-table-column>
      <el-table-column prop="updatedAt" label="发布时间" width="200"> </el-table-column>
      <!-- @vue-generic {User} -->
      <el-table-column label="操作" width="175" fixed="right">
        <template #default="scope">
          <div class="action-buttons">
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button @click="handlePublish(scope.row)" v-if="scope.row.status === 0 || scope.row.status === 2"
              size="small" type="success">
              发布
            </el-button>
            <el-button @click="handleUnPublish(scope.row)" v-if="scope.row.status === 1" size="small" type="warning">
              下线
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination style="margin-top: 25px;" layout="prev, pager, next, jumper" :total="pagination.total"
      :page-size="pagination.size" @change="handleChange" />
    <ArticleDialog v-model:modelValue="dialogVisible" :categories="categories" @success="handleSuccess"
      :article="currentArticle" />
  </div>
</template>
<script setup>
/**
 * 知识文章管理页（后台）
 * 支持文章的新增/编辑/发布/下线/删除操作
 * 通过 ArticleDialog 组件弹窗编辑，TableSearch 组件筛选，el-pagination 分页
 * editSeq 序列号机制防止快速操作时新旧请求竞态导致覆盖问题
 */
import PageHead from '@/components/PageHead.vue'
import { categoryTree, articlePage, getArticleDetail, changeArticleStatus, deleteArticle } from '@/api/asmin'
import TableSearch from '@/components/TableSearch.vue'
import { onMounted, ref, reactive } from 'vue'
import ArticleDialog from '@/components/articleDialog.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Timer, Coin } from '@element-plus/icons-vue'

const formItem = [{
  label: '文章标题', prop: 'title', comp: 'input', placeholder: '请输入文章标题',
},
{
  label: '文章分类', prop: 'categoryId', comp: 'select', placeholder: '请选择文章分类', options: [
    { label: '人际关系', value: '4' },
    { label: '压力缓解', value: '3' },
    { label: '心理健康基础', value: '1' },
    { label: '情绪管理', value: '2' },
  ]
},
{
  label: '文章状态', prop: 'status', comp: 'select', placeholder: '请选择文章状态', options: [
    { label: '草稿', value: 0 },
    { label: '已发布', value: 1 },
  ]
}]
const tableData = ref([])             // 当前页文章列表
const categories = ref([])            // 文章分类列表（从 categoryTree 接口获取）
// 分页信息
const pagination = reactive({
  total: 0,        // 总条数
  size: 10,        // 每页多少条
  currentPage: 1,  // 当前页码
})
const dialogVisible = ref(false)      // 文章详情弹窗是否显示
const currentArticle = ref(null)      // 当前文章详情（null=新增模式，对象=编辑模式）

/** 文章新增/编辑成功后触发：关闭弹窗 → 重置到第1页 → 刷新列表 */
const handleSuccess = () => {
  dialogVisible.value = false
  pagination.currentPage = 1
  handleSearch({})
}

/** 分页改变时触发 */
const handleChange = (val) => {
  pagination.currentPage = val
  handleSearch({})
}

/**
 * 搜索文章：后端按 createdAt 降序分页返回，前端再按 updatedAt 降序微调
 * 确保最近编辑的文章排在前面
 */
const handleSearch = async (formData) => {
  const params = {
    currentPage: pagination.currentPage,
    size: pagination.size,
    sortField: 'createdAt',
    sortOrder: 'desc',
    ...formData,
  }
  const { records, total } = await articlePage(params)
  tableData.value = (records || []).sort((a, b) => {
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
  })
  pagination.total = total
}

/**
 * 请求序列号，防止竞态
 * 场景：用户快速点击"编辑"再点"新增"，旧编辑请求返回时可能把 currentArticle 从 null 覆盖为非 null
 * 每次 handleEdit 调用时 seq++ 并赋给局部变量，回调中判断 seq === editSeq 才赋值
 */
let editSeq = 0
const handleEdit = (row) => {
  if (row.id) {
    const seq = ++editSeq
    getArticleDetail(row.id).then(res => {
      // 仅当没有更新的 handleEdit 调用时才赋值
      if (seq === editSeq) {
        currentArticle.value = res
        dialogVisible.value = true
      }
    })
  }
  else {
    ++editSeq // 使所有待处理的编辑请求失效
    currentArticle.value = null
    dialogVisible.value = true
  }
}

// 页面挂载：拉取分类树 → 填入下拉选项 → 加载第一页数据
onMounted(async () => {
  const data = await categoryTree()
  categories.value = data.map((item) => {
    return {
      label: item.categoryName,
      value: item.id
    }
  })
  formItem[1].options = categories.value
  handleSearch({})
})

/** 发布文章：确认后调用 API 将状态改为 1（已发布） */
const handlePublish = (row) => {
  ElMessageBox.confirm('确认发布文章吗？', '提示', {
    confirmButtonText: '确认发布',
    cancelButtonText: '取消',
    type: 'info',
  }).then(() => {
    changeArticleStatus(row.id, 1).then(res => {
      ElMessage.success('文章发布成功')
      handleSearch()
    }).catch(error => {
      ElMessage.error(error?.msg || '文章发布失败，请重试')
    })
  })
}

/** 下线文章：确认后调用 API 将状态改为 2（已下线） */
const handleUnPublish = (row) => {
  ElMessageBox.confirm('确认下线文章吗？', '提示', {
    confirmButtonText: '确认下线',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    changeArticleStatus(row.id, 2).then(res => {
      ElMessage.success('文章下线成功！')
      handleSearch()
    }).catch(error => {
      ElMessage.error(error?.msg || '文章下线失败，请重试')
    })
  })
}

/** 删除文章：确认后调用 API 删除，成功后刷新列表 */
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除文章吗？', '提示', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'danger',
  }).then(() => {
    deleteArticle(row.id).then(res => {
      ElMessage.success('文章删除成功！')
      handleSearch()
    }).catch(error => {
      ElMessage.error(error?.msg || '文章删除失败，请重试')
    })
  })
}
</script>

<style lang="scss" scoped>
/* ============================================================
 Knowledge — 知识文章管理页样式
 页面头部 + 搜索表单 + 表格 + 分页 + 文章编辑弹窗
 ============================================================ */

/* -- 表格统一样式：斑马纹 + 表头背景 -- */
:deep(.el-table) {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;

  .el-table__header-wrapper {
    th {
      background: #F9FAFB;
      color: #374151;
      font-weight: 600;
      font-size: 13px;
      border-bottom: 2px solid #E5E7EB;
    }
  }

  /* 斑马纹 */
  .el-table__body-wrapper {
    .el-table__row--striped {
      td {
        background: #FAFBFC;
      }
    }
  }

  /* 行悬浮 */
  .el-table__body tr:hover>td {
    background: #EEF2FF !important;
  }

  /* 单元格内边距 */
  td,
  th {
    padding: 14px 12px;
  }
}

/* -- 操作按钮容器：水平排列，等间距，统一大小 -- */
.action-buttons {
  display: flex;
  align-items: center;
  white-space: nowrap;
  gap: 4px;

  .el-button {
    min-width: 36px;
    height: 24px;
    padding: 0 6px;
    font-size: 12px;
    border-radius: 4px;
  }
}

/* -- 操作按钮：统一悬浮交互效果 -- */
:deep(.el-button) {
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0) scale(0.97);
  }

  /* 危险按钮悬浮阴影 */
  &.el-button--danger:hover {
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
  }

  /* 成功按钮悬浮阴影 */
  &.el-button--success:hover {
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  }

  /* 警告按钮悬浮阴影 */
  &.el-button--warning:hover {
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
  }
}

/* -- 分页样式 -- */
:deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-end;

  .el-pager li {
    border-radius: 6px;
    transition: all 0.2s ease;

    &.is-active {
      background: #6366F1;
      color: #fff;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
    }

    &:hover:not(.is-active) {
      color: #6366F1;
    }
  }

  .btn-prev,
  .btn-next {
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
      color: #6366F1;
    }
  }
}
</style>
