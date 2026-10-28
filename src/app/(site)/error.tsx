"use client";

import Link from "next/link";
import { useEffect } from "react";
import { View, ViewBody, ViewHeader } from "../view";

/** Shown when a page fails while it renders. The shell above it is untouched, so the nav works and the conversation in the chat is kept */
export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const titleId = "error-title";

  return (
    <View labelledBy={titleId}>
      <ViewHeader back={{ href: "/", label: "Home" }} />
      <ViewBody>
        <header className="flex max-w-3xl flex-col gap-3">
          <h1 id={titleId} className="text-3xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-base leading-relaxed text-slate-300">
            This page hit a problem while loading. Trying again often fixes it.
          </p>
        </header>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-full bg-[#f5a25d] px-4 py-2 text-sm font-semibold text-[#1a0f05] transition-colors hover:bg-[#f8b67d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
          >
            Back to the home page
          </Link>
        </div>
      </ViewBody>
    </View>
  );
}
