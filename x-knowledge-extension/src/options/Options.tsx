import { useState, useEffect } from 'react';

const DEFAULT_PROMPT = `请分析以下推文内容，返回严格的 JSON 格式数据，不要包含任何 Markdown 标记（如 \`\`\`json），只需返回纯 JSON 字符串。
JSON 结构如下：
{
  "category": "字符串，推文的分类（如：#AI工具, #编程技巧, #投资观察, #生活方式等）",
  "summary": "字符串，50字以内的核心摘要",
  "tags": ["标签1", "标签2"]
}`;

function Options() {
  const [apiKey, setApiKey] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [notionToken, setNotionToken] = useState('');
  const [notionDatabaseId, setNotionDatabaseId] = useState('');
  const [saved, setSaved] = useState(false);

  const [apiProvider, setApiProvider] = useState<'siliconflow' | 'custom'>('siliconflow');
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [apiModel, setApiModel] = useState('');

  useEffect(() => {
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['siliconFlowApiKey', 'customAIPrompt', 'notionToken', 'notionDatabaseId', 'apiProvider', 'apiBaseUrl', 'apiModel'], (result) => {
        if (result.siliconFlowApiKey) setApiKey(result.siliconFlowApiKey as string);
        if (result.customAIPrompt) setCustomPrompt(result.customAIPrompt as string);
        if (result.notionToken) setNotionToken(result.notionToken as string);
        if (result.notionDatabaseId) setNotionDatabaseId(result.notionDatabaseId as string);
        if (result.apiProvider) setApiProvider(result.apiProvider as 'siliconflow' | 'custom');
        if (result.apiBaseUrl) setApiBaseUrl(result.apiBaseUrl as string);
        if (result.apiModel) setApiModel(result.apiModel as string);
      });
    }
  }, []);

  const handleSave = () => {
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({
        siliconFlowApiKey: apiKey.trim(),
        customAIPrompt: customPrompt.trim(),
        notionToken: notionToken.trim(),
        notionDatabaseId: notionDatabaseId.trim(),
        apiProvider,
        apiBaseUrl: apiBaseUrl.trim(),
        apiModel: apiModel.trim()
      }, () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      });
    }
  };

  const handleResetPrompt = () => {
    setCustomPrompt(DEFAULT_PROMPT);
  };

  return (
    <div className="min-h-screen bg-x-bg flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-x-bg rounded-2xl shadow-lg p-8 w-full max-w-2xl border border-x-border">
        <h1 className="text-2xl font-bold text-x-text mb-2">X-knowledge Settings</h1>
        <p className="text-x-textMuted text-sm mb-6">
          Configure your AI brain and customize how bookmarks are analyzed.
        </p>

        <div className="space-y-6">
          {/* API Key Section */}
          <div className="space-y-4">
            <div>
              <label htmlFor="apiProvider" className="block text-sm font-bold text-x-text mb-2">
                API 提供商
              </label>
              <select
                id="apiProvider"
                value={apiProvider}
                onChange={(e) => setApiProvider(e.target.value as 'siliconflow' | 'custom')}
                className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all"
              >
                <option value="siliconflow">SiliconFlow (默认)</option>
                <option value="custom">自定义兼容 OpenAI 的接口</option>
              </select>
            </div>

            {apiProvider === 'custom' && (
              <>
                <div>
                  <label htmlFor="apiBaseUrl" className="block text-sm font-bold text-x-text mb-2">
                    Base URL (非必填，默认 SiliconFlow)
                  </label>
                  <input
                    type="text"
                    id="apiBaseUrl"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1/chat/completions"
                    className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="apiModel" className="block text-sm font-bold text-x-text mb-2">
                    模型名称 (非必填，默认 SiliconFlow 模型)
                  </label>
                  <input
                    type="text"
                    id="apiModel"
                    value={apiModel}
                    onChange={(e) => setApiModel(e.target.value)}
                    placeholder="gpt-3.5-turbo"
                    className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="apiKey" className="block text-sm font-bold text-x-text mb-2">
                {apiProvider === 'siliconflow' ? 'SiliconFlow API Key' : 'API Key'}
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all"
              />
            </div>
          </div>

          {/* Notion API Section */}
          <div className="pt-4 border-t border-x-border space-y-4">
            <h2 className="text-lg font-bold text-x-text">Notion Integration</h2>
            <p className="text-xs text-x-textMuted mb-2">
              Configure Notion to sync your bookmarks directly to a database. You need an Internal Integration Token and the target Database ID.
            </p>
            <div className="bg-blue-50/10 border border-blue-100/20 p-3 rounded-xl text-xs text-x-textMuted mb-4">
              <strong>Database Setup Requirements:</strong><br />
              Your target Notion database MUST have these exact property names and types:<br />
              <ul className="list-disc pl-4 mt-1">
                <li><code>Name</code> (Title)</li>
                <li><code>URL</code> (URL)</li>
                <li><code>Date</code> (Date)</li>
                <li><code>Category</code> (Select)</li>
                <li><code>Tags</code> (Multi-select)</li>
              </ul>
            </div>

            <div>
              <label htmlFor="notionToken" className="block text-sm font-bold text-x-text mb-2">
                Notion Integration Token
              </label>
              <input
                type="password"
                id="notionToken"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
                placeholder="secret_..."
                className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="notionDatabaseId" className="block text-sm font-bold text-x-text mb-2">
                Notion Database ID
              </label>
              <input
                type="text"
                id="notionDatabaseId"
                value={notionDatabaseId}
                onChange={(e) => setNotionDatabaseId(e.target.value)}
                placeholder="e.g. 1a2b3c4d5e..."
                className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all"
              />
            </div>
          </div>

          {/* Custom Prompt Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="customPrompt" className="block text-sm font-bold text-x-text">
                Custom AI Prompt (System Instructions)
              </label>
              <button
                onClick={handleResetPrompt}
                className="text-xs text-x-primary hover:text-x-primaryHover font-medium"
              >
                Reset to Default
              </button>
            </div>
            <p className="text-xs text-x-textMuted mb-2">
              Customize the instructions sent to the AI. Ensure you ask for the strict JSON structure {"{"}"category":"", "summary":"", "tags":[]{"}"} if you modify this.
            </p>
            <textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={DEFAULT_PROMPT}
              rows={8}
              className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text text-sm font-mono rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all resize-y"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-x-text text-x-bg hover:opacity-90 font-bold py-3 px-4 rounded-full transition-opacity flex justify-center items-center mt-4"
          >
            {saved ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                Saved Successfully
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-x-border text-sm text-x-textMuted">
          <p>
            Don't have an API key? <a href="https://siliconflow.cn/" target="_blank" rel="noreferrer" className="text-x-primary hover:underline">Get one from SiliconFlow</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Options;
