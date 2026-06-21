# 后端开发与部署计划

## 概览

为"AI心理健康助手"前端项目新建 Node.js + Express + MySQL 后端，实现所有前端页面所需的 API 接口，并部署上线。

---

## 一、当前状态分析

### 1.1 前端现状
- **技术栈**：Vue 3 + Vite + Element Plus + Pinia + Axios
- **项目路径**：`d:\code\solo try\AI mental health assistant`
- **API 调用方式**：Axios 实例，baseURL 为 `/api`，开发时通过 Vite proxy 转发到 `http://159.75.169.224:1235`
- **响应格式约定**：所有接口返回 `{ code: 200, data: ..., msg: ... }`，前端 interceptor 识别 string 类型的 `"200"` 为成功，`"-1"` 为登录过期
- **认证方式**：登录后获取 token，存在 localStorage，后续请求在 header 中带 `token` 字段

### 1.2 需要实现的接口（共13个）

| # | 方法 | 路径 | 说明 |
|---|------|------|------|
| 1 | POST | `/api/user/login` | 管理员登录 |
| 2 | GET | `/api/knowledge/category/tree` | 获取文章分类树 |
| 3 | GET | `/api/knowledge/article/page` | 分页文章列表 |
| 4 | POST | `/api/file/upload` | 文件上传 |
| 5 | POST | `/api/knowledge/article` | 创建文章 |
| 6 | GET | `/api/knowledge/article/:id` | 文章详情 |
| 7 | PUT | `/api/knowledge/article/:id` | 更新文章 |
| 8 | PUT | `/api/knowledge/article/:id/status` | 文章上下架 |
| 9 | DELETE | `/api/knowledge/article/:id` | 删除文章 |
| 10 | GET | `/api/psychological-chat/sessions` | 咨询会话列表 |
| 11 | GET | `/api/psychological-chat/sessions/:id/messages` | 会话消息记录 |
| 12 | GET | `/api/emotion-diary/admin/page` | 情绪日记分页 |
| 13 | GET | `/api/data-analytics/overview` | 综合数据分析 |

### 1.3 数据模型

**管理员/admin**
```
id, username, password(加密), nickname, avatar, createdAt
```

**文章分类/category**
```
id, name, parentId, sort, createdAt
```

**知识文章/article**
```
id, title, content, coverImage, categoryId, summary, tags, authorName, 
readCount, status(0=草稿/1=已发布/2=已下架), createdAt, updatedAt
```

**咨询会话/consultation_session**
```
id, userId, userNickname, sessionTitle, lastMessageContent, messageCount, 
lastMessageTime, startedAt
```

**会话消息/session_message**
```
id, sessionId, senderType(1=用户/2=AI), content, createdAt
```

**情绪日记/emotion_diary**
```
id, userId, nickname, diaryDate, moodScore(1-10), sleepQuality(/5), 
stressLevel(/5), emotionTriggers, diaryContent, createdAt
```

---

## 二、实施方案

### 步骤1：项目初始化

在项目根目录下创建 `server/` 文件夹，初始化 Node.js 后端项目。

**操作**：
- 在 `d:\code\solo try\AI mental health assistant\server\` 下创建 `package.json`
- 安装依赖：`express`, `mysql2`, `sequelize`, `cors`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `multer`
- 创建目录结构：`server/src/{config,models,routes,controllers,middleware,utils}`

### 步骤2：数据库设计与建表

**文件**：`server/src/models/` 下创建各 Sequelize 模型定义文件
- `Admin.js` - 管理员模型
- `Category.js` - 分类模型
- `Article.js` - 文章模型
- `ConsultationSession.js` - 咨询会话模型
- `SessionMessage.js` - 会话消息模型
- `EmotionDiary.js` - 情绪日记模型
- `index.js` - 模型关联与导出

同时创建 `server/src/config/database.js` 连接 MySQL。

### 步骤3：编写接口

**文件**：
- `server/src/routes/index.js` - 路由入口，挂载所有子路由
- `server/src/routes/auth.js` - 登录相关路由
- `server/src/routes/article.js` - 文章 CRUD 路由
- `server/src/routes/category.js` - 分类路由
- `server/src/routes/upload.js` - 文件上传路由
- `server/src/routes/consultation.js` - 咨询会话路由
- `server/src/routes/emotion.js` - 情绪日记路由
- `server/src/routes/analytics.js` - 数据分析路由

**文件**：
- `server/src/controllers/` 下对应每个路由模块编写控制器逻辑
- `server/src/middleware/auth.js` - JWT 认证中间件（校验 token，返回管理员信息）
- `server/src/utils/response.js` - 统一响应格式封装：`{ code: "200", data, msg }`

### 步骤4：主入口文件

**文件**：`server/src/app.js` - Express 应用配置
- 配置 cors（允许跨域）
- 配置 JSON 解析
- 配置静态文件服务（上传的文件）
- 挂载路由
- 全局错误处理

**文件**：`server/index.js` - 服务启动入口

### 步骤5：创建数据库初始化脚本

**文件**：`server/src/seed.js` - 初始化一个管理员账号和示例数据

### 步骤6：修改前端配置

**修改文件**：`vite.config.js`
- 将 proxy target 改为本地后端地址（开发时用 `http://localhost:3000`）

