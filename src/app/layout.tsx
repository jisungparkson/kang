import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudentAI - 생기부 작성 자동화",
  description: "AI 기반 학교 생활기록부 작성 및 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
