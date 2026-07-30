"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-triggered fade and rise. Deliberately the only entrance animation on
 * the site, and applied to section entrances only — never to individual list
 * items, which would turn a page of work into a staggered performance.
 *
 * Content renders unconditionally, so nothing depends on JavaScript to be
 * readable. `prefers-reduced-motion` and the `scripting: none` fallback are both
 * handled in globals.css rather than here, because a media query is a more
 * reliable place to be correct than a component that has to hydrate first.
 */
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${shown ? "reveal-in" : ""} ${className}`}>
      {children}
    </div>
  );
}
