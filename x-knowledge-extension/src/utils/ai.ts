import { loadSettings } from './settingsStorage';

export interface AIAnalysisResult {
  category: string;
  summary: string;
  tags: string[];
}

type Provider = 'siliconflow' | 'openai' | 'deepseek' | 'moonshot' | 'qwen' | 'custom';

interface ProviderPreset {
  apiUrl: string;
  model: string;
}

interface StorageConfig {
  apiKey: string | null;
  customPrompt: string | null;
  apiProvider: Provider;
  apiBaseUrl: string;
  apiModel: string;
}

const PRESETS: Record<Exclude<Provider, 'custom'>, ProviderPreset> = {
  siliconflow: {
    apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B'
  },
  openai: {
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4.1-mini'
  },
  deepseek: {
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat'
  },
  moonshot: {
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k'
  },
  qwen: {
    apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-plus'
  }
};

const DEFAULT_PROMPT = `请分析以下推文内容，返回严格 JSON，不要包含 Markdown 代码块。
返回结构如下：
{
  "category": "字符串，例如 AI工具/编程技巧/投资观察/生活记录，不带#",
  "summary": "50字以内摘要",
  "tags": ["标签1","标签2","标签3"]
}
要求：
1) 标签使用通用可复用话题，不要过碎。
2) tags 数量控制在 2-4 个。
3) category 和 summary 必填。`;

const getStorageConfig = async (): Promise<StorageConfig> => {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return {
      apiKey: null,
      customPrompt: null,
      apiProvider: 'siliconflow',
      apiBaseUrl: '',
      apiModel: ''
    };
  }

  try {
    const settings = await loadSettings();
    return {
      apiKey: settings.siliconFlowApiKey || null,
      customPrompt: settings.customAIPrompt || null,
      apiProvider: settings.apiProvider,
      apiBaseUrl: settings.apiBaseUrl || '',
      apiModel: settings.apiModel || ''
    };
  } catch {
    return {
      apiKey: null,
      customPrompt: null,
      apiProvider: 'siliconflow',
      apiBaseUrl: '',
      apiModel: ''
    };
  }
};

const pickEndpoint = (provider: Provider, customBase: string, customModel: string): ProviderPreset => {
  if (provider === 'custom') {
    return {
      apiUrl: customBase || PRESETS.siliconflow.apiUrl,
      model: customModel || PRESETS.siliconflow.model
    };
  }
  const preset = PRESETS[provider];
  return {
    apiUrl: customBase || preset.apiUrl,
    model: customModel || preset.model
  };
};

const normalizeResult = (raw: unknown): AIAnalysisResult | null => {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Record<string, unknown>;
  const category = typeof candidate.category === 'string' ? candidate.category.trim() : '';
  const summary = typeof candidate.summary === 'string' ? candidate.summary.trim() : '';
  const tags = Array.isArray(candidate.tags)
    ? candidate.tags.filter((v): v is string => typeof v === 'string').map((v) => v.trim()).filter(Boolean)
    : [];

  if (!category || !summary) return null;
  return {
    category,
    summary,
    tags: tags.slice(0, 8)
  };
};

const extractJsonText = (content: string): string => {
  let clean = content.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start >= 0 && end >= start) clean = clean.slice(start, end + 1);
  return clean;
};

interface CompletionPayload {
  choices?: Array<{
    message?: {
      content?: string | Array<{ text?: string }>;
    };
  }>;
}

const parseResponseContent = (payload: unknown): AIAnalysisResult | null => {
  const content = (payload as CompletionPayload)?.choices?.[0]?.message?.content;
  if (!content) return null;

  if (Array.isArray(content)) {
    const text = content
      .map((item) => (item && typeof item.text === 'string' ? item.text : ''))
      .join('\n')
      .trim();
    if (!text) return null;
    try {
      return normalizeResult(JSON.parse(extractJsonText(text)));
    } catch {
      return null;
    }
  }

  if (typeof content === 'string') {
    try {
      return normalizeResult(JSON.parse(extractJsonText(content)));
    } catch {
      return null;
    }
  }

  return null;
};

export async function analyzeTweet(text: string): Promise<AIAnalysisResult | null> {
  if (!text?.trim()) return null;

  const config = await getStorageConfig();
  if (!config.apiKey) {
    console.warn('[X-knowledge] Missing API key.');
    return null;
  }

  const { apiUrl, model } = pickEndpoint(config.apiProvider, config.apiBaseUrl, config.apiModel);
  const prompt = `${config.customPrompt || DEFAULT_PROMPT}\n\n推文内容：\n${text}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`
  };

  const baseBody = {
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: '你是一个返回严格 JSON 的推文分析器。' },
      { role: 'user', content: prompt }
    ]
  };

  // First attempt with JSON response hint.
  const firstBody = {
    ...baseBody,
    response_format: { type: 'json_object' }
  };

  try {
    let response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(firstBody)
    });

    if (!response.ok) {
      // Some compatible providers reject response_format.
      response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(baseBody)
      });
    }

    if (!response.ok) {
      console.error('[X-knowledge] AI API Error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const parsed = parseResponseContent(data);
    if (parsed) return parsed;

    console.error('[X-knowledge] Unable to parse AI response:', data);
    return null;
  } catch (error) {
    console.error('[X-knowledge] Failed to call AI API:', error);
    return null;
  }
}
