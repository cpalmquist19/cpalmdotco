import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { LINKEDIN_URL } from "@/site/config";
import { ChatPanel } from "../chat/chat-panel";
import { SiteNav } from "../site-nav";

export const metadata: Metadata = {
  title: { default: "Portfolio | Caleb Palmquist", template: "%s | Caleb Palmquist" },
};

/**
 * The shell every page of the site shares: background, header with the nav, and BEAM-E. Only the left column changes
 * from route to route (the home page's hero and projects, a project's write-up, experience, skills), so navigating
 * never remounts the chat and a conversation survives it.
 *
 * Pages supply grid items for `main`. On xl the grid is one screen tall: the left column is a hero row over a flexible
 * row, with the chat spanning both; a page with a single `View` takes both rows.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-[#070b1a] font-sans text-white xl:flex xl:h-dvh xl:min-h-[600px] xl:flex-col">
      {/* Full-bleed mountain background, with a soft scrim so the copy on the left and the nav stay readable */}
      <div
        aria-hidden="true"
        style={{ backgroundImage: `url(${asset("/distance.jpg")})` }}
        className="absolute inset-0 -z-10 bg-cover bg-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,11,26,0.7)_0%,rgba(7,11,26,0.25)_55%,rgba(7,11,26,0.4)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-44 bg-gradient-to-b from-[#070b1a]/70 to-transparent"
      />

      <header className="relative z-20 mx-auto flex w-full max-w-[1480px] shrink-0 items-center justify-between gap-6 px-6 py-5 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="flex items-center gap-3 whitespace-nowrap rounded-full text-lg font-semibold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
        >
          <span className="size-10 shrink-0 overflow-hidden rounded-full bg-slate-700 ring-2 ring-white/15">
            <Image
              src={asset("/caleb_headshot.jpg")}
              alt=""
              width={80}
              height={80}
              className="size-full origin-[50%_30%] scale-[1.35] object-cover"
            />
          </span>
          Caleb Palmquist
        </Link>

        <SiteNav variant="bar" />

        {/* The full nav is hidden below md, where it drops to a row under the header, so keep the main call to action reachable */}
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-[#f5a25d] px-4 py-2 text-sm font-semibold text-[#1a0f05] transition-colors hover:bg-[#f8b67d] md:hidden"
        >
          Contact
        </a>
      </header>

      <div className="relative z-20 mx-auto w-full max-w-[1480px] shrink-0 md:hidden">
        <SiteNav variant="row" />
      </div>

      <main className="mx-auto grid w-full max-w-[1480px] gap-12 px-6 pb-16 pt-6 sm:px-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-16 lg:pt-10 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_480px] xl:grid-rows-[auto_minmax(0,1fr)] xl:gap-x-14 xl:gap-y-[clamp(1rem,3dvh,2rem)] xl:pb-[clamp(1rem,3dvh,2rem)] xl:pt-0">
        {children}

        {/* Assistant: beside the page's content on wide screens, below it on small ones (order 2, between the hero and projects on the home page) */}
        <div className="max-lg:order-2 lg:col-start-2 lg:row-start-1 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:min-h-0">
          <div className="xl:h-full">
            <ChatPanel className="xl:h-full" />
          </div>
        </div>
      </main>
    </div>
  );
}
