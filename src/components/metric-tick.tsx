/**
 * The signature element. Each piece of work is indexed by its own hardest number
 * rather than by `01 / 02 / 03`, because the projects are not a sequence and
 * numbering them would be decoration imitating structure. See DESIGN_BRIEF.md,
 * "Signature".
 *
 * The tick itself is the only place `marine` appears that is not interactive, and
 * it is `aria-hidden` because a two-pixel rule carries no information a reader
 * needs announced — the value and its label already say everything.
 */
export function MetricTick({ value, label }: { value: string; label: string }) {
  return (
    <div>
      {/* Slightly tighter than mono's natural tracking: "60–80%" and "3-level"
          are the widest values and this keeps them on one line in the column. */}
      <p className="font-mono text-[1.75rem] leading-none tracking-[-0.03em] text-ink">
        {value}
      </p>
      <span aria-hidden="true" className="mt-3 block h-0.5 w-10 bg-marine" />
      <p className="mt-3 font-mono text-eyebrow leading-snug text-muted">{label}</p>
    </div>
  );
}
