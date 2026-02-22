## 项目上下文摘要（新功能开发）
生成时间：2026-02-22 20:30:00

### 1. 相似实现分析
- **实现1**: `src/utils/ai.ts:80-97`
  - 模式：使用 RESTful API POST 请求并强制 JSON 解析
  - 需注意：新需求提到要清洗 DeepSeek-R1 返回的思维链块 `<think>...</think>` 保护真正的 JSON。
- **实现2**: `src/App.tsx:368-430`
  - 模式：`handleBatchAnalyze` 循环处理分析队列，已有的 `batchProgress` 和 `isBatchAnalyzing` 状态目前似乎只反映在工具栏内部或未明显置顶。
  - 需要复用：修改顶栏结构，通过相对/绝对定位在 X-Style 头部渲染一个横向进度或胶囊进度提示。
- **实现3**: `src/App.tsx:282-305`
  - 模式：单个书签导出到 Markdown `generateMarkdown([tweet])` 和推送到 Obsidian `obsidian://new?file...`
  - 需进化：为 App 组件添加 `selectedIds`(Set) 的状态，将单个 tweet 改为数组传递实现批量合成和导出。

### 2. 项目约定
- **命名约定**: React Hook 用驼峰 `useX`，组件首字母大写 `TweetCard`。
- **代码风格**: X 风格（深色背景 `bg-x-bg`，淡灰色边框 `border border-x-border`，圆角和系统文字颜色 `text-x-text` 等 Tailwind 原子类）。
- **文件组织**: 仅使用 SPA 的单文件状态切换，避免引入 react-router 带来的复杂度，通过状态 `readingTweetId` 和独立弹层组件 `ImmersiveReader` 渲染更佳。

### 3. 可复用组件清单
- `src/components/TweetCard.tsx`: 现有推文卡片（后续需扩展 checkbox 暴露）。
- `src/components/Icons.tsx` (或者 App 内置SVG): 可复用返回、下载、退出相关的图标 SVG。
- `TailwindCSS` 主题变量配置（见 `index.css` 和 `tailwind.config.js`）。

### 4. 测试策略
- **测试框架**: 无纯单元测试，依赖本应用实时更新预览（Vitest/vite preview）。
- **覆盖要求**: 需要手动在 UI 上点选多个 checkbox، 测试“导出/全部取消”，需测试 DeepSeek-R1 API 解析过程的鲁棒性。

### 5. 依赖和集成点
- **内部依赖**: `dexie` (书签存储 DB，提供 `.toArray()` 和 `.update()` 等方法)。
- **外部依赖**: 调用 SiliconFlow / DeepSeek 模型的 Fetch。

### 6. 技术选型理由
- **实现无路由阅读页**: 不引入 `react-router-dom` 可避免打破原扩展现有的挂载逻辑（毕竟是个 Chrome Plugin 单页应用），采用全屏悬浮层 `fixed inset-0 z-50` 的方案足够且高效。

### 7. 关键风险点
- **选框防误触**: 点击 checkbox 时需要 `e.stopPropagation()` 避免直接触发进入了“沉浸式阅读”或展开。
- **超长导出**: URL 长度限制可能导致 `obsidian://new` 被截断，如选中的书签数百个，其 markdown 内容直接拼接在 url parameter 将失败，可能需要改为提供批量 `.md` 文件下载，或者先存本地文件再由 Obsidian 拾取（受限于浏览器沙箱体验不佳）。需要评估导出数量，对于批量 Markdown，采用 Blob 下载最安全。
