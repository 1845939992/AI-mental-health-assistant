# 调试备忘录

## 1. 编辑文章后 token 被清除、跳转登录页

**根因**：`ArticleDialog.vue` 的 `watch` 中使用了 `nextTick`，导致 `formData` 延迟赋值。

- `watch(() => props.article)` 检测到编辑数据后，通过 `nextTick` 异步赋值 `formData`
- 在 `nextTick` 回调执行前，`formData` 仍保留完整的 `article` 对象（含 18 个字段）
- 点击"更新"时 `handleSubmit` 直接提交了完整对象，后端无法处理多余字段，返回 `code: '-1'`
- 响应拦截器检测到 `-1`，清除 `localStorage` 中的 token，重定向到登录页

**修复**：移除 `watch` 中的 `nextTick`，同步赋值；`handleSubmit` 中显式构造只含 6 个表单字段的 `submitData`。

---

## 2. 新增文章时 `handleEdit({ })` 传空对象导致 `id` 为 `undefined` 引发报错

**位置**：`knowledge.vue#L5`

```html
<el-button type="primary" @click="handleEdit({ })" >新增</el-button>
```

**根因**：传入空对象 `{}`，其 `id` 属性为 `undefined`（而非 `null`），`ArticleDialog` 的 `watch` 中以 `newVal?.id` 判断时，`undefined` 和 `null` 在可选链下行为一致，但后续 `businessId.value = newVal.id` 会将 `undefined` 赋给 `businessId`，与预期 `null` 不符。

---

## 3. 发布/下线文章返回 500：形参非解构，实参误传对象

**位置**：`knowledge.vue#L172,L193` → `asmin.js#L40-L42`

**原始代码**

```js
changeArticleStatus(row.id, {status: 1})
export function changeArticleStatus(id, status) {
  return service.put(`/knowledge/article/${id}/status`, {status})
}
```

**原因**：形参未解构，传 `{status: 1}` 整个对象被赋给 `status`，请求体属性简写 `{status}` → `{status: {status: 1}}`，后端收到嵌套对象报 500。

**语法要点**：`{xxx}` 在形参位置是**解构拆包**，在对象字面量位置是**属性简写打包**，拆包只在接收参数那一刻发生。

**修复**：`changeArticleStatus(id, { status })` — 解构的本质是 形参和实参要匹配 ：你传对象 {status: 1} ，形参就要写成 { status } 来解构它；你传裸值 1 ，形参就写成普通变量 status 。两边对不上就会出 bug。

