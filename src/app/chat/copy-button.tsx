"use client";

import { useEffect, useRef, useState } from "react";
import { copyText } from "./copy-text";

/** Small icon button under a message that copies its text. The icon turns into a check for a moment once copied, or red if the browser refused */
export function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const copied = status === "copied";
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  async function copy() {
    setStatus((await copyText(text)) ? "copied" : "failed");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : status === "failed" ? "Couldn't copy" : "Copy message"}
      title={copied ? "Copied" : status === "failed" ? "Couldn't copy" : "Copy message"}
      className={`flex size-7 items-center justify-center rounded-lg transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${
        copied
          ? "text-emerald-400"
          : status === "failed"
            ? "text-red-300"
            : "text-slate-500 hover:bg-white/[0.08] hover:text-slate-200"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden="true"
      >
        {copied ? (
          <path d="M20 6 9 17l-5-5" />
        ) : (
          <>
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </>
        )}
      </svg>
    </button>
  );
}
