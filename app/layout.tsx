import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Frame a Soulframe armor loadout, tune Courage, Spirit, and Grace, and compare verified defense scaling.";

export const metadata: Metadata = {
  title: "Soulframe Framer — Armor Build Builder",
  description,
  icons: {
    icon: "/icons/courage.png",
    shortcut: "/icons/courage.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|$)/.test(host)
      ? "http"
      : "https");
  const socialImage = `${protocol}://${host}/og.png`;

  return (
    <html lang="en">
      <head>
        <meta property="og:title" content="Soulframe Framer" />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Soulframe Framer armor build builder"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Soulframe Framer" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={socialImage} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
