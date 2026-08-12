import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import { headers } from "next/headers";
import { AlertsProvider } from "./alerts/AlertsProvider";
import "./globals.css";

const atkinsonSans = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson-sans",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

type RootLayoutElement = "body";

const ROOT_LAYOUT_CLASS_NAMES = {
  body:
    "min-h-screen min-w-0 scheme-dark bg-canvas bg-fixed font-sans text-ink antialiased selection:bg-gold/30 selection:text-ink",
} as const satisfies Record<RootLayoutElement, string>;

const description =
  "Plan builds, publish guides, and discover community knowledge for the games you love.";

function requestOrigin(requestHeaders: Awaited<ReturnType<typeof headers>>): URL {
  const host =
    requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    requestHeaders.get("host") ||
    "localhost:3000";
  const forwardedProtocol = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|$)/.test(host)
        ? "http"
        : "https";
  return new URL(`${protocol}://${host}`);
}

export async function generateMetadata(): Promise<Metadata> {
  const image = {
    url: "/social/cards/nightfold-brand-v1.png",
    width: 1200,
    height: 630,
    alt: "Nightfold — builds, guides, and community knowledge for the games you love",
  };

  return {
    metadataBase: requestOrigin(await headers()),
    title: "Nightfold",
    description,
    icons: {
      icon: "/brand/nightfold-favicon.png",
      shortcut: "/brand/nightfold-favicon.png",
    },
    openGraph: {
      type: "website",
      siteName: "Nightfold",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      images: [image],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={atkinsonSans.variable}>
      <body className={ROOT_LAYOUT_CLASS_NAMES.body}>
        <AlertsProvider>{children}</AlertsProvider>
      </body>
    </html>
  );
}
