"use client";

import { useEffect } from "react";

/**
 * Moves focus onto the `View` when it appears. BEAM-E's text box takes the cursor on desktop and keeps it, and the
 * view's keys (see `ViewKeys`) ignore anything typed into a text box, so without this a [ or ] pressed right after
 * opening a view would land in the chat. Renders nothing; the view marks itself with `data-view`.
 */
export function ViewFocus() {
  useEffect(() => {
    document.querySelector<HTMLElement>("[data-view]")?.focus({ preventScroll: true });
  }, []);

  return null;
}
