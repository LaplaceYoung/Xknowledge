import React, { useState } from 'react';
import { updateSettings, ExtensionSettings } from '../utils/settingsStorage';

interface OnboardingProps {
  onComplete: () => void;
}

const PROVIDER_OPTIONS: Array<{ value: ExtensionSettings['apiProvider']; label: string; defaultUrl: string; defaultModel: string }> = [
  { value: 'siliconflow', label: 'SiliconFlow', defaultUrl: 'https://api.siliconflow.cn/v1/chat/completions', defaultModel: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B' },
  { value: 'openai', label: 'OpenAI', defaultUrl: 'https://api.openai.com/v1/chat/completions', defaultModel: 'gpt-4.1-mini' },
  { value: 'deepseek', label: 'DeepSeek', defaultUrl: 'https://api.deepseek.com/v1/chat/completions', defaultModel: 'deepseek-chat' },
  { value: 'moonshot', label: 'Moonshot', defaultUrl: 'https://api.moonshot.cn/v1/chat/completions', defaultModel: 'moonshot-v1-8k' },
  { value: 'qwen', label: 'Qwen (DashScope Compatible)', defaultUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', defaultModel: 'qwen-plus' },
  { value: 'custom', label: 'Custom', defaultUrl: '', defaultModel: '' }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [apiProvider, setApiProvider] = useState<ExtensionSettings['apiProvider']>('siliconflow');
  const [apiBaseUrl, setApiBaseUrl] = useState(PROVIDER_OPTIONS[0].defaultUrl);
  const [apiModel, setApiModel] = useState(PROVIDER_OPTIONS[0].defaultModel);
  const [displayLanguage, setDisplayLanguage] = useState<ExtensionSettings['displayLanguage']>('zh');

  const handleProviderChange = (provider: ExtensionSettings['apiProvider']) => {
    const option = PROVIDER_OPTIONS.find((x) => x.value === provider) || PROVIDER_OPTIONS[0];
    setApiProvider(provider);
    if (!apiBaseUrl) setApiBaseUrl(option.defaultUrl);
    if (!apiModel) setApiModel(option.defaultModel);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        siliconFlowApiKey: apiKey.trim(),
        apiProvider,
        apiBaseUrl: apiBaseUrl.trim(),
        apiModel: apiModel.trim(),
        displayLanguage,
        syncSecretsEnabled: false
      });
      setIsSaving(false);
      onComplete();
    } catch (err) {
      console.error('[X-knowledge] Failed to save onboarding settings:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-x-bg p-8 text-center w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-x-text mb-2">欢迎使用 X-knowledge</h1>
        <p className="text-x-textMuted">你的 X (Twitter) 书签智能知识库。</p>
      </div>

      <div className="w-full max-w-sm bg-x-bg p-6 rounded-2xl border border-x-border shadow-sm">
        <h2 className="text-lg font-semibold text-x-text mb-4 text-left">初始化配置</h2>

        <div className="mb-4 text-left space-y-4">
          <div>
            <label className="block text-xs font-medium text-x-text mb-1">界面语言</label>
            <select
              value={displayLanguage}
              onChange={(e) => setDisplayLanguage(e.target.value as ExtensionSettings['displayLanguage'])}
              className="w-full px-4 py-2 bg-x-bg border border-x-border rounded-2xl text-sm focus:border-x-primary focus:ring-2 focus:ring-x-primary/30 transition-all outline-none"
            >
              <option value="zh">简体中文</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-x-text mb-1">AI Provider</label>
            <select
              value={apiProvider}
              onChange={(e) => handleProviderChange(e.target.value as ExtensionSettings['apiProvider'])}
              className="w-full px-4 py-2 bg-x-bg border border-x-border rounded-2xl text-sm focus:border-x-primary focus:ring-2 focus:ring-x-primary/30 transition-all outline-none"
            >
              {PROVIDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-x-text mb-1">Base URL</label>
            <input
              type="text"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1/chat/completions"
              className="w-full px-4 py-2 bg-x-bg border border-x-border rounded-2xl text-sm focus:border-x-primary focus:ring-2 focus:ring-x-primary/30 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-x-text mb-1">Model</label>
            <input
              type="text"
              value={apiModel}
              onChange={(e) => setApiModel(e.target.value)}
              placeholder="gpt-4.1-mini"
              className="w-full px-4 py-2 bg-x-bg border border-x-border rounded-2xl text-sm focus:border-x-primary focus:ring-2 focus:ring-x-primary/30 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-x-text mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2 bg-x-bg border border-x-border rounded-2xl text-sm focus:border-x-primary focus:ring-2 focus:ring-x-primary/30 transition-all outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!apiKey || isSaving}
          className="w-full bg-x-primary hover:bg-x-primaryHover disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-2xl transition-colors"
        >
          {isSaving ? '保存中...' : '开始使用'}
        </button>
      </div>
    </div>
  );
};
