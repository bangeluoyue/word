export type BookStatus = "published" | "draft" | "archived";

export type WordBook = {
  id: string;
  name: string;
  description: string;
  category: string;
  wordCount: number;
  status: BookStatus;
  updatedAt: string;
  color: string;
};

export const DEFAULT_BOOKS: WordBook[] = [
  { id: "book-001", name: "雅思核心词汇", description: "覆盖雅思听说读写高频核心词汇", category: "雅思", wordCount: 1286, status: "published", updatedAt: "2026-09-08", color: "#6677f8" },
  { id: "book-002", name: "考研英语大纲词汇", description: "考研英语一、英语二大纲重点词汇", category: "考研", wordCount: 3520, status: "published", updatedAt: "2026-09-06", color: "#2bb4a4" },
  { id: "book-003", name: "商务英语高频词", description: "职场沟通与商务场景实用词汇", category: "商务", wordCount: 860, status: "draft", updatedAt: "2026-09-05", color: "#f59b45" },
  { id: "book-004", name: "大学英语四级必备", description: "四级考试核心词汇与常用短语", category: "四六级", wordCount: 2180, status: "published", updatedAt: "2026-08-29", color: "#8e6de8" },
  { id: "book-005", name: "日常口语 1000 词", description: "覆盖旅行、社交与生活场景的基础表达", category: "日常", wordCount: 1000, status: "archived", updatedAt: "2026-08-21", color: "#ec6f7e" },
];

export const BOOK_COLORS = ["#6677f8", "#2bb4a4", "#f59b45", "#8e6de8", "#ec6f7e", "#3e9bd8"];
