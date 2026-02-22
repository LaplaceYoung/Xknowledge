# X-knowledge

**Your Intelligent X (Twitter) Knowledge Base Extension**

X-knowledge is a browser extension designed for users who heavily rely on X (Twitter) for information. It seamlessly captures your bookmarks on X, uses AI to automatically tag and summarize them, and supports exporting to Markdown, JSON, or syncing directly to Notion or Obsidian.

---

## Key Features

- **Seamless Bookmark Capture**
  Automatically captures tweet content, author info, and related data when you bookmark on X (Twitter), requiring no extra actions.

- **Intelligent AI Analysis**
  Built-in AI support (defaults to SiliconFlow, compatible with custom OpenAI-format APIs) to auto-generate summaries, extract key tags, and categorize your tweets.

- **Flexible Export Options**
  - **Markdown & ZIP**: Easily export selected tweets as Markdown files and offline ZIP packages containing their related images.
  - **JSON Backup**: Support exporting all data to JSON for backup or migration.
  - **Obsidian Integration**: Send tweets quickly to your local Obsidian vault using the URI protocol.
  - **Notion Sync**: Configure your Notion Token and Database ID to sync bookmarks and AI analysis directly to a specified database.

- **Premium Reading Experience**
  Supports auto-syncing of dark/light themes, features an immersive reading mode, and can generate borderless screenshots for sharing.

## Installation & Run

This project is built with Vite, React, TypeScript, and Tailwind CSS.

### Local Development

1. Clone this repository
```bash
git clone https://github.com/LaplaceYoung/Xknowledge.git
cd Xknowledge
```

2. Install dependencies
```bash
npm install
```

3. Run dev server
```bash
npm run dev
```

4. Build extension
```bash
npm run build
```

After building, go to Chrome's `chrome://extensions/` page, enable "Developer mode", and click "Load unpacked" to select the `dist` directory.

## Configuration Guide

After installing the extension, perform the initial configuration in the sidebar or options page:

1. **API Settings**: 
   - Defaults to **SiliconFlow API**. Register and enter your API Key.
   - Or choose **Custom**, entering your OpenAI-compatible Base URL, Model Name, and API Key.

2. **Notion Integration (Optional)**: 
   - Enter your Notion Internal Integration Token and Target Database ID.
   - *(Note: The Database must include Name, URL, Date, Category, Tags properties)*

## Contribution & Feedback

Issues and Pull Requests are welcome!

## License

[MIT License](LICENSE)
