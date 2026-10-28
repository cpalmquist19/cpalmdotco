import type { Metadata } from "next";
import Link from "next/link";
import { NAV } from "@/site/config";
import { View, ViewBody, ViewHeader } from "../view";

export const metadata: Metadata = { title: "Page not found" };

// The site's own pages, taken from the nav so a new one shows up here too
const LINKS = [{ label: "Home", href: "/" }, ...NAV.flatMap((item) => (item.kind === "route" ? [item] : []))];

/** Shown for an address that matches no page, and for a project that doesn't exist. It sits in the shell, so the nav and the chat still work */
export default function NotFound() {
  const titleId = "not-found-title";

  return (
    <View labelledBy={titleId}>
      <ViewHeader back={{ href: "/", label: "Home" }} />
      <ViewBody>
        <header className="flex max-w-3xl flex-col gap-3">
          <p className="font-mono text-sm text-[#9cc3ff]">404</p>
          <h1 id={titleId} className="text-3xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="text-base leading-relaxed text-slate-300">
            That address doesn&rsquo;t lead anywhere on this site. Try one of these, or ask BEAM-E what you were looking for.
          </p>
        </header>
        <nav aria-label="Pages" className="flex flex-wrap gap-2">
          {LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              {label}
            </Link>
          ))}
        </nav>
      </ViewBody>
    </View>
  );
}
