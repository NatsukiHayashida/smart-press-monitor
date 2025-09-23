import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { extendedJaJP } from "@/locales/extended_ja_jp";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "プレス機械管理システム",
  description: "プレス機械とメンテナンス記録の統合管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={extendedJaJP}>
      <html lang="ja">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <AuthProvider>
            {children}
            <Toaster
              richColors
              position="bottom-right"
              toastOptions={{
                style: {
                  fontFamily: 'sans-serif'
                }
              }}
            />
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
