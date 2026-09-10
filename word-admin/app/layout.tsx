import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "WordFlow 管理后台",
    template: "%s · WordFlow",
  },
  description: "清晰、高效的单词内容管理平台",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
