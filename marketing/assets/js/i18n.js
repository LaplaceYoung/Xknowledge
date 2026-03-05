(() => {
  const supported = ['zh', 'en'];
  const STORE_KEY = 'xknowledge_lang';

  const messages = {
    home: {
      zh: {
        meta: {
          title: 'X-knowledge | 把 X 书签变成可检索知识系统',
          description: '将 X/Twitter 书签转为结构化知识，支持 AI 标签、批处理工作流与 Markdown/Notion/Obsidian 导出。'
        },
        nav: {
          repoLoading: '正在加载 GitHub 指标...',
          star: 'GitHub Star',
          docs: '使用文档'
        },
        controls: {
          light: '浅色',
          dark: '深色',
          zh: '中文',
          en: 'EN'
        },
        hero: {
          kicker: 'X 原生体验 · 双语 · 双主题',
          title: '把碎片书签，变成可运营的知识资产。',
          desc: 'X-knowledge 以本地优先方式管理书签，借助 AI 摘要与标签完成检索、归档和复用。',
          install: '安装扩展',
          viewRepo: '查看源码',
          cap: '累计处理书签',
          ai: 'AI 批处理成功率',
          export: '内置导出通道'
        },
        proof: {
          s1: '重度用户单库容量',
          s2: '内置导出路径',
          s3: '队列延迟控制',
          s4: '本地优先密钥策略'
        },
        feature: {
          title: '能力矩阵',
          desc: '遵循 X 信息流节奏，围绕检索、批处理和跨平台导出进行工程化设计。',
          c1t: '信号化检索',
          c1d: '按文本、作者、标签与日期筛选，卡片级高亮匹配。',
          c2t: '批处理调度',
          c2d: '支持暂停、恢复、停止与失败重试，进度和错误可追踪。',
          c3t: '知识可迁移',
          c3d: '一键导出 Markdown、JSON、ZIP，并衔接 Notion 与 Obsidian。',
          c4t: '密钥策略清晰',
          c4d: '默认本地保存 API Key，跨设备同步需显式授权。',
          c5t: '发布链路完整',
          c5d: '扩展与营销页均具备可持续迭代的发布流程。',
          c6t: '界面贴近 X',
          c6d: '主题、层级、交互反馈与 X 原生风格保持一致。'
        },
        workflow: {
          title: '4 步完成知识闭环',
          desc: '从采集到导出，形成可重复执行的个人研究流水线。',
          s1: '采集 / Capture',
          d1: '自动抓取书签推文内容、作者、互动数据与媒体。',
          s2: '结构化 / Structure',
          d2: '调用 AI 批量生成摘要、分类与可复用标签。',
          s3: '运营 / Operate',
          d3: '基于标签和时间窗口进行筛选、清洗与重试。',
          s4: '输出 / Ship',
          d4: '将结果导出到 Markdown、Notion、Obsidian 等知识栈。'
        },
        scenes: {
          title: '按角色切换工作流',
          desc: '切换不同角色，查看最短价值路径。',
          r1t: '研究者',
          r1h: '研究采集与周度信号复盘',
          r1d: '日常采集书签、批量补全元数据，每周输出可决策笔记。',
          r2t: '创作者',
          r2h: '把收藏变成内容选题池',
          r2d: '将零散书签聚合成主题簇，用于写作、视频和线程规划。',
          r3t: '产品团队',
          r3h: '同步到 Notion 的团队情报板',
          r3d: '统一分类法与摘要字段，持续更新共享情报看板。',
          link: '打开工作流指南'
        },
        guides: {
          title: '场景指南',
          desc: '围绕高意图检索词构建的实操页面。',
          g1t: '导出到 Obsidian',
          g1d: '把收藏推文转成可维护的 Markdown 笔记。',
          g2t: '同步到 Notion',
          g2d: '映射数据库字段并批量写入 AI 摘要与标签。',
          g3t: 'AI 搜索书签',
          g3d: '摆脱原生滚动，建立可检索知识层。',
          read: '阅读指南'
        },
        trust: {
          title: '参考优秀产品叙事结构',
          desc: '借鉴头部创作者和效率工具的页面方法：价值先行、证据驱动、CTA 低摩擦。'
        },
        compare: {
          title: '为什么不只用原生书签？',
          desc: 'X 原生书签解决“存”，X-knowledge 解决“找、管、用”。',
          h1: '能力项',
          h2: 'X 原生书签',
          h3: 'X-knowledge',
          r1c1: '语义检索',
          r1c2: '仅基础文本查找',
          r1c3: 'AI 标签 + 摘要 + 过滤',
          r2c1: '批处理能力',
          r2c2: '无队列控制',
          r2c3: '暂停 / 恢复 / 失败重试',
          r3c1: '可迁移性',
          r3c2: '平台内封闭',
          r3c3: 'Markdown / Notion / Obsidian / ZIP',
          r4c1: '数据策略',
          r4c2: '平台绑定',
          r4c3: '默认本地优先'
        },
        testimonials: {
          title: '真实使用场景',
          desc: '来自内容创作与产品研究流程中的高频需求。',
          q1: '“再也不用在书签列表里反复滚动，周报素材 5 分钟就能整理完。”',
          a1: '产品经理 · AI 工具方向',
          q2: '“标签和摘要让趋势挖掘效率比原生 X 高很多。”',
          a2: '独立创作者 · 增长方向',
          q3: '“同步到 Notion 后，团队有了统一的情报面板。”',
          a3: '创业团队运营 · 研究流程'
        },
        activation: {
          title: '10 分钟内完成激活',
          desc: '将上手流程压缩到首次价值：采集、结构化、导出。',
          c1t: '1) 在 Chrome 加载扩展',
          c1d: '开启开发者模式后一键加载。',
          c2t: '2) 打开 X 书签开始采集',
          c2d: '直接从现有书签列表获取数据。',
          c3t: '3) 执行 AI 批处理并导出',
          c3d: '生成元数据后导入你的知识工具栈。'
        },
        referral: {
          title: '分享给团队，统一知识分类法',
          desc: '复制当前语言版本页面链接，快速完成团队对齐。',
          copy: '复制页面链接'
        },
        faq: {
          title: '常见问题',
          desc: '安装前你最关心的问题。',
          q1: '支持 x.com 和 twitter.com 吗？',
          a1: '支持，扩展兼容两个域名。',
          q2: 'API Key 会默认上传吗？',
          a2: '不会，默认本地保存，跨端同步需要手动开启。',
          q3: '已有书签可以直接迁移吗？',
          a3: '可以，直接从 X 书签时间线批量采集。'
        },
        cta: {
          title: '从书签堆积，走向可复用知识流。',
          desc: '适合在 X 进行研究、产品情报和内容生产的个人与团队。',
          install: '安装扩展',
          star: 'Star 并关注更新'
        },
        footer: {
          copy: '由 LaplaceYoung 构建。开源、迭代驱动、可持续交付。',
          github: 'GitHub',
          docs: '文档'
        },
        runtime: {
          repoFallback: '面向 X 知识管理的开源扩展',
          copySuccess: '页面链接已复制',
          copyFail: '复制失败，请手动复制地址'
        }
      },
      en: {
        meta: {
          title: 'X-knowledge | Turn X Bookmarks into Searchable Knowledge',
          description: 'Convert X/Twitter bookmarks into structured knowledge with AI tags, batch workflows, and exports to Markdown, Notion, and Obsidian.'
        },
        nav: {
          repoLoading: 'Loading GitHub metrics...',
          star: 'Star on GitHub',
          docs: 'Docs'
        },
        controls: {
          light: 'Light',
          dark: 'Dark',
          zh: '中文',
          en: 'EN'
        },
        hero: {
          kicker: 'X-native UX · Bilingual · Dual Themes',
          title: 'Turn bookmark clutter into an operational knowledge system.',
          desc: 'X-knowledge keeps your data local-first, then layers AI summaries and tags for retrieval, curation, and reuse.',
          install: 'Install Extension',
          viewRepo: 'View Repository',
          cap: 'Bookmarks captured',
          ai: 'AI batch success',
          export: 'Built-in export routes'
        },
        proof: {
          s1: 'Bookmarks per power user',
          s2: 'Built-in export routes',
          s3: 'Queue delay control',
          s4: 'Local-first key policy'
        },
        feature: {
          title: 'Feature Matrix',
          desc: 'Designed around X-style interaction rhythm with strong retrieval, batch processing, and export portability.',
          c1t: 'Signal-rich search',
          c1d: 'Filter by text, author, tags, and date with on-card highlights.',
          c2t: 'Batch queue control',
          c2d: 'Pause, resume, stop, and retry failed AI tasks with visible progress.',
          c3t: 'Knowledge portability',
          c3d: 'Export to Markdown, JSON, ZIP, Notion, and Obsidian workflows.',
          c4t: 'Clear secret policy',
          c4d: 'API keys stay local by default, with explicit opt-in sync behavior.',
          c5t: 'Release-ready pipeline',
          c5d: 'Extension and marketing pages ship through reliable iteration loops.',
          c6t: 'X-like interface',
          c6d: 'Theme hierarchy and interaction feedback aligned with X native UI.'
        },
        workflow: {
          title: '4-step workflow',
          desc: 'A repeatable loop from capture to delivery.',
          s1: 'Capture',
          d1: 'Ingest tweet content, author, metrics, and media from bookmarks.',
          s2: 'Structure',
          d2: 'Generate summaries, categories, and reusable tags with AI.',
          s3: 'Operate',
          d3: 'Filter, review, and retry in bulk with date and tag controls.',
          s4: 'Ship',
          d4: 'Export to Markdown, Notion, Obsidian, and archive formats.'
        },
        scenes: {
          title: 'Choose your workflow lane',
          desc: 'Switch by role to see the fastest value path.',
          r1t: 'Researcher',
          r1h: 'Research capture and weekly signal reviews',
          r1d: 'Capture bookmarks daily, enrich metadata in batch, and export decision-ready notes every week.',
          r2t: 'Creator',
          r2h: 'Content backlog from saved posts',
          r2d: 'Turn scattered bookmarks into reusable topic clusters for writing, clips, and thread planning.',
          r3t: 'Product Team',
          r3h: 'Team-ready intel with Notion sync',
          r3d: 'Normalize taxonomy, sync summary fields, and keep a shared product intelligence board updated.',
          link: 'Open workflow guide'
        },
        guides: {
          title: 'Use-case Guides',
          desc: 'Practical pages for high-intent search scenarios.',
          g1t: 'Export to Obsidian',
          g1d: 'Convert saved tweets into structured markdown notes.',
          g2t: 'Sync to Notion',
          g2d: 'Map database fields and push AI summaries at scale.',
          g3t: 'Search with AI',
          g3d: 'Move beyond native scroll with a searchable layer.',
          read: 'Read Guide'
        },
        trust: {
          title: 'Benchmark-inspired product narrative',
          desc: 'Pattern references from top creator and product tools: clear value, proof-first modules, and low-friction CTA flow.'
        },
        compare: {
          title: 'Why not just use native bookmarks?',
          desc: 'X native bookmarks are storage; X-knowledge adds retrieval and operations.',
          h1: 'Capability',
          h2: 'Native X Bookmarks',
          h3: 'X-knowledge',
          r1c1: 'Semantic search',
          r1c2: 'Basic text scan only',
          r1c3: 'AI tags + summary + filters',
          r2c1: 'Batch operations',
          r2c2: 'No queue controls',
          r2c3: 'Pause / resume / retry failed',
          r3c1: 'Portability',
          r3c2: 'Locked in platform',
          r3c3: 'Markdown / Notion / Obsidian / ZIP',
          r4c1: 'Data policy',
          r4c2: 'Platform-bound',
          r4c3: 'Local-first by default'
        },
        testimonials: {
          title: 'What builders use it for',
          desc: 'Validated use-cases collected from creator workflows and product research routines.',
          q1: '"I stopped losing references in bookmark scroll. Weekly research export takes 5 minutes now."',
          a1: 'Product manager · AI tooling',
          q2: '"Tags and summaries make trend digging way faster than native X."',
          a2: 'Indie creator · Growth',
          q3: '"Notion sync gave our team a shared signal board from personal bookmarks."',
          a3: 'Startup operator · Research ops'
        },
        activation: {
          title: 'Activation in under 10 minutes',
          desc: 'Compress onboarding to first value: capture, classify, and export.',
          c1t: '1) Load extension in Chrome',
          c1d: 'Enable developer mode and load unpacked in one step.',
          c2t: '2) Open X bookmarks to ingest',
          c2d: 'Start capture immediately from your existing bookmark list.',
          c3t: '3) Run AI batch and export',
          c3d: 'Generate metadata and ship to your note stack.'
        },
        referral: {
          title: 'Share with your team and keep taxonomy aligned',
          desc: 'Copy this page link with your language setting and onboard collaborators fast.',
          copy: 'Copy Page Link'
        },
        faq: {
          title: 'FAQ',
          desc: 'Practical answers before installation.',
          q1: 'Does this work on x.com and twitter.com?',
          a1: 'Yes. The extension supports both domains.',
          q2: 'Will my API key be uploaded by default?',
          a2: 'No. Keys are local-first by default, and sync is opt-in.',
          q3: 'Can I migrate existing bookmarks?',
          a3: 'Yes. Existing bookmarks can be ingested directly from your X bookmark timeline.'
        },
        cta: {
          title: 'Move from bookmark chaos to reusable knowledge flow.',
          desc: 'Built for creators, researchers, and product teams running intelligence loops on X.',
          install: 'Install Extension',
          star: 'Star + Follow Updates'
        },
        footer: {
          copy: 'Built by LaplaceYoung. Open source, iteration-driven, launch-ready.',
          github: 'GitHub',
          docs: 'Docs'
        },
        runtime: {
          repoFallback: 'Open-source extension for serious X knowledge workflows',
          copySuccess: 'Page link copied',
          copyFail: 'Copy failed, please copy the URL manually'
        }
      }
    },
    guide_obsidian: {
      zh: {
        meta: { title: '如何将 X 书签导出到 Obsidian | X-knowledge', description: '一步步将 X 书签转成 Obsidian 可维护 Markdown 知识库。' },
        nav: { back: '返回首页', tag: '指南 / Obsidian' },
        hero: { title: '如何将 X 书签导出到 Obsidian', lead: '用 X-knowledge 把收藏推文沉淀为可复盘、可搜索、可再利用的 Markdown 资产。' },
        toc: { title: '快速导航', summary: 'TL;DR', s1: '步骤 1', s2: '步骤 2', s3: '步骤 3', faq: '常见问题' },
        summary: { title: 'TL;DR', body: '10 分钟内完成采集、AI 补全与 Markdown 导出，直接进入 Obsidian 知识库。' },
        s1: { title: '步骤 1：安装扩展并授权读取书签', li1: '在 Chrome 开发者模式加载扩展。', li2: '打开 X 书签页，让插件自动采集内容。', li3: '确认书签列表与作者信息已入库。' },
        s2: { title: '步骤 2：批量生成摘要和标签', li1: '配置 AI 服务商与模型。', li2: '开启批处理，监控成功/失败计数。', li3: '重试失败任务，保证标签完整性。' },
        s3: { title: '步骤 3：导出 Markdown 并落地到 Vault', li1: '选择 Markdown 或 ZIP 导出。', li2: '用日期或主题组织目录结构。', li3: '在 Obsidian 建立视图和查询规则。' },
        faq: { title: '常见问题', q1: '可以离线使用吗？', a1: '可以。数据默认本地保存，AI 分析按需触发。', q2: '如何避免重复导出？', a2: '按时间窗口或标签过滤后再导出。' },
        related: { title: '相关指南', r1: '同步到 Notion', r2: 'AI 搜索书签' },
        cta: { install: '安装扩展', repo: '查看源码' },
        controls: { light: '浅色', dark: '深色', zh: '中文', en: 'EN' }
      },
      en: {
        meta: { title: 'How to Export X Bookmarks to Obsidian | X-knowledge', description: 'Step-by-step workflow to convert X bookmarks into maintainable Obsidian markdown knowledge assets.' },
        nav: { back: 'Back to Home', tag: 'GUIDE / Obsidian' },
        hero: { title: 'How to Export X Bookmarks to Obsidian', lead: 'Use X-knowledge to turn saved tweets into searchable, reusable markdown assets.' },
        toc: { title: 'Quick Nav', summary: 'TL;DR', s1: 'Step 1', s2: 'Step 2', s3: 'Step 3', faq: 'FAQ' },
        summary: { title: 'TL;DR', body: 'In under 10 minutes, you can capture bookmarks, run AI enrichment, and export markdown into your Obsidian vault.' },
        s1: { title: 'Step 1: Install extension and enable bookmark capture', li1: 'Load the extension in Chrome developer mode.', li2: 'Open your X bookmarks page to ingest tweet content.', li3: 'Confirm author and bookmark data are indexed.' },
        s2: { title: 'Step 2: Generate summaries and tags in batch', li1: 'Configure your AI provider and model.', li2: 'Start batch processing and monitor success/failure.', li3: 'Retry failed tasks to keep metadata complete.' },
        s3: { title: 'Step 3: Export markdown into your vault', li1: 'Choose Markdown or ZIP export.', li2: 'Organize files by date or topic folders.', li3: 'Build Obsidian queries and dashboards.' },
        faq: { title: 'FAQ', q1: 'Can it work offline?', a1: 'Yes. Data stays local by default and AI runs on demand.', q2: 'How to avoid duplicate export?', a2: 'Filter by time range or tags before exporting.' },
        related: { title: 'Related guides', r1: 'Sync to Notion', r2: 'Search with AI' },
        cta: { install: 'Install Extension', repo: 'View Source' },
        controls: { light: 'Light', dark: 'Dark', zh: '中文', en: 'EN' }
      }
    },
    guide_notion: {
      zh: {
        meta: { title: '如何同步 X 书签到 Notion 数据库 | X-knowledge', description: '配置字段映射与 AI 元数据，将 X 收藏同步到 Notion。' },
        nav: { back: '返回首页', tag: '指南 / Notion' },
        hero: { title: '如何把 X 书签同步到 Notion', lead: '将推文内容、作者和 AI 摘要结构化写入 Notion 数据库，形成团队可共享知识面板。' },
        toc: { title: '快速导航', summary: 'TL;DR', s1: '步骤 1', s2: '步骤 2', s3: '步骤 3', faq: '常见问题' },
        summary: { title: 'TL;DR', body: '先搭好 Notion 字段映射，再小批量验证，最后全量同步以保证数据质量。' },
        s1: { title: '步骤 1：准备 Notion 集成和数据库字段', li1: '创建 Integration 并获取 Token。', li2: '建立标题、链接、作者、标签、摘要等字段。', li3: '把数据库共享给 Integration。' },
        s2: { title: '步骤 2：在扩展中配置 Notion 参数', li1: '填写 Token 与 Database ID。', li2: '先用小批量测试字段映射。', li3: '确认写入格式符合团队规范。' },
        s3: { title: '步骤 3：批量推送并持续维护', li1: '按标签或时间范围选择推送集。', li2: '失败项重试并记录错误原因。', li3: '用视图过滤高价值内容。' },
        faq: { title: '常见问题', q1: '是否支持覆盖更新？', a1: '可通过唯一链接字段去重，避免重复创建。', q2: '能否只同步部分字段？', a2: '可以，先最小字段集上线再逐步扩展。' },
        related: { title: '相关指南', r1: '导出到 Obsidian', r2: 'AI 搜索书签' },
        cta: { install: '安装扩展', repo: '查看源码' },
        controls: { light: '浅色', dark: '深色', zh: '中文', en: 'EN' }
      },
      en: {
        meta: { title: 'How to Sync X Bookmarks to Notion | X-knowledge', description: 'Configure field mapping and AI metadata to sync X bookmarks into a Notion database.' },
        nav: { back: 'Back to Home', tag: 'GUIDE / Notion' },
        hero: { title: 'How to Sync X Bookmarks to Notion', lead: 'Write tweet content, authors, and AI summaries into a structured Notion database for team-ready knowledge ops.' },
        toc: { title: 'Quick Nav', summary: 'TL;DR', s1: 'Step 1', s2: 'Step 2', s3: 'Step 3', faq: 'FAQ' },
        summary: { title: 'TL;DR', body: 'Prepare a clean Notion schema first, then run small-batch sync before full push to keep data quality stable.' },
        s1: { title: 'Step 1: Prepare Notion integration and schema', li1: 'Create a Notion integration and obtain token.', li2: 'Set fields for title, url, author, tags, and summary.', li3: 'Share the target database with the integration.' },
        s2: { title: 'Step 2: Configure Notion in extension settings', li1: 'Provide token and database ID.', li2: 'Run a small batch to verify field mapping.', li3: 'Validate formatting against your workspace standard.' },
        s3: { title: 'Step 3: Push in batch and maintain quality', li1: 'Select by tags or date range for controlled sync.', li2: 'Retry failures and document root causes.', li3: 'Use Notion views to surface high-value signals.' },
        faq: { title: 'FAQ', q1: 'Can updates overwrite existing entries?', a1: 'Use unique URL-based dedupe to avoid duplicates.', q2: 'Can I sync only partial fields?', a2: 'Yes, start with a minimal schema and expand later.' },
        related: { title: 'Related guides', r1: 'Export to Obsidian', r2: 'Search with AI' },
        cta: { install: 'Install Extension', repo: 'View Source' },
        controls: { light: 'Light', dark: 'Dark', zh: '中文', en: 'EN' }
      }
    },
    guide_search: {
      zh: {
        meta: { title: '如何用 AI 搜索 X/Twitter 书签 | X-knowledge', description: '使用 AI 标签与摘要建立可搜索的 X 书签工作流。' },
        nav: { back: '返回首页', tag: '指南 / AI 搜索' },
        hero: { title: '如何用 AI 搜索 X/Twitter 书签', lead: '通过结构化元数据和批处理机制，替代低效滚动查找，快速定位关键信息。' },
        toc: { title: '快速导航', summary: 'TL;DR', s1: '步骤 1', s2: '步骤 2', s3: '步骤 3', faq: '常见问题' },
        summary: { title: 'TL;DR', body: '先完成基础索引，再叠加 AI 标签与固定筛选组合，规模增长时检索仍稳定。' },
        s1: { title: '步骤 1：建立基础索引', li1: '先完成书签采集并核对原始内容。', li2: '按作者、时间、主题建立初始标签。', li3: '清理无效或重复收藏。' },
        s2: { title: '步骤 2：构建 AI 检索层', li1: '批量生成摘要与语义标签。', li2: '保留失败队列并执行重试。', li3: '高频标签沉淀为固定筛选器。' },
        s3: { title: '步骤 3：形成检索与导出闭环', li1: '按查询场景预设过滤组合。', li2: '定期导出到 Markdown/Notion 归档。', li3: '持续优化标签词表。' },
        faq: { title: '常见问题', q1: '适合多大规模书签？', a1: '从几百到数千条都可，建议按月维护。', q2: '如何提高检索准确率？', a2: '统一标签命名并定期清洗重复语义。' },
        related: { title: '相关指南', r1: '导出到 Obsidian', r2: '同步到 Notion' },
        cta: { install: '安装扩展', repo: '查看源码' },
        controls: { light: '浅色', dark: '深色', zh: '中文', en: 'EN' }
      },
      en: {
        meta: { title: 'How to Search X/Twitter Bookmarks with AI | X-knowledge', description: 'Build a searchable X bookmark workflow with AI-generated tags and summaries.' },
        nav: { back: 'Back to Home', tag: 'GUIDE / AI Search' },
        hero: { title: 'How to Search X/Twitter Bookmarks with AI', lead: 'Replace manual scrolling with structured metadata and batch processing so key insights are always retrievable.' },
        toc: { title: 'Quick Nav', summary: 'TL;DR', s1: 'Step 1', s2: 'Step 2', s3: 'Step 3', faq: 'FAQ' },
        summary: { title: 'TL;DR', body: 'Build a reliable index first, then add AI tagging and fixed filter sets so retrieval quality remains stable as bookmarks grow.' },
        s1: { title: 'Step 1: Build baseline indexing', li1: 'Ingest bookmarks and verify raw records.', li2: 'Create initial tags by author, date, and topic.', li3: 'Clean duplicated or low-signal items.' },
        s2: { title: 'Step 2: Add AI retrieval layer', li1: 'Generate summaries and semantic tags in batch.', li2: 'Keep failed queues visible and retry.', li3: 'Promote high-frequency tags into quick filters.' },
        s3: { title: 'Step 3: Close the search-export loop', li1: 'Predefine filter sets for recurring queries.', li2: 'Archive to Markdown/Notion on schedule.', li3: 'Refine vocabulary and merge overlapping tags.' },
        faq: { title: 'FAQ', q1: 'What scale does it support?', a1: 'Hundreds to thousands of bookmarks, with periodic maintenance.', q2: 'How to improve search precision?', a2: 'Use consistent tag naming and regular semantic cleanup.' },
        related: { title: 'Related guides', r1: 'Export to Obsidian', r2: 'Sync to Notion' },
        cta: { install: 'Install Extension', repo: 'View Source' },
        controls: { light: 'Light', dark: 'Dark', zh: '中文', en: 'EN' }
      }
    }
  };

  const getByPath = (obj, path) => path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

  const detectLang = () => {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (supported.includes(urlLang)) return urlLang;
    try {
      const stored = localStorage.getItem(STORE_KEY);
      if (supported.includes(stored)) return stored;
    } catch {
      // noop
    }
    const navLang = (navigator.language || '').toLowerCase();
    return navLang.startsWith('zh') ? 'zh' : 'en';
  };

  const setMeta = (entry, lang) => {
    const meta = getByPath(entry, 'meta');
    if (!meta) return;
    if (meta.title) document.title = meta.title;

    const setTag = (selector, content) => {
      const node = document.querySelector(selector);
      if (node && content) node.setAttribute('content', content);
    };

    setTag('meta[name="description"]', meta.description);
    setTag('meta[property="og:title"]', meta.title);
    setTag('meta[property="og:description"]', meta.description);
    setTag('meta[name="twitter:title"]', meta.title);
    setTag('meta[name="twitter:description"]', meta.description);

    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  };

  const setLangButtons = (lang) => {
    document.querySelectorAll('[data-lang-value]').forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang-value') === lang ? 'true' : 'false');
    });
  };

  const applyLang = (lang) => {
    const page = document.body.getAttribute('data-page') || 'home';
    const pageData = messages[page] || messages.home;
    const dict = pageData[lang] || pageData.en;

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      const val = getByPath(dict, key || '');
      if (typeof val === 'string') node.textContent = val;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((node) => {
      const val = node.getAttribute('data-i18n-attr') || '';
      const mappings = val.split(';').map((item) => item.trim()).filter(Boolean);
      mappings.forEach((item) => {
        const [attr, key] = item.split(':');
        if (!attr || !key) return;
        const t = getByPath(dict, key.trim());
        if (typeof t === 'string') node.setAttribute(attr.trim(), t);
      });
    });

    setMeta(dict, lang);
    setLangButtons(lang);
  };

  const setLang = (lang) => {
    const out = supported.includes(lang) ? lang : 'en';
    try {
      localStorage.setItem(STORE_KEY, out);
    } catch {
      // noop
    }
    const url = new URL(window.location.href);
    url.searchParams.set('lang', out);
    history.replaceState({}, '', url.toString());
    applyLang(out);
    window.dispatchEvent(new CustomEvent('xk:langchange', { detail: { lang: out } }));
  };

  const init = () => {
    const current = detectLang();
    applyLang(current);
    document.querySelectorAll('[data-lang-value]').forEach((btn) => {
      btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang-value') || 'en'));
    });
  };

  window.XK_I18N = {
    getLang: detectLang,
    setLang,
    t: (key) => {
      const page = document.body.getAttribute('data-page') || 'home';
      const lang = detectLang();
      const dict = (messages[page] || messages.home)[lang] || (messages[page] || messages.home).en;
      return getByPath(dict, key);
    },
    apply: () => applyLang(detectLang()),
    init
  };
})();
