import type { Metadata } from "next";
import { BooksPage } from "@/components/dashboard/books-page";

export const metadata: Metadata = { title: "单词书管理" };

export default function Page() {
  return <BooksPage />;
}

