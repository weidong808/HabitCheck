import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Literata } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
  APP_URL,
  SITE_BRAND_NAME,
  SITE_HOME_URL,
} from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  authors: [{ name: SITE_BRAND_NAME, url: SITE_HOME_URL }],
  robots: { index: true, follow: true },
  openGraph: {
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1210" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${literata.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <AppHeader />
          <div className="flex-1">{children}</div>
          <AppFooter />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
