<template>
  <!-- 知识库文章详情页 -->
  <div class="articleDetail-container">
    <!-- 头部 -->
    <div class="header-section">
      <div class="header-content">
        <el-button circle @click="router.back()" class="back-btn">
          <el-icon :size="20">
            <Back />
          </el-icon>
        </el-button>
        <h2>文章详情</h2>
      </div>
    </div>

    <!-- 正文 -->
    <div class="content">
      <!-- 加载状态：骨架屏（标题、摘要、元信息、封面、正文段落占位） -->
      <div v-if="isLoading" class="diary-card skeleton-card">
        <el-skeleton animated>
          <template #template>
            <div class="skeleton-header">
              <el-skeleton-item variant="text" style="width: 30%; height: 24px;" />
            </div>
            <el-skeleton-item variant="h1" style="width: 70%; height: 36px; margin: 24px 0 12px;" />
            <el-skeleton-item variant="text" style="width: 90%; height: 16px; margin-bottom: 8px;" />
            <div class="skeleton-meta">
              <el-skeleton-item variant="text" style="width: 80px; height: 20px;" />
              <el-skeleton-item variant="text" style="width: 120px; height: 16px;" />
              <el-skeleton-item variant="text" style="width: 120px; height: 16px;" />
            </div>
            <el-skeleton-item variant="image"
              style="width: 100%; height: 320px; margin: 20px 0; border-radius: 12px;" />
            <el-skeleton-item variant="p" style="width: 100%; height: 16px; margin-bottom: 10px;" />
            <el-skeleton-item variant="p" style="width: 96%; height: 16px; margin-bottom: 10px;" />
            <el-skeleton-item variant="p" style="width: 92%; height: 16px; margin-bottom: 10px;" />
            <el-skeleton-item variant="p" style="width: 88%; height: 16px; margin-bottom: 10px;" />
          </template>
        </el-skeleton>
      </div>

      <div v-else class="diary-card">
        <!-- 文章基本信息区：标题 / 摘要 / 分类 / 作者 / 日期 / 阅读量 -->
        <div class="title">文章基本信息</div>

        <!-- 文章标题 -->
        <h1 class="article-title">{{ article.title }}</h1>

        <!-- 文章摘要 -->
        <div v-if="article.summary" class="summary-content">
          <p style="margin: 0; font-size: 14px; color: #374151;">
            <el-icon :size="16" style="margin-right: 6px;" v-if="article.summary">
              <Reading />
            </el-icon>
            {{ article.summary }}
          </p>
        </div>

        <!-- 分类标签 + 作者/日期 -->
        <div class="sub-title">
          <div class="category-tag">
            <el-tag type="primary" size="small" effect="light" round>{{ article.categoryName || '心理科普' }}</el-tag>
          </div>
          <div class="flex-box">
            <div class="item">
              <el-icon :size="14">
                <User />
              </el-icon>
              <span>{{ article.authorName || '系统管理员' }}</span>
            </div>
            <div class="item">
              <el-icon :size="14">
                <Calendar />
              </el-icon>
              <span>{{ dayjs(article.updatedAt).format('YYYY-MM-DD') }}</span>
            </div>
            <div class="item">
              <el-icon :size="14">
                <View />
              </el-icon>
              <span>{{ article.readCount || 0 }} 次阅读</span>
            </div>
          </div>
        </div>

        <!-- 封面图片 -->
        <div v-if="article.coverImage" class="cover-image-wrapper">
          <el-image :src="fileBaseUrl + article.coverImage" :preview-src-list="[fileBaseUrl + article.coverImage]"
            fit="contain" class="cover-image" />
        </div>

        <!-- 文章正文（富文本） -->
        <div v-if="article.content" class="content-wrapper" v-html="formatContent(article.content)"></div>

        <!-- 文章标签区：将后端 tagArray 渲染为圆角标签 -->
        <div v-if="tags.length" class="tags-content">
          <div class="tags-title">相关标签</div>
          <div class="tags-list">
            <el-tag v-for="(tag, index) in tags" :key="tag" type="info" size="small" effect="light" round
              class="article-tag" :style="{ animationDelay: `${index * 0.05}s` }">
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
/**
 * 知识库文章详情页
 * 根据路由参数 :id 调用 API 获取文章完整信息并渲染。
 * 数据加载期间展示骨架屏（el-skeleton），加载完成后渲染文章标题、摘要、封面、富文本正文及标签。
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getKnowledgeDetail } from '@/api/frontend'
import { fileBaseUrl } from '@/config/index.js' // 后端文件服务基础 URL，用于拼接封面图地址
import { dayjs } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 存储知识库文章详情
const article = ref({})

// 页面加载状态（true 时展示骨架屏，false 时展示真实内容）
const isLoading = ref(true)

/**
 * 将后端返回的 tagArray 转为响应式数组，供标签列表渲染
 * computed 而非直接赋值，确保 article 更新后 DOM 同步刷新
 */
const tags = computed(() => {
  if (!article.value.tagArray) return []
  return article.value.tagArray
})

/**
 * 对文章正文进行基础的 XSS-safe 格式化
 * - 换行符 → <br>（适配纯文本文本存储的换行）
 * - **text** → <strong>（粗体）
 * - *text* → <em>（斜体）
 */
const formatContent = (content) => {
  if (!content) return ''

  let formattedContent = content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
  return formattedContent
}

/**
 * onMounted 生命周期：
 * 先设置 isLoading = true（触发骨架屏），再异步拉取文章数据，
 * 无论成功与否，最终都将 isLoading 置为 false 以展示真实内容或空状态
 */
