/**
 * Plain mono text, not pills. A bordered chip around every technology would put
 * eleven small boxes on a page whose whole argument is hairlines and restraint,
 * and it would read as a logo grid without the logos.
 *
 * Case is preserved rather than uppercased: "FastAPI", "pgvector" and "Next.js"
 * carry information in their capitalisation that "FASTAPI" throws away.
 */
export function StackTags({
  items,
  limit,
  className = "",
}: {
  items: readonly string[];
  limit?: number;
  className?: string;
}) {
  const shown = limit ? items.slice(0, limit) : items;

  return (
    <ul
      className={`flex flex-wrap gap-x-3 gap-y-1 font-mono text-eyebrow text-muted ${className}`}
    >
      {shown.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
