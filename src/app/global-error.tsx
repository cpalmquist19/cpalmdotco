"use client";

import "./globals.css";

/** The last resort, for a failure in the root layout itself. It replaces the whole page, so it brings its own html and body */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#070b1a] px-6 text-center text-white">
        <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="max-w-md text-slate-300">The site hit a problem while loading. Trying again often fixes it.</p>
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-[#f5a25d] px-4 py-2 text-sm font-semibold text-[#1a0f05] transition-colors hover:bg-[#f8b67d]"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
