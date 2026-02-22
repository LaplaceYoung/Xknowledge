import { useState, useMemo, useRef, useEffect } from 'react'
import { ParsedTweet } from './utils/twitterParser'
import { analyzeTweet } from './utils/ai'
import { generateMarkdown, downloadMarkdown } from './utils/markdownExport'
import { pushToNotion } from './utils/notionExport'
import { exportToZip } from './utils/zipExport'
import { db } from './utils/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { Onboarding } from './components/Onboarding'
import { useToast } from './contexts/ToastContext'
// @ts-ignore
import { VariableSizeList as List } from 'react-window'
// @ts-ignore
import { AutoSizer } from 'react-virtualized-auto-sizer'
import { TweetCard } from './components/TweetCard'
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

  const bookmarksQuery = useLiveQuery(() => db.tweets.orderBy('createdAt').reverse().toArray());
  const bookmarks = bookmarksQuery || [];
  const loading = bookmarksQuery === undefined || isApiKeyConfigured === null;

  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [pushingId, setPushingId] = useState<string | null>(null)

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

  // New state for filtering and searching
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClear = async () => {
    if (window.confirm('确定要清空所有书签数据吗？此操作不可恢复！')) {
      try {
        await db.tweets.clear();
        if (chrome && chrome.storage && chrome.storage.local) {
          chrome.storage.local.remove(['parsedBookmarks', 'rawBookmarks']); // Cleanup legacy
        }
      } catch (err) {
        console.error('Failed to clear database', err);
      }
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

  const handleCopyMarkdown = async (tweet: ParsedTweet) => {
    const mdContent = generateMarkdown([tweet]);
    try {
      await navigator.clipboard.writeText(mdContent);
      showToast('已复制该书签的 Markdown！', 'success');
    } catch (err) {
      console.error('Failed to copy', err);
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

      return true
    })
  }, [bookmarks, activeCategory, searchQuery])

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
        <div className="w-[700px] h-[600px] bg-x-bg flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-x-bg border-r border-x-border flex flex-col">
            <div className="p-4 border-b border-x-border">
              <h1 className="text-lg font-bold text-x-text">X-knowledge</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="text-xs font-semibold text-x-textMuted uppercase tracking-wider mb-2 px-2 mt-2">
                Views
              </div>

              {isBatchAnalyzing ? (
                <div className="w-full bg-x-bg border border-x-border rounded-x-card p-3 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-x-primary">
                      {isBatchPaused ? 'Paused' : 'Analyzing...'}
                    </span>
                    <span className="text-x-textMuted">{batchProgress.current} / {batchProgress.total}</span>
                  </div>
                  <div className="w-full bg-x-border rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${isBatchPaused ? 'bg-yellow-500' : 'bg-x-primary transition-all duration-500'}`}
                      style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex gap-2">
                    {isBatchPaused ? (
                      <button onClick={handleBatchAnalyze} className="flex-1 py-1.5 bg-x-primary text-white text-xs rounded-full-x-button hover:bg-x-primaryHover transition-colors">Resume</button>
                    ) : (
                      <button onClick={handlePauseBatch} className="flex-1 py-1.5 bg-yellow-500 text-white text-xs rounded-full-x-button hover:bg-yellow-600 transition-colors">Pause</button>
                    )}
                    <button onClick={handleStopBatch} className="flex-1 py-1.5 bg-red-500 text-white text-xs rounded-full-x-button hover:bg-red-600 transition-colors">Stop</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleBatchAnalyze}
                  className="w-full px-3 py-2 text-sm bg-x-primary/10 text-x-primary rounded-full-x-button hover:bg-x-primary/20 transition-colors flex items-center justify-center gap-2"
                >
                  ✨ Batch Analyze Uncategorized
                </button>
              )}

              <button
                onClick={handleExport}
                className="w-full px-3 py-2 text-sm bg-x-primary/10 text-x-primary rounded-full hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export to Markdown
              </button>

              {isExportingZip ? (
                <div className="w-full bg-x-bg border border-x-border rounded-x-card p-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-x-primary">Packaging ZIP...</span>
                    <span className="text-x-textMuted">
                      {zipProgress.total > 0 ? `${zipProgress.current} / ${zipProgress.total}` : 'Starting...'}
                    </span>
                  </div>
                  <div className="w-full bg-x-border rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-x-primary transition-all duration-300"
                      style={{ width: zipProgress.total > 0 ? `${(zipProgress.current / zipProgress.total) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleExportZip}
                  className="w-full px-3 py-2 text-sm bg-x-primary/10 text-x-primary rounded-full hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Export to ZIP (Offline)
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleExportJSON}
                  className="flex-1 px-3 py-2 text-xs bg-x-bgHover text-x-text rounded-full hover:bg-x-border transition-colors flex justify-center items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export JSON
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-3 py-2 text-xs bg-x-bgHover text-x-text rounded-full hover:bg-x-border transition-colors flex justify-center items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import JSON
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportJSON}
                  accept=".json"
                  className="hidden"
                />
              </div>

              <button
                onClick={handleClear}
                className="w-full px-3 py-2 text-sm bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-x-bg overflow-hidden">
            {/* Header / Search */}
            <div className="p-4 bg-x-bg border-b border-x-border flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search bookmarks, authors, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-x-bgHover border-transparent rounded-2xl text-sm focus:bg-x-bg focus:border-x-primary focus:ring-2 focus:ring-x-primary/30 transition-all outline-none"
                />
                <svg className="w-4 h-4 text-x-textMuted absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
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
                <div style={{ flex: '1 1 auto', height: '100%' }}>
                  {/* @ts-ignore */}
                  <AutoSizer>
                    {({ height, width }: { height: number; width: number }) => (
                      <List
                        ref={listRef}
                        height={height}
                        itemCount={filteredBookmarks.length}
                        itemSize={getSize}
                        width={width}
                        itemData={filteredBookmarks}
                      >
                        {({ index, style }) => (
                          <TweetCard
                            tweet={filteredBookmarks[index]}
                            index={index}
                            analyzingId={analyzingId}
                            pushingId={pushingId}
                            notionToken={notionToken}
                            notionDbId={notionDbId}
                            onAnalyze={handleAnalyze}
                            onDelete={handleDelete}
                            onCopyMarkdown={handleCopyMarkdown}
                            onPushToNotion={handlePushToNotion}
                            onImageClick={setLightboxImage}
                            onHeightReady={setSize}
                            style={style as React.CSSProperties}
                          />
                        )}
                      </List>
                    )}
                  </AutoSizer>
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
    </>
  )
}

export default App