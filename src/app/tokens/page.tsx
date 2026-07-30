import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * Development-only specimen sheet. Exists to satisfy the Phase 2 acceptance
 * criteria — that Fraunces renders with the right variation axes, that every
 * colour token resolves through Tailwind, and that the focus ring is visible —
 * by making all three checkable in a browser rather than asserted in a commit
 * message.
 *
 * Deleted in Phase 10. Until then it 404s in production so it can never be
 * reached from the deployed site, and carries noindex in case it ever is.
 */

export const metadata: Metadata = {
  title: "Tokens",
  robots: { index: false, follow: false },
};

// Every token from DESIGN_BRIEF.md. The Tailwind class is written as a literal
// because the v4 compiler scans source text for class names — a template string
// would produce no CSS.
const colorTokens = [
  { name: "paper", hex: "#F2F3F4", swatch: "bg-paper", use: "Page background" },
  { name: "paper-raised", hex: "#FBFBFC", swatch: "bg-paper-raised", use: "Raised surfaces" },
  { name: "ink", hex: "#101319", swatch: "bg-ink", use: "Primary text" },
  { name: "ink-soft", hex: "#3B414C", swatch: "bg-ink-soft", use: "Secondary text" },
  { name: "muted", hex: "#676D79", swatch: "bg-muted", use: "Metadata, captions" },
  { name: "rule", hex: "#DCDEE2", swatch: "bg-rule", use: "Hairlines" },
  { name: "rule-strong", hex: "#C3C7CD", swatch: "bg-rule-strong", use: "Emphasised dividers" },
  { name: "marine", hex: "#243FA8", swatch: "bg-marine", use: "Links, focus, metric ticks" },
  { name: "marine-soft", hex: "#E6E9F6", swatch: "bg-marine-soft", use: "Rare accent tint" },
];

const PAPER = "#F2F3F4";

// WCAG 2.1 relative luminance and contrast ratio. Inlined here rather than put
// in src/lib because it is scaffolding for this page and leaves with it.
function relativeLuminance(hex: string): number {
  const value = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

export default function TokensPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="shell py-16">
      <h1 className="eyebrow">Token specimen — development only</h1>

      <section aria-labelledby="type" className="mt-12">
        <h2 id="type" className="type-display text-section">
          Type scale
        </h2>

        <div className="mt-8 space-y-8">
          <div>
            <p className="eyebrow">Hero · Fraunces · clamp(3rem, 4.5rem) · opsz 48</p>
            <p className="type-display text-hero mt-2">Handgloves 0123</p>
          </div>

          <div>
            <p className="eyebrow">Section · Fraunces · 1.75rem · opsz 48</p>
            <p className="type-display text-section mt-2">
              Handgloves &amp; hairlines, 93.75%
            </p>
          </div>

          <div>
            <p className="eyebrow">
              Heading · Fraunces · 1.5rem · opsz 16 — compare the thins against the line
              above
            </p>
            <p className="type-display-sm mt-2 text-[1.5rem]">
              Legislative monitoring for animal advocacy
            </p>
          </div>

          <div>
            <p className="eyebrow">Body · IBM Plex Sans · 1rem / 1.65</p>
            <p className="mt-2 max-w-[52ch]">
              Sphinx of black quartz, judge my vow. The quick brown fox jumps over the lazy
              dog, then measures how long it took and writes the number down.
            </p>
            <p className="mt-3 max-w-[52ch] font-medium">Weight 500, the same sentence.</p>
            <p className="mt-3 max-w-[52ch] font-semibold">Weight 600, the same sentence.</p>
          </div>

          <div>
            <p className="eyebrow">Data · IBM Plex Mono · metrics and eyebrows</p>
            <p className="mt-2 font-mono">
              100% · 60–80% · 3-level · 150+ · 1,284 views · p99 42ms
            </p>
          </div>

          <div>
            <p className="eyebrow">Eyebrow · mono · 0.6875rem · 0.14em tracking</p>
            <p className="eyebrow mt-2">Selected work</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="color" className="mt-16">
        <h2 id="color" className="type-display text-section">
          Colour
        </h2>
        <p className="mt-2 max-w-[52ch] text-sm text-ink-soft">
          Each swatch is split: the left half is painted by the Tailwind utility, the right
          half by an inline hex. If a token failed to resolve, the halves would not match.
          Ratios are against <span className="font-mono">paper {PAPER}</span>.
        </p>

        <ul className="mt-8 space-y-3">
          {colorTokens.map((token) => {
            const ratio = contrastRatio(token.hex, PAPER);
            return (
              <li key={token.name} className="flex items-center gap-4">
                <span className="flex h-10 w-20 shrink-0 border border-rule-strong">
                  <span className={`h-full w-1/2 ${token.swatch}`} />
                  <span className="h-full w-1/2" style={{ backgroundColor: token.hex }} />
                </span>
                <span className="font-mono text-sm">{token.name}</span>
                <span className="font-mono text-sm text-muted">{token.hex}</span>
                <span className="font-mono text-sm text-muted">
                  {ratio.toFixed(2)}:1
                </span>
                <span className="text-sm text-ink-soft">{token.use}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="focus" className="mt-16">
        <h2 id="focus" className="type-display text-section">
          Focus and motion
        </h2>
        <p className="mt-2 max-w-[52ch] text-sm text-ink-soft">
          Tab through these. Every one should show a 2px marine ring at 3px offset. Hovering
          the link should grow its underline from the left over 220ms.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-6">
          <a href="#focus" className="link-underline text-marine">
            A link with the growing underline
          </a>
          <button type="button" className="border border-rule-strong px-4 py-2 text-sm">
            A button
          </button>
          <label className="flex items-center gap-2 text-sm">
            An input
            <input
              type="text"
              className="border border-rule-strong bg-paper-raised px-2 py-1"
            />
          </label>
        </div>
      </section>
    </div>
  );
}
