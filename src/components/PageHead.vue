<template>
  <div class="page-head">
    <p class="page-title">{{ props.title }}</p>
    <div class="btn-accion">
      <slot name="buttons"></slot>
    </div>
  </div>
</template>
<script setup>
/**
 * 页面头部组件
 * 接收 title 属性渲染标题，通过 buttons 插槽支持在右侧添加操作按钮
 * 适用于所有管理端页面头部（如"情绪日志""知识文章"等）
 */
const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>
<style lang="scss" scoped>
.page-head {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  /* 柔和渐变背景，替代单调白底 */
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(99, 102, 241, 0.01) 50%, transparent 100%);
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 20px;
  border-radius: 8px 8px 0 0;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
  /* 左侧色条装饰 */
  padding-left: 16px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 24px;
    border-radius: 0 4px 4px 0;
    background: #6366F1;
  }
}

.btn-accion {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
</style>
