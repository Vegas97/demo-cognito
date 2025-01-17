import type { Metadata } from "next";
import { ResizableLayout } from "@/components/ResizableLayout";
import { SessionProvider } from "@/components/SessionProvider";
import { NavBar } from "@/components/NavBar";
import "./globals.css";
import localFont from "next/font/local";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Demo Cognito",
  description: "Demo Cognito App",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SessionProvider>
          <div className="flex h-screen">
            <NavBar />
            <ResizableLayout>
              {children}
            </ResizableLayout>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
