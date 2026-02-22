## 项目上下文摘要（修复书签爬取功能）
生成时间：2026-02-22 18:45:00

### 1. 相似实现分析
- **实现**: `src/content/inject.ts` 和 `src/utils/twitterParser.ts`
  - 模式: 通过 Monkey Patch `window.fetch` 和 `XMLHttpRequest` 拦截 GraphQL 请求，并使用递归遍历解析响应数据。
  - 需注意: X (Twitter) 的 GraphQL 响应结构频繁变化，且 Content Script 默认处于 ISOLATED 世界，无法直接访问页面级的 `fetch`。

### 2. 项目约定
- **命名约定**: 驼峰式命名 (camelCase)，类型定义清晰。
- **文件组织**: 源码位于 `src`，其中 `content` 负责页面交互，`utils` 负责逻辑解析。
- **代码风格**: 使用 TypeScript，异步操作使用 `async/await`。

### 3. 可复用组件清单
- `src/utils/twitterParser.ts`: 负责将原始 JSON 数据转换为 `ParsedTweet` 对象。
- `src/utils/db.ts`: 负责 IndexedDB (Dexie) 数据持久化。

### 4. 测试策略
- **参考模式**: 通过浏览器控制台观察 `[X-knowledge]` 前缀的日志输出，确认拦截和解析状态。
- **验证流程**:
  1. 刷新 X 书签页面。
  2. 观察控制台是否出现 "Intercepted GraphQL" 日志。
  3. 检查侧边栏 extension 是否成功加载并显示新书签。

### 5. 关键风险点
- **作用域隔离**: MV3 插件的 Content Script 默认无法拦截主页面请求，必须运行在 `MAIN` world。
- **解析鲁棒性**: X 的数据结构中作者信息 (`user_results`) 或主体信息 (`legacy`) 可能嵌套在 `TweetWithVisibilityResults` 中，或者完全缺失。
