<template>
  <div class="page-head">
    <p class="page-title">{{ props.title }}</p>
    <div class="btn-accion">
      <slot name="buttons"></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>
<style  lang="scss" scoped>
.page-head {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
}
.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
.btn-accion {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
