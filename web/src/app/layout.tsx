import type { Metadata } from 'next';
import './globals.css';
import NextAuthSessionProvider from '@/components/providers/SessionProvider';

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
      <body>
        <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
      </body>
    </html>
  );
}
