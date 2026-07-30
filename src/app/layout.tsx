import type { Metadata } from "next";
import "./globals.css";

// Phase 1 scaffold. The fonts and the token-driven base styles land in Phase 2;
// the title, description, and Open Graph tags move onto `profile` in Phase 3 so
// no name or address is written twice.
export const metadata: Metadata = {
  title: "Sucharita Chattopadhyay",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
