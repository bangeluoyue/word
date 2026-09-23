import type { BookListItem } from 'lib/books/types';
import type { DictionaryBody, LearningWordViewModel } from 'lib/words/types';

export type MockBookRow = BookListItem & {
  id: string;
  created_at: string;
  updated_at: string;
};

export type MockWordRow = LearningWordViewModel;

export type MockProgressRow = {
  id: string;
  user_id: number;
  book_id: string;
  last_word_row_id: string | null;
  last_word_rank: number | null;
  learned_count: number;
  total_words: number;
  status: 'learning' | 'completed';
  version: number;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
};

type WordSeed = {
  id: string;
  rank: number;
  bookId: string;
  word: string;
  wordId: string;
  usphone?: string;
  ukphone?: string;
  chinese: string;
  englishDefinition?: string;
  sentences?: Array<{ sContent: string; sCn: string }>;
  phrase?: DictionaryBody['phrase'];
  remMethod?: DictionaryBody['remMethod'];
  syno?: DictionaryBody['syno'];
  relWord?: DictionaryBody['relWord'];
};

function makeWord(seed: WordSeed): MockWordRow {
  return {
    id: seed.id,
    wordRank: seed.rank,
    headWord: seed.word,
    bookId: seed.bookId,
    content: {
      word: {
        wordHead: seed.word,
        wordId: seed.wordId,
        content: {
          usphone: seed.usphone,
          ukphone: seed.ukphone,
          usspeech: `${seed.word}&type=2`,
          ukspeech: `${seed.word}&type=1`,
          trans: [
            {
              tranCn: seed.chinese,
              tranOther: seed.englishDefinition,
              descCn: '中释',
              descOther: '英释',
            },
          ],
          sentence: seed.sentences
            ? { desc: '例句', sentences: seed.sentences }
            : undefined,
          phrase: seed.phrase,
          remMethod: seed.remMethod,
          syno: seed.syno,
          relWord: seed.relWord,
        },
      },
    },
  };
}

export const mockBooks: MockBookRow[] = [
  {
    id: '573ab7b5-c386-4b0d-a903-1baf5f8845d1',
    title: '人教版小学英语（三年级上）',
    word_count: 4,
    cover_url: null,
    book_id: 'PEPXiaoXue3_1',
    tags: '小学,入门',
    created_at: '2026-08-20T08:00:00.000Z',
    updated_at: '2026-09-10T08:00:00.000Z',
  },
  {
    id: '8f8485f2-5ba7-4461-9abe-7283fb70bc88',
    title: '生活英语基础词汇',
    word_count: 3,
    cover_url: null,
    book_id: 'LifeEnglish_1',
    tags: '生活,基础',
    created_at: '2026-08-18T08:00:00.000Z',
    updated_at: '2026-09-08T08:00:00.000Z',
  },
  {
    id: '35874e2d-c44e-44fd-8ccb-c927db71aa91',
    title: '日常交流高频词',
    word_count: 3,
    cover_url: null,
    book_id: 'DailyTalk_1',
    tags: '口语,高频',
    created_at: '2026-08-12T08:00:00.000Z',
    updated_at: '2026-09-02T08:00:00.000Z',
  },
];

