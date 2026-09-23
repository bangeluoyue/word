/**
 * 首页书籍卡片使用的可序列化模型。
 *
 * 仅包含书籍列表实际使用的公开字段，避免页面依赖数据库内部主键和时间字段。
 */
export type BookListItem = {
  title: string;
  word_count: number;
  cover_url: string | null;
  book_id: string;
  tags: string | null;
};
