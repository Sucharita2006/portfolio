import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
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

// Phase 2 scaffold. The title, description, and Open Graph tags move onto
// `profile` in Phase 3 so no name or address is written twice.
export const metadata: Metadata = {
  title: "Sucharita Chattopadhyay",
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
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
