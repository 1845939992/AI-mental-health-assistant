<template>
    <div style="border: 1px solid #ccc">
      <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
        class="editor-toolbar"
             />
      <Editor
        style="height: 500px; overflow-y: hidden;"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="handleChange"
        @onDestroyed="handleEditorDestroyed"
      />
    </div>
</template>
<script>
  import '@wangeditor/editor/dist/css/style.css' // 引入 css

  import { onBeforeUnmount, ref, shallowRef, watch, reactive } from 'vue'
  import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

  const defaultToolbarKeys = [
    'bold','italic','underline','color','bgColor','|','fontSize','fontFamily','|','header1','header2','header3','|','bulletedList','numberedList','blockquote','|','insertLink','|','undo','redo'
  ]

  export default {
    components: { Editor, Toolbar },
    props: {
      modelValue: {
        type: String,
        default: ''
      },
      placeholder: {
        type: String,
        default: '请输入内容...'
      },
      maxLength: {
        type: Number,
        default: 5000
      },
      toolbarKeys: {
        type: Array,
        default: () => defaultToolbarKeys,
      }
    },
    emits: ['update:modelValue', 'change'],
    setup(props, { emit }) {
      // 编辑器实例，必须用 shallowRef
      const editorRef = shallowRef()

      // 内容 HTML
      const valueHtml = ref(props.modelValue || '')

      // 当父组件更新 modelValue 时同步到编辑器
      watch(() => props.modelValue, (newVal) => {
        if (newVal !== valueHtml.value) {
          valueHtml.value = newVal
        }
      })

      const toolbarConfig = reactive({
        toolbarKeys: props.toolbarKeys
      })

      const editorConfig = reactive({
        placeholder: props.placeholder,
        maxLength: props.maxLength
      })

      // 监听 placeholder 变化
      watch(() => props.placeholder, (newVal) => {
        editorConfig.placeholder = newVal
      })

      // 内容变化时通知父组件
      const handleChange = (editor) => {
        const html = editor.getHtml()
        emit('update:modelValue', html)
        emit('change', html)
      }

      // 编辑器销毁回调
      const handleEditorDestroyed = () => {
        // 编辑器销毁时的清理逻辑
      }

      // 组件销毁时，也及时销毁编辑器
      onBeforeUnmount(() => {
        const editor = editorRef.value
        if (editor == null) return
        editor.destroy()
      })

      const handleCreated = (editor) => {
        editorRef.value = editor // 记录 editor 实例，重要！
      }

      return {
        editorRef,
        valueHtml,
        mode: 'default', // 或 'simple'
        toolbarConfig,
        editorConfig,
        handleCreated,
        handleChange,
        handleEditorDestroyed,
      }
    },
  }
</script>
