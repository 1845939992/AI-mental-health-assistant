<template>
  <div class="knowledge-container">
    <!-- 头部：分层设计，图标 + 标题 + 功能说明 + 底部曲线过渡 -->
    <div class="header-section">
      <div class="header-bg-dots"></div>
      <div class="header-content">
        <div class="header-icon-circle">
          <span class="header-icon">📖</span>
        </div>
        <div class="header-text-group">
          <h2>心理健康知识库</h2>
          <p class="header-desc">精选专业心理科普文章，为您提供科学、温暖的心理健康知识与疗愈方法</p>
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

/* 头部流动渐变（与情绪日记统一） */
@keyframes header-shimmer {
  0% {
    background-position: 0% 0;
  }

  50% {
    background-position: 100% 0;
  }

  100% {
    background-position: 0% 0;
  }
}

/* 图标圆形容器浮动（与情绪日记统一） */
@keyframes icon-float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

/* 头部入场下滑动画 */
@keyframes header-slide-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes header-content-fade {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 头部浮动：使用 transform(GPU 合成层)替代 top(Layout)，零重排 */
@keyframes header-float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(6px);
  }
}

@keyframes header-content-fade {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

// -- 设计变量与页面容器：紫粉金统一色彩体系（与情绪日记协调） --
/* 设计变量：紫粉金统一色彩体系 */
.knowledge-container {
  --primary: #8b5cf6;
  --primary-light: #a78bfa;
  --primary-deep: #7c3aed;
  --accent: #f59e0b;
  --accent-warm: #f97316;
  --pink: #ec4899;
  --text-main: #1f2937;
  --text-secondary: #4b5563;
  --text-muted: #9ca3af;
  --bg-soft: #f8fafc;
  --bg-card: #ffffff;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 8px 24px rgba(139, 92, 246, 0.08);
  --shadow-lg: 0 16px 40px rgba(139, 92, 246, 0.12);
  --radius: 16px;

  min-height: 100vh;
  /* 统一色彩：紫粉金径向光斑 + 线性渐变 */
  background:
    radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 85% 15%, rgba(236, 72, 153, 0.06) 0%, transparent 35%),
    radial-gradient(circle at 90% 85%, rgba(245, 158, 11, 0.05) 0%, transparent 40%),
    linear-gradient(180deg, #faf5ff 0%, #fdf2f8 30%, #fff7ed 70%, #f8fafc 100%);

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

  // -- 头部区域：分层设计，紫色强调（与情绪日记的粉色强调形成差异） --
  /* 头部：分层设计 + 点阵纹理解码 + 图标圆形容器 + 底部波浪曲线过渡 */
  .header-section {
    /* 与内容区同宽，不再全宽铺满 */
    width: 100%;
    max-width: 1200px;
    margin: -34px auto 0;
    box-sizing: border-box;
    will-change: transform;
    /* 浮动动画 GPU 合成层提示 */
    /* 紫色强调的流动渐变（与情绪日记的粉色强调形成差异） */
    background: linear-gradient(135deg,
        #6366f1 0%,
        #8b5cf6 25%,
        #a78bfa 50%,
        #8b5cf6 75%,
        #6366f1 100%);
    background-size: 200% 200%;
    animation: header-shimmer 12s ease-in-out infinite, header-slide-down 0.7s cubic-bezier(0.22, 1, 0.36, 1) both, header-float 4s ease-in-out infinite 0.7s;
    color: white;
    padding: 22px 48px 22px 60px;
    overflow: hidden;

    /* 多层阴影：立体悬浮效果 */
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.10),
      0 2px 8px rgba(0, 0, 0, 0.06),
      0 16px 48px rgba(139, 92, 246, 0.28);

    /* 点阵背景纹理解码层 */
    .header-bg-dots {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(circle at 20% 25%, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
        radial-gradient(circle at 70% 35%, rgba(255, 255, 255, 0.1) 1.5px, transparent 1.5px),
        radial-gradient(circle at 80% 65%, rgba(255, 255, 255, 0.12) 1px, transparent 1px),
        radial-gradient(circle at 25% 70%, rgba(255, 255, 255, 0.08) 2px, transparent 2px);
      background-size:
        90px 90px,
        110px 110px,
        100px 100px,
        130px 130px;
      opacity: 0.5;
    }

    .header-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 1200px;
      margin: 0 auto;
      animation: header-content-fade 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;

      /* 图标圆形容器：毛玻璃 + 浮动动画 */
      .header-icon-circle {
        width: 52px;
        height: 52px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(12px);
        box-shadow:
          0 4px 16px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
        animation: icon-float 3s ease-in-out infinite;

        .header-icon {
          font-size: 26px;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
        }
      }

      /* 标题组：标题 + 功能说明文字 */
      .header-text-group {
        display: flex;
        flex-direction: column;
        gap: 4px;

        h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          line-height: 1.2;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
          letter-spacing: -0.01em;
        }

        /* 功能说明：帮助用户理解页面用途和操作方式 */
        .header-desc {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          opacity: 0.9;
          font-weight: 400;
          max-width: 360px;
        }
      }
    }

    /* 底部波浪曲线：平滑过渡到内容区 */
  }

  /* 整体圆角：底部大弧度减少棱角，平滑过渡到内容区 */
  border-radius: 60px;

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
      padding: 24px;
      height: fit-content;
      position: sticky;
      top: 24px;
      border: 1px solid rgba(139, 92, 246, 0.1);
      transition: box-shadow 0.3s ease, border-color 0.3s ease;

      &:hover {
        border-color: rgba(139, 92, 246, 0.2);
        box-shadow: 0 12px 32px rgba(139, 92, 246, 0.1);
      }

      .section-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-main);
        margin-bottom: 18px;
        display: flex;
        align-items: center;
        gap: 8px;
        /* 左侧渐变装饰条 */
        padding-left: 14px;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 18px;
          border-radius: 2px;
          background: linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%);
        }

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
            background: linear-gradient(135deg, #faf5ff 0%, #fef3c7 100%);
            border-color: rgba(139, 92, 246, 0.2);
            transform: translateX(4px);
            box-shadow: 0 4px 16px rgba(139, 92, 246, 0.1);

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
        border: 1px solid rgba(139, 92, 246, 0.08);

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(139, 92, 246, 0.25);
          /* 底部渐变光晕 */
          box-shadow: 0 12px 32px rgba(139, 92, 246, 0.1), 0 4px 8px rgba(236, 72, 153, 0.06);

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
          background: linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%);
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
            background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%);
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
                color: #a78bfa;
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
          background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
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
        background: linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%);
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

