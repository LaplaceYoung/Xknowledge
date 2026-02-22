import { parseBookmarks, ParsedTweet } from '../utils/twitterParser';
import { db } from '../utils/db';

async function cacheMediaForTweets(tweets: ParsedTweet[]) {
  const urlsToCache = new Set<string>();

  for (const tweet of tweets) {
    if (tweet.authorAvatar) urlsToCache.add(tweet.authorAvatar);
    for (const m of tweet.media) {
      if (m.url) urlsToCache.add(m.url);
      if (m.previewUrl) urlsToCache.add(m.previewUrl);
    }
  }

  const urls = Array.from(urlsToCache);
  if (urls.length === 0) return;

  console.log(`[X-knowledge] Background attempting to cache ${urls.length} media items offline...`);

  // Process sequentially or with small concurrency to avoid network flooding
  for (const url of urls) {
    try {
      // Check if already in DB
      const existing = await db.mediaCache.get(url);
      if (existing) continue;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const mimeType = response.headers.get('content-type') || blob.type;

      await db.mediaCache.put({
        url,
        blob,
        mimeType,
        createdAt: Date.now()
      });
      console.log(`[X-knowledge] Successfully cached: ${url.substring(0, 30)}...`);
    } catch (err) {
      console.warn(`[X-knowledge] Failed to cache media ${url}:`, err);
    }
  }
}

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_BOOKMARKS') {
    console.log('[X-knowledge] Background received bookmarks payload');

    const newParsed = parseBookmarks([message.payload]);

    db.transaction('rw', db.tweets, async () => {
      // Find which IDs already exist in the database
      const newIds = newParsed.map(t => t.id);
      const existingIds = await db.tweets.where('id').anyOf(newIds).primaryKeys();
      const existingIdSet = new Set(existingIds);

      // Only keep the ones that are truly new to prevent overwriting AI analysis
      const uniqueNew = newParsed.filter(t => !existingIdSet.has(t.id));

      if (uniqueNew.length > 0) {
        await db.tweets.bulkAdd(uniqueNew);
        console.log(`[X-knowledge] Saved ${uniqueNew.length} new bookmarks to IndexedDB.`);

        // Fire and forget media caching
        cacheMediaForTweets(uniqueNew).catch(err => {
          console.error('[X-knowledge] Background media cache err:', err);
        });
      } else {
        console.log(`[X-knowledge] No new bookmarks to save.`);
      }
    }).catch(err => {
      console.error('[X-knowledge] Failed to save to IndexedDB:', err);
    });

    // Send response to acknowledge receipt
    sendResponse({ status: 'success' });
  }

  // Return true to indicate we wish to send a response asynchronously
  return true;
});

console.log('[X-knowledge] Background script loaded.');
