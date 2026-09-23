import 'server-only';

import { and, desc, eq } from 'drizzle-orm';

import { db } from 'lib/db/client';
import {
  learningProgress,
  type LearningProgress,
} from 'lib/db/schema';
import type { ProgressViewModel } from 'lib/progress/types';

export async function listProgressByUser(
  userId: number,
): Promise<ProgressViewModel[]> {
  const rows = await db
    .select()
    .from(learningProgress)
    .where(eq(learningProgress.userId, userId))
    .orderBy(desc(learningProgress.updatedAt));

  return rows.map(mapProgress);
}

export async function getProgressByUserAndBook(
  userId: number,
  bookId: string,
): Promise<LearningProgress | null> {
  const [progress] = await db
    .select()
    .from(learningProgress)
    .where(
      and(
        eq(learningProgress.userId, userId),
        eq(learningProgress.bookId, bookId),
      ),
    )
    .limit(1);

  return progress ?? null;
}

export function mapProgress(progress: LearningProgress): ProgressViewModel {
  return {
    id: progress.id.toString(),
    book_id: progress.bookId,
    last_word_row_id: progress.lastWordRowId?.toString() ?? null,
    last_word_rank: progress.lastWordRank,
    learned_count: progress.learnedCount,
    total_words: progress.totalWords,
    status: progress.status,
    version: progress.version,
    started_at: progress.startedAt.toISOString(),
    updated_at: progress.updatedAt.toISOString(),
    completed_at: progress.completedAt?.toISOString() ?? null,
  };
}
