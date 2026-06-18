import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

const notoSans = localFont({
  src: "../../public/fonts/NotoSans-Regular.ttf",
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Temple family records",
    template: "%s · Temple family records",
  },
  description: "Internal admin app for temple devotee and family records.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${notoSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 font-sans text-zinc-900">{children}</body>
    </html>
  );
}
