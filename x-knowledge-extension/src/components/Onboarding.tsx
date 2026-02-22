import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // TODO: Implement the save function to store the API key in chrome.storage.sync
  // Call onComplete() when successfully saved
  const handleSave = async () => {
    setIsSaving(true);
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ siliconFlowApiKey: apiKey.trim() }, () => {
        setIsSaving(false);
        onComplete();
      });
    } else {
      // Local dev fallback
      setIsSaving(false);
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-x-bg p-8 text-center w-[700px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-x-text mb-2">欢迎使用 X-knowledge</h1>
        <p className="text-x-textMuted">
          您的 X (Twitter) 专属智能知识库。
        </p>
      </div>

      <div className="w-full max-w-sm bg-x-bg p-6 rounded-2xl border border-x-border shadow-sm">
        <h2 className="text-lg font-semibold text-x-text mb-4 text-left">配置 AI 大脑</h2>
        <p className="text-sm text-x-textMuted mb-4 text-left leading-relaxed">
          为了自动为您抓取的推文打标签、写摘要，我们需要配置 SiliconFlow API Key。数据仅保存在本地。
        </p>

        <div className="mb-4 text-left">
          <label className="block text-xs font-medium text-x-text mb-1">
            SiliconFlow API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-2 bg-x-bg border border-x-border rounded-2xl text-sm focus:bg-x-bg focus:border-x-primary focus:ring-2 focus:ring-x-primary/30 transition-all outline-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!apiKey || isSaving}
          className="w-full bg-x-primary hover:bg-x-primaryHover disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-2xl transition-colors flex justify-center items-center"
        >
          {isSaving ? '保存中...' : '开始使用 ✨'}
        </button>

        <div className="mt-4 text-xs text-x-textMuted text-left flex items-center justify-between">
          <span>还没有账号？</span>
          <a
            href="https://siliconflow.cn/"
            target="_blank"
            rel="noreferrer"
            className="text-x-primary hover:text-x-primaryHover font-medium hover:underline flex items-center gap-1"
          >
            去免费注册
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};
