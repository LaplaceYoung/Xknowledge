import { ParsedTweet } from './twitterParser';

export async function pushToNotion(tweet: ParsedTweet, token: string, dbId: string): Promise<boolean> {
  const url = 'https://api.notion.com/v1/pages';

  // Format properties
  const properties: any = {
    "Name": {
      "title": [
        {
          "text": {
            "content": `${tweet.authorName} on X`
          }
        }
      ]
    },
    "URL": {
      "url": `https://x.com/${tweet.authorHandle}/status/${tweet.id}`
    },
    "Date": {
      "date": {
        "start": new Date(tweet.createdAt).toISOString()
      }
    }
  };

  if (tweet.aiAnalysis) {
    if (tweet.aiAnalysis.category) {
      properties["Category"] = {
        "select": {
          "name": tweet.aiAnalysis.category
        }
      };
    }

    if (tweet.aiAnalysis.tags && tweet.aiAnalysis.tags.length > 0) {
      properties["Tags"] = {
        "multi_select": tweet.aiAnalysis.tags.map(tag => ({ name: tag.replace(/^#/, '') }))
      };
    }
  }

  // Format content blocks
  const children: any[] = [];

  // Add AI Summary if exists
  if (tweet.aiAnalysis) {
    children.push({
      "object": "block",
      "type": "callout",
      "callout": {
        "rich_text": [{ "type": "text", "text": { "content": `AI Summary: ${tweet.aiAnalysis.summary}` } }],
        "icon": { "emoji": "💡" }
      }
    });
  }

  // Add original text
  // Split text by newlines to create separate paragraphs (Notion limits text block length)
  const paragraphs = tweet.text.split('\n').filter(p => p.trim() !== '');
  paragraphs.forEach(p => {
    children.push({
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": p.substring(0, 2000) // Notion has a 2000 char limit per text block
            }
          }
        ]
      }
    });
  });

  // Add media links (Notion API doesn't easily support uploading files directly to blocks via external URL if they expire,
  // but we can embed or just link them)
  if (tweet.media && tweet.media.length > 0) {
    tweet.media.forEach(m => {
      if (m.type === 'photo') {
        // Use bookmark for images to avoid expiration issues breaking embeds, or just raw links
        children.push({
          "object": "block",
          "type": "bookmark",
          "bookmark": {
            "url": m.url
          }
        });
      } else {
        children.push({
          "object": "block",
          "type": "paragraph",
          "paragraph": {
            "rich_text": [
              {
                "type": "text",
                "text": { "content": "🎬 Watch Video: " },
                "annotations": { "bold": true }
              },
              {
                "type": "text",
                "text": { "content": m.url, "link": { "url": m.url } }
              }
            ]
          }
        });
      }
    });
  }

  const body = {
    "parent": { "database_id": dbId },
    "properties": properties,
    "children": children
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[X-Knowledge] Notion API Error:', response.status, errorText);
      throw new Error(`Notion API Error: ${response.status} ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error('[X-Knowledge] Failed to push to Notion:', error);
    throw error;
  }
}