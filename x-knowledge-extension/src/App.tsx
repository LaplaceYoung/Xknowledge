import { useState, useMemo, useRef, useEffect } from 'react'
import { ParsedTweet } from './utils/twitterParser'
import { analyzeTweet } from './utils/ai'
import { generateMarkdown, downloadMarkdown } from './utils/markdownExport'
import { pushToNotion } from './utils/notionExport'
import { exportToZip } from './utils/zipExport'
import { CustomDatePicker } from './components/CustomDatePicker'
import { db } from './utils/db'

import { Onboarding } from './components/Onboarding'
import { useToast } from './contexts/ToastContext'
// @ts-ignore - react-window 类型定义与实际导出不匹配
import { List } from 'react-window'
// @ts-ignore - auto-sizer 导出兼容性
import { AutoSizer } from 'react-virtualized-auto-sizer'


import { TweetCard } from './components/TweetCard'
import { ImmersiveReader } from './components/ImmersiveReader'
import './App.css'

function App() {
  const { showToast } = useToast();


  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean | null>(null);
  const [notionToken, setNotionToken] = useState<string | null>(null);
  const [notionDbId, setNotionDbId] = useState<string | null>(null);

  // Theme Sync logic
  useEffect(() => {
    const applyTheme = (theme: string) => {
      const root = document.documentElement;
      if (theme === 'dim') {
        root.setAttribute('data-theme', 'dim');
      } else if (theme === 'dark') {
        root.setAttribute('data-theme', 'lights-out');
      } else {
        root.removeAttribute('data-theme'); // default light
      }
    };

    // 1. Initial check: get current theme from active tab
    if (chrome && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_CURRENT_THEME' }, (response) => {
            if (!chrome.runtime.lastError && response?.theme) {
              applyTheme(response.theme);
            }
          });
        }
      });
    }

    // 2. Listen for theme changes broadcasted by the content script
    const messageListener = (message: any) => {
      if (message.type === 'THEME_CHANGED' && message.payload) {
        applyTheme(message.payload);
      }
    };

    if (chrome && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(messageListener);
    }

    return () => {
      if (chrome && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.removeListener(messageListener);
      }
    };
  }, []);

  useEffect(() => {
    // Check if API key is already configured
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['siliconFlowApiKey', 'notionToken', 'notionDatabaseId'], (result) => {
        setIsApiKeyConfigured(!!result.siliconFlowApiKey);
        setNotionToken((result.notionToken as string) || null);
        setNotionDbId((result.notionDatabaseId as string) || null);
      });
    } else {
      // For local development without extension environment
      setIsApiKeyConfigured(false);
    }
  }, []);

  // 手动查询替代 useLiveQuery（后者无法感知 service worker 的跨上下文 IndexedDB 写入）
  const [bookmarks, setBookmarks] = useState<ParsedTweet[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshBookmarks = async () => {
    try {
      const all = await db.tweets.orderBy('createdAt').reverse().toArray();
      setBookmarks(all);
      setLoading(false);
    } catch (err) {
      console.error('[X-knowledge] Failed to load bookmarks:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBookmarks();

    // 监听后台脚本的数据更新通知
    const onMessage = (message: any) => {
      if (message.type === 'BOOKMARKS_UPDATED') {
        console.log(`[X-knowledge] Side panel received update notification (${message.count} new).`);
        refreshBookmarks();
      }
    };

    if (chrome?.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(onMessage);
    }

    return () => {
      if (chrome?.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(onMessage);
      }
    };
  }, []);



  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [pushingId, setPushingId] = useState<string | null>(null)

  // Immersive interaction
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [readingTweetId, setReadingTweetId] = useState<string | null>(null)

  // Batch analysis state
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false)
  const [isBatchPaused, setIsBatchPaused] = useState(false)
  const batchStateRef = useRef({ isRunning: false, isPaused: false });
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 })

  // Zip export state
  const [isExportingZip, setIsExportingZip] = useState(false)
  const [zipProgress, setZipProgress] = useState({ current: 0, total: 0 })

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  // Float to top state
  const [showScrollTop, setShowScrollTop] = useState(false)

  // New state for filtering and searching
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'time' | 'retweets' | 'likes'>('time')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // UI state
  const [isGeneratingImage, setIsGeneratingImage] = useState<string | null>(null)
  const [showTools, setShowTools] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setShowClearConfirm(true);
  }

  const confirmClear = async () => {
    try {
      await db.tweets.clear();
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(['parsedBookmarks', 'rawBookmarks']); // Cleanup legacy
      }
      setShowClearConfirm(false);
      showToast('所有数据已清空', 'success');
    } catch (err) {
      console.error('Failed to clear database', err);
      showToast('清空数据失败', 'error');
    }
  }

  const handleExport = () => {
    const mdContent = generateMarkdown(filteredBookmarks);
    downloadMarkdown(mdContent, 'x-knowledge-export.md');
  };

  const handleExportZip = async () => {
    setIsExportingZip(true);
    setZipProgress({ current: 0, total: 0 });
    try {
      await exportToZip(filteredBookmarks, (current, total) => {
        setZipProgress({ current, total });
      });
    } catch (err) {
      console.error('Failed to export ZIP', err);
      showToast('导出 ZIP 失败，请检查网络连接！', 'error');
    } finally {
      setIsExportingZip(false);
      setZipProgress({ current: 0, total: 0 });
    }
  };

  const handleExportJSON = async () => {
    try {
      const allBookmarks = await db.tweets.toArray();
      const jsonStr = JSON.stringify(allBookmarks, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `x-knowledge-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export JSON', err);
      showToast('导出 JSON 失败！', 'error');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          // Import into Dexie
          await db.tweets.bulkPut(data);
          showToast(`成功导入 ${data.length} 条书签！`, 'success');
        } else {
          showToast('JSON 格式错误：期望一个数组。', 'error');
        }
      } catch (err) {
        console.error('Failed to parse or import JSON', err);
        showToast('导入失败，请检查文件格式！', 'error');
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async (tweet: ParsedTweet) => {
    setAnalyzingId(tweet.id)
    try {
      const result = await analyzeTweet(tweet.text)
      if (result) {
        await db.tweets.update(tweet.id, { aiAnalysis: result });
      }
    } catch (error) {
      console.error('Failed to analyze tweet:', error)
    } finally {
      setAnalyzingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await db.tweets.delete(id);
    } catch (err) {
      console.error('Failed to delete tweet', err);
    }
  };

  const handleUpdateTags = async (id: string, newTags: string[]) => {
    try {
      const tweet = await db.tweets.get(id);
      if (tweet && tweet.aiAnalysis) {
        await db.tweets.update(id, {
          aiAnalysis: {
            ...tweet.aiAnalysis,
            tags: newTags
          }
        });
        showToast('已更新标签', 'success');
      }
    } catch (err) {
      console.error('Failed to update tags', err);
      showToast('更新标签失败', 'error');
    }
  };

  const handleCopyMarkdown = async (tweet: ParsedTweet) => {
    const mdContent = generateMarkdown([tweet]);
    try {
      await navigator.clipboard.writeText(mdContent);
      showToast('已复制该书签的 Markdown！', 'success');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handlePushToObsidian = (tweet: ParsedTweet) => {
    const mdContent = generateMarkdown([tweet]);
    const dateStr = new Date(tweet.createdAt).toISOString().split('T')[0];
    // Sanitize filename
    const safeAuthorName = tweet.authorName.replace(/[\/\?<>\\:\*\|"]/g, '_');
    const fileName = `X-knowledge/${dateStr}-${safeAuthorName}`;

    // Construct Obsidian URI
    const obsUri = `obsidian://new?file=${encodeURIComponent(fileName)}&content=${encodeURIComponent(mdContent)}`;

    // Open URI
    window.location.href = obsUri;
    showToast('已尝试唤起 Obsidian！', 'info');
  };

  const handleToggleSelect = (id: string, selected: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredBookmarks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBookmarks.map(b => b.id)));
    }
  };

  const handleExportSelectedMarkdown = () => {
    if (selectedIds.size === 0) return;
    const selectedTweets = bookmarks.filter(b => selectedIds.has(b.id));
    const mdContent = generateMarkdown(selectedTweets);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `x-knowledge-batch-${dateStr}.md`;
      downloadMarkdown(mdContent, fileName);
      showToast('已下载所选书签 Markdown 文件！', 'success');
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to download', err);
    }
  };

  const handlePushSelectedToObsidian = () => {
    if (selectedIds.size === 0) return;
    const selectedTweets = bookmarks.filter(b => selectedIds.has(b.id));
    const mdContent = generateMarkdown(selectedTweets);
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `X-knowledge/Batch-${dateStr}-${Date.now()}`;
    const obsUri = `obsidian://new?file=${encodeURIComponent(fileName)}&content=${encodeURIComponent(mdContent)}`;
    window.location.href = obsUri;
    showToast('已尝试唤起 Obsidian 导出多条书签！', 'info');
    setSelectedIds(new Set());
  };

  const handleGenerateImage = async (tweet: ParsedTweet) => {
    const cardEl = document.getElementById(`tweet-card-${tweet.id}`);
    if (!cardEl) return;

    try {
      setIsGeneratingImage(tweet.id);
      showToast('正在生成无白边的高清分享图...', 'info');

      // Slight delay to ensure UI updates are flushed
      await new Promise(r => setTimeout(r, 100));

      const html2canvas = (window as any).html2canvas;
      if (!html2canvas) {
        showToast('渲染引擎尚未加载，请刷新页面', 'error');
        setIsGeneratingImage(null);
        return;
      }

      const canvas = await html2canvas(cardEl, {
        useCORS: true,
        scale: 2, // High DPI
        backgroundColor: '#ffffff',
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/png');
      const dateStr = new Date().toISOString().split('T')[0];
      const safeAuthorName = tweet.authorName.replace(/[\/\?<>\\:\*\|"]/g, '_');

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `X-knowledge-${dateStr}-${safeAuthorName}.png`;
      a.click();

      showToast('分享图已生成并下载！', 'success');
    } catch (err) {
      console.error('Failed to generate image:', err);
      showToast('生成图片失败', 'error');
    } finally {
      setIsGeneratingImage(null);
    }
  };

  const handlePushToNotion = async (tweet: ParsedTweet) => {
    if (!notionToken || !notionDbId) {
      showToast('请先在设置页配置 Notion Token 和 Database ID', 'warning');
      return;
    }

    setPushingId(tweet.id);
    try {
      await pushToNotion(tweet, notionToken, notionDbId);
      showToast('✅ 已成功推送到 Notion！', 'success');
    } catch (err) {
      console.error('Push to Notion failed', err);
      showToast('❌ 推送到 Notion 失败，请检查配置或数据库 Schema。', 'error');
    } finally {
      setPushingId(null);
    }
  };

  const handleBatchAnalyze = async () => {
    if (batchStateRef.current.isRunning && batchStateRef.current.isPaused) {
      // Resume
      setIsBatchPaused(false);
      batchStateRef.current.isPaused = false;
      return;
    }

    const uncategorized = bookmarks.filter(b => !b.aiAnalysis);
    if (uncategorized.length === 0) return;

    setIsBatchAnalyzing(true);
    setIsBatchPaused(false);
    batchStateRef.current = { isRunning: true, isPaused: false };
    setBatchProgress({ current: 0, total: uncategorized.length });

    for (let i = 0; i < uncategorized.length; i++) {
      if (!batchStateRef.current.isRunning) break;

      while (batchStateRef.current.isPaused) {
        await new Promise(r => setTimeout(r, 500));
        if (!batchStateRef.current.isRunning) break;
      }

      if (!batchStateRef.current.isRunning) break;

      const tweet = uncategorized[i];
      setAnalyzingId(tweet.id);

      try {
        const result = await analyzeTweet(tweet.text);
        if (result) {
          await db.tweets.update(tweet.id, { aiAnalysis: result });
        }
      } catch (error) {
        console.error(`Failed to analyze tweet ${tweet.id}:`, error);
      }

      setBatchProgress({ current: i + 1, total: uncategorized.length });

      // Rate limit delay
      if (i < uncategorized.length - 1 && batchStateRef.current.isRunning && !batchStateRef.current.isPaused) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setAnalyzingId(null);
    setIsBatchAnalyzing(false);
    setIsBatchPaused(false);
    batchStateRef.current = { isRunning: false, isPaused: false };
  };

  const handlePauseBatch = () => {
    setIsBatchPaused(true);
    batchStateRef.current.isPaused = true;
  };

  const handleStopBatch = () => {
    batchStateRef.current.isRunning = false;
    setIsBatchAnalyzing(false);
    setIsBatchPaused(false);
    setAnalyzingId(null);
  };

  // Derived state: Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>()
    bookmarks.forEach(b => {
      if (b.aiAnalysis?.category) {
        cats.add(b.aiAnalysis.category)
      }
    })
    return Array.from(cats).sort()
  }, [bookmarks])

  // Derived state: Popular Top 15 Tags
  const popularTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    bookmarks.forEach(b => {
      if (b.aiAnalysis?.tags) {
        b.aiAnalysis.tags.forEach(t => {
          const rawTag = t.startsWith('#') ? t : `#${t}`;
          tagCounts[rawTag] = (tagCounts[rawTag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency descending
      .slice(0, 15)
      .map(entry => entry[0]);
  }, [bookmarks])

  // Derived state: Filtered bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(tweet => {
      // 1. Category filter
      if (activeCategory === 'uncategorized' && tweet.aiAnalysis) return false
      if (activeCategory !== 'all' && activeCategory !== 'uncategorized') {
        if (tweet.aiAnalysis?.category !== activeCategory) return false
      }

      // 2. Search filter (fuzzy search on text, author name, and tags)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const textMatch = tweet.text.toLowerCase().includes(query)
        const authorMatch = tweet.authorName.toLowerCase().includes(query)
        const tagMatch = tweet.aiAnalysis?.tags.some(tag => tag.toLowerCase().includes(query))

        if (!textMatch && !authorMatch && !tagMatch) return false
      }

      // 3. Date Range filter
      if (startDate || endDate) {
        const twTime = new Date(tweet.createdAt).getTime()
        if (startDate) {
          const startTime = new Date(startDate).getTime()
          if (twTime < startTime) return false
        }
        if (endDate) {
          // Add 23:59:59 to include the whole end day
          const endTime = new Date(endDate + 'T23:59:59.999').getTime()
          if (twTime > endTime) return false
        }
      }

      return true
    }).sort((a, b) => {
      // Sort logic
      if (sortBy === 'time') {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeB - timeA; // Descending
      } else if (sortBy === 'retweets') {
        return (b.metrics.retweetCount || 0) - (a.metrics.retweetCount || 0); // Descending
      } else if (sortBy === 'likes') {
        return (b.metrics.likeCount || 0) - (a.metrics.likeCount || 0); // Descending
      }
      return 0;
    });
  }, [bookmarks, activeCategory, searchQuery, sortBy, startDate, endDate])

  // Virtual Scrolling State
  const listRef = useRef<any>(null);
  const sizeMap = useRef<{ [key: number]: number }>({});

  const setSize = (index: number, size: number) => {
    if (sizeMap.current[index] !== size) {
      sizeMap.current[index] = size;
      if (listRef.current) {
        listRef.current.resetAfterIndex(index);
      }
    }
  };

  const getSize = (index: number) => sizeMap.current[index] || 150;

  // Reset size map when filter changes
  useEffect(() => {
    sizeMap.current = {};
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [filteredBookmarks]);

  return (
    <>
      {!isApiKeyConfigured ? (
        <Onboarding onComplete={() => setIsApiKeyConfigured(true)} />
      ) : (
        <div className="w-full h-screen bg-x-bg flex flex-col overflow-hidden">
          {/* Header - X 风格顶栏 */}
          <div className="px-4 py-3 border-b border-x-border flex flex-col bg-x-bg/80 backdrop-blur-sm sticky top-0 z-10 w-full relative">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-x-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <h1 className="text-base font-bold text-x-text">Knowledge</h1>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/LaplaceYoung/Xknowledge"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-x-textMuted hover:text-x-text hover:bg-x-primary/10 rounded-full transition-colors flex items-center justify-center"
                  title="GitHub Repository"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                <span className="text-xs text-x-textMuted font-medium">{bookmarks.length}</span>
                <div className="relative">
                  <button
                    onClick={() => setShowTools(!showTools)}
                    className="p-2 text-x-textMuted hover:text-x-text hover:bg-x-primary/10 rounded-full transition-colors"
                    title="更多操作"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>

                  {/* X 风格下拉菜单 */}
                  {showTools && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowTools(false)} />
                      <div className="absolute right-0 top-[calc(100%+8px)] w-60 bg-x-bg shadow-[0_0_15px_rgba(255,255,255,0.2)] dark:shadow-[0_0_15px_rgba(255,255,255,0.15)] rounded-xl z-30 py-2 overflow-hidden flex flex-col">
                        <button onClick={() => { handleBatchAnalyze(); setShowTools(false); }}
                          className="w-full px-4 py-3 text-[15px] font-bold text-x-text hover:bg-x-bgHover transition-colors flex items-center gap-3 text-left">
                          <svg className="w-5 h-5 text-x-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                          </svg>
                          批量 AI 分析
                        </button>
                        <button onClick={() => { handleExport(); setShowTools(false); }}
                          className="w-full px-4 py-3 text-[15px] font-bold text-x-text hover:bg-x-bgHover transition-colors flex items-center gap-3 text-left">
                          <svg className="w-5 h-5 text-x-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          导出 Markdown
                        </button>
                        <button onClick={() => { handleExportZip(); setShowTools(false); }}
                          className="w-full px-4 py-3 text-[15px] font-bold text-x-text hover:bg-x-bgHover transition-colors flex items-center gap-3 text-left">
                          <svg className="w-5 h-5 text-x-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          导出 ZIP（离线）
                        </button>
                        <button onClick={() => { handleExportJSON(); setShowTools(false); }}
                          className="w-full px-4 py-3 text-[15px] font-bold text-x-text hover:bg-x-bgHover transition-colors flex items-center gap-3 text-left">
                          <svg className="w-5 h-5 text-x-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          导出 JSON
                        </button>
                        <button onClick={() => { fileInputRef.current?.click(); setShowTools(false); }}
                          className="w-full px-4 py-3 text-[15px] font-bold text-x-text hover:bg-x-bgHover transition-colors flex items-center gap-3 text-left">
                          <svg className="w-5 h-5 text-x-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          导入 JSON
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImportJSON} accept=".json" className="hidden" />
                        <button onClick={() => { handleClear(); setShowTools(false); }}
                          className="w-full px-4 py-3 text-[15px] font-bold text-[#F4212E] hover:bg-x-bgHover transition-colors flex items-center gap-3 text-left">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          清空所有数据
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Batch Progress Bar Indicator */}
            {isBatchAnalyzing && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-x-bgHover z-20">
                <div
                  className="h-full bg-x-primary transition-all duration-300 shadow-[0_0_10px_rgba(29,155,240,0.5)]"
                  style={{ width: `${(batchProgress.current / Math.max(batchProgress.total, 1)) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-x-bg overflow-hidden">
            {/* 搜索栏 - X 风格 */}
            <div className="px-4 py-2 border-b border-x-border">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索书签、作者或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-x-bgHover border border-transparent rounded-full text-sm text-x-text placeholder-x-textMuted focus:bg-transparent focus:border-x-primary focus:ring-0 transition-all outline-none"
                />
                <svg className="w-4 h-4 text-x-textMuted absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* 筛选栏 - X 风格标签页 */}
            <div className="px-4 py-2 border-b border-x-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent hover:bg-x-bgHover border border-x-border rounded-full text-xs font-bold text-x-text transition-colors"
                  >
                    <span>
                      {sortBy === 'time' ? '最新' : sortBy === 'retweets' ? '最多转发' : '最多点赞'}
                    </span>
                    <svg className={`w-3.5 h-3.5 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showSortDropdown && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowSortDropdown(false)} />
                      <div className="absolute left-0 top-full mt-1 w-36 bg-x-bg shadow-[0_0_15px_rgba(255,255,255,0.2)] dark:shadow-[0_0_15px_rgba(255,255,255,0.15)] rounded-xl z-30 py-2 overflow-hidden flex flex-col border border-x-border">
                        {[
                          { value: 'time', label: '最新' },
                          { value: 'retweets', label: '最多转发' },
                          { value: 'likes', label: '最多点赞' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value as 'time' | 'retweets' | 'likes');
                              setShowSortDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 text-[14px] font-bold text-x-text hover:bg-x-bgHover transition-colors flex items-center justify-between text-left"
                          >
                            {option.label}
                            {sortBy === option.value && (
                              <svg className="w-4 h-4 text-x-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs relative">
                <CustomDatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="开始日期"
                />
                <span className="text-x-textMuted font-bold">—</span>
                <CustomDatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="结束日期"
                />
                {(startDate || endDate) && (
                  <button
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="p-1 text-x-textMuted hover:text-[#F4212E] transition-colors rounded-full hover:bg-[#F4212E]/10"
                    title="清除日期"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>


            {/* List */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-full text-x-textMuted">
                  Loading...
                </div>
              ) : filteredBookmarks.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-x-textMuted text-center">
                  <p>No bookmarks found.</p>
                  {bookmarks.length === 0 && (
                    <p className="text-sm mt-2">Open X (Twitter) bookmarks page to start capturing.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 relative">
                  {filteredBookmarks.map((tweet, index) => (
                    <TweetCard
                      key={tweet.id}
                      tweet={tweet}
                      index={index}
                      isSelected={selectedIds.has(tweet.id)}
                      onToggleSelect={handleToggleSelect}
                      onClickContent={setReadingTweetId}
                      analyzingId={analyzingId}
                      pushingId={pushingId}
                      notionToken={notionToken}
                      notionDbId={notionDbId}
                      onAnalyze={handleAnalyze}
                      onDelete={handleDelete}
                      onCopyMarkdown={handleCopyMarkdown}
                      onPushToObsidian={handlePushToObsidian}
                      onPushToNotion={handlePushToNotion}
                      onGenerateImage={handleGenerateImage}
                      isGeneratingImage={isGeneratingImage === tweet.id}
                      onUpdateTags={handleUpdateTags}
                      onImageClick={setLightboxImage}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImage(null);
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={lightboxImage}
              alt="Expanded view"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent clicks on image from closing modal
            />
          </div>
        </div>
      )}
      {/* Clear Confirmation Modal (X Style) */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-x-bg w-80 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-x-text mb-2">清空所有数据？</h2>
            <p className="text-sm text-x-textMuted mb-6 leading-relaxed">
              此操作无法撤销。清空后，所有本地缓存的书签数据将被移除（不会影响您的 X 书签）。
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmClear}
                className="w-full py-3 bg-[#F4212E] hover:bg-[#F4212E]/90 text-white font-bold rounded-full transition-colors"
              >
                清空
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="w-full py-3 bg-transparent hover:bg-x-bgHover text-x-text border border-x-border font-bold rounded-full transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Immersive Reader */}
      {readingTweetId && bookmarks.find(b => b.id === readingTweetId) && (
        <ImmersiveReader
          tweet={bookmarks.find(b => b.id === readingTweetId)!}
          onClose={() => setReadingTweetId(null)}
          onImageClick={setLightboxImage}
        />
      )}

      {/* Floating Action Bar for Multi-select */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-x-primary text-white flex items-center gap-4 animate-fade-in-up py-3 px-6 rounded-full shadow-2xl">
          <span className="font-bold border-r border-white/20 pr-4 text-sm whitespace-nowrap">已选择 {selectedIds.size} 项</span>
          <button onClick={handleSelectAll} className="hover:opacity-80 transition-opacity whitespace-nowrap text-sm font-medium">
            全选/取消
          </button>
          <button onClick={handleExportSelectedMarkdown} className="hover:opacity-80 transition-opacity flex items-center gap-1 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Markdown
          </button>
          <button onClick={handlePushSelectedToObsidian} className="hover:opacity-80 transition-opacity flex items-center gap-1 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Obsidian
          </button>
        </div>
      )}
    </>
  )
}

export default App