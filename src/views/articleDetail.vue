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
      <!-- 加载状态：骨架屏 -->
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
            <el-skeleton-item variant="image" style="width: 100%; height: 320px; margin: 20px 0; border-radius: 12px;" />
            <el-skeleton-item variant="p" style="width: 100%; height: 16px; margin-bottom: 10px;" />
            <el-skeleton-item variant="p" style="width: 96%; height: 16px; margin-bottom: 10px;" />
            <el-skeleton-item variant="p" style="width: 92%; height: 16px; margin-bottom: 10px;" />
            <el-skeleton-item variant="p" style="width: 88%; height: 16px; margin-bottom: 10px;" />
          </template>
        </el-skeleton>
      </div>

      <div v-else class="diary-card">
        <!-- 文章基本信息 -->
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

        <!-- 文章标签 -->
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getKnowledgeDetail } from '@/api/frontend'
import { fileBaseUrl } from '@/config/index.js'
import { dayjs } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 存储知识库文章详情
const article = ref({})

// 页面加载状态
const isLoading = ref(true)

// 标签字符串拆分为数组
const tags = computed(() => {
  if (!article.value.tagArray) return []
  return article.value.tagArray
})

// 基本的HTML清理和格式化
const formatContent = (content) => {
  if (!content) return ''

  let formattedContent = content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
  return formattedContent
}

onMounted(async () => {
  isLoading.value = true
  try {
    article.value = await getKnowledgeDetail(route.params.id)
  } catch {
    article.value = {}
  } finally {
    isLoading.value = false
  }
})
</script>
<style lang="scss" scoped>
.articleDetail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
  animation: page-fade-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;

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

  .content {
    margin: 0 auto;
    width: 980px;
    max-width: calc(100% - 40px);
    padding: 24px 20px;
    animation: content-slide-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;

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

      .title {
        margin-bottom: 16px;
        font-size: 18px;
        font-weight: 600;
        color: #6b7280;
        letter-spacing: 0.3px;
      }

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

      .article-title {
        font-size: 32px;
        font-weight: 800;
        color: #111827;
        margin-top: 24px;
        margin-bottom: 14px;
        line-height: 1.25;
      }

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

      .summary-content {
        background: linear-gradient(135deg, rgba(126, 211, 33, 0.12) 0%, rgba(126, 211, 33, 0.05) 100%);
        border-left: 4px solid #7ED321;
        padding: 14px 18px;
        border-radius: 0 12px 12px 0;
        position: relative;
        margin-bottom: 8px;
      }

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

@keyframes page-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

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
