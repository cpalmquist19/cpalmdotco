"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

// How many menus are open right now. The page's keyboard shortcuts (Escape, [ and ], the arrows) stand aside while one is
// open, so that Escape closes the menu instead of also leaving the page
let openMenus = 0;

/** Whether any menu is open, for code that has keys of its own to avoid taking from it */
export const isMenuOpen = () => openMenus > 0;

/**
 * For a menu that is open: closes it when the visitor presses Escape or clicks anywhere outside `ref`, and tells
 * `isMenuOpen` it is there for as long as it is.
 */
export function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  // `close` is usually written inline, so it is a new function on every render. Reading it through an effect event
  // keeps the listeners from being removed and added again each time
  const onClose = useEffectEvent(close);

  useEffect(() => {
    if (!open) return;
    openMenus++;

    function handlePointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) onClose();
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      openMenus--;
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, open]);
}
