'use client';

import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/auth/auth-provider"; 
import { ResizableLayout } from "@/components/ResizableLayout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <ResizableLayout>
            {children}
          </ResizableLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
