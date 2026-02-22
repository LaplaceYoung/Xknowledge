# X-knowledge

**X (Twitter) 专属智能知识库扩展程序 | Your Intelligent X (Twitter) Knowledge Base Extension**

X-knowledge 是一款为高度依赖 X (Twitter) 获取信息的用户设计的浏览器扩展程序。它能够无缝抓取您在 X 上的书签，利用 AI 自动打标签和生成摘要，并支持导出为 Markdown、JSON 甚至直接推送到 Notion 或 Obsidian。

X-knowledge is a browser extension designed for users who heavily rely on X (Twitter) for information. It seamlessly captures your bookmarks on X, uses AI to automatically tag and summarize them, and supports exporting to Markdown, JSON, or syncing directly to Notion or Obsidian.

---

## 🌟 核心特性 | Key Features

- **✅ 无缝书签抓取 | Seamless Bookmark Capture**
  在您浏览 X (Twitter) 并点击书签时自动捕获推文内容、作者信息和相关数据，无需额外操作。
  Automatically captures tweet content, author info, and related data when you bookmark on X (Twitter), requiring no extra actions.

- **🧠 智能 AI 分析 | Intelligent AI Analysis**
  内置 AI 支持（默认支持 SiliconFlow，兼容自定义 OpenAI 格式接口），为推文自动生成摘要、提取核心标签并进行分类。
  Built-in AI support (defaults to SiliconFlow, compatible with custom OpenAI-format APIs) to auto-generate summaries, extract key tags, and categorize your tweets.

- **📁 灵活的导出选项 | Flexible Export Options**
  - **Markdown & ZIP**: 轻松导出所选推文的 Markdown 文件及其相关配图的离线 ZIP 包。
    Easily export selected tweets as Markdown files and offline ZIP packages containing their related images.
  - **JSON Backup**: 支持将所有数据导出为 JSON 以作备份或迁移。
    Support exporting all data to JSON for backup or migration.
  - **Obsidian 集成 | Obsidian Integration**: 使用 URI 协议将推文一键快速发送至本地 Obsidian 库。
    Send tweets quickly to your local Obsidian vault using the URI protocol.
  - **Notion 同步 | Notion Sync**: 配置 Notion Token 和 Database ID，将书签及 AI 分析结果一键同步到指定数据库。
    Configure your Notion Token and Database ID to sync bookmarks and AI analysis directly to a specified database.

- **🎨 优质的阅读体验 | Premium Reading Experience**
  支持暗黑/明亮主题自动同步，内置沉浸式阅读模式，可以为您生成无边框分享截图。
  Supports auto-syncing of dark/light themes, features an immersive reading mode, and can generate borderless screenshots for sharing.

## 🚀 安装及运行 | Installation & Run

本项目基于 Vite + React + TypeScript + Tailwind CSS 构建。
This project is built with Vite + React + TypeScript + Tailwind CSS.

### 本地开发 | Local Development

1. 克隆本仓库 | Clone this repository
```bash
git clone https://github.com/LaplaceYoung/Xknowledge.git
cd Xknowledge
```

2. 安装依赖 | Install dependencies
```bash
npm install
```

3. 运行开发服务器 | Run dev server
```bash
npm run dev
```

4. 构建插件 | Build extension
```bash
npm run build
```

构建完成后，您可以通过 Chrome 的 `chrome://extensions/` 页面，开启“开发者模式”(Developer mode)，并“加载已解压的扩展程序”(Load unpacked)，选择 `dist` 目录进行安装。
After building, go to Chrome's `chrome://extensions/` page, enable "Developer mode", and click "Load unpacked" to select the `dist` directory.

## ⚙️ 配置说明 | Configuration Guide

安装扩展后，在侧边栏或选项页中进行初始配置：
After installing the extension, perform the initial configuration in the sidebar or options page:

1. **API 设置 | API Settings**: 
   - 默认使用 **SiliconFlow API**，注册并填入您的 API Key。
     Defaults to **SiliconFlow API**. Register and enter your API Key.
   - 或选择 **自定义接口 (Custom)**，输入兼容 OpenAI 的 Base URL、模型名称和 API Key。
     Or choose **Custom**, entering your OpenAI-compatible Base URL, Model Name, and API Key.

2. **Notion 集成 (可选) | Notion Integration (Optional)**: 
   - 输入 Notion Internal Integration Token 和 Target Database ID。
     Enter your Notion Internal Integration Token and Target Database ID.
   - *（注意：Database 必须包含 Name, URL, Date, Category, Tags 等属性列）*
     *(Note: The Database must include Name, URL, Date, Category, Tags properties)*

## 🤝 贡献与反馈 | Contribution & Feedback

欢迎提交 Issue 或 Pull Request！
Issues and Pull Requests are welcome!

## 📜 许可协议 | License

[MIT License](LICENSE)
