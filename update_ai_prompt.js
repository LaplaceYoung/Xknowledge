const fs = require('fs');
const path = 'x-knowledge-extension/src/utils/ai.ts';
let content = fs.readFileSync(path, 'utf8');

const getApiKeyOld = /const getApiKey = \(\): Promise<string \| null> => \{[\s\S]*?\}\);/;
const getApiKeyNew = `interface StorageConfig {
  apiKey: string | null;
  customPrompt: string | null;
}

const getStorageConfig = (): Promise<StorageConfig> => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['siliconFlowApiKey', 'customAIPrompt'], (result) => {
        resolve({
          apiKey: result.siliconFlowApiKey || null,
          customPrompt: result.customAIPrompt || null
        });
      });
    } else {
      resolve({ apiKey: null, customPrompt: null });
    }
  });
};`;

content = content.replace(getApiKeyOld, getApiKeyNew);

const analyzeOld = /const API_KEY = await getApiKey\(\);[\s\S]*?const prompt = \`请分析以下推文内容[\s\S]*?\$\{text\}\`;/;
const analyzeNew = `const config = await getStorageConfig();
  const API_KEY = config.apiKey;

  if (!API_KEY) {
    console.warn('[X-knowledge] No API Key found. Please configure it in the extension options.');
    return null;
  }

  const defaultPrompt = \`请分析以下推文内容，返回严格的 JSON 格式数据，不要包含任何 Markdown 标记（如 \\`\\`\\`json），只需返回纯 JSON 字符串。
JSON 结构如下：
{
  "category": "字符串，推文的分类（如：#AI工具, #编程技巧, #投资观察, #生活方式等）",
  "summary": "字符串，50字以内的核心摘要",
  "tags": ["标签1", "标签2"]
}\`;

  const basePrompt = config.customPrompt || defaultPrompt;
  const prompt = \`\${basePrompt}

推文内容：
\${text}\`;`;

content = content.replace(analyzeOld, analyzeNew);

fs.writeFileSync(path, content);
console.log('AI engine updated to support custom prompts');
