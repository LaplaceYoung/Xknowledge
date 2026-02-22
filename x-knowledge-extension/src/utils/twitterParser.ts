export interface Media {
  type: 'photo' | 'video' | 'animated_gif';
  url: string;
  previewUrl?: string;
  width?: number;
  height?: number;
}

export interface ParsedTweet {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  text: string;
  media: Media[];
  createdAt: string;
  metrics: {
    replyCount: number;
    retweetCount: number;
    likeCount: number;
    bookmarkCount: number;
  };
  aiAnalysis?: {
    category: string;
    summary: string;
    tags: string[];
  };
}


export function parseBookmarks(rawPayloads: any[]): ParsedTweet[] {
  const parsedTweets: ParsedTweet[] = [];
  const seenIds = new Set<string>();

  const extractTweetFromResult = (tweetResult: any) => {
    if (!tweetResult) return;

    // 保留所有层级引用用于后续用户信息查找
    const originalInput = tweetResult;
    let result = tweetResult.result || tweetResult;
    let tweet = result.tweet || result;

    if (tweet.result) {
      tweet = tweet.result.tweet || tweet.result;
    }

    if (!tweet.legacy && !tweet.tweet_results) {
      if (tweet.__typename !== 'TweetTombstone') {
        // console.log('[X-knowledge-parser] Result missing legacy/tweet_results:', result.__typename || 'Unknown');
      }
      return;
    }

    const legacy = tweet.legacy || tweet.tweet_results?.result?.legacy;
    if (!legacy) return;

    // 从所有可能的路径提取用户信息
    // Twitter API 在不同端点和不同嵌套层级中会把 user_results 放在不同位置
    const candidateObjects = [tweet, result, originalInput, originalInput?.result, result?.tweet];

    let userLegacy: any = null;

    for (const candidate of candidateObjects) {
      if (!candidate) continue;

      const userResult = candidate.core?.user_results?.result
        || candidate.author?.result
        || candidate.user_results?.result;

      if (!userResult) continue;

      // 路径 A: 传统 legacy 子对象 (旧版 Twitter API)
      if (userResult.legacy?.screen_name) {
        userLegacy = userResult.legacy;
        break;
      }

      // 路径 B: 直接在 user_results.result 上 (新版 Twitter API，legacy 被扁平化)
      if (userResult.screen_name) {
        userLegacy = userResult;
        break;
      }
    }

    // 终极回退：递归搜索带 screen_name 的对象（深度限制）
    if (!userLegacy?.screen_name) {
      const findUserData = (obj: any, depth: number): any => {
        if (!obj || typeof obj !== 'object' || depth > 8) return null;
        // 直接检查当前对象是否有 screen_name（用户对象的标志）
        if (obj.screen_name && typeof obj.screen_name === 'string') {
          return obj;
        }
        for (const key of Object.keys(obj)) {
          if (key === 'entities' || key === 'extended_entities') continue;
          const found = findUserData(obj[key], depth + 1);
          if (found) return found;
        }
        return null;
      };
      userLegacy = findUserData(originalInput, 0) || userLegacy;
    }

    const id = legacy.id_str || tweet.rest_id || result.rest_id || tweetResult.rest_id;
    if (!id) return;

    if (seenIds.has(id)) return;
    seenIds.add(id);

    let text = legacy.full_text || '';
    if (tweet.note_tweet?.note_tweet_results?.result?.text) {
      text = tweet.note_tweet.note_tweet_results.result.text;
    }

    const mediaList: Media[] = [];
    const entities = legacy.extended_entities || legacy.entities;

    if (entities && entities.media) {
      for (const m of entities.media) {
        if (m.type === 'video' || m.type === 'animated_gif') {
          const variants = m.video_info?.variants || [];
          const bestVariant = variants
            .filter((v: any) => v.content_type === 'video/mp4')
            .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0];

          if (bestVariant) {
            mediaList.push({
              type: m.type,
              url: bestVariant.url,
              previewUrl: m.media_url_https,
              width: m.original_info?.width,
              height: m.original_info?.height
            });
          }
        } else {
          mediaList.push({
            type: 'photo',
            url: m.media_url_https,
            width: m.original_info?.width,
            height: m.original_info?.height
          });
        }
      }
    }

    // 调试日志：仅在作者未找到时输出 user_results.result 的键
    if (!userLegacy?.screen_name) {
      const ur = tweet.core?.user_results?.result;
      console.warn(`[X-knowledge-parser] 无法提取用户信息, tweet id=${id}`,
        '\n  user_results.result keys:', ur ? Object.keys(ur) : 'N/A',
        '\n  user_results.result.__typename:', ur?.__typename,
        '\n  user_results.result.legacy exists:', !!ur?.legacy,
        '\n  user_results.result.screen_name:', ur?.screen_name,
        '\n  完整 user_results.result:', ur ? JSON.stringify(ur).substring(0, 500) : 'N/A'
      );
    }

    parsedTweets.push({
      id,
      authorName: userLegacy?.name || 'Unknown Author',
      authorHandle: userLegacy?.screen_name || 'unknown',
      authorAvatar: userLegacy?.profile_image_url_https || '',
      text,
      media: mediaList,
      createdAt: legacy.created_at || '',
      metrics: {
        replyCount: legacy.reply_count || 0,
        retweetCount: legacy.retweet_count || 0,
        likeCount: legacy.favorite_count || 0,
        bookmarkCount: legacy.bookmark_count || 0
      }
    });
  };

  // Recursive deep search for tweet_results or objects with legacy field
  const traverse = (obj: any, depth = 0) => {
    if (!obj || typeof obj !== 'object' || depth > 20) return;

    if (Array.isArray(obj)) {
      obj.forEach(item => traverse(item, depth + 1));
      return;
    }

    // Is this a tweet result node?
    if (obj.tweet_results && obj.tweet_results.result) {
      extractTweetFromResult(obj.tweet_results);
    }
    // Is this a common entry format?
    else if (obj.itemContent?.tweet_results?.result) {
      extractTweetFromResult(obj.itemContent.tweet_results);
    }
    // Is this a direct result node from TweetResultByRestId?
    else if ((obj.__typename === 'Tweet' || obj.__typename === 'TweetWithVisibilityResults') && obj.legacy) {
      extractTweetFromResult(obj);
    }

    // Continue traversing
    // For performance, only traverse certain fields if we are at the top levels
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        traverse(obj[key], depth + 1);
      }
    }
  };

  console.log(`[X-knowledge-parser] Starting parse with ${rawPayloads.length} payloads`);
  for (const payload of rawPayloads) {
    try {
      traverse(payload);
    } catch (e) {
      console.error('[X-knowledge] Error parsing payload:', e);
    }
  }

  console.log(`[X-knowledge-parser] Finished. Found ${parsedTweets.length} unique tweets.`);
  return parsedTweets;
}
