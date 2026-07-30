/**
 * The signature element. Each piece of work is indexed by its own hardest number
 * rather than by `01 / 02 / 03`, because the projects are not a sequence and
 * numbering them would be decoration imitating structure. See DESIGN_BRIEF.md,
 * "Signature".
 *
 * The tick itself is the only place `marine` appears that is not interactive, and
 * it is `aria-hidden` because a one-pixel rule carries no information a reader
 * needs announced — the value and its label already say everything.
 */
export function MetricTick({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-mono text-2xl leading-none text-ink">{value}</p>
      <span aria-hidden="true" className="mt-3 block h-px w-8 bg-marine" />
      <p className="mt-3 font-mono text-eyebrow leading-tight text-muted">{label}</p>
    </div>
  );
}
