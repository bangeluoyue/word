import type { Word } from 'lib/db/schema';
import type {
  DictionaryBody,
  GlobalWordViewModel,
  LearningWordViewModel,
} from 'lib/words/types';

type JsonObject = Record<string, unknown>;

/** 把公共词条 JSON 转成页面可安全消费、且不依赖书籍关系的模型。 */
export function mapGlobalWordRow(
  row: Pick<Word, 'id' | 'headWord' | 'content'>,
): GlobalWordViewModel | null {
  const root = asObject(row.content);
  const word = asObject(root?.word);
  const body = asObject(word?.content);
  const wordId = cleanString(word?.wordId);
  const headWord = cleanString(word?.wordHead) ?? cleanString(row.headWord);

  if (!wordId || !headWord) return null;

  return {
    id: row.id.toString(),
    headWord,
    content: {
      word: {
        wordHead: headWord,
        wordId,
        content: mapDictionaryBody(body),
      },
    },
  };
}

/** 在公共词条上附加所属书和排序，供学习流程使用。 */
export function mapLearningWordRow(row: Word): LearningWordViewModel | null {
  const word = mapGlobalWordRow(row);
  const bookId = cleanString(row.bookId);

  if (!word || !bookId || !row.wordRank || row.wordRank <= 0) return null;

  return {
    ...word,
    bookId,
    wordRank: row.wordRank,
  };
}

function mapDictionaryBody(value: JsonObject | null): DictionaryBody {
  if (!value) return {};

  const sentence = asObject(value.sentence);
  const phrase = asObject(value.phrase);
  const remMethod = asObject(value.remMethod);
  const syno = asObject(value.syno);
  const relWord = asObject(value.relWord);

  const translations = asArray(value.trans)
    .map(asObject)
    .filter(isPresent)
    .map((item) => ({
      tranCn: cleanString(item.tranCn),
      tranOther: cleanString(item.tranOther),
      descCn: cleanString(item.descCn),
      descOther: cleanString(item.descOther),
    }))
    .filter((item) => item.tranCn || item.tranOther);

  const sentences = asArray(sentence?.sentences)
    .map(asObject)
    .filter(isPresent)
    .map((item) => ({
      sContent: cleanString(item.sContent),
      sCn: cleanString(item.sCn),
    }))
    .filter((item) => item.sContent || item.sCn);

  const phrases = asArray(phrase?.phrases)
    .map(asObject)
    .filter(isPresent)
    .map((item) => ({
      pContent: cleanString(item.pContent),
      pCn: cleanString(item.pCn),
    }))
    .filter((item) => item.pContent || item.pCn);

  const synonyms = asArray(syno?.synos)
    .map(asObject)
    .filter(isPresent)
    .map((item) => ({
      pos: cleanString(item.pos),
      tran: cleanString(item.tran),
      hwds: asArray(item.hwds)
        .map(asObject)
        .filter(isPresent)
        .map((word) => ({ w: cleanString(word.w) }))
        .filter((word) => word.w),
    }))
    .filter((item) => item.pos || item.tran || item.hwds.length > 0);

  const relatedWords = asArray(relWord?.rels)
    .map(asObject)
    .filter(isPresent)
    .map((item) => ({
      pos: cleanString(item.pos),
      words: asArray(item.words)
        .map(asObject)
        .filter(isPresent)
        .map((word) => ({
          hwd: cleanString(word.hwd),
          tran: cleanString(word.tran),
        }))
        .filter((word) => word.hwd || word.tran),
    }))
    .filter((item) => item.pos || item.words.length > 0);

  return {
    usphone: cleanString(value.usphone),
    ukphone: cleanString(value.ukphone),
    usspeech: cleanString(value.usspeech),
    ukspeech: cleanString(value.ukspeech),
    trans: translations.length > 0 ? translations : undefined,
    sentence:
      sentences.length > 0
        ? { desc: cleanString(sentence?.desc), sentences }
        : undefined,
    phrase:
      phrases.length > 0 ? { desc: cleanString(phrase?.desc), phrases } : undefined,
    remMethod: cleanString(remMethod?.val)
      ? {
          desc: cleanString(remMethod?.desc),
          val: cleanString(remMethod?.val),
        }
      : undefined,
    syno:
      synonyms.length > 0
        ? { desc: cleanString(syno?.desc), synos: synonyms }
        : undefined,
    relWord:
      relatedWords.length > 0
        ? { desc: cleanString(relWord?.desc), rels: relatedWords }
        : undefined,
  };
}

function asObject(value: unknown): JsonObject | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function cleanString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function isPresent<T>(value: T | null): value is T {
  return value !== null;
}
