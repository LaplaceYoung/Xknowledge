import { useEffect, useMemo, useState } from 'react';
import { loadSettings, saveSettings, ExtensionSettings } from '../utils/settingsStorage';

const DEFAULT_PROMPT = `请分析以下推文内容，返回严格 JSON，不要包含 Markdown 代码块。
返回结构：
{
  "category": "分类（不带#）",
  "summary": "50字以内摘要",
  "tags": ["标签1","标签2"]
}`;

const PROVIDER_OPTIONS: Array<{ value: ExtensionSettings['apiProvider']; label: string; defaultUrl: string; defaultModel: string }> = [
  { value: 'siliconflow', label: 'SiliconFlow', defaultUrl: 'https://api.siliconflow.cn/v1/chat/completions', defaultModel: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B' },
  { value: 'openai', label: 'OpenAI', defaultUrl: 'https://api.openai.com/v1/chat/completions', defaultModel: 'gpt-4.1-mini' },
  { value: 'deepseek', label: 'DeepSeek', defaultUrl: 'https://api.deepseek.com/v1/chat/completions', defaultModel: 'deepseek-chat' },
  { value: 'moonshot', label: 'Moonshot', defaultUrl: 'https://api.moonshot.cn/v1/chat/completions', defaultModel: 'moonshot-v1-8k' },
  { value: 'qwen', label: 'Qwen (DashScope Compatible)', defaultUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', defaultModel: 'qwen-plus' },
  { value: 'custom', label: 'Custom (OpenAI-Compatible)', defaultUrl: '', defaultModel: '' }
];

function Options() {
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let disposed = false;
    loadSettings()
      .then((s) => {
        if (!disposed) setSettings(s);
      })
      .catch((err) => console.error('[X-knowledge] Failed to load settings:', err));
    return () => {
      disposed = true;
    };
  }, []);

  const selectedProvider = useMemo(
    () => PROVIDER_OPTIONS.find((p) => p.value === settings?.apiProvider) || PROVIDER_OPTIONS[0],
    [settings?.apiProvider]
  );

  const update = <K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleProviderChange = (provider: ExtensionSettings['apiProvider']) => {
    const preset = PROVIDER_OPTIONS.find((p) => p.value === provider);
    if (!preset || !settings) return;
    setSettings({
      ...settings,
      apiProvider: provider,
      apiBaseUrl: settings.apiBaseUrl || preset.defaultUrl,
      apiModel: settings.apiModel || preset.defaultModel
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      await saveSettings({
        ...settings,
        siliconFlowApiKey: settings.siliconFlowApiKey.trim(),
        customAIPrompt: settings.customAIPrompt.trim(),
        notionToken: settings.notionToken.trim(),
        notionDatabaseId: settings.notionDatabaseId.trim(),
        apiBaseUrl: settings.apiBaseUrl.trim(),
        apiModel: settings.apiModel.trim()
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('[X-knowledge] Failed to save settings:', err);
    }
  };

  if (!settings) {
    return <div className="min-h-screen bg-x-bg text-x-text p-6">Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-x-bg flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-x-bg rounded-2xl shadow-lg p-8 w-full max-w-2xl border border-x-border">
        <h1 className="text-2xl font-bold text-x-text mb-2">X-knowledge Settings</h1>
        <p className="text-x-textMuted text-sm mb-6">
          Configure language, AI provider/model, and export integrations.
        </p>

        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-x-text">Display</h2>
            <div>
              <label htmlFor="displayLanguage" className="block text-sm font-bold text-x-text mb-2">
                UI Language
              </label>
              <select
                id="displayLanguage"
                value={settings.displayLanguage}
                onChange={(e) => update('displayLanguage', e.target.value as ExtensionSettings['displayLanguage'])}
                className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all"
              >
                <option value="zh">简体中文</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-x-border space-y-4">
            <h2 className="text-lg font-bold text-x-text">AI Provider & Model</h2>
            <div>
              <label htmlFor="apiProvider" className="block text-sm font-bold text-x-text mb-2">
                Provider
              </label>
              <select
                id="apiProvider"
                value={settings.apiProvider}
                onChange={(e) => handleProviderChange(e.target.value as ExtensionSettings['apiProvider'])}
                className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all"
              >
                {PROVIDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="apiBaseUrl" className="block text-sm font-bold text-x-text mb-2">
                Base URL
              </label>
              <input
                id="apiBaseUrl"
                type="text"
                value={settings.apiBaseUrl}
                onChange={(e) => update('apiBaseUrl', e.target.value)}
                placeholder={selectedProvider.defaultUrl || 'https://api.openai.com/v1/chat/completions'}
                className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="apiModel" className="block text-sm font-bold text-x-text mb-2">
                Model Name
              </label>
              <input
                id="apiModel"
                type="text"
                value={settings.apiModel}
                onChange={(e) => update('apiModel', e.target.value)}
                placeholder={selectedProvider.defaultModel || 'gpt-4.1-mini'}
                className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="apiKey" className="block text-sm font-bold text-x-text mb-2">
                API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={settings.siliconFlowApiKey}
                onChange={(e) => update('siliconFlowApiKey', e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-x-border space-y-4">
            <h2 className="text-lg font-bold text-x-text">Notion Integration</h2>
            <div>
              <label htmlFor="notionToken" className="block text-sm font-bold text-x-text mb-2">Notion Token</label>
              <input
                id="notionToken"
                type="password"
                value={settings.notionToken}
                onChange={(e) => update('notionToken', e.target.value)}
                placeholder="secret_..."
                className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="notionDatabaseId" className="block text-sm font-bold text-x-text mb-2">Notion Database ID</label>
              <input
                id="notionDatabaseId"
                type="text"
                value={settings.notionDatabaseId}
                onChange={(e) => update('notionDatabaseId', e.target.value)}
                placeholder="database id"
                className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="customPrompt" className="block text-sm font-bold text-x-text">Custom AI Prompt</label>
              <button onClick={() => update('customAIPrompt', DEFAULT_PROMPT)} className="text-xs text-x-primary hover:text-x-primaryHover font-medium">
                Reset Default
              </button>
            </div>
            <textarea
              id="customPrompt"
              value={settings.customAIPrompt}
              onChange={(e) => update('customAIPrompt', e.target.value)}
              placeholder={DEFAULT_PROMPT}
              rows={8}
              className="w-full px-4 py-3 bg-x-bg border border-x-border text-x-text text-sm font-mono rounded-2xl focus:border-x-primary focus:ring-1 focus:ring-x-primary outline-none transition-all resize-y"
            />
          </div>

          <label className="flex items-start gap-3 bg-amber-50/10 border border-amber-200/20 rounded-xl p-3">
            <input
              type="checkbox"
              checked={settings.syncSecretsEnabled}
              onChange={(e) => update('syncSecretsEnabled', e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-xs text-x-textMuted leading-relaxed">
              Enable sync storage for secrets across devices (disabled by default).
            </span>
          </label>

          <button
            onClick={handleSave}
            className="w-full bg-x-text text-x-bg hover:opacity-90 font-bold py-3 px-4 rounded-full transition-opacity flex justify-center items-center mt-2"
          >
            {saved ? 'Saved' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Options;
