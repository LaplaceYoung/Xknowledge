const fs = require('fs');

const parserPath = 'x-knowledge-extension/src/utils/twitterParser.ts';
let content = fs.readFileSync(parserPath, 'utf8');

// The new logic
const newLogic = `
export function parseBookmarks(rawPayloads: any[]): ParsedTweet[] {
  const parsedTweets: ParsedTweet[] = [];
  const seenIds = new Set<string>();

  const extractTweetFromResult = (tweetResult: any) => {
    if (!tweetResult) return;

    // Support nested tweets (e.g. retweeted)
    const tweet = tweetResult.tweet || tweetResult;
    if (!tweet.legacy) return;

    const legacy = tweet.legacy;
    const userResult = tweet.core?.user_results?.result;
    const userLegacy = userResult?.legacy;

    if (!userLegacy) return;

    const id = legacy.id_str;
    if (!id) return;

    // Deduplicate
    if (seenIds.has(id)) return;
    seenIds.add(id);

    // Extract text (handle long tweets via note_tweet)
    let text = legacy.full_text || '';
    if (tweet.note_tweet?.note_tweet_results?.result?.text) {
      text = tweet.note_tweet.note_tweet_results.result.text;
    }

    // Extract media
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

    parsedTweets.push({
      id,
      authorName: userLegacy.name || '',
      authorHandle: userLegacy.screen_name || '',
      authorAvatar: userLegacy.profile_image_url_https || '',
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

  // Recursive deep search for tweet_results
  const traverse = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
      obj.forEach(item => traverse(item));
      return;
    }

    // Is this a tweet result node?
    if (obj.tweet_results && obj.tweet_results.result) {
      extractTweetFromResult(obj.tweet_results.result);
    } 
    // Is this a direct result node from TweetResultByRestId?
    else if (obj.__typename === 'Tweet' && obj.legacy) {
      extractTweetFromResult(obj);
    }
    
    // Continue traversing
    Object.values(obj).forEach(value => traverse(value));
  };

  for (const payload of rawPayloads) {
    try {
      traverse(payload);
    } catch (e) {
      console.error('[X-knowledge] Error parsing payload:', e);
    }
  }

  return parsedTweets;
}
`;

// Replace everything from `export function parseBookmarks` to the end of the file
const startIdx = content.indexOf('export function parseBookmarks');
if (startIdx !== -1) {
  content = content.substring(0, startIdx) + newLogic;
  fs.writeFileSync(parserPath, content);
  console.log('Parser updated successfully for deep graphQL extraction.');
} else {
  console.log('Could not find parseBookmarks function.');
}
