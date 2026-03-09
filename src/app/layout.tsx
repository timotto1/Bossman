import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";

import "./globals.css";

import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";
import { fontInter, fontPoppins } from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon-16x16.png",
    apple: "/favicon/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontPoppins.className} ${fontInter.variable} antialiased flex min-h-screen w-full flex-col`}
      >
        <NextTopLoader
          color="#7f47ff"
          height={4}
          speed={400}
          showSpinner={false}
        />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
