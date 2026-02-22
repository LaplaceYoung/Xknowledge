// Intercept X (Twitter) GraphQL requests
console.log('[X-knowledge] Inject script loaded. Intercepting fetch and XHR...');

// --- 1. Intercept Fetch ---
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);

  try {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] instanceof Request ? args[0].url : '');

    // Check if it's a GraphQL request
    if (url.includes('/graphql/')) {
      // Clone the response to read it without consuming it
      const clone = response.clone();
      clone.json().then((data) => {
        // Debug: Log all GraphQL requests to help identify the correct one
        console.log('[X-knowledge] GraphQL Request:', url);

        // Check for Bookmarks in the response data
        // The structure is usually data -> bookmark_timeline_v2 -> timeline -> instructions...
        // We check if the URL contains relevant endpoint names
        const relevantEndpoints = ['Bookmarks', 'TweetDetail', 'TweetResultByRestId', 'UserTweets', 'HomeTimeline'];
        const isRelevantUrl = relevantEndpoints.some(ep => url.includes(ep));

        // We'll also just check if the data contains tweet_results deeply, but for performance, URL check is better.
        if (isRelevantUrl && data) {
          console.log(`[X-knowledge] Intercepted GraphQL (${url.split('/').pop()?.split('?')[0]}) via fetch!`);
          window.postMessage({
            type: 'X_KNOWLEDGE_BOOKMARKS',
            payload: data
          }, '*');
        }
      }).catch(err => {
        // console.error('[X-knowledge] Failed to parse intercepted GraphQL data', err)
      });
    }
  } catch (e) {
    console.error('[X-knowledge] Error in fetch interceptor', e);
  }

  return response;
};

// --- 2. Intercept XHR (XMLHttpRequest) ---
const originalXHRSend = XMLHttpRequest.prototype.send;
const originalXHROpen = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
  this._url = url.toString();
  // @ts-ignore
  return originalXHROpen.apply(this, [method, url, ...rest]);
};

XMLHttpRequest.prototype.send = function(...args: any[]) {
  this.addEventListener('load', function() {
    try {
      if (this._url && this._url.includes('/graphql/')) {
        if (this.responseText) {
          try {
            const data = JSON.parse(this.responseText);
            
            // Debug: Log all GraphQL requests
            console.log('[X-knowledge] XHR GraphQL Request:', this._url);

            const relevantEndpoints = ['Bookmarks', 'TweetDetail', 'TweetResultByRestId', 'UserTweets', 'HomeTimeline'];
            const isRelevantUrl = relevantEndpoints.some(ep => this._url.includes(ep));

            if (isRelevantUrl && data) {
              console.log(`[X-knowledge] Intercepted GraphQL XHR (${this._url.split('/').pop()?.split('?')[0]})`);
              window.postMessage({
                type: 'X_KNOWLEDGE_BOOKMARKS',
                payload: data
              }, '*');
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      }
    } catch (e) {
      console.error('[X-knowledge] Error in XHR interceptor', e);
    }
  });

  // @ts-ignore
  return originalXHRSend.apply(this, args);
};
