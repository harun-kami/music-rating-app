import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MY DIGS. | Micro Archive",
  description: "Personal music archive and deep digging platform.",
  openGraph: {
    title: "MY DIGS. | Micro Archive",
    description: "Personal music archive and deep digging platform.",
    // ↓ ここに今の君のVercelのURL（https://〜.vercel.app）を入れてね
    url: "https://君のVercelのURL.vercel.app", 
    siteName: "MY DIGS.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MY DIGS. | Micro Archive",
    description: "Personal music archive and deep digging platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
