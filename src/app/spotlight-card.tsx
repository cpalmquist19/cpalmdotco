"use client";

import type { PointerEvent, ReactNode } from "react";

/**
 * Card wrapper for the featured projects. On hover, a soft blue light follows the pointer,
 * the same glow the chat pane uses. The light sits above the image and below the card link,
 * and pointer-events-none keeps it from blocking clicks.
 */
export function SpotlightCard({
  className,
  children,
  spotlightRadius = 360,
}: {
  className: string;
  children: ReactNode;
  // Radius of the pointer light in px
  spotlightRadius?: number;
}) {
  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <article className={`group ${className}`} onPointerMove={handlePointerMove}>
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            `radial-gradient(${spotlightRadius}px circle at var(--spot-x, 50%) var(--spot-y, 0%), rgba(96,165,250,0.22), rgba(59,130,246,0.06) 45%, transparent 70%)`,
        }}
      />
    </article>
  );
}
