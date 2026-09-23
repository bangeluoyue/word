export type Translation = {
  tranCn?: string;
  tranOther?: string;
  descCn?: string;
  descOther?: string;
};

export type DictionaryBody = {
  usphone?: string;
  ukphone?: string;
  usspeech?: string;
  ukspeech?: string;
  trans?: Translation[];
  sentence?: {
    desc?: string;
    sentences?: Array<{ sContent?: string; sCn?: string }>;
  };
  phrase?: {
    desc?: string;
    phrases?: Array<{ pContent?: string; pCn?: string }>;
  };
  remMethod?: { desc?: string; val?: string };
  syno?: {
    desc?: string;
    synos?: Array<{
      pos?: string;
      tran?: string;
      hwds?: Array<{ w?: string }>;
    }>;
  };
  relWord?: {
    desc?: string;
    rels?: Array<{
      pos?: string;
      words?: Array<{ hwd?: string; tran?: string }>;
    }>;
  };
};

/** 不依赖任何单词书、可用于搜索和全局详情的公共词条。 */
export type GlobalWordViewModel = {
  id: string;
  headWord: string;
  content: {
    word: {
      wordHead: string;
      wordId: string;
      content: DictionaryBody;
    };
  };
};

/** 附带当前单词书顺序、用于线性学习的词条。 */
export type LearningWordViewModel = GlobalWordViewModel & {
  bookId: string;
  wordRank: number;
};

export type WordSummary = {
  id: string;
  headWord: string;
  translation: string | null;
};
