import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { profile } from "@/content/profile";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

// Self-hosted at build time by next/font, so there is no request to Google at
// runtime and no layout shift from a late-arriving face.

// Variable font: the three axes are requested here so `font-variation-settings`
// in globals.css has something to set. Requesting `weight` alongside `axes`
// would pin it to a static instance and the axes would stop responding.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

// Plex Sans and Plex Mono are static faces on Google Fonts, so the weights are
// listed explicitly. Only the three the design uses are downloaded.
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

// Every canonical URL, sitemap entry, and Open Graph tag hangs off this. On
// Vercel the deployment URL is known without configuration, so the fallback
// chain avoids hardcoding a domain that may not be owned yet.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const description =
  "Backend and applied-AI engineer. Computer science at VIT-AP, AI engineer intern at Open Paws. FastAPI, Python, TypeScript, and a preference for systems that stay correct on a bad day.";

// Shorter for the card, where the first line is all most readers see.
const socialDescription =
  "Backend and applied-AI engineer. FastAPI, Python, TypeScript, and a preference for systems that stay correct on a bad day.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s — ${profile.name}`,
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: `${profile.name} — ${profile.role}`,
    description: socialDescription,
    url: siteUrl,
    siteName: profile.name,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>
        {/* First element in the body, so it is the first thing Tab reaches. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <SiteHeader />
        {/*
          tabIndex={-1} is what makes the skip link work. Safari and Firefox will
          not move focus to a landmark that cannot receive it, so without this the
          link scrolls the page and leaves focus back at the top of the header.
        */}
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
