import type { Metadata } from "next";
import { BooksPage } from "@/components/dashboard/books-page";
import { listBooks } from "@/lib/books/data";

export const metadata: Metadata = { title: "单词书管理" };

export default async function Page() {
  return <BooksPage initialBooks={await listBooks()} />;
}
