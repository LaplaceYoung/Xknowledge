export interface AIAnalysisResult {
  category: string;
  summary: string;
  tags: string[];
}

const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const MODEL = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B';

interface StorageConfig {
  apiKey: string | null;
  customPrompt: string | null;
}

const getStorageConfig = (): Promise<StorageConfig> => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['siliconFlowApiKey', 'customAIPrompt'], (result) => {
        resolve({
          apiKey: (result.siliconFlowApiKey as string) || null,
          customPrompt: (result.customAIPrompt as string) || null
        });
      });
    } else {
      resolve({ apiKey: null, customPrompt: null });
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
JSON 结构如下：
{
  "category": "字符串，推文的分类（如：#AI工具, #编程技巧, #投资观察, #生活方式等）",
  "summary": "字符串，50字以内的核心摘要",
  "tags": ["标签1", "标签2"]
}`;

  const basePrompt = config.customPrompt || defaultPrompt;
  const prompt = `${basePrompt}

推文内容：
${text}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
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

    // 尝试解析 JSON
    try {
      // 移除可能存在的 markdown 标记
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanContent) as AIAnalysisResult;
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      return null;
    }
  } catch (error) {
    console.error('Failed to call AI API:', error);
    return null;
  }
}
