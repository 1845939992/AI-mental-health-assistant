<template>
  <div class="knowledge-container">
    <!-- 头部 -->
    <div class="header-section">
      <div class="header-content">
        <span style="font-size: 32px;">📖</span>
        <h2>心理健康知识库</h2>
      </div>
    </div>

    <!-- 正文：左侧推荐 + 右侧文章列表 -->
    <div class="content">
      <!-- 左侧推荐阅读 -->
      <div class="recommend-section">
        <div class="section-title">
          <el-icon>
            <Star />
          </el-icon>
          <span>推荐阅读</span>
        </div>
        <div class="recommend-list">
          <div v-for="item in recommendList" :key="item.id" class="recommend-item" @click="handleRecommendClick(item.id)">
            <div>{{ item.title }}</div>
            <div class="read-count">
              <el-icon :size="12">
                <View />
              </el-icon>
              <span>浏览量：{{ item.readCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧文章列表 -->
      <div class="article-list">
        <div v-for="article in articleList" :key="article.id" class="article-item">
          <el-image :src="article.coverImage ? fileBaseUrl + article.coverImage : knowledgeUrl" fit="cover"
            style="width: 160px; height: 110px; border-radius: 8px; flex-shrink: 0;" />
          <div class="info">
            <div class="title">
              <h3>{{ article.title }}</h3>
              <el-tag size="small" type="primary">{{ article.categoryName || '心理科普' }}</el-tag>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">
              {{ article.summary }}
            </p>
            <div
              style="display: flex; align-items: center; gap: 16px; margin-top: 10px; font-size: 13px; color: #9ca3af;">
              <span>
                <el-icon :size="14">
                  <User />
                </el-icon>
                {{ article.authorName || '系统管理员' }}
              </span>
              <span>
                <el-icon :size="14">
                  <Calendar />
                </el-icon>
                <span>{{ dayjs(article.updatedAt).format('YYYY-MM-DD') }}</span>
              </span>
            </div>
            <div
              style="display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 13px; color: #9ca3af;">
              <el-icon :size="14">
                <View />
              </el-icon>
              <span>观看人数：{{ article.readCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination 
      v-model:current-page="pagination.currentPage" 
      v-model:page-size="pagination.size"
      :total="pagination.total" layout="prev, pager, next" 
      @current-change="handlePageChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { fileBaseUrl, knowledgeUrl } from '@/config/index.js'
import { ElMessage, dayjs } from 'element-plus'
import { getKnowledgelist, getKnowledgeDetail } from '@/api/frontend'
import { useRouter } from 'vue-router'

const router = useRouter()

// 推荐列表（取前5篇高浏览量的文章）
const recommendList = ref([])

// 文章列表
const articleList = ref([])

// 推荐阅读参数配置
const params = reactive({
  sortField: 'readCount',//按阅读量排序
  sortDirection: 'desc',//倒序排列
  currentPage: 1,//当前页
  size: 5,//总条数
})

// 右侧列表分页参数配置
const pagination = reactive({
  currentPage: 1, //当前页
  size: 10, //每页条数
  total: 0, //总条数
})

// 获取文章列表数据
const fetchArticles = async () => {
  try {
    const res = await getKnowledgelist({
      sortField: 'publishedAt',//按发布时间排序
      sortDirection: 'desc',//倒序排列
      ...pagination,
    })
    articleList.value = res.records || []
    params.total = res.total || 0

    // 填充推荐列表（取前5条，按阅读量排序）
    if (recommendList.value.length === 0) {
      const allRes = await getKnowledgelist({ currentPage: 1, size: 20, sortField: params.sortField, sortDirection: params.sortDirection })
      const sorted = (allRes.records || []).sort((a, b) => (b.readCount || 0) - (a.readCount || 0))
      recommendList.value = sorted.slice(0, 5)
    }
  } catch {
    // 加载失败
  }
}

// 点击推荐项跳转到对应文章
const handleRecommendClick =  (id) => {
    router.push(`/f-knowledge/article/${id}`)
}

// 切换页码
const handlePageChange = (page) => {
  pagination.currentPage = page
  fetchArticles()
}

onMounted(() => {
  fetchArticles()
  getKnowledgelist(params).then(res => {
  recommendList.value = res.records || []
  })
})
</script>
<style lang="scss" scoped>
.knowledge-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);

  .flex-box {
    display: flex;
    align-items: center;

    span {
      margin-left: 10px;
    }
  }

  .header-section {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
    color: white;
    padding: 12px 48px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .content {
    display: flex;
    gap: 20px;
    margin: 0 auto;
    width: 1200px;
    padding: 20px;

    .recommend-section {
      width: 280px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      padding: 15px;
      height: 400px;
      overflow-y: auto;

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .recommend-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .recommend-item {
          border-left: 4px solid #f59e0b;
          padding-left: 10px;
          cursor: pointer;
          transition: background-color 0.2s;

          &:hover {
            background-color: #fef3c7;
          }

          .read-count {
            margin-top: 15px;
            font-size: 12px;
            color: #6b7280;
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
      }
    }

    .article-list {
      flex: 1;

      .article-item {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        padding: 15px;
        margin-bottom: 20px;
        display: flex;
        transition: transform 0.2s, box-shadow 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .info {
          margin-left: 20px;
          flex: 1;
          min-width: 0;

          .title {
            display: flex;
            align-items: center;
            gap: 10px;

            h3 {
              font-size: 16px;
              font-weight: 600;
              color: #374151;
              margin: 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-bottom: 30px;
  }
}
</style>
