// app/layout.tsx
export const metadata = {
  title: "양심우산 대여",
  description: "학교 양심우산 대여 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>{children}</body>
    </html>
  );
}
