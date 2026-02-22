export interface AIAnalysisResult {
  category: string;
  summary: string;
  tags: string[];
}

const DEFAULT_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B';

interface StorageConfig {
  apiKey: string | null;
  customPrompt: string | null;
  apiProvider?: string;
  apiBaseUrl?: string;
  apiModel?: string;
}

const getStorageConfig = (): Promise<StorageConfig> => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['siliconFlowApiKey', 'customAIPrompt', 'apiProvider', 'apiBaseUrl', 'apiModel'], (result) => {
        resolve({
          apiKey: (result.siliconFlowApiKey as string) || null,
          customPrompt: (result.customAIPrompt as string) || null,
          apiProvider: (result.apiProvider as string) || 'siliconflow',
          apiBaseUrl: (result.apiBaseUrl as string) || '',
          apiModel: (result.apiModel as string) || ''
        });
      });
    } else {
      resolve({ apiKey: null, customPrompt: null, apiProvider: 'siliconflow' });
    }
  });
};

export async function analyzeTweet(text: string): Promise<AIAnalysisResult | null> {
  if (!text || text.trim() === '') {
    return null;
  }

  const config = await getStorageConfig();
  const API_KEY = config.apiKey;

  if (!API_KEY) {
    console.warn('[X-knowledge] No API Key found. Please configure it in the extension options.');
    // Ideally, we'd throw an error here to show in the UI, but returning null is safe for now.
    return null;
  }

  const defaultPrompt = `请分析以下推文内容，返回严格的 JSON 格式数据，不要包含任何 Markdown 标记（如 \`\`\`json），只需返回纯 JSON 字符串。
注意事项：
1. 请不要创建过于具体、长尾且不具备复用性的碎化标签。
2. 尽可能复用推特社区常见的宽泛话题标签（如：#AI, #Crypto, #生活方式, #生产力, #效率工具, #商业, #设计, #幽默 等）。
3. "tags" 数组的长度尽量控制在 2~4 个之内。
JSON 结构如下：
{
  "category": "字符串，推文的总分类（如：AI工具, 编程技巧, 投资观察, 生活记录等，不要带#号）",
  "summary": "字符串，50字以内的核心内容摘要，用于快速浏览理解",
  "tags": ["标签1", "标签2", "标签3"]
}`;

  const basePrompt = config.customPrompt || defaultPrompt;
  const prompt = `${basePrompt}

推文内容：
${text}`;

  const apiUrl = (config.apiProvider === 'custom' && config.apiBaseUrl) ? config.apiBaseUrl : DEFAULT_API_URL;
  const modelName = (config.apiProvider === 'custom' && config.apiModel) ? config.apiModel : DEFAULT_MODEL;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      console.error('AI API Error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) return null;

    // 尝试解析 JSON - 处理 deepseek-r1 的思维链和 markdown
    try {
      let cleanContent = content;
      // 去除可能的外层 markdown (```json ... ```)
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // 提取最新的 {} 内的内容（避免前置的 <think>...</think> 或非规范文本崩溃 JSON.parse）
      const startIndex = cleanContent.indexOf('{');
      const endIndex = cleanContent.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
        cleanContent = cleanContent.substring(startIndex, endIndex + 1);
      }

      const parsed = JSON.parse(cleanContent) as AIAnalysisResult;
      // Validate schema
      if (parsed.category && parsed.summary && Array.isArray(parsed.tags)) {
        return parsed;
      }
      console.warn('[X-knowledge] Parsed JSON missing required fields:', parsed);
      return null;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      return null;
    }
  } catch (error) {
    console.error('Failed to call AI API:', error);
    return null;
  }
}
