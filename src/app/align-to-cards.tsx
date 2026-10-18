"use client";

import { useEffect, useRef, type ReactNode } from "react";

// On wide screens the cards are sized by their images, so the row can be narrower than the column.
// This trims the header to the right edge of the last card so the link lines up with it.
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
    const list = el?.parentElement?.querySelector("ul");
    if (!el || !list) return;

    const fit = () => {
      const last = list.lastElementChild;
      if (!last) return;
      el.style.maxWidth = "";
      const width = last.getBoundingClientRect().right - el.getBoundingClientRect().left;
      if (width > 0) el.style.maxWidth = `${width}px`;
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
