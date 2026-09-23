import './globals.css';

import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';

const title = '词流 · 英语单词学习';
const description = '选择一本单词书，用轻松的卡片开始每天的英语学习。';

export const metadata: Metadata = {
  title,
  description,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#24473f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${GeistSans.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
