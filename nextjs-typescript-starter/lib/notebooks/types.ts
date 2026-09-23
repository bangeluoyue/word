import type { WordSummary } from 'lib/words/types';

export type NotebookListItem = {
  id: string;
  name: string;
  wordCount: number;
  updatedAt: string;
};

export type WordNotebookMemberships = Record<string, string[]>;

export type NotebookDetail = NotebookListItem & {
  words: WordSummary[];
};
