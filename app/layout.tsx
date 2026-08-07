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
  "Plan, publish, and explore game builds with Nightfold.";

export const metadata: Metadata = {
  title: "Nightfold",
  description,
  icons: {
    icon: "/brand/nightfold-favicon.png",
    shortcut: "/brand/nightfold-favicon.png",
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
    <html lang="en" className={atkinsonSans.variable}>
      <head>
        <meta property="og:title" content="Nightfold" />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Nightfold build planning and publishing"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nightfold" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={socialImage} />
      </head>
      <body className={ROOT_LAYOUT_CLASS_NAMES.body}>
        <AlertsProvider>{children}</AlertsProvider>
      </body>
    </html>
  );
}
