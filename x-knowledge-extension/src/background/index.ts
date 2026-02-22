import { parseBookmarks } from '../utils/twitterParser';
import { db } from '../utils/db';

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
