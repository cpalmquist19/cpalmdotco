"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type MouseEvent } from "react";
import { NAV, isActive } from "@/site/config";
import { ResumeMenu } from "./resume-menu";

const ITEM =
  "block rounded-full border transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400";
const IDLE = "border-transparent text-[#b6c2d8] hover:bg-[#9cc3ff]/10 hover:text-white";
const ACTIVE = "border-blue-400/40 bg-blue-500/20 text-white";
const CTA = "border-transparent bg-[#f5a25d] font-semibold text-[#1a0f05] hover:bg-[#f8b67d]";

/**
 * The primary nav, rendered from NAV. "bar" is the pill in the header from md up, with every item. "row" is the
 * same list as a full-width row under the header below md; it leaves out the external call to action, since the
 * header already shows that one as its own button there.
 */
export function SiteNav({ variant }: { variant: "bar" | "row" }) {
  const pathname = usePathname();
  const row = variant === "row";
  // The page a click is already on its way to, so spam-clicking a link doesn't start the same navigation again
  const pending = useRef<string | null>(null);

  useEffect(() => {
    pending.current = null;
  }, [pathname]);

  /** Ignore a click on the page that is already showing, or already loading. Links with a hash still scroll to their anchor */
  function skipRepeat(event: MouseEvent, href: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (href.includes("#")) return;
    if (href === pathname || href === pending.current) {
      event.preventDefault();
      return;
    }
    pending.current = href;
  }

  return (
    <nav
      aria-label="Primary"
      className={row ? "px-6 sm:px-10 md:hidden" : "hidden md:block md:w-full md:max-w-[480px]"}
    >
      <ul
        className={`flex w-full items-center justify-between gap-1 rounded-full border border-[#9cc3ff]/15 bg-[#0e1428]/50 p-1 shadow-lg shadow-black/20 backdrop-blur-xl ${
          row ? "text-[13px]" : "text-sm"
        }`}
      >
        {NAV.map((item) => {
          if (item.kind === "resume") {
            return <ResumeMenu key={item.label} align={row ? "end" : "center"} compact={row} />;
          }
          const padding = row ? "px-2.5 py-2" : "px-3 py-2 lg:px-4";
          if (item.kind === "external") {
            if (row) return null;
            return (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${ITEM} ${padding} ${item.cta ? CTA : IDLE}`}
                >
                  {item.label}
                </a>
              </li>
            );
          }
          const active = isActive(item.paths, pathname);
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={(event) => skipRepeat(event, item.href)}
                aria-current={active ? "page" : undefined}
                className={`${ITEM} ${padding} ${active ? ACTIVE : IDLE}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
