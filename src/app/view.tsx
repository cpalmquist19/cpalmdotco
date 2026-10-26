import Link from "next/link";
import type { ReactNode } from "react";
import type { Section as SectionData } from "@/site/projects";
import { ArrowLeft, ArrowRight } from "./icons";
import { ViewKeys } from "./view-keys";

// Building blocks for every page that fills the left column in place of the home page: a project's write-up,
// experience, skills. A page is <View> around <ViewHeader> and <ViewBody>, with the sections below inside the body.

type Crumb = { href: string; label: string };

/**
 * The panel itself, and its place in the shell's grid. On xl it takes the whole left column and the body scrolls inside
 * it, so the page keeps fitting the screen with the chat beside it; below that the page scrolls as a whole, with the
 * panel ahead of the chat. It slides in whenever it mounts, which is on every navigation between pages.
 */
export function View({ labelledBy, children }: { labelledBy: string; children: ReactNode }) {
  return (
    <section
      aria-labelledby={labelledBy}
      className="animate-view-in motion-reduce:animate-none flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0e1428]/85 ring-1 ring-inset ring-white/[0.03] backdrop-blur-xl max-lg:order-1 lg:col-start-1 lg:row-span-2 lg:row-start-1 xl:min-h-0"
      style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px -8px rgba(59,130,246,0.25)" }}
    >
      {children}
    </section>
  );
}

const PILL =
  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-[#b6c2d8] transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400";

/**
 * Top bar: a way back to where the visitor came from, and optionally the previous and next sibling. It also wires up
 * the keyboard for the same moves (Escape, left and right). Escape's key is labelled; the arrows are already drawn on the buttons.
 */
export function ViewHeader({ back, prev, next, position }: { back: Crumb; prev?: Crumb; next?: Crumb; position?: string }) {
  // With only two siblings, previous and next are the same page, so just offer next
  const showPrev = prev && prev.href !== next?.href;
  const kbd = "hidden rounded border border-white/15 px-1 font-mono text-[10px] leading-4 text-slate-400 xl:inline";

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5 sm:px-5">
      <ViewKeys back={back.href} prev={prev?.href} next={next?.href} />
      <Link href={back.href} className={PILL}>
        <ArrowLeft className="size-4" />
        {back.label}
        <kbd className={kbd}>Esc</kbd>
      </Link>
      {(prev || next) && (
        <div className="flex items-center gap-1">
          {position && <span className="mr-1 font-mono text-xs text-slate-500">{position}</span>}
          {showPrev && (
            <Link href={prev.href} aria-label={`Previous: ${prev.label}`} className={PILL}>
              <ArrowLeft className="size-4" />
              <span className="max-sm:hidden">{prev.label}</span>
            </Link>
          )}
          {next && (
            <Link href={next.href} aria-label={`Next: ${next.label}`} className={PILL}>
              <span className="max-sm:hidden">{next.label}</span>
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/** The reading area. Scrolls inside the panel on xl, and is part of the page's scroll below that. The thin scrollbar matches the chat's */
export function ViewBody({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-8 px-5 py-6 sm:px-8 sm:py-8 xl:min-h-0 xl:flex-1 xl:overflow-y-auto [scrollbar-color:rgba(79,134,240,0.45)_transparent] [scrollbar-width:thin]">
      {children}
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="flex max-w-3xl flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight text-white">{heading}</h2>
      {children}
    </section>
  );
}

export function Paragraphs({ items }: { items: string[] }) {
  return (
    <>
      {items.map((text) => (
        <p key={text} className="text-[15px] leading-relaxed text-slate-300">
          {text}
        </p>
      ))}
    </>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((text) => (
        <li
          key={text}
          className="relative pl-5 text-[15px] leading-relaxed text-slate-300 before:absolute before:left-0 before:top-[0.68em] before:size-1.5 before:rounded-full before:bg-blue-400/70"
        >
          {text}
        </li>
      ))}
    </ul>
  );
}

/** A write-up section as data: a heading over paragraphs and/or bullets */
export function ContentSection({ section }: { section: SectionData }) {
  return (
    <Section heading={section.heading}>
      {section.paragraphs && <Paragraphs items={section.paragraphs} />}
      {section.bullets && <Bullets items={section.bullets} />}
    </Section>
  );
}

/** Small pills. "tag" is the mono, uppercase label used on projects; "chip" is a plainer pill for names such as skills */
export function TagList({ tags, variant = "tag" }: { tags: string[]; variant?: "tag" | "chip" }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li
          key={tag}
          className={
            variant === "tag"
              ? "rounded-full border border-blue-400/25 bg-blue-500/10 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-[#9cc3ff]"
              : "rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-slate-200"
          }
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

/** A vertical timeline: a rule down the left with a dot at each entry */
export function Timeline({ children }: { children: ReactNode }) {
  return <ol className="flex flex-col gap-7 border-l border-white/10 pl-6">{children}</ol>;
}

export function TimelineItem({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  return (
    <li className="relative flex flex-col gap-2 before:absolute before:-left-[1.9rem] before:top-[0.45rem] before:size-2.5 before:rounded-full before:border-2 before:border-[#4f86f0] before:bg-[#0e1428]">
      <div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {meta && <p className="font-mono text-xs text-[#9fb0cc]">{meta}</p>}
      </div>
      {children}
    </li>
  );
}

/** A button-styled link that opens in a new tab, for a project's repository or any other outside destination */
export function ExternalButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/20 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:border-blue-400/70 hover:bg-blue-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
    >
      {children}
    </a>
  );
}
