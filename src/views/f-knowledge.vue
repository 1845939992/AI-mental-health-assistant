<template>
  <div class="knowledge-container">
    <!-- 头部 -->
    <div class="header-section animate-in stagger-1">
      <div class="header-content">
        <div class="header-icon">📖</div>
        <div class="header-text">
          <h2>心理健康知识库</h2>
          <p>探索专业、温暖的心理科普内容</p>
        </div>
      </div>
    </div>

    <!-- 骨架屏：数据挂载前展示，保持整体布局不跳动 -->
    <template v-if="loading">
      <div class="content skeleton-content">
        <!-- 左侧推荐骨架 -->
        <div class="recommend-section">
          <div class="section-title skeleton-title">
            <el-icon>
              <Star />
            </el-icon>
            <span>推荐阅读</span>
          </div>
          <div class="recommend-list">
            <div v-for="i in 5" :key="i" class="recommend-item skeleton-recommend">
              <div class="skeleton-rank"></div>
              <div class="recommend-body">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line tiny"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧文章骨架 -->
        <div class="article-list">
          <div v-for="i in 4" :key="i" class="article-item skeleton-article">
            <div class="skeleton-image"></div>
            <div class="info">
              <div class="title">
                <div class="skeleton-line title-line"></div>
                <div class="skeleton-tag"></div>
              </div>
              <div class="skeleton-line summary-line"></div>
              <div class="skeleton-line summary-line short"></div>
              <div class="meta-row">
                <div class="skeleton-line tiny"></div>
                <div class="skeleton-line tiny"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 正文：左侧推荐 + 右侧文章列表 -->
    <template v-else>
      <div class="content animate-in stagger-2">
        <!-- 左侧推荐阅读 -->
        <div class="recommend-section">
          <div class="section-title">
            <el-icon>
              <Star />
            </el-icon>
            <span>推荐阅读</span>
          </div>
          <div class="recommend-list">
            <div v-for="(item, index) in recommendList" :key="item.id" class="recommend-item"
              :style="{ animationDelay: `${0.12 + index * 0.08}s` }" @click="handleRecommendClick(item.id)">
              <div class="rank-badge" :class="{ top: index < 3 }">{{ index + 1 }}</div>
              <div class="recommend-body">
                <div class="recommend-title">{{ item.title }}</div>
                <div class="read-count">
                  <el-icon :size="12">
                    <View />
                  </el-icon>
                  <span>浏览量：{{ item.readCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧文章列表 -->
        <div class="article-list">
          <div v-for="(article, index) in articleList" :key="article.id" class="article-item"
            :style="{ animationDelay: `${0.16 + index * 0.07}s` }" @click="handleRecommendClick(article.id)">
            <div class="cover-wrapper">
              <el-image :src="article.coverImage ? fileBaseUrl + article.coverImage : knowledgeUrl" fit="cover"
                class="cover-image">
                <template #error>
                  <div class="cover-fallback">
                    <el-icon :size="28">
                      <Document />
                    </el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="info">
              <div class="title">
                <h3>{{ article.title }}</h3>
                <el-tag size="small" type="primary" effect="light" class="category-tag">
                  {{ article.categoryName || '心理科普' }}
                </el-tag>
              </div>
              <p class="summary">{{ article.summary }}</p>
              <div class="meta-row">
                <span class="meta-item">
                  <el-icon :size="14">
                    <User />
                  </el-icon>
                  {{ article.authorName || '系统管理员' }}
                </span>
                <span class="meta-item">
                  <el-icon :size="14">
                    <Calendar />
                  </el-icon>
                  {{ dayjs(article.updatedAt).format('YYYY-MM-DD') }}
                </span>
                <span class="meta-item">
                  <el-icon :size="14">
                    <View />
                  </el-icon>
                  观看人数：{{ article.readCount }}
                </span>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="articleList.length === 0" class="empty-state">
            <el-icon :size="48">
              <Document />
            </el-icon>
            <p>暂无文章，敬请期待</p>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper animate-in stagger-3" v-if="articleList.length > 0">
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.size"
          :total="pagination.total" layout="prev, pager, next" @current-change="handlePageChange" />
      </div>
    </template>
  </div>
</template>

<script setup>
/**
 * 心理健康知识库列表页
 * 布局：左侧推荐阅读（按浏览量 Top 5）+ 右侧文章列表（按发布时间倒序，带分页）
 * 数据加载期间展示自定义骨架屏，加载完成后渲染真实内容 + Stagger 入场动画
 */
import { ref, reactive, onMounted } from 'vue'
import { fileBaseUrl, knowledgeUrl } from '@/config/index.js'
import { ElMessage, dayjs } from 'element-plus'
import { getKnowledgelist, getKnowledgeDetail } from '@/api/frontend'
import { useRouter } from 'vue-router'

const router = useRouter()

// 页面加载状态（true=骨架屏，false=真实内容）
const loading = ref(true)

/**
 * 推荐列表（左侧悬浮卡片区，取前 5 篇高浏览量文章）
 * 仅首次加载时填充，翻页时不重新拉取，避免左侧抖动
 */
const recommendList = ref([])

// 右侧文章列表
const articleList = ref([])

/** 推荐阅读参数：按 readCount 倒序，前 5 篇 */
const params = reactive({
  sortField: 'readCount',   // 按阅读量排序
  sortDirection: 'desc',    // 倒序排列
  currentPage: 1,           // 当前页
  size: 5,                  // 取 5 篇
})

/** 右侧列表分页参数：按发布时间倒序 */
const pagination = reactive({
  currentPage: 1,  // 当前页
  size: 10,        // 每页条数
  total: 0,        // 总条数（后端返回）
})

/**
 * 获取文章列表数据
 * 首次加载时：同时拉取右侧列表 + 左侧推荐列表（推荐仅首次加载避免闪烁）
 * 翻页时：仅拉取右侧列表
 */
const fetchArticles = async () => {
  try {
    loading.value = true
    const res = await getKnowledgelist({
      sortField: 'publishedAt',  // 按发布时间排序
      sortDirection: 'desc',     // 倒序排列
      ...pagination,
    })
    articleList.value = res.records || []
    pagination.total = res.total || 0

    // 推荐列表仅在首次加载时填充（recommendList 为空时），翻页不再重复请求
    if (recommendList.value.length === 0) {
      const allRes = await getKnowledgelist({ currentPage: 1, size: 20, sortField: params.sortField, sortDirection: params.sortDirection })
      // 客户端侧排序确保前 5 为真实浏览量最高
      const sorted = (allRes.records || []).sort((a, b) => (b.readCount || 0) - (a.readCount || 0))
      recommendList.value = sorted.slice(0, 5)
    }
  } catch {
    // 加载失败时保持上一次数据，不做额外 toast（避免干扰用户浏览）
  } finally {
    loading.value = false
  }
}

/** 点击推荐项或文章卡片，跳转到文章详情页 */
const handleRecommendClick = (id) => {
  router.push(`/f-knowledge/article/${id}`)
}

/** 切换页码：更新 currentPage 后重新拉取数据 */
const handlePageChange = (page) => {
  pagination.currentPage = page
  fetchArticles()
}

// 页面挂载后拉取推荐列表和文章列表
onMounted(() => {
  fetchArticles()
  // 额外调用一次确保推荐列表兜底（fetchArticles 内部仅在首屏填充推荐）
  getKnowledgelist(params).then(res => {
    recommendList.value = res.records || []
  })
})
</script>

<style lang="scss" scoped>
// ============================================================
//  Knowledge — 前台心理健康知识库列表页样式
//  结构：全宽渐变头部 + 两栏内容（左侧推荐 / 右侧文章列表）+ 分页
// ============================================================

// -- 关键帧动画：淡入上浮 + 脉冲 + 骨架屏流光 --
/* 页面进入动画：淡入 + 上浮 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.85;
  }

  50% {
    opacity: 0.55;
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

// -- 设计变量与页面容器：柔和、专业的心理健康主题色 --
/* 设计变量：柔和、专业的心理健康主题色 */
.knowledge-container {
  --primary: #6366f1;
  --primary-light: #818cf8;
  --accent: #f59e0b;
  --accent-warm: #f97316;
  --text-main: #1f2937;
  --text-secondary: #4b5563;
  --text-muted: #9ca3af;
  --bg-soft: #f8fafc;
  --bg-card: #ffffff;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 8px 24px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 16px 40px rgba(15, 23, 42, 0.12);
  --radius: 16px;

  min-height: 100vh;
  background:
    radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.06) 0%, transparent 35%),
    radial-gradient(circle at 90% 80%, rgba(245, 158, 11, 0.05) 0%, transparent 35%),
    linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);

  .animate-in {
    opacity: 0;
    transform: translateY(24px);
    animation: fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .stagger-1 {
    animation-delay: 0.05s;
  }

  .stagger-2 {
    animation-delay: 0.15s;
  }

  .stagger-3 {
    animation-delay: 0.25s;
  }

  .flex-box {
    display: flex;
    align-items: center;

    span {
      margin-left: 10px;
    }
  }

  // -- 头部区域：大气渐变 + 微光纹理 --
  /* 头部：大气渐变 + 微光纹理 */
  .header-section {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    background:
      linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.92) 50%, rgba(245, 158, 11, 0.88) 100%),
      radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.18) 0%, transparent 50%);
    color: white;
    padding: 40px 48px;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      pointer-events: none;
    }

    .header-content {
      position: relative;
      display: flex;
      align-items: center;
      gap: 18px;
      max-width: 1200px;
      margin: 0 auto;

      .header-icon {
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        background: rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(8px);
        border-radius: 18px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }

      .header-text {
        h2 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        p {
          margin: 6px 0 0;
          font-size: 15px;
          opacity: 0.85;
          font-weight: 400;
        }
      }
    }
  }

  // -- 内容区：左侧推荐栏 + 右侧文章列表 --
  .content {
    display: flex;
    gap: 28px;
    margin: 32px auto 0;
    width: 1200px;
    padding: 0 20px;

    // -- 左侧推荐栏：按浏览量排序 Top 5，吸顶展示 --
    /* 左侧推荐栏 */
    .recommend-section {
      width: 300px;
      background: var(--bg-card);
      border-radius: var(--radius);
      box-shadow: var(--shadow-md);
      padding: 22px;
      height: fit-content;
      position: sticky;
      top: 24px;
      border: 1px solid rgba(226, 232, 240, 0.8);

      .section-title {
        font-size: 15px;
        font-weight: 700;
        color: var(--text-main);
        margin-bottom: 18px;
        display: flex;
        align-items: center;
        gap: 8px;

        .el-icon {
          color: var(--accent);
        }
      }

      .recommend-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .recommend-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          border-radius: 12px;
          cursor: pointer;
          background: var(--bg-card);
          border: 1px solid transparent;
          opacity: 0;
          transform: translateY(16px);
          animation: fadeInUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          transition:
            background-color 0.25s ease,
            border-color 0.25s ease,
            transform 0.25s ease,
            box-shadow 0.25s ease;

          &:hover {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border-color: rgba(245, 158, 11, 0.25);
            transform: translateX(4px);
            box-shadow: var(--shadow-sm);

            .rank-badge {
              transform: scale(1.08);
            }
          }

          .rank-badge {
            flex-shrink: 0;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted);
            background: #f1f5f9;
            transition: transform 0.25s ease;

            &.top {
              color: white;
              background: linear-gradient(135deg, var(--accent) 0%, var(--accent-warm) 100%);
              box-shadow: 0 3px 10px rgba(245, 158, 11, 0.3);
            }
          }

          .recommend-body {
            flex: 1;
            min-width: 0;

            .recommend-title {
              font-size: 14px;
              font-weight: 600;
              color: var(--text-main);
              line-height: 1.5;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }

            .read-count {
              margin-top: 8px;
              font-size: 12px;
              color: var(--text-muted);
              display: flex;
              align-items: center;
              gap: 6px;

              .el-icon {
                color: var(--accent);
              }
            }
          }
        }
      }
    }

    // -- 右侧文章列表：卡片式布局，带封面、摘要、元信息 --
    /* 右侧文章列表 */
    .article-list {
      flex: 1;
      min-width: 0;

      .article-item {
        background: var(--bg-card);
        border-radius: var(--radius);
        box-shadow: var(--shadow-sm);
        padding: 20px;
        margin-bottom: 20px;
        display: flex;
        gap: 20px;
        cursor: pointer;
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        transition:
          transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow 0.3s ease,
          border-color 0.3s ease;
        border: 1px solid rgba(226, 232, 240, 0.6);

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(99, 102, 241, 0.2);

          .cover-image {
            transform: scale(1.04);
          }

          .title h3 {
            color: var(--primary);
          }
        }

        .cover-wrapper {
          width: 176px;
          height: 120px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          background: linear-gradient(135deg, #e0e7ff 0%, #fef3c7 100%);
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);

          .cover-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .cover-fallback {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-light);
            background: linear-gradient(135deg, #eef2ff 0%, #fff7ed 100%);
          }
        }

        .info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;

          .title {
            display: flex;
            align-items: center;
            gap: 12px;

            h3 {
              font-size: 17px;
              font-weight: 700;
              color: var(--text-main);
              margin: 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              transition: color 0.25s ease;
            }

            .category-tag {
              flex-shrink: 0;
              font-weight: 600;
              border-radius: 8px;
            }
          }

          .summary {
            color: var(--text-secondary);
            font-size: 14px;
            line-height: 1.7;
            margin: 10px 0 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            min-height: 48px;
          }

          .meta-row {
            display: flex;
            align-items: center;
            gap: 18px;
            margin-top: auto;
            padding-top: 12px;
            font-size: 13px;
            color: var(--text-muted);

            .meta-item {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              transition: color 0.2s ease;

              .el-icon {
                color: var(--primary-light);
              }

              &:hover {
                color: var(--text-secondary);
              }
            }
          }
        }
      }
    }
  }

  // -- 分页区域：居中展示，页码带悬停动画 --
  /* 分页 */
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 24px 0 48px;

    :deep(.el-pagination) {
      --el-pagination-button-bg-color: white;
      --el-pagination-hover-color: var(--primary);

      .el-pager li {
        border-radius: 10px;
        margin: 0 4px;
        box-shadow: var(--shadow-sm);
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-1px);
        }

        &.is-active {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
      }

      .btn-prev,
      .btn-next {
        border-radius: 10px;
        box-shadow: var(--shadow-sm);
      }
    }
  }

  // -- 空状态：暂无文章时展示 --
  /* 空状态 */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    color: var(--text-muted);
    background: var(--bg-card);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);

    p {
      margin-top: 16px;
      font-size: 15px;
    }
  }

  // -- 骨架屏：数据加载期间保持布局不跳动 --
  /* 骨架屏样式 */
  .skeleton-content {
    pointer-events: none;

    .skeleton-title {
      .el-icon {
        color: #e2e8f0;
      }
    }

    .skeleton-recommend {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid transparent;
      animation: pulse 1.6s ease-in-out infinite;

      .skeleton-rank {
        width: 26px;
        height: 26px;
        border-radius: 8px;
        background: #e2e8f0;
        flex-shrink: 0;
      }

      .recommend-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }

    .skeleton-article {
      background: var(--bg-card);
      border-radius: var(--radius);
      box-shadow: var(--shadow-sm);
      padding: 20px;
      margin-bottom: 20px;
      display: flex;
      gap: 20px;
      animation: pulse 1.6s ease-in-out infinite;

      .skeleton-image {
        width: 176px;
        height: 120px;
        border-radius: 12px;
        background: linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%);
        flex-shrink: 0;
      }

      .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;

        .title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .meta-row {
          display: flex;
          gap: 18px;
          margin-top: auto;
        }
      }
    }

    .skeleton-line {
      height: 12px;
      border-radius: 6px;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.6s infinite;

      &.short {
        width: 70%;
      }

      &.tiny {
        width: 80px;
      }

      &.title-line {
        width: 60%;
        height: 16px;
      }

      &.summary-line {
        width: 95%;

        &.short {
          width: 70%;
        }
      }
    }

    .skeleton-tag {
      width: 64px;
      height: 22px;
      border-radius: 8px;
      background: #e2e8f0;
    }
  }
}
</style>