import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReqDocs AI - 자동 문서 생성',
  description: '텍스트 입력으로 PRD와 기능 목록을 자동 생성',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
