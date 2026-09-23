import type { LearningStatus } from 'lib/db/schema';

/** 可安全跨越 Server/Client Component 边界的学习进度。 */
export type ProgressViewModel = {
  id: string;
  book_id: string;
  last_word_row_id: string | null;
  last_word_rank: number | null;
  learned_count: number;
  total_words: number;
  status: LearningStatus;
  version: number;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
};
