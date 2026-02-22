## 项目上下文摘要（Task 20 - Virtual Scrolling 虚拟滚动解决列表卡顿）
生成时间：2026-02-22 17:00:00

### 1. 相似实现分析
- **实现1**: `x-knowledge-extension/src/App.tsx:492-525`
  - 模式：使用 `react-window` 的 List 构建渲染列表项框架。
  - 需注意：原本预期动态引入的第三方 `useDynamicRowHeight` Hook 不存在或不可用，导致应用内 `listRef`, `getSize`, `setSize` 方法未定义而白屏或报错。我们需要转为基于 `react-window` 内置组件 `VariableSizeList` 管理自身字典的模式。
- **实现2**: `x-knowledge-extension/src/components/TweetCard.tsx:36-50`
  - 模式：使用 `ResizeObserver` 及原生的图片回调抛出 `onHeightReady` 以精准返回渲染树结构中的元素总高度。
  - 需注意：它传递的行高已附带组件边界（增加 16px 为 CSS Margin 对齐用），直接喂入字典即可。

### 2. 项目约定
- **命名约定**: 骆驼拼写法 (CamelCase)、明确的 TypeScript 静态类型 (如 `Tweet`, `React.FC`) 和内敛注释。
- **文件组织**: 主要在 `App.tsx` 统筹并向子组件 `TweetCard` 派发任务；UI 与背景逻辑通过 `background/`, `content/` 分离解耦。
- **代码风格**: 基于 React hooks 和 tailwind CSS，没有大段类组件存在。避免引入过重或复杂的依赖组件。

### 3. 可复用组件清单
- `src/components/TweetCard.tsx`: 单条知识卡片的无状态容器和基础处理逻辑。自带了动态自适应计算体积的能力。
- `src/utils/twitterParser.ts`: 获取到的 Payload 解析机制，不需要修改但与列表数据的属性有高度依赖。

### 4. 测试策略
- **测试框架**: 无现成自动化测试框架，依靠 Chrome DevTools 排查节点变更。
- **覆盖要求**: 侧边界栏上下滑动，检索词发生更新时（索引0的内容改变），虚拟滚动容器不能出现串列、文字覆盖或空白黑洞现象。针对动态加高的瀑布流图片流与长文必须稳定不抖动。

### 5. 依赖和集成点
- **外部依赖**: `react-window`, `react-virtualized-auto-sizer`
- **内部依赖**: `TweetCard` 依赖由 `App.tsx` 动态派发其 `index` 和 `onHeightReady` 事件。

### 6. 技术选型理由
- **为什么用这个方案**: 在侧边界栏（Width 有限而 Height 无限的 Webview 环境中）当书签量累积至数千，如果全量渲染会导致应用层卡死，并迅速占据大量 RAM 导致 Chrome 直接抛弃此插件。
- **优势**: 内存复用，每次最多只渲染可视区域加上下预留的数条卡片实例。

### 7. 关键风险点
- **动态高度失效**: 图片在加载前未知体积，导致首次渲染存在堆叠风险；解决手段是组件内置的 `onLoad` 引发重绘。
- **检索过滤**: List 数据源一旦变动，`sizeMap` 的旧 `index` 内容与新数组的 `index` 将出现冲突；需要监听检索变更事件来强行清除并重建缓存字典。
