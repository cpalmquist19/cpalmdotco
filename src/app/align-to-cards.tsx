"use client";

import { useEffect, useRef, type ReactNode } from "react";

// On wide screens the cards are sized by their images, so the row can be narrower than the column.
// This trims the header to the right edge of the last card so the link lines up with it.
// It finds the cards by the data-card-list attribute that ProjectGrid puts on its list, anywhere in the parent.

export function AlignToCards({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const list = el?.parentElement?.querySelector("[data-card-list]");
    if (!el || !list) return;

    const fit = () => {
      const last = list.lastElementChild;
      if (!last) return;
      el.style.maxWidth = "";
      const width = last.getBoundingClientRect().right - el.getBoundingClientRect().left;
      // Never trim below what the header needs, or a lone narrow card would clip the link
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const needed = [...el.children].reduce((sum, child) => sum + child.getBoundingClientRect().width, 0) + gap;
      if (width > 0) el.style.maxWidth = `${Math.max(width, needed)}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(list);
    for (const item of list.children) observer.observe(item);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
