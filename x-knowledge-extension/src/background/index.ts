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
    const sourceUrl = message.sourceUrl ? ` from ${message.sourceUrl.split('?')[0]}` : '';
    console.log(`[X-knowledge] Background received bookmarks payload${sourceUrl}`);

    // ===== 调试：转储原始数据结构，找到用户信息路径 =====
    const dumpStructure = (obj: any, path: string, depth: number) => {
      if (!obj || typeof obj !== 'object' || depth > 6) return;
      const keys = Object.keys(obj);
      if (keys.length > 20) {
        console.log(`[DEBUG] ${path} => {${keys.slice(0, 10).join(', ')}... (${keys.length} keys)}`);
      } else {
        console.log(`[DEBUG] ${path} => {${keys.join(', ')}}`);
      }
      // 标记关键字段
      if (obj.__typename) console.log(`[DEBUG] ${path}.__typename = "${obj.__typename}"`);
      if (obj.screen_name) console.log(`[DEBUG] ★★★ 找到 screen_name 在 ${path}.screen_name = "${obj.screen_name}"`);
      if (obj.name && obj.screen_name) console.log(`[DEBUG] ★★★ 找到用户 name 在 ${path}.name = "${obj.name}"`);
      for (const key of keys) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          dumpStructure(obj[key], `${path}.${key}`, depth + 1);
        }
      }
    };

    // 找到第一个 tweet entry 并转储
    try {
      const payload = message.payload;
      // 尝试遍历到书签时间线的第一个条目
      const instructions = payload?.data?.bookmark_timeline_v2?.timeline?.instructions
        || payload?.data?.bookmarkTimeline?.timeline?.instructions
        || [];
      for (const inst of instructions) {
        if (inst.entries && inst.entries.length > 0) {
          const firstEntry = inst.entries[0];
          console.log('[DEBUG] ====== 第一个书签条目的完整结构 ======');
          dumpStructure(firstEntry, 'entry', 0);
          console.log('[DEBUG] ====== 结构转储结束 ======');
          break;
        }
      }
      if (instructions.length === 0) {
        console.log('[DEBUG] 未找到 instructions，顶层 keys:', Object.keys(payload?.data || payload));
        dumpStructure(payload, 'payload', 0);
      }
    } catch (e) {
      console.error('[DEBUG] 结构转储出错:', e);
    }
    // ===== 调试结束 =====

    const newParsed = parseBookmarks([message.payload]);
    console.log(`[X-knowledge] Background parsed ${newParsed.length} tweets from payload.`);

    db.transaction('rw', db.tweets, async () => {
      if (newParsed.length === 0) return;

      // Find which IDs already exist in the database
      const newIds = newParsed.map(t => t.id);
      const existingIds = await db.tweets.where('id').anyOf(newIds).primaryKeys();
      const existingIdSet = new Set(existingIds);

      // Only keep the ones that are truly new to prevent overwriting AI analysis
      const uniqueNew = newParsed.filter(t => !existingIdSet.has(t.id));

      if (uniqueNew.length > 0) {
        // Use bulkPut just in case, though we filtered duplicates
        await db.tweets.bulkPut(uniqueNew);
        console.log(`[X-knowledge] Saved ${uniqueNew.length} new bookmarks to IndexedDB.`);

        // 通知侧边栏刷新数据（useLiveQuery 无法感知跨上下文的 IndexedDB 写入）
        chrome.runtime.sendMessage({ type: 'BOOKMARKS_UPDATED', count: uniqueNew.length }).catch(() => { });

        // Fire and forget media caching
        cacheMediaForTweets(uniqueNew).catch(err => {
          console.error('[X-knowledge] Background media cache err:', err);
        });
      } else {
        console.log(`[X-knowledge] No new bookmarks to save (all ${newParsed.length} already exist).`);
      }
    }).catch(err => {
      console.error('[X-knowledge] Failed to save to IndexedDB:', err);
    });


    // Send response to acknowledge receipt
    sendResponse({ status: 'success', count: newParsed.length });
  }

  // Return true to indicate we wish to send a response asynchronously
  return true;
});

console.log('[X-knowledge] Background script loaded.');
