# X-Knowledge 浏览器插件 - 开发路线图 (Roadmap)

本项目致力于打造一个无缝融入 X (Twitter) 的高质量书签与知识管理工具。以公开发布为目标，注重隐私安全、深度数据抓取、美观的UI交互以及流畅的知识流转（Markdown/Notion/Obsidian）。

## 阶段一：公开发布准备与架构升级 (P0)
* [x] **API Key 安全配置与用户引导**
  * 移除代码中硬编码的 SiliconFlow API Key。
  * 开发 Options 设置页，允许用户填入自己的 API Key。
  * 编写面向新用户的使用引导 (Onboarding Guide)。
* [x] **突破存储限制**
  * 在 `manifest.json` 中配置 `"unlimitedStorage"` 权限，确保海量书签不会导致存储溢出。
* [x] **迁移至 Chrome Side Panel (侧边栏模式)**
  * 废弃现有的 Popup 模式，改用 `chrome.sidePanel` API。
  * 实现“边刷推特边整理”的无缝工作流。

## 阶段二：UI/UX 深度适配 X Native 风格 (P1)
* [x] **像素级复刻 X 视觉规范**
  * 深度重构 Tailwind CSS 配置。
  * 适配 X 的明亮/昏暗/纯黑 (Dim/Lights out) 主题模式。
  * 统一字体排版、圆角大小、Hover 动效与滚动条样式。
  * 确保侧边栏 UI 与 X 主站无缝融合，不产生割裂感。

## 阶段三：全量数据深度抓取引擎 (P1)
* [x] **增强型 GraphQL 拦截与解析**
  * **原文与长文**：完整抓取推文文本，包括推特长文 (Notes) 的展开内容。
  * **高清媒体资源**：准确提取原图 (Original 图片) 和高质量视频/GIF链接。
  * **上下文与评论**：重点抓取“贴主在评论区的补充发言（Self-replies/Threads）”，保留完整的知识上下文。

## 阶段四：半自动化 AI 批量处理机制 (P2)
* [x] **可控的批量分析队列**
  * 在侧边栏 UI 中添加“批量分析未分类书签”的控制区（包含：开始、暂停、进度条）。
  * 引入队列系统与请求节流 (Rate Limiting) 机制，避免频繁调用导致用户 API 账号触发 429 错误。
  * 把消耗 Token 的控制权交给用户（半自动化模式）。

## 阶段五：高质量 Markdown 导出与媒体处理 (P2)
* [x] **构建美观的 Markdown 渲染引擎**
  * 根据抓取到的复杂数据（文本、图片、视频链接、线程）生成排版精美、结构清晰的 Markdown 文本。
  * 保证导出媒体功能可用（正确嵌入图片/视频语法）。
* [x] **适配双链笔记 (Obsidian/Notion)**
  * 自动生成 YAML Frontmatter（包含标签、分类、作者、时间等元数据）。
  * 提供“一键复制到剪贴板”和“下载 .md 文件”功能，为未来的 Notion/Obsidian 自动同步做技术铺垫。

## 阶段六：高阶特性与生产级架构 (P3 - 预计工时: 5+小时)
* [x] **Task 6: 媒体资源本地化与 ZIP 导出方案 (1.5h)**
  * **问题**：推特的图片/视频链接带有 Token 会过期，导致导出的 Markdown 最终图片失效。
  * **方案**：在导出时拉取媒体流，将其转存为本地文件，并生成包含 `.md` 原文和 `assets/` 媒体文件夹的 `.zip` 压缩包。
* [x] **Task 7: 存储架构升级：从 Chrome.storage 到 IndexedDB (1h)**
  * **问题**：即使有 `unlimitedStorage`，`chrome.storage.local` 也不适合频繁读写带有 Base64 图片或巨大文本块的数千条推文。
  * **方案**：引入轻量级 IndexedDB 封装（如 `dexie` 或 `idb`）重构本地数据库，提高读写性能和检索速度。
