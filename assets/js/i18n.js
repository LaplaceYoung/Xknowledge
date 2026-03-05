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
          kicker: 'X-Native UX · 本地优先 · AI 驱动',
          title: ' Everything from X, now actionable.',
          desc: 'X-knowledge 将混乱的书签转化为可搜索的情报中心。AI 驱动的结构化，零成本导出。',
          install: '安装扩展',
          viewRepo: '查看源码',
          trendingTitle: '知识趋势榜',
          showMore: '查看更多',
          cap: '已采集书签',
          ai: 'AI 批处理成功',
          export: '内置导出通道'
        },
        proof: {
          s1: '重度用户单库容量',
          s2: '内置导出路径',
          s3: '队列延迟控制',
          s4: '本地优先密钥策略'
        },
        trust: {
          title: '参考优秀产品叙事结构',
          desc: '借鉴头部创作者和效率工具的页面方法：价值先行、证据驱动、CTA 低摩擦。'
        },
        feature: {
          title: '能力矩阵',
          desc: '遵循 X 信息流节奏，围绕检索、批处理和跨平台导出进行工程化设计。',
          c1t: '信号化检索',
          c1d: '按文本、作者、标签与日期筛选。',
          c2t: '批处理调度',
          c2d: '支持暂停、恢复、停止与失败重试。',
          c3t: '知识可迁移',
          c3d: '一键导出 Markdown、JSON、ZIP，衔接 Notion 与 Obsidian。',
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
          s1: '采集',
          d1: '自动抓取书签推文内容。',
          s2: '结构化',
          d2: '调用 AI 批量生成摘要与标签。',
          s3: '运营',
          d3: '基于标签和时间窗口进行筛选与重试。',
          s4: '输出',
          d4: '将结果导出到 Markdown 和 Notion。'
        },
        scenes: {
          title: '按角色切换工作流',
          desc: '切换不同角色，查看最短价值路径。',
          r1t: '研究者',
          r1h: '研究采集与周度信号复盘',
          r1d: '日常采集书签并批量补全元数据。',
          r2t: '创作者',
          r2h: '把收藏变成内容选题池',
          r2d: '将零散书签聚合成主题簇。',
          r3t: '产品团队',
          r3h: '同步到 Notion 的团队情报板',
          r3d: '统一分类法与摘要字段。',
          link: '打开指南'
        },
        guides: {
          title: '场景指南',
          desc: '围绕高意图检索词构建的实操页面。',
          g1t: '导出到 Obsidian',
          g1d: '把推文转成结构化 Markdown 笔记。',
          g2t: '同步到 Notion',
          g2d: '映射数据库字段并推送摘要。',
          g3t: 'AI 搜索书签',
          g3d: '摆脱原生滚动，建立可检索层。',
          read: '阅读指南'
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
          r2c3: '暂停 / 恢复 / 重试',
          r3c1: '可迁移性',
          r3c2: '平台内封闭',
          r3c3: 'Markdown / Notion / Obsidian',
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
          c1t: '1) 加载扩展',
          c1d: '开启开发者模式后一键加载。',
          c2t: '2) 开始采集',
          c2d: '直接从现有书签列表获取数据。',
          c3t: '3) 批处理与导出',
          c3d: '生成元数据后导入你的知识栈。'
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
          a2: '不会，默认本地保存。',
          q3: '已有书签可以直接迁移吗？',
          a3: '可以，直接从 X 书签批量采集。'
        },
        cta: {
          title: '从书签堆积，走向可复用知识流。',
          desc: '适合在 X 进行研究和内容生产的团队。',
          install: '安装扩展',
          star: 'Star 关注更新'
        },
        footer: {
          copy: '由 LaplaceYoung 构建。开源、迭代驱动。',
          github: 'GitHub',
          docs: '文档'
        },
        runtime: {
          repoFallback: '面向 X 知识管理的开源扩展',
          copySuccess: '链接已复制',
          copyFail: '复制失败'
        }
      },
      en: {
        meta: {
          title: 'X-knowledge | Turn X Bookmarks into Searchable Knowledge',
          description: 'Convert X/Twitter bookmarks into structured knowledge.'
        },
        nav: {
          repoLoading: 'Loading GitHub metrics...',
          star: 'GitHub Star',
          docs: 'Docs'
        },
        controls: {
          light: 'Light',
          dark: 'Dark',
          zh: '中文',
          en: 'EN'
        },
        hero: {
          kicker: 'X-Native UX · Local-First · AI-Powered',
          title: 'Everything from X,<br>now actionable.',
          desc: 'X-knowledge turns your chaotic bookmarks into a searchable intelligence hub.',
          install: 'Install Extension',
          viewRepo: 'View GitHub',
          trendingTitle: 'Trending in your knowledge',
          showMore: 'Show more',
          cap: 'bookmarks summarized',
          ai: 'insights captured',
          export: 'exports to Notion'
        },
        proof: {
          s1: 'Bookmarks per power user',
          s2: 'Built-in export routes',
          s3: 'Queue delay control',
          s4: 'Local-first key policy'
        },
        trust: {
          title: 'Benchmark-inspired product narrative',
          desc: 'Pattern references from top creator and product tools.'
        },
        feature: {
          title: 'Feature Matrix',
          desc: 'Designed around X-style interaction rhythm.',
          c1t: 'Signal-rich search',
          c1d: 'Filter by text, author, tags, and date.',
          c2t: 'Batch queue control',
          c2d: 'Pause, resume, and retry failed AI tasks.',
          c3t: 'Knowledge portability',
          c3d: 'Export to Markdown, Notion, and Obsidian.',
          c4t: 'Clear secret policy',
          c4d: 'API keys stay local by default.',
          c5t: 'Release-ready pipeline',
          c5d: 'Ship through reliable iteration loops.',
          c6t: 'X-like interface',
          c6d: 'Theme hierarchy aligned with X native UI.'
        },
        workflow: {
          title: '4-step workflow',
          desc: 'A repeatable loop from capture to delivery.',
          s1: 'Capture',
          d1: 'Ingest tweet content from bookmarks.',
          s2: 'Structure',
          d2: 'Generate summaries and tags with AI.',
          s3: 'Operate',
          d3: 'Filter, review, and retry in bulk.',
          s4: 'Ship',
          d4: 'Export to Markdown and Notion.'
        },
        scenes: {
          title: 'Choose your workflow lane',
          desc: 'Switch by role to see the fastest value path.',
          r1t: 'Researcher',
          r1h: 'Research capture and weekly signal reviews',
          r1d: 'Capture bookmarks daily and enrich metadata.',
          r2t: 'Creator',
          r2h: 'Content backlog from saved posts',
          r2d: 'Turn scattered bookmarks into reusable topic clusters.',
          r3t: 'Product Team',
          r3h: 'Team-ready intel with Notion sync',
          r3d: 'Normalize taxonomy and sync summary fields.',
          link: 'Open Guide'
        },
        guides: {
          title: 'Use-case Guides',
          desc: 'Practical pages for high-intent scenarios.',
          g1t: 'Export to Obsidian',
          g1d: 'Convert saved tweets into structured markdown.',
          g2t: 'Sync to Notion',
          g2d: 'Map database fields and push summaries.',
          g3t: 'Search with AI',
          g3d: 'Move beyond native scroll.',
          read: 'Read Guide'
        },
        compare: {
          title: 'Why not just use native bookmarks?',
          desc: 'Native is for storage; X-knowledge is for operations.',
          h1: 'Capability',
          h2: 'Native X',
          h3: 'X-knowledge',
          r1c1: 'Semantic search',
          r1c2: 'Basic text scan only',
          r1c3: 'AI tags + summary + filters',
          r2c1: 'Batch operations',
          r2c2: 'No queue controls',
          r2c3: 'Pause / resume / retry',
          r3c1: 'Portability',
          r3c2: 'Locked in platform',
          r3c3: 'Markdown / Notion / Obsidian',
          r4c1: 'Data policy',
          r4c2: 'Platform-bound',
          r4c3: 'Local-first'
        },
        testimonials: {
          title: 'What builders use it for',
          desc: 'Validated use-cases collected from creator workflows.',
          q1: '"I stopped losing references in bookmark scroll. Weekly research export takes 5 minutes now."',
          a1: 'Product manager · AI tooling',
          q2: '"Tags and summaries make trend digging way faster than native X."',
          a2: 'Indie creator · Growth',
          q3: '"Notion sync gave our team a shared signal board from personal bookmarks."',
          a3: 'Startup operator · Research ops'
        },
        activation: {
          title: 'Activation in under 10 minutes',
          desc: 'Compress onboarding to first value.',
          c1t: '1) Load extension',
          c1d: 'Enable developer mode and load in one step.',
          c2t: '2) Open X bookmarks',
          c2d: 'Start capture immediately from your list.',
          c3t: '3) AI batch and export',
          c3d: 'Generate metadata and ship to your stack.'
        },
        referral: {
          title: 'Share with your team',
          desc: 'Copy this page link to onboard collaborators fast.',
          copy: 'Copy Page Link'
        },
        faq: {
          title: 'FAQ',
          desc: 'Practical answers before installation.',
          q1: 'Does this work on x.com and twitter.com?',
          a1: 'Yes. The extension supports both domains.',
          q2: 'Will my API key be uploaded by default?',
          a2: 'No. Keys are local-first by default.',
          q3: 'Can I migrate existing bookmarks?',
          a3: 'Yes. Existing bookmarks can be ingested directly.'
        },
        cta: {
          title: 'From bookmark chaos to reusable knowledge flow.',
          desc: 'Built for creators and product teams.',
          install: 'Install Extension',
          star: 'Star + Follow'
        },
        footer: {
          copy: 'Built by LaplaceYoung. Open source.',
          github: 'GitHub',
          docs: 'Docs'
        },
        runtime: {
          repoFallback: 'Open-source extension for X knowledge workflows',
          copySuccess: 'Link copied',
          copyFail: 'Copy failed'
        }
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

  const applyLang = (lang) => {
    const page = document.body.getAttribute('data-page') || 'home';
    const pageData = messages[page] || messages.home;
    const dict = pageData[lang] || pageData.en;

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      const val = getByPath(dict, key || '');
      if (typeof val === 'string') node.textContent = val;
    });

    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  };

  const setLang = (lang) => {
    const out = supported.includes(lang) ? lang : 'en';
    try { localStorage.setItem(STORE_KEY, out); } catch {}
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

  window.XK_I18N = { getLang: detectLang, setLang, apply: () => applyLang(detectLang()), init };
})();