/* ==================== RESPONSIVE — 平板 ==================== */
@media (max-width: 991px) {
  .knowledge-container {
    .header-section {
      padding: 20px 24px 18px 52px;
      border-radius: 48px;

      .header-content {
        gap: 12px;

        .header-icon-circle {
          width: 44px;
          height: 44px;

          .header-icon {
            font-size: 22px;
          }
        }

        .header-text-group {
          h2 {
            font-size: 20px;
          }

          .header-desc {
            font-size: 12px;
            max-width: 280px;
          }
        }
      }
    }

    .content {
      width: auto;
      flex-direction: column;

      .recommend-section {
        width: 100%;
        position: static;
      }
    }
  }
}

/* ==================== RESPONSIVE — 手机 ==================== */
@media (max-width: 767px) {
  .knowledge-container {
    .header-section {
      padding: 18px 16px 14px 42px;
      border-radius: 36px;

      .header-content {
        gap: 10px;

        .header-icon-circle {
          width: 38px;
          height: 38px;

          .header-icon {
            font-size: 18px;
          }
        }

        .header-text-group {
          h2 {
            font-size: 18px;
          }

          .header-desc {
            font-size: 12px;
            max-width: none;
          }
        }
      }
    }

    .content {
      padding: 0 10px;

      .article-list .article-item {
        flex-direction: column;

        .cover-wrapper {
          width: 100%;
          height: 160px;
        }
      }
    }
  }
}

/* ==================== RESPONSIVE — 小手机 ==================== */
@media (max-width: 480px) {
  .knowledge-container {
    .header-section {
      padding: 14px 12px 12px 34px;
      border-radius: 28px;

      .header-content {
        .header-icon-circle {
          width: 32px;
          height: 32px;

          .header-icon {
            font-size: 16px;
          }
        }

        .header-text-group {
          h2 {
            font-size: 16px;
          }

          .header-desc {
            font-size: 11px;
          }
        }
      }
    }
  }
}

/* ==================== 高分辨率大屏优化 ==================== */
@media (min-width: 1600px) {
  .knowledge-container {
    .header-section {
      padding: 28px 64px 28px 68px;
      border-radius: 60px;

      .header-content {
        .header-icon-circle {
          width: 60px;
          height: 60px;

          .header-icon {
            font-size: 30px;
          }
        }

        .header-text-group {
          h2 {
            font-size: 26px;
          }

          .header-desc {
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>