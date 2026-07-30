/**
 * The eyebrow label that opens each section. It is an `h2` rather than a `p`,
 * because it is the section's heading in every sense except its size — making it
 * a paragraph would leave the page with an `h1` and then a jump to `h3`, and a
 * screen reader's heading list would show the page as one undivided block.
 */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="eyebrow">{children}</h2>;
}

/**
 * The same treatment where the text is a label rather than a heading — a work
 * row's metadata line, a metric's caption. Kept separate so the styling can be
 * shared without every use of it claiming a place in the document outline.
 */
export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}
