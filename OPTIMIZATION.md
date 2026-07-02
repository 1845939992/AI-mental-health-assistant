# 项目优化记录

---

## 目录

1. [优化 1：Element Plus 组件与图标按需引入](#优化-1)
2. [优化 2：重复请求取消](#优化-2)
3. [优化 3：Markdown SSE 流式渲染兼容（未闭合语法清理）](#优化-3)
4. [优化 4：登录态集中管理（userStore）](#优化-4)

---

## 优化 1：Element Plus 组件与图标按需引入

### 优化目标与背景

**问题**：原项目在 `main.js` 中全量注册 Element Plus：

```js
// 改之前
import ElementPlus from 'element-plus'           // ~1MB 组件代码
import 'element-plus/dist/index.css'             // ~360KB CSS
import * as ElementPlusIconsVue from '@element-plus/icons-vue'  // 300+ 图标 ~200KB

app.use(ElementPlus)  // 注册所有组件

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)  // 注册所有图标
}
```

不管用户访问哪个页面，浏览器都要下载 ~1.5MB 的 Element Plus 全家桶。但实际每个页面只用到其中十几个组件和几个图标。

### 优化方法

用 `unplugin-vue-components` 插件在 **Vite 编译时** 自动分析模板，按需生成 import 语句。

**改动的文件**：

- `vite.config.js`：新增 `Components({ ElementPlusResolver({ importStyle: 'css' }) })`
- `main.js`：删除 `app.use(ElementPlus)`、全量 CSS import、图标 forEach 注册
- `package.json`：新增 `unplugin-vue-components` devDependency

### 技术原理

```
编译时流程：
  扫描 src/ 下所有 .vue 文件
    → 模板中发现 <el-button> → 自动加 import { ElButton } from 'element-plus' + 注入 el-button.css
    → 模板中发现 <el-table>   → 自动加 import { ElTable }  + 注入 el-table.css
    → 模板中未使用的组件       → 不打包，0 字节
```

### 图标手动导入（为什么不能全自动）

`ElementPlusResolver` 理论上能自动解析 `<el-icon><Timer /></el-icon>` 中的图标，但实际测试中有两个场景无法自动处理：

| 场景 | 原因 | 处理方式 |
|------|------|---------|
| 静态 `<Timer />` | Resolver 版本与 Vite 版本兼容性边界情况 | 手动 `import` |
| 动态 `<component :is="item.meta.icon" />` | 图标名是运行时字符串，编译时无法静态分析 | 手动导入 + `iconMap` 映射表 |

**受影响的 6 个文件**（每文件只加了 1-3 行 import）：

| 文件 | 手动导入的图标 |
|------|-------------|
| `Sidebar.vue` | PieChart, ChatLineRound, Message, User |
| `Navbar.vue` | Expand, ArrowDown |
| `knowledge.vue` | Timer, Coin |
| `ai-cunsulations.vue` | ChatRound, DeleteFilled, Plus, Promotion, Clock |
| `f-knowledge.vue` | Star |
| `articleDetail.vue` | Back, Reading, User, Calendar, View |

**特殊处理**：`TableSearch.vue` 用 `:is="'el-select'"` 动态渲染组件（字符串引用），插件无法静态分析，改为返回组件实例 `markRaw(ElSelect)`。

### 优化前后对比

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| Element Plus 引入方式 | `app.use(ElementPlus)` 全量 | unplugin-vue-components 按需 |
| 全量 CSS 文件 | `element-plus/dist/index.css` (360KB) | 随组件按需注入，每个 CSS 1-30KB |
| 图标引入 | 300+ 图标全部注册 (~200KB) | 每页面仅导入用到的那几个 |
| 构建体积 | ~1.5MB（仅 Element Plus） | 约 200-300KB（仅用到的部分） |
| 新增页面成本 | 无额外成本（已全量注册） | 需手动 import 新用到的图标 |

### 注意事项

1. 新增页面时如果用了新图标，需要在 `<script>` 顶部添加 `import { 图标名 } from '@element-plus/icons-vue'`
2. 不要用小写写图标标签（`<timer />`），要用 PascalCase（`<Timer />`）
3. 动态 `:is` 渲染的组件（如 Sidebar 的菜单图标）必须手动导入
4. `importStyle: 'css'` 模式会给每个组件注入独立 CSS，不会出现样式冲突

---

## 优化 2：重复请求取消

### 优化目标与背景

**问题**：用户快速重复点击"搜索"/"提交"按钮时，同一接口短时间内发出多次请求，造成：
- 网络资源浪费
- 后端重复处理
- 页面数据闪烁（两次请求返回顺序不确定）

### 优化方法

在 Axios 请求拦截器中基于 `AbortController` + `Map` 做请求去重。

**改动的文件**：`src/utils/request.js`（第 14-28 行、第 42-44 行、第 78-88 行）

### 技术实现

```js
// 1. 创建请求去重表
const pendingMap = new Map()  // key = "方法:URL", value = AbortController

// 2. 请求拦截器：新请求到来时取消同一 key 的旧请求
const key = `${config.method}:${config.url}`
if (pendingMap.has(key)) {
  pendingMap.get(key).abort()  // 取消旧请求
}
const controller = new AbortController()
config.signal = controller.signal  // 把取消信号绑定到请求
pendingMap.set(key, controller)

// 3. 响应拦截器：请求完成或失败后清理 key
const key = `${response.config.method}:${response.config.url}`
pendingMap.delete(key)

// 4. 被取消的请求：静默丢弃，不抛错误
if (axios.isCancel(error)) {
  return new Promise(() => { })  // 永远不 resolve 也不 reject，调用方无感知
}

// 5. 网络错误：也需清理 pendingMap 防止内存泄漏
if (error.config) {
  const key = `${error.config.method}:${error.config.url}`
  pendingMap.delete(key)
}
```

### 去重粒度

以 `method + path` 为唯一键（不含 query 参数）：

```
GET:/api/knowledge/article/page → 一个 key
POST:/api/knowledge/article/save → 另一个 key
```

不同分页参数或搜索条件导致的"参数不同但 URL 相同"会被视为同一请求并取消旧的，因为场景是"用户改条件后快速重搜"，旧请求的结果已无意义。

### 注意事项

1. **仅取消同一 URL 的前一个请求**，不同 URL 的请求互不影响
2. 被 `abort()` 的请求在响应拦截器中被 `axios.isCancel()` 捕获，**静默丢弃**（不弹错误提示）
3. 网络错误（超时、断网）也必须 `delete(key)`，否则 `pendingMap` 会残留导致后续所有该 URL 的请求都被取消
4. 这个机制解决的是 **同一接口的重复请求**，不是跨接口的并发控制

---

## 优化 3：Markdown SSE 流式渲染兼容（未闭合语法清理）

### 优化目标与背景

**问题**：AI 对话采用 SSE 流式推送，后端每次推送一个短句片段。如果 Markdown 语法被截断在两次推送之间（如 `**加粗文字` 的前半段 `**` 在第一次推送，后半段在第二次），渲染器会拿到不完整的语法标记并错误渲染。

### 优化方法

在 `MarkdownRenderer` 组件的 `computed` 渲染函数末尾，用正则逐条清理末尾的未闭合语法。

**改动的文件**：`src/components/MarkdownRenderer.vue`（第 70-76 行）

### 技术实现

```js
// 流式渲染兼容：清理末尾未闭合的 Markdown 语法
html = html.replace(/(\*\*[^*]*)$/, '')   // 未闭合粗体 **text
html = html.replace(/(\*[^*]*)$/, '')     // 未闭合斜体 *text
html = html.replace(/(```[\s\S]*)$/, '')  // 未闭合代码块 ```
html = html.replace(/($$[^$$]*)$/, '')    // 未闭合链接文本 [text
html = html.replace(/(\([^)]*)$/, '')     // 未闭合链接 URL (url
```

**处理顺序很重要**：
- 必须先处理粗体（`**`）再处理斜体（`*`），否则 `**` 会被斜体规则误判为两个 `*`
- 代码块（```）用 `[\s\S]` 匹配（包含换行），因为代码块常多行
- 链接分两步：先清理 `[text`（方括号未闭合），再清理 `(url`（圆括号未闭合）

### 效果

| 场景 | 优化前 | 优化后 |
|------|--------|--------|
| 收到 `**加粗`（未闭合） | 渲染出裸 `**加粗` 文本 | 清理掉 `**`，显示 `加粗`，等后半段到齐后正常渲染 |
| 收到 `` ```代码 ``  | 渲染出裸 `` ```代码 `` | 清理掉，等代码块闭合后再渲染 |
| 收到 `[链接文本` | 渲染出裸 `[链接文本` | 清理掉，等 URL 到齐后正常渲染 |

### 注意事项

1. 这些正则只作用于**字符串末尾**（`$` 锚点），不会误删中间已闭合的语法
2. 本质是"先藏起来，等补全再显示"的策略——下一条 SSE 片段补全后，正则不再匹配末尾残留，正常渲染
3. 如果后端永远不发闭合部分（极端情况），该片段被永久丢弃，但 SSE 流通常以完整消息结束

---

## 优化 4：登录态集中管理（userStore）

### 优化目标与背景

**问题**：原项目登录态管理散落在各处：

```js
// login.vue
localStorage.setItem('token', data.token)
localStorage.setItem('userInfo', JSON.stringify(data.userInfo))

// FrontendLayout.vue
if (localStorage.getItem('token')) { ... }

// request.js
const token = localStorage.getItem('token')

// router/index.js
const userInfo = JSON.parse(localStorage.getItem('userInfo'))
if (userInfo.userType === 2) { ... }
```

**痛点**：
- 几处判断逻辑可能不一致（有的判 `userType === 2`，有的只判 token 是否存在）
- 响应拦截器清空状态时需要同时清 localStorage + 其他副作用，容易遗漏

### 优化方法

创建 Pinia setup store 统一管理，所有读取写入都通过 store。

**新增文件**：`src/stores/user.js`

**改动的文件**：

| 文件 | 改动 |
|------|------|
| `src/views/login.vue` | 登录成功：`userStore.setLoginData(data)` 替代裸 localStorage |
| `src/components/FrontendLayout.vue` | 退出登录：`userStore.logout()` 替代裸 localStorage.removeItem |
| `src/components/Navbar.vue` | 退出登录：`userStore.logout()` |
| `src/utils/request.js` | 新增 `clearUserStore()` 函数，响应 -1 时调用（延迟 import 避免循环依赖） |
| `src/router/index.js` | `beforeEach`：`useUserStore()` 替代裸 localStorage |

### Store 设计

```js
export const useUserStore = defineStore('user', () => {
  // --- 状态 ---
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(loadUserInfo())

  // --- 计算属性 ---
  userType     = computed(() => userInfo.value?.userType ?? 0)
  isLoggedIn   = computed(() => !!token.value)
  isAdmin      = computed(() => userType.value === 2)

  // --- 方法 ---
  setLoginData(data)   // 登录时调用：同步更新 ref + localStorage
  logout()             // 退出时调用：清空 ref + localStorage
})
```

### 注意事项

1. **token 初始化仍从 localStorage 读取**（`ref(localStorage.getItem('token') || '')`），保证页面刷新不掉登录态
2. **`request.js` 中 import store 用延迟导入**（函数内动态 `import`），因为 `request.js` 是底层模块，避免顶层 import 导致循环依赖
3. **`setLoginData` 同时写 Pinia ref 和 localStorage**，写 Pinia 是为了响应式驱动计算属性，写 localStorage 是为了刷新保活
4. 这是**状态集中化**，不是**安全加固**——token 仍在 localStorage，前端防不了篡改，安全防线在后端接口鉴权
