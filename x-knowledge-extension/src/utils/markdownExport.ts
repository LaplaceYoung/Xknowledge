import { ParsedTweet } from './twitterParser';

function generateSingleTweetMarkdown(tweet: ParsedTweet, localMediaMap?: Record<string, string>): string {
  let md = `---\n`;
  md += `id: "${tweet.id}"\n`;
  md += `author: "${tweet.authorName.replace(/"/g, '\\"')}"\n`;
  md += `handle: "@${tweet.authorHandle}"\n`;
  md += `date: ${tweet.createdAt}\n`;
  md += `url: "https://x.com/${tweet.authorHandle}/status/${tweet.id}"\n`;

  if (tweet.aiAnalysis) {
    md += `category: "${tweet.aiAnalysis.category}"\n`;
    if (tweet.aiAnalysis.tags && tweet.aiAnalysis.tags.length > 0) {
      md += `tags:\n`;
      tweet.aiAnalysis.tags.forEach(tag => {
        md += `  - "${tag.replace(/^#/, '')}"\n`;
      });
    }
  } else {
    md += `category: "Uncategorized"\n`;
  }
  md += `---\n\n`;

  // Body
  md += `# ${tweet.authorName} (@${tweet.authorHandle})\n\n`;

  if (tweet.aiAnalysis) {
    md += `> **💡 AI Summary**: ${tweet.aiAnalysis.summary}\n\n`;
  }

  md += `${tweet.text}\n\n`;

  if (tweet.media && tweet.media.length > 0) {
    tweet.media.forEach(m => {
      const mediaUrl = localMediaMap && localMediaMap[m.url] ? localMediaMap[m.url] : m.url;
      if (m.type === 'photo') {
        md += `![Image](${mediaUrl})\n\n`;
      } else {
        md += `🎬 [Watch Video](${mediaUrl})\n\n`;
      }
    });
  }

  md += `---\n*Saved from [X/Twitter](https://x.com/${tweet.authorHandle}/status/${tweet.id}) on ${new Date().toLocaleDateString()}*\n`;

  return md;
}

export function generateMarkdown(tweets: ParsedTweet[], localMediaMap?: Record<string, string>): string {
  if (!tweets || tweets.length === 0) return '';

  // If it's a single tweet (e.g., Copy to Clipboard), include frontmatter
  if (tweets.length === 1) {
    return generateSingleTweetMarkdown(tweets[0], localMediaMap);
  }

  // If it's a batch export, structure as a single document without breaking YAML
  let markdown = `---\n`;
  markdown += `title: "X-Knowledge Export"\n`;
  markdown += `date: ${new Date().toISOString()}\n`;
  markdown += `count: ${tweets.length}\n`;
  markdown += `---\n\n`;
  markdown += `# X-Knowledge Bookmarks Export\n\n`;
  markdown += `Generated on ${new Date().toLocaleDateString()}\n\n`;
  markdown += `---\n\n`;

  tweets.forEach(tweet => {
    markdown += `## ${tweet.authorName} (@${tweet.authorHandle})\n\n`;
    markdown += `📅 ${new Date(tweet.createdAt).toLocaleDateString()} | 🔗 [Original Tweet](https://x.com/${tweet.authorHandle}/status/${tweet.id})\n\n`;

    if (tweet.aiAnalysis) {
      markdown += `**Category**: ${tweet.aiAnalysis.category} | **Tags**: ${tweet.aiAnalysis.tags.join(', ')}\n\n`;
      markdown += `> **💡 AI Summary**: ${tweet.aiAnalysis.summary}\n\n`;
    }

    markdown += `${tweet.text}\n\n`;

    if (tweet.media && tweet.media.length > 0) {
      tweet.media.forEach(m => {
        const mediaUrl = localMediaMap && localMediaMap[m.url] ? localMediaMap[m.url] : m.url;
        if (m.type === 'photo') {
          markdown += `![Image](${mediaUrl})\n\n`;
        } else {
          markdown += `🎬 [Watch Video](${mediaUrl})\n\n`;
        }
      });
    }

    markdown += `---\n\n`;
  });

  return markdown;
}

export function downloadMarkdown(content: string, filename: string = 'x-knowledge-export.md') {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}