**修改文件**：`src/config/index.js`
- 添加生产环境 API 地址配置

**修改文件**：`src/utils/request.js`
- baseURL 改为可配置（开发环境用 `/api` proxy，生产环境用实际地址）

### 步骤7：部署上线

**方案A（推荐 - 国内云服务器）**：
- 购买阿里云/腾讯云轻量应用服务器（约 50-100元/月）
- 安装 Node.js 18+ 和 MySQL 8.0
- 使用 PM2 进程管理运行后端
- 配置 Nginx 反向代理
- 将前端打包后的 dist 文件也部署到服务器，或使用 Vercel/Netlify 部署前端

**方案B（免费方案）**：
- 后端：Railway.app / Render.com（免费额度，有休眠限制）
- 数据库：PlanetScale（免费 MySQL）
- 缺点：国内访问速度较慢，免费额度有限

由于用户要求免费部署，推荐优先尝试方案B，但如果体验不佳再考虑方案A。

### 步骤8：环境变量配置

**文件**：`server/.env.example` - 环境变量模板
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mental_health
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
PORT=3000
```

---

## 三、文件变更清单

### 新建文件（server/ 目录）
| 文件 | 说明 |
|------|------|
| `server/package.json` | 后端项目配置 |
| `server/.env.example` | 环境变量模板 |
| `server/index.js` | 入口文件 |
| `server/src/app.js` | Express 应用 |
| `server/src/config/database.js` | 数据库连接 |
| `server/src/models/index.js` | 模型总入口 |
| `server/src/models/Admin.js` | 管理员模型 |
| `server/src/models/Category.js` | 分类模型 |
| `server/src/models/Article.js` | 文章模型 |
| `server/src/models/ConsultationSession.js` | 会话模型 |
| `server/src/models/SessionMessage.js` | 消息模型 |
| `server/src/models/EmotionDiary.js` | 情绪日记模型 |
| `server/src/models/Analytics.js` | 分析数据模型 |
| `server/src/routes/index.js` | 路由汇总 |
| `server/src/routes/auth.js` | 认证路由 |
| `server/src/routes/article.js` | 文章路由 |
| `server/src/routes/category.js` | 分类路由 |
| `server/src/routes/upload.js` | 上传路由 |
| `server/src/routes/consultation.js` | 咨询路由 |
| `server/src/routes/emotion.js` | 情绪日记路由 |
| `server/src/routes/analytics.js` | 分析路由 |
| `server/src/controllers/auth.js` | 认证控制器 |
| `server/src/controllers/article.js` | 文章控制器 |
| `server/src/controllers/category.js` | 分类控制器 |
| `server/src/controllers/upload.js` | 上传控制器 |
| `server/src/controllers/consultation.js` | 咨询控制器 |
| `server/src/controllers/emotion.js` | 情绪日记控制器 |
| `server/src/controllers/analytics.js` | 分析控制器 |
| `server/src/middleware/auth.js` | JWT 认证中间件 |
| `server/src/utils/response.js` | 统一响应工具 |
| `server/src/seed.js` | 数据库初始化数据 |

### 修改文件（前端）
| 文件 | 修改内容 |
|------|----------|
| `vite.config.js` | proxy target 改为可配置 |
| `src/utils/request.js` | baseURL 支持环境区分 |
| `src/config/index.js` | 新增后端地址配置 |

---

## 四、假设与决策

1. 后端运行在 **3000 端口**
2. 文件上传存储在 `server/uploads/` 目录
3. JWT token 有效期设为 **7天**
4. 管理员密码使用 bcryptjs 加密
5. 分页默认每页 10 条
6. 数据库表名前缀为 `mh_`（mental health）
7. 文件上传最大 5MB，仅允许图片格式
8. 缓存策略：暂不引入 Redis，后续按需添加

---

## 五、验证步骤

1. 启动 MySQL，创建数据库 `mental_health`
2. 运行 `npm run seed` 初始化管理员账号
3. 启动后端：`npm run dev`（端口 3000）
4. 用 Postman/Apifox 测试 `/api/user/login` 接口
5. 启动前端，验证登录、文章管理、咨询记录、情绪日记等所有页面功能
6. 部署到服务器后，用公网地址完整测试

---

## 六、关于免费部署的现实说明

完全免费的方案比较受限，推荐以下路线：

- **学习和测试阶段**：本地运行，前端 `npm run dev` + 后端 `npm run dev`，不需要任何服务器
- **上线阶段（免费）**：Render.com 部署后端 + PlanetScale 免费 MySQL 数据库，前端的 dist 部署到 Vercel。缺点是 Render 免费实例 15 分钟无请求会休眠，唤醒需要几十秒
- **正式使用**：建议购买阿里云/腾讯云轻量服务器（约 ¥68/月起），MySQL 可以直接装在服务器上，最稳定
