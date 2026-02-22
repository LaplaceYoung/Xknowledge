// =============================================
// 第一步：通过外部文件在 MAIN world 中注入拦截脚本
// 使用 script.src + chrome.runtime.getURL 绕过 CSP 限制
// =============================================
const scriptEl = document.createElement('script');
scriptEl.src = chrome.runtime.getURL('interceptor.js');
scriptEl.onload = () => scriptEl.remove(); // 加载完成后清理 DOM
(document.documentElement || document.head || document.body).appendChild(scriptEl);

// =============================================
// 第二步：在 ISOLATED world 中监听来自 MAIN world 的消息
// =============================================
console.log('[X-knowledge] Content script loaded (ISOLATED world). Listening for intercepted data...');

window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  if (event.data && event.data.type === 'X_KNOWLEDGE_BOOKMARKS') {
    const sourceUrl = event.data.sourceUrl || '';
    console.log(`[X-knowledge] Content script received data from: ${sourceUrl.split('?')[0]}`);

    chrome.runtime.sendMessage({
      type: 'SAVE_BOOKMARKS',
      payload: event.data.payload,
      sourceUrl: sourceUrl
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[X-knowledge] Error sending to background:', chrome.runtime.lastError);
      } else {
        console.log('[X-knowledge] Background response:', response);
      }
    });
  }
});

// =============================================
// 第三步：主题同步
// =============================================
let currentTheme = '';

function getXTheme() {
  const bodyBgColor = window.getComputedStyle(document.body).backgroundColor;
  if (bodyBgColor === 'rgb(255, 255, 255)' || bodyBgColor === 'rgba(255, 255, 255, 1)') {
    return 'light';
  } else if (bodyBgColor === 'rgb(21, 32, 43)' || bodyBgColor === 'rgba(21, 32, 43, 1)') {
    return 'dim';
  } else if (bodyBgColor === 'rgb(0, 0, 0)' || bodyBgColor === 'rgba(0, 0, 0, 1)') {
    return 'dark';
  }
  return 'dark';
}

function broadcastTheme() {
  const theme = getXTheme();
  if (theme !== currentTheme) {
    currentTheme = theme;
    console.log(`[X-knowledge] Theme changed to: ${theme}`);
    chrome.runtime.sendMessage({
      type: 'THEME_CHANGED',
      payload: theme
    }, () => {
      if (chrome.runtime.lastError) { }
    });
  }
}

let themeObserver: MutationObserver | null = null;

const startObserving = () => {
  if (document.body) {
    themeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          broadcastTheme();
        }
      }
    });
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['style']
    });
    broadcastTheme();
  } else {
    setTimeout(startObserving, 100);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startObserving);
} else {
  startObserving();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_CURRENT_THEME') {
    if (document.body) {
      sendResponse({ theme: getXTheme() });
    } else {
      sendResponse({ theme: 'dark' });
    }
  }
  return true;
});
