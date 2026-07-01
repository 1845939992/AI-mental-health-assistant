<script setup>
/**
 * 根组件
 * 仅作为路由出口容器，所有页面通过 router-view 渲染
 */
</script>

<template>
  <div>
    <router-view />
  </div>

</template>

<style lang="scss" scoped>
/* 全局防止 100vw 全宽元素产生水平滚动条 */
div {
  overflow-x: hidden;
}
</style>
