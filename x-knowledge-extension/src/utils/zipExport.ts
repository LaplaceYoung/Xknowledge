import JSZip from 'jszip';
import { ParsedTweet } from './twitterParser';
import { generateMarkdown } from './markdownExport';

export async function exportToZip(tweets: ParsedTweet[], onProgress?: (current: number, total: number) => void): Promise<void> {
  if (!tweets || tweets.length === 0) return;

  const zip = new JSZip();
  const assetsFolder = zip.folder('assets');
  if (!assetsFolder) {
    throw new Error('Failed to create assets folder in ZIP');
  }

  const localMediaMap: Record<string, string> = {};

  // Collect all media URLs
  const mediaItems: { url: string, tweetId: string, type: string, index: number }[] = [];
  tweets.forEach(tweet => {
    if (tweet.media && tweet.media.length > 0) {
      tweet.media.forEach((m, index) => {
        mediaItems.push({
          url: m.url,
          tweetId: tweet.id,
          type: m.type,
          index
        });
      });
    }
  });

  // Fetch all media items
  for (let i = 0; i < mediaItems.length; i++) {
    const item = mediaItems[i];
    try {
      const response = await fetch(item.url);
      if (!response.ok) {
        console.warn(`[X-Knowledge] Failed to fetch media: ${item.url}`);
        continue;
      }

      const blob = await response.blob();

      // Determine extension
      let extension = 'jpg';
      if (item.type === 'video' || item.type === 'animated_gif') {
        extension = 'mp4';
      } else if (blob.type.includes('png')) {
        extension = 'png';
      }

      const filename = `${item.tweetId}-${item.index}.${extension}`;
      const relativePath = `./assets/${filename}`;

      // Add to map for markdown rewriting
      localMediaMap[item.url] = relativePath;

      // Add to ZIP
      assetsFolder.file(filename, blob);
    } catch (err) {
      console.error(`[X-Knowledge] Error fetching media: ${item.url}`, err);
    }

    // Report progress
    if (onProgress) {
      onProgress(i + 1, mediaItems.length);
    }
  }

  // Generate markdown with local paths
  const markdownContent = generateMarkdown(tweets, localMediaMap);
  zip.file('x-knowledge-export.md', markdownContent);

  // Generate ZIP and trigger download
  const content = await zip.generateAsync({ type: 'blob' });

  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  link.download = `x-knowledge-offline-export-${dateStr}.zip`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}