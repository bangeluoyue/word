'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  FavoritePicker,
  type FavoriteTarget,
} from 'components/notebooks/favorite-picker';
import { SearchIcon, StarIcon } from 'components/ui/icons';
import type {
  NotebookListItem,
  WordNotebookMemberships,
} from 'lib/notebooks/types';
import type { WordSummary } from 'lib/words/types';

export function WordSearchList({
  words,
  loadFailed,
  isLoggedIn,
  notebooks,
  initialMemberships,
  favoriteLoadFailed,
  initialFavoriteWordId,
}: {
  words: WordSummary[];
  loadFailed: boolean;
  isLoggedIn: boolean;
  notebooks: NotebookListItem[];
  initialMemberships: WordNotebookMemberships;
  favoriteLoadFailed: boolean;
  initialFavoriteWordId?: string;
}) {
  const router = useRouter();
  const handledInitialIntent = useRef(false);
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<FavoriteTarget | null>(null);
  const [memberships, setMemberships] =
    useState<WordNotebookMemberships>(initialMemberships);
  const [notice, setNotice] = useState<string>();
  const normalizedQuery = query.trim().toLowerCase();
  const filteredWords = useMemo(
    () =>
      normalizedQuery
        ? words.filter((word) =>
            word.headWord.toLowerCase().includes(normalizedQuery),
          )
        : words,
    [normalizedQuery, words],
  );

  useEffect(() => {
    if (
      handledInitialIntent.current ||
      !initialFavoriteWordId ||
      !isLoggedIn
    ) {
      return;
    }
    handledInitialIntent.current = true;
    const word = words.find((item) => item.id === initialFavoriteWordId);
    window.history.replaceState(null, '', '/words');
    if (!word) return;
    if (favoriteLoadFailed) {
      setNotice('笔记本加载失败，请刷新后重试');
    } else if (notebooks.length === 0) {
      router.push(buildNewNotebookPath(word.id, '/words'));
    } else {
      setTarget({ id: word.id, headWord: word.headWord });
    }
  }, [favoriteLoadFailed, initialFavoriteWordId, isLoggedIn, notebooks.length, router, words]);

  function chooseFavorite(word: WordSummary) {
    setNotice(undefined);
    if (!isLoggedIn) {
      const returnTo = `/words?${new URLSearchParams({ favoriteWordId: word.id }).toString()}`;
      router.push(
        `/mine?${new URLSearchParams({ auth: 'login', returnTo }).toString()}`,
      );
      return;
    }
    if (favoriteLoadFailed) {
      setNotice('笔记本加载失败，请刷新后重试');
      return;
    }
    if (notebooks.length === 0) {
      router.push(buildNewNotebookPath(word.id, '/words'));
      return;
    }
    setTarget({ id: word.id, headWord: word.headWord });
  }

  function favoriteSaved(notebookIds: string[]) {
    if (!target) return;
    setMemberships((current) => ({ ...current, [target.id]: notebookIds }));
    setNotice(notebookIds.length > 0 ? '已保存到笔记本' : '已取消收藏');
    setTarget(null);
  }

  return (
    <>
      <div className="sticky top-0 z-20 -mx-5 border-b border-ink/[0.05] bg-paper/95 px-5 pb-4 pt-3 backdrop-blur-lg">
        <label className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-ink/[0.08] bg-white px-4 shadow-sm focus-within:border-forest/25 focus-within:ring-2 focus-within:ring-sun/35">
          <SearchIcon className="h-5 w-5 shrink-0 text-ink/30" />
          <span className="sr-only">搜索单词原型</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="输入单词，例如 pen"
            maxLength={80}
            disabled={loadFailed}
            className="min-w-0 flex-1 bg-transparent py-3.5 text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink/25 disabled:cursor-not-allowed"
          />
        </label>
      </div>

      <div className="mb-3 mt-5 flex items-center justify-between px-1 text-xs">
        <p className="font-bold text-ink/60">
          {normalizedQuery ? `找到 ${filteredWords.length} 个单词` : '全部单词'}
        </p>
        {!loadFailed && <span className="text-ink/30">共 {words.length} 个</span>}
      </div>

      {notice && (
        <p className="mb-3 rounded-xl bg-mint px-4 py-3 text-center text-xs font-bold text-forest" role="status">
          {notice}
        </p>
      )}

      {loadFailed ? (
        <WordSearchError />
      ) : filteredWords.length === 0 ? (
        <EmptySearch query={query.trim()} />
      ) : (
        <ul className="overflow-hidden rounded-[24px] border border-ink/[0.06] bg-white shadow-card">
          {filteredWords.map((word) => (
            <li
              key={word.id}
              className="flex min-h-[72px] items-center border-b border-ink/[0.06] last:border-b-0"
            >
              <Link
                href={`/words/${word.id}`}
                className="group flex min-w-0 flex-1 items-center self-stretch px-4 py-3 transition hover:bg-mint/35"
              >
                <span className="min-w-0">
                  <span className="block truncate font-serif text-[17px] font-black text-ink transition group-hover:text-forest">
                    {word.headWord}
                  </span>
                  <span className="mt-1 block truncate text-xs text-ink/45">
                    {word.translation ?? '暂无中文释义'}
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => chooseFavorite(word)}
                title="收藏到笔记本"
                aria-label={`${memberships[word.id]?.length ? '管理收藏' : '收藏'} ${word.headWord}`}
                className={`mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition hover:bg-sun/20 ${
                  memberships[word.id]?.length ? 'text-sun-dark' : 'text-ink/25'
                }`}
              >
                <StarIcon className="h-5 w-5" filled={Boolean(memberships[word.id]?.length)} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <FavoritePicker
        target={target}
        notebooks={notebooks}
        selectedNotebookIds={target ? memberships[target.id] ?? [] : []}
        onClose={() => setTarget(null)}
        onSaved={favoriteSaved}
      />
    </>
  );
}

function buildNewNotebookPath(wordRowId: string, returnTo: string) {
  return `/notebooks/new?${new URLSearchParams({ wordRowId, returnTo }).toString()}`;
}

function EmptySearch({ query }: { query: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-ink/15 bg-white/65 px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sun/20 text-forest">
        <SearchIcon className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-bold text-ink/65">没有找到“{query}”</p>
      <p className="mt-1 text-xs leading-5 text-ink/35">换一个英文单词试试看</p>
    </div>
  );
}

function WordSearchError() {
  return (
    <div className="rounded-[24px] border border-coral/20 bg-white px-6 py-12 text-center shadow-card" role="alert">
      <p className="text-sm font-bold text-ink/70">单词加载失败</p>
      <p className="mt-1 text-xs leading-5 text-ink/40">数据库暂时无法连接，请稍后重试。</p>
      <a
        href="/words"
        className="mt-5 inline-flex min-h-11 items-center rounded-full bg-forest px-5 text-xs font-bold text-white"
      >
        重新加载
      </a>
    </div>
  );
}