onMounted(async () => {
  isLoading.value = true
  try {
    article.value = await getKnowledgeDetail(route.params.id)
  } catch {
    article.value = {} // 请求失败时清空，避免展示上次缓存的旧数据
  } finally {
    isLoading.value = false
  }
})
</script>
<style lang="scss" scoped>
/**
 * articleDetail 页面样式
 * 布局：全宽渐变头部 → 居中正文卡片（骨架屏 / 真实内容）
 */

/** 页面容器 — 淡入动画 */
.articleDetail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
  animation: page-fade-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;

  /** 元信息行：作者 / 日期 / 阅读量 */
  .flex-box {
    display: flex;
    align-items: center;

    .item {
      margin-right: 20px;

      span {
        margin-left: 5px;
      }
    }
  }

  /** 全屏宽紫粉渐变头部，带下滑动画 */
  .header-section {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 40%, #f59e0b 100%);
    color: white;
    padding: 16px 48px;
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.25);
    animation: header-slide-down 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;

    .header-content {
      display: flex;
      align-items: center;
      gap: 14px;
      max-width: 1200px;
      margin: 0 auto;

      .back-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: #fff;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: translateX(-3px);
        }
      }

      h2 {
        font-size: 22px;
        font-weight: 700;
        margin: 0;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }

  /** 正文区域 — 居中最大 980px，上浮动画 */
  // -- 正文区域：居中最大 980px，上浮动画 --
  .content {
    margin: 0 auto;
    width: 980px;
    max-width: calc(100% - 40px);
    padding: 24px 20px;
    animation: content-slide-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;

    // -- 文章卡片：毛玻璃 + 柔和阴影 --
    .diary-card {
      margin-bottom: 24px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 18px;
      padding: 28px;
      box-shadow:
        0 8px 30px rgba(0, 0, 0, 0.04),
        0 2px 8px rgba(139, 92, 246, 0.06);
      border: 1px solid rgba(139, 92, 246, 0.08);
      backdrop-filter: blur(10px);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.06),
          0 4px 12px rgba(139, 92, 246, 0.1);
      }

      // -- 骨架屏内部布局占位 --
      /** 骨架屏内部布局 */
      &.skeleton-card {
        .skeleton-header {
          margin-bottom: 16px;
        }

        .skeleton-meta {
          display: flex;
          gap: 16px;
          margin: 16px 0;
        }
      }

      // -- "文章基本信息" 小标题 --
      .title {
        margin-bottom: 16px;
        font-size: 18px;
        font-weight: 600;
        color: #6b7280;
        letter-spacing: 0.3px;
      }

      // -- 分类标签与作者/日期/阅读量元信息行 --
      .sub-title {
        margin-top: 22px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;

        .category-tag {
          margin-right: 8px;
        }
      }

      // -- 文章大标题 --
      .article-title {
        font-size: 32px;
        font-weight: 800;
        color: #111827;
        margin-top: 24px;
        margin-bottom: 14px;
        line-height: 1.25;
      }

      // -- 封面图容器：圆角裁剪 + 阴影 --
      /** 封面图容器 — 圆角裁剪 + 阴影 */
      .cover-image-wrapper {
        margin: 24px 0;
        border-radius: 14px;
        overflow: hidden;
        background: #f3f4f6;
        display: flex;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);

        .cover-image {
          width: 100%;
          max-height: 520px;

          :deep(img) {
            object-fit: contain;
            max-width: 100%;
          }
        }
      }

      // -- 摘要区：绿色左边框高亮 --
      /** 摘要区 — 绿色左边框高亮 */
      .summary-content {
        background: linear-gradient(135deg, rgba(126, 211, 33, 0.12) 0%, rgba(126, 211, 33, 0.05) 100%);
        border-left: 4px solid #7ED321;
        padding: 14px 18px;
        border-radius: 0 12px 12px 0;
        position: relative;
        margin-bottom: 8px;
      }

      // -- 富文本正文：段落、标题、列表、图片排版规范 --
      /** 富文本正文 — 排版规范：段间距、标题样式、列表缩进 */
      .content-wrapper {
        font-size: 16px;
        line-height: 1.8;
        color: #374151;

        :deep(p) {
          margin-bottom: 14px;
        }

        :deep(h1),
        :deep(h2),
        :deep(h3),
        :deep(h4),
        :deep(h5),
        :deep(h6) {
          margin: 22px 0 12px;
          color: #111827;
          font-weight: 700;
        }

        :deep(h2) {
          font-size: 22px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
        }

        :deep(h3) {
          font-size: 18px;
        }

        :deep(ul),
        :deep(ol) {
          padding-left: 22px;
          margin-bottom: 14px;
        }

        :deep(li) {
          margin-bottom: 8px;
        }

        :deep(strong) {
          color: #111827;
          font-weight: 700;
        }

        :deep(img) {
          max-width: 100%;
          border-radius: 12px;
          margin: 12px 0;
        }
      }

      // -- 标签区：顶部分割线 + 弹入动画 --
      /** 标签区 — 顶部分割线 + 弹入动画 */
      .tags-content {
        margin-top: 28px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;

        .tags-title {
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;

          .article-tag {
            transition: all 0.3s ease;
            animation: tag-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
            }
          }
        }
      }
    }
  }
}

/** 页面淡入 */
@keyframes page-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/** 头部下滑 */
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

/** 正文上浮 */
@keyframes content-slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/** 标签弹入（缩放 + 回弹） */
@keyframes tag-pop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

/** 手机端适配：缩小标题字号和卡片内边距 */
@media (max-width: 767px) {
  .articleDetail-container {
    .header-section {
      padding: 14px 20px;

      .header-content h2 {
        font-size: 18px;
      }
    }

    .content {
      padding: 16px;

      .diary-card {
        padding: 20px;
        border-radius: 14px;

        .article-title {
          font-size: 24px;
        }
      }
    }
  }
}
</style>
