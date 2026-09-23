import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { currentUser } from "@/lib/auth";
import { APP_NAME, ORG_NAME } from "@/lib/masters";

export const metadata: Metadata = {
  title: APP_NAME,
  description: `ระบบสารสนเทศเพื่อการจัดการผู้มีส่วนได้ส่วนเสียของ${ORG_NAME}`,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}
