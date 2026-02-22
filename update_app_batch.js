const fs = require('fs');

const path = 'x-knowledge-extension/src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add isPaused state and abort ref
const stateHookPos = content.indexOf('const [batchProgress');
const stateInject = `  const [isBatchPaused, setIsBatchPaused] = useState(false)\n  const batchStateRef = useRef({ isRunning: false, isPaused: false });\n`;
content = content.substring(0, stateHookPos) + stateInject + content.substring(stateHookPos);

// 2. Update handleBatchAnalyze logic
const handleBatchAnalyzeOld = /const handleBatchAnalyze = async \(\) => \{[\s\S]*?setIsBatchAnalyzing\(false\);\s*\};/;
const handleBatchAnalyzeNew = `const handleBatchAnalyze = async () => {
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
        console.error(\`Failed to analyze tweet \${tweet.id}:\`, error);
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
  };`;

content = content.replace(handleBatchAnalyzeOld, handleBatchAnalyzeNew);

// 3. Update the UI for batch analysis
const uiOld = /<button[\s\S]*?onClick=\{handleBatchAnalyze\}[\s\S]*?disabled=\{isBatchAnalyzing\}[\s\S]*?>[\s\S]*?\{isBatchAnalyzing \? \([\s\S]*?\) : \([\s\S]*?'✨ Batch Analyze Uncategorized'[\s\S]*?\)\}[\s\S]*?<\/button>/;

const uiNew = `
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
                  className={\`h-1.5 rounded-full \${isBatchPaused ? 'bg-yellow-500' : 'bg-x-primary transition-all duration-500'}\`}
                  style={{ width: \`\${(batchProgress.current / batchProgress.total) * 100}%\` }}
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
`;

content = content.replace(uiOld, uiNew);
fs.writeFileSync(path, content);
console.log('App.tsx updated with pausable batch analysis queue and UI');
