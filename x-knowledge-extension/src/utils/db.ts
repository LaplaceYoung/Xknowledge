import Dexie, { Table } from 'dexie';
import { ParsedTweet } from './twitterParser';

export interface MediaCacheItem {
  url: string;
  blob: Blob;
  mimeType: string;
  createdAt: number;
}

export class XKnowledgeDB extends Dexie {
  tweets!: Table<ParsedTweet, string>;
  mediaCache!: Table<MediaCacheItem, string>;

  constructor() {
    super('XKnowledgeDB');
    this.version(1).stores({
      tweets: 'id, createdAt, authorHandle, aiAnalysis.category'
    });
    this.version(2).stores({
      mediaCache: 'url, createdAt'
    });
  }
}

export const db = new XKnowledgeDB();
