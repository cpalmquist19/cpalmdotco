"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Keyboard shortcuts for a `View`: Escape goes back, and the arrow keys step to the previous and next sibling.
 * Renders nothing. Typing in the chat box, and an open menu closing on Escape, take priority over them.
 */
export function ViewKeys({ back, prev, next }: { back: string; prev?: string; next?: string }) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
        return;
      }
      // Any open menu (the resume downloads, the model picker) gets Escape and the arrows first
      if (document.querySelector('[aria-expanded="true"]')) return;

      const to = event.key === "Escape" ? back : event.key === "ArrowLeft" ? prev : event.key === "ArrowRight" ? next : undefined;
      if (!to) return;
      event.preventDefault();
      router.push(to);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router, back, prev, next]);

  return null;
}