export const mockWords: MockWordRow[] = [
  makeWord({
    id: '1001',
    rank: 1,
    bookId: 'PEPXiaoXue3_1',
    word: 'ruler',
    wordId: 'PEPXiaoXue3_1_1',
    usphone: "'rulɚ",
    ukphone: "'ruːlə",
    chinese: '尺子',
    englishDefinition:
      'a long flat straight piece used for measuring things or drawing straight lines',
    sentences: [{ sContent: 'a 12-inch ruler', sCn: '一把 12 英寸的尺子' }],
    remMethod: {
      desc: '记忆',
      val: '没有规矩（rule），不成方圆；尺子（ruler）可以用来规划图形。',
    },
    syno: {
      desc: '同近',
      synos: [
        {
          pos: 'n.',
          tran: '尺；统治者',
          hwds: [{ w: 'governor' }, { w: 'dominator' }],
        },
      ],
    },
    relWord: {
      desc: '同根',
      rels: [
        {
          pos: 'n.',
          words: [
            { hwd: 'rule', tran: '规则；统治' },
            { hwd: 'ruling', tran: '统治；裁定' },
          ],
        },
      ],
    },
  }),
  makeWord({
    id: '1002',
    rank: 2,
    bookId: 'PEPXiaoXue3_1',
    word: 'pencil',
    wordId: 'PEPXiaoXue3_1_2',
    usphone: "'pɛnsl",
    ukphone: "'pens(ə)l; -sɪl",
    chinese: '铅笔',
    englishDefinition:
      'an instrument used for writing or drawing, with a thin graphite centre',
    sentences: [
      { sContent: 'a sharp pencil', sCn: '尖尖的铅笔' },
      { sContent: 'a blue pencil', sCn: '蓝色铅笔' },
      { sContent: 'a pencil sketch', sCn: '铅笔速写' },
    ],
    phrase: {
      desc: '短语',
      phrases: [
        { pContent: 'pencil case', pCn: '文具盒' },
        { pContent: 'pencil box', pCn: '铅笔盒' },
        { pContent: 'pencil sharpener', pCn: '卷笔刀' },
        { pContent: 'mechanical pencil', pCn: '自动铅笔' },
        { pContent: 'pencil sketch', pCn: '素描' },
      ],
    },
    relWord: {
      desc: '同根',
      rels: [
        {
          pos: 'adj.',
          words: [
            { hwd: 'penciled', tran: '用铅笔写的；光线锥的' },
            { hwd: 'pencilled', tran: '用铅笔写的' },
          ],
        },
      ],
    },
  }),
  makeWord({
    id: '1003',
    rank: 3,
    bookId: 'PEPXiaoXue3_1',
    word: 'eraser',
    wordId: 'PEPXiaoXue3_1_3',
    usphone: "ɪ'resɚ",
    ukphone: "ɪ'reɪzə",
    chinese: '橡皮',
    englishDefinition: 'a small object used for removing pencil marks',
    sentences: [
      { sContent: 'Can I use your eraser?', sCn: '我可以用一下你的橡皮吗？' },
    ],
    phrase: {
      desc: '短语',
      phrases: [{ pContent: 'pencil eraser', pCn: '铅笔擦' }],
    },
  }),
  makeWord({
    id: '1004',
    rank: 4,
    bookId: 'PEPXiaoXue3_1',
    word: 'school',
    wordId: 'PEPXiaoXue3_1_4',
    usphone: 'skul',
    ukphone: 'skuːl',
    chinese: '学校',
    englishDefinition: 'a place where children go to be taught',
    sentences: [{ sContent: 'I go to school every day.', sCn: '我每天去上学。' }],
    phrase: {
      desc: '短语',
      phrases: [
        { pContent: 'primary school', pCn: '小学' },
        { pContent: 'after school', pCn: '放学后' },
      ],
    },
  }),
  makeWord({
    id: '2001',
    rank: 1,
    bookId: 'LifeEnglish_1',
    word: 'apple',
    wordId: 'LifeEnglish_1_1',
    usphone: "'æpl",
    ukphone: "'æp(ə)l",
    chinese: '苹果',
    englishDefinition: 'a round fruit with red or green skin',
    sentences: [{ sContent: 'She ate a red apple.', sCn: '她吃了一个红苹果。' }],
  }),
  makeWord({
    id: '2002',
    rank: 2,
    bookId: 'LifeEnglish_1',
    word: 'banana',
    wordId: 'LifeEnglish_1_2',
    usphone: "bə'nænə",
    ukphone: "bə'nɑːnə",
    chinese: '香蕉',
    englishDefinition: 'a long curved fruit with yellow skin',
    sentences: [{ sContent: 'This banana is sweet.', sCn: '这根香蕉很甜。' }],
  }),
  makeWord({
    id: '2003',
    rank: 3,
    bookId: 'LifeEnglish_1',
    word: 'orange',
    wordId: 'LifeEnglish_1_3',
    usphone: "'ɔrɪndʒ",
    ukphone: "'ɒrɪn(d)ʒ",
    chinese: '橙子；橙色',
    englishDefinition: 'a round citrus fruit with a bright orange skin',
    sentences: [{ sContent: 'Would you like an orange?', sCn: '你想要一个橙子吗？' }],
  }),
  makeWord({
    id: '3001',
    rank: 1,
    bookId: 'DailyTalk_1',
    word: 'hello',
    wordId: 'DailyTalk_1_1',
    usphone: "hə'lo",
    ukphone: "hə'ləʊ",
    chinese: '你好；喂',
    englishDefinition: 'used as a greeting when meeting someone',
    sentences: [{ sContent: 'Hello, nice to meet you.', sCn: '你好，很高兴认识你。' }],
  }),
  makeWord({
    id: '3002',
    rank: 2,
    bookId: 'DailyTalk_1',
    word: 'friend',
    wordId: 'DailyTalk_1_2',
    usphone: 'frɛnd',
    ukphone: 'frend',
    chinese: '朋友',
    englishDefinition: 'a person you know well and like',
    sentences: [{ sContent: 'She is my best friend.', sCn: '她是我最好的朋友。' }],
  }),
  makeWord({
    id: '3003',
    rank: 3,
    bookId: 'DailyTalk_1',
    word: 'family',
    wordId: 'DailyTalk_1_3',
    usphone: "'fæməli",
    ukphone: "'fæmɪlɪ",
    chinese: '家庭；家人',
    englishDefinition: 'a group of people who are related to each other',
    sentences: [{ sContent: 'My family is very important to me.', sCn: '家人对我很重要。' }],
  }),
];

export const mockProgress: MockProgressRow[] = [
  {
    id: '5001',
    user_id: 1,
    book_id: 'PEPXiaoXue3_1',
    last_word_row_id: '1001',
    last_word_rank: 1,
    learned_count: 1,
    total_words: 4,
    status: 'learning',
    version: 1,
    started_at: '2026-09-12T01:30:00.000Z',
    updated_at: '2026-09-13T02:20:00.000Z',
    completed_at: null,
  },
  {
    id: '5002',
    user_id: 1,
    book_id: 'LifeEnglish_1',
    last_word_row_id: '2003',
    last_word_rank: 3,
    learned_count: 3,
    total_words: 3,
    status: 'completed',
    version: 3,
    started_at: '2026-09-09T06:30:00.000Z',
    updated_at: '2026-09-11T08:40:00.000Z',
    completed_at: '2026-09-11T08:40:00.000Z',
  },
];

export function getMockBook(bookId: string) {
  return mockBooks.find((book) => book.book_id === bookId);
}

export function getMockWords(bookId: string) {
  return mockWords
    .filter((word) => word.bookId === bookId)
    .sort((left, right) => left.wordRank - right.wordRank);
}

export function getMockProgress(bookId: string) {
  return mockProgress.find((progress) => progress.book_id === bookId);
}

export function getMockRecentProgress() {
  return [...mockProgress]
    .filter((progress) => progress.status === 'learning')
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at))[0];
}

export function findMockWord(bookId: string, wordId: string) {
  return mockWords.find(
    (word) => word.bookId === bookId && word.content.word.wordId === wordId,
  );
}
