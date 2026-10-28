"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isMenuOpen } from "./use-dismiss";

/**
 * Keyboard shortcuts for a `View`: Escape goes back, and [ and ] (or the arrow keys) step to the previous and next sibling.
 * Renders nothing. Typing in the chat box, and an open menu closing on Escape, take priority over them.
 */
export function ViewKeys({ back, prev, next }: { back: string; prev?: string; next?: string }) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // A held key repeats, which would start the same navigation over and over
      if (event.repeat || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
        return;
      }
      // An open menu (the resume downloads, the model picker) gets Escape and the arrows first
      if (isMenuOpen()) return;

      const to =
        event.key === "Escape"
          ? back
          : event.key === "ArrowLeft" || event.key === "["
            ? prev
            : event.key === "ArrowRight" || event.key === "]"
              ? next
              : undefined;
      if (!to) return;
      event.preventDefault();
      router.push(to);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router, back, prev, next]);

  return null;
}
