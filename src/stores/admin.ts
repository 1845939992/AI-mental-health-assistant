import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', () => {
const isCollapse = ref(false)
const toCollapse = () => {
  isCollapse.value = !isCollapse.value
}

return { isCollapse, toCollapse }
})
