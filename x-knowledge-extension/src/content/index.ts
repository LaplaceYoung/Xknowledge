// Listen for messages from the injected script
console.log('[X-knowledge] Content script loaded. Waiting for messages...');

window.addEventListener('message', (event) => {
  // We only accept messages from ourselves
  if (event.source !== window) return;

  if (event.data && event.data.type === 'X_KNOWLEDGE_BOOKMARKS') {
    console.log('[X-knowledge] Content Script received bookmarks:', event.data.payload);

    // Forward to background script for storage/processing
    chrome.runtime.sendMessage({
      type: 'SAVE_BOOKMARKS',
      payload: event.data.payload
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[X-knowledge] Error sending message to background:', chrome.runtime.lastError);
      } else {
        console.log('[X-knowledge] Background response:', response);
      }
    });
  }
});

// --- Theme Observer ---
// Detect X (Twitter) theme changes and notify the extension
let currentTheme = '';

function getXTheme() {
  const bodyBgColor = window.getComputedStyle(document.body).backgroundColor;
  // Light: rgb(255, 255, 255)
  // Dim: rgb(21, 32, 43)
  // Lights out: rgb(0, 0, 0)

  if (bodyBgColor === 'rgb(255, 255, 255)' || bodyBgColor === 'rgba(255, 255, 255, 1)') {
    return 'light';
  } else if (bodyBgColor === 'rgb(21, 32, 43)' || bodyBgColor === 'rgba(21, 32, 43, 1)') {
    return 'dim';
  } else if (bodyBgColor === 'rgb(0, 0, 0)' || bodyBgColor === 'rgba(0, 0, 0, 1)') {
    return 'dark'; // Map lights out to dark
  }

  // Fallback
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
      // Ignore errors if the side panel is not open
      if (chrome.runtime.lastError) {}
    });
  }
}

// Observe body for style changes
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

    // Initial broadcast
    broadcastTheme();
  } else {
    setTimeout(startObserving, 100);
  }
};

// Start when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startObserving);
} else {
  startObserving();
}

// Listen for explicit requests from the side panel for the current theme
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

