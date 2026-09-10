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

export type AdminRole = "超级管理员" | "管理员" | "内容管理员";
export type AdminStatus = "active" | "disabled";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: AdminRole;
  status: AdminStatus;
  lastLogin: string;
  createdAt: string;
  color: string;
};

export const DEFAULT_BOOKS: WordBook[] = [
  { id: "book-001", name: "雅思核心词汇", description: "覆盖雅思听说读写高频核心词汇", category: "雅思", wordCount: 1286, status: "published", updatedAt: "2026-09-08", color: "#6677f8" },
  { id: "book-002", name: "考研英语大纲词汇", description: "考研英语一、英语二大纲重点词汇", category: "考研", wordCount: 3520, status: "published", updatedAt: "2026-09-06", color: "#2bb4a4" },
  { id: "book-003", name: "商务英语高频词", description: "职场沟通与商务场景实用词汇", category: "商务", wordCount: 860, status: "draft", updatedAt: "2026-09-05", color: "#f59b45" },
  { id: "book-004", name: "大学英语四级必备", description: "四级考试核心词汇与常用短语", category: "四六级", wordCount: 2180, status: "published", updatedAt: "2026-08-29", color: "#8e6de8" },
  { id: "book-005", name: "日常口语 1000 词", description: "覆盖旅行、社交与生活场景的基础表达", category: "日常", wordCount: 1000, status: "archived", updatedAt: "2026-08-21", color: "#ec6f7e" },
];

export const DEFAULT_ADMINS: AdminUser[] = [
  { id: "admin-001", name: "林墨", email: "admin@wordflow.cn", password: "admin123", role: "超级管理员", status: "active", lastLogin: "今天 09:42", createdAt: "2026-01-12", color: "#6476f3" },
  { id: "admin-002", name: "陈昕", email: "chenxin@wordflow.cn", password: "admin123", role: "管理员", status: "active", lastLogin: "昨天 18:26", createdAt: "2026-03-18", color: "#27ad9e" },
  { id: "admin-003", name: "许安然", email: "anran@wordflow.cn", password: "admin123", role: "内容管理员", status: "active", lastLogin: "9月6日 14:08", createdAt: "2026-05-02", color: "#ed8f42" },
  { id: "admin-004", name: "周嘉禾", email: "jiahe@wordflow.cn", password: "admin123", role: "内容管理员", status: "disabled", lastLogin: "8月22日 10:17", createdAt: "2026-06-11", color: "#8c68dc" },
  { id: "admin-005", name: "蒋知遥", email: "zhiyao@wordflow.cn", password: "admin123", role: "管理员", status: "active", lastLogin: "9月5日 16:33", createdAt: "2026-07-21", color: "#e6687b" },
];

export const BOOK_COLORS = ["#6677f8", "#2bb4a4", "#f59b45", "#8e6de8", "#ec6f7e", "#3e9bd8"];
export const AVATAR_COLORS = ["#6476f3", "#27ad9e", "#ed8f42", "#8c68dc", "#e6687b", "#3e9bd8"];

