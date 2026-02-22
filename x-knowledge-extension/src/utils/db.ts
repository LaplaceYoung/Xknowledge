import Dexie, { Table } from 'dexie';
import { ParsedTweet } from './twitterParser';

export class XKnowledgeDB extends Dexie {
  tweets!: Table<ParsedTweet, string>;

  constructor() {
    super('XKnowledgeDB');
    this.version(1).stores({
      // Primary key is 'id'.
      // We index 'createdAt', 'authorHandle' and 'aiAnalysis.category' for fast querying later if needed.
      tweets: 'id, createdAt, authorHandle, aiAnalysis.category'
    });
  }
}

export const db = new XKnowledgeDB();
