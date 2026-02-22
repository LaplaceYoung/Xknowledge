## 编码前检查 - 虚拟滚动 (Task 20)
时间：2026-02-22 17:00:00

□ 已查阅上下文摘要文件：.claude/context-summary-Task20.md
□ 将使用以下可复用组件：
  - TweetCard: `x-knowledge-extension/src/components/TweetCard.tsx` - 用于绘制列表具体内容卡片并回传自身高度给列表管理器。
  - VariableSizeList: `react-window` - 用于充当动态定高外围容器，节省 RAM。
□ 将遵循命名约定：项目通用的驼峰命名格式与接口分离要求，方法名使用 `getSize`, `setSize`，参数传递依旧与旧实现对其。
□ 将遵循代码风格：Hooks 模式并挂接 `useRef` 实现脏数据快速比对。
□ 确认不重复造轮子，证明：未使用第三方高度适配补丁，利用 `react-window` 暴露出来的原生 `resetAfterIndex` API 来手工维护缓存。没有另外创建一个列表组件而是修复当前已有的列表片段。

========================================