* [x] **Task 8: X (Twitter) 原生主题无缝同步 (1h)**
  * **问题**：目前侧边栏背景是写死的，如果用户在 X 主站切换了暗色模式，侧边栏会显得极其刺眼和割裂。
  * **方案**：开发一个 Content Script 监听器，实时探测 X 网页的主题状态（`body` 的背景色或相关 CSS 类），通过消息机制让插件的 Tailwind Theme 自动跟随变换（Light / Dim / Lights out）。
* [x] **Task 9: Notion API 直连导入功能 (1h)**
  * **方案**：超越单纯的 Markdown 导出，在设置页提供 Notion API 的 Integration Token 输入框。实现一键将书签直接推送到用户的 Notion Database 中，并自动映射好 Category 和 Tags 属性。
* [x] **Task 10: AI 分析 Prompt 自定义引擎 (0.5h)**
  * **问题**：不同用户对推文摘要的需求不同（有人需要投资代码提取，有人需要翻译摘要）。
  * **方案**：在设置页提供一个多行文本框，允许高级用户覆盖默认的 AI Prompt，将大语言模型的能力完全开放给用户定制。

## 阶段七：25+ 深度迭代与优化任务清单 (The 25+ Tasks)
### 核心存储与底层 (Storage & Core)
* [x] Task 11: 引入 Dexie.js 将存储全面迁移至 IndexedDB。
* [x] Task 12: 实现完整数据备份 (导出完整 JSON)。
* [x] Task 13: 实现数据恢复 (从 JSON 导入)。
* [x] Task 14: 为危险操作（清空数据）增加二次确认 Modal。

### 媒体与离线化 (Media & Offline)
* [ ] Task 15: 拦截并缓存原图 (Blob) 至 IndexedDB。
* [ ] Task 16: 实现视频资源的离线缓存提取。
* [x] Task 17: 开发完整的 `.zip` 离线包导出功能（包含图片/视频文件和链接替换）。
* [x] Task 18: 在侧边栏增加图片点击放大的 Lightbox 预览功能。

### UI/UX 体验升级 (UI/UX Polish)
* [x] Task 19: 监听 X 主站 DOM，实现 Light/Dim/Dark 主题无缝自动切换。
* [x] Task 20: 引入 react-window 实现书签列表的虚拟滚动 (Virtual Scrolling)，解决卡顿。
* [x] Task 21: 增加“回到顶部”悬浮按钮。
* [x] Task 22: 添加全局 Toast 提示组件（例如“书签已保存”、“分析完成”）。
* [x] Task 23: 优化侧边栏滚动条样式，使其与 macOS/Twitter 原生滚动条一致。

### AI 深度定制 (AI Customization)
* [x] Task 24: 在设置页提供 AI Prompt 自定义输入框。
* [ ] Task 25: 支持在设置页选择不同的 AI 模型 (如 DeepSeek-Chat, Qwen 等)。
* [ ] Task 26: 增加 AI 调参功能 (Temperature 控制)。
* [ ] Task 27: 为批量分析加入自动重试 (Auto-Retry) 机制，应对网络波动。

### 知识流转与交互管理 (Knowledge Flow & Management)
* [x] Task 28: 单条书签删除功能。
* [x] Task 29: 单条书签一键复制为 Markdown 功能。
* [ ] Task 30: 支持手动修改/增加 AI 生成的标签 (Tags)。
* [ ] Task 31: 书签排序功能 (按时间、按原推文转推数/点赞数)。
* [x] Task 32: Notion API 直连配置与一键发送。
* [ ] Task 33: Obsidian URI scheme 一键发送 (`obsidian://new`)。
* [ ] Task 34: 将精选书签生成精美分享图片 (Canvas/html2canvas)。
* [ ] Task 35: 书签按日期范围的高级筛选功能。

---
*注：此任务列表由 Claude Code 管理，我们将在此 Ralph Loop 中逐步实现以上承诺，直至打造出一个美观完善的浏览器插件。*