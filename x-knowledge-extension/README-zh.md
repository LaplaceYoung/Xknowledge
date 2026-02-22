# X-knowledge

**X (Twitter) 专属智能知识库扩展程序**

X-knowledge 是一款为高度依赖 X (Twitter) 获取信息的用户设计的浏览器扩展程序。它能够无缝抓取您在 X 上的书签，利用 AI 自动打标签和生成摘要，并支持导出为 Markdown、JSON 甚至直接推送到 Notion 或 Obsidian。

---

## 核心特性

- **无缝书签抓取**
  在您浏览 X (Twitter) 并点击书签时自动捕获推文内容、作者信息和相关数据，无需额外操作。

- **智能 AI 分析**
  内置 AI 支持（默认支持 SiliconFlow，兼容自定义 OpenAI 格式接口），为推文自动生成摘要、提取核心标签并进行分类。

- **灵活的导出选项**
  - **Markdown & ZIP**: 轻松导出所选推文的 Markdown 文件及其相关配图的离线 ZIP 包。
  - **JSON Backup**: 支持将所有数据导出为 JSON 以作备份或迁移。
  - **Obsidian 集成**: 使用 URI 协议将推文一键快速发送至本地 Obsidian 库。
  - **Notion 同步**: 配置 Notion Token 和 Database ID，将书签及 AI 分析结果一键同步到指定数据库。

- **优质的阅读体验**
  支持暗黑/明亮主题自动同步，内置沉浸式阅读模式，可以为您生成无边框分享截图。

## 安装及运行

本项目基于 Vite + React + TypeScript + Tailwind CSS 构建。

### 本地开发

1. 克隆本仓库
```bash
git clone https://github.com/LaplaceYoung/Xknowledge.git
cd Xknowledge
```

2. 安装依赖
```bash
npm install
```

3. 运行开发服务器
```bash
npm run dev
```

4. 构建插件
```bash
npm run build
```

构建完成后，您可以通过 Chrome 的 `chrome://extensions/` 页面，开启“开发者模式”，并选择“加载已解压的扩展程序”，选择 `dist` 目录进行安装。

## 配置说明

安装扩展后，在侧边栏或选项页中进行初始配置：

1. **API 设置**: 
   - 默认使用 **SiliconFlow API**，注册并填入您的 API Key。
   - 或选择 **自定义接口**，输入兼容 OpenAI 的 Base URL、模型名称和 API Key。

2. **Notion 集成 (可选)**: 
   - 输入 Notion Internal Integration Token 和 Target Database ID。
   - *（注意：Database 必须包含 Name, URL, Date, Category, Tags 等属性列）*

## 贡献与反馈

欢迎提交 Issue 或 Pull Request！

## 许可协议

[MIT License](LICENSE)
