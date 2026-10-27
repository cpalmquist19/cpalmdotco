import Link from "next/link";
import type { ReactNode } from "react";
import type { Section as SectionData } from "@/site/projects";
import { ArrowLeft, ArrowRight } from "./icons";
import { ViewFocus } from "./view-focus";
import { ViewKeys } from "./view-keys";

// Building blocks for every page that fills the left column in place of the home page: a project's write-up,
// experience, skills. A page is <View> around <ViewHeader> and <ViewBody>, with the sections below inside the body.

type Crumb = { href: string; label: string };

/**
 * The panel itself, and its place in the shell's grid. On xl it takes the whole left column and the body scrolls inside
 * it, so the page keeps fitting the screen with the chat beside it; below that the page scrolls as a whole, with the
 * panel ahead of the chat. Views swap instantly, with no transition: the animation made switching feel sluggish.
 */
export function View({ labelledBy, children }: { labelledBy: string; children: ReactNode }) {
  return (
    <section
      aria-labelledby={labelledBy}
      data-view=""
      tabIndex={-1}
      className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0e1428]/85 ring-1 ring-inset ring-white/[0.03] backdrop-blur-xl focus:outline-none max-lg:order-1 lg:col-start-1 lg:row-span-2 lg:row-start-1 xl:min-h-0"
      style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px -8px rgba(59,130,246,0.25)" }}
    >
      <ViewFocus />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

const PILL =
  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-[#b6c2d8] transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400";

/**
 * Top bar: a way back to where the visitor came from, and optionally the previous and next sibling. It also wires up
 * the keyboard for the same moves (Escape, and [ and ] or the left and right arrows). The three keys are labelled together beside the way back.
 */
export function ViewHeader({ back, prev, next, position }: { back: Crumb; prev?: Crumb; next?: Crumb; position?: string }) {
  // Lit like a keyword in an editor theme: violet text and border with a soft glow that brightens when the pill is hovered
  const kbdBase = "hidden rounded-md border px-1.5 font-mono text-[11px] font-medium leading-4 xl:inline";
  const kbd = `${kbdBase} border-[#c084fc]/50 bg-[#a855f7]/15 text-[#e0b8ff] shadow-[0_0_10px_rgba(192,132,252,0.4),inset_0_0_6px_rgba(192,132,252,0.18)] [text-shadow:0_0_8px_rgba(217,170,255,0.7)] transition-[box-shadow,border-color] duration-150 group-hover:border-[#e879f9]/80 group-hover:shadow-[0_0_16px_rgba(232,121,249,0.6),inset_0_0_8px_rgba(232,121,249,0.25)]`;
  // A bracket with nothing to step to (the first or last page) goes dark, because its key does nothing
  const kbdOff = `${kbdBase} border-white/10 text-slate-600`;

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5 sm:px-5">
      <ViewKeys back={back.href} prev={prev?.href} next={next?.href} />
      <div className="flex items-center gap-4">
        <Link href={back.href} className={`group ${PILL}`}>
          <ArrowLeft className="size-4" />
          {back.label}
          <kbd className={kbd}>Esc</kbd>
        </Link>
        {/* Both brackets whenever the page has siblings; the one with nowhere to go is dimmed */}
        {(prev || next) && (
          <span aria-hidden="true" className="flex items-center gap-1.5">
            <kbd className={prev ? kbd : kbdOff}>[</kbd>
            <kbd className={next ? kbd : kbdOff}>]</kbd>
          </span>
        )}
      </div>
      {(prev || next) && (
        <div className="flex items-center gap-1">
          {position && <span className="mr-1 font-mono text-xs text-slate-500">{position}</span>}
          {prev && (
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

/**
 * Chip colors borrowed from an editor's syntax theme (keyword, function, string, number, type, variable). Each is a
 * lit pill: tinted border and fill, bright text, and a soft glow that strengthens on hover. Written out in full so
 * Tailwind can see every class.
 */
const TONES = {
  purple:
    "border-[#c678dd]/40 bg-[#c678dd]/10 text-[#e2b6f0] shadow-[0_0_10px_rgba(198,120,221,0.22)] [text-shadow:0_0_8px_rgba(198,120,221,0.55)] hover:border-[#c678dd]/80 hover:shadow-[0_0_16px_rgba(198,120,221,0.5)]",
  blue: "border-[#61afef]/40 bg-[#61afef]/10 text-[#a9d3fa] shadow-[0_0_10px_rgba(97,175,239,0.22)] [text-shadow:0_0_8px_rgba(97,175,239,0.55)] hover:border-[#61afef]/80 hover:shadow-[0_0_16px_rgba(97,175,239,0.5)]",
  green:
    "border-[#98c379]/40 bg-[#98c379]/10 text-[#c5e3ae] shadow-[0_0_10px_rgba(152,195,121,0.22)] [text-shadow:0_0_8px_rgba(152,195,121,0.55)] hover:border-[#98c379]/80 hover:shadow-[0_0_16px_rgba(152,195,121,0.5)]",
  orange:
    "border-[#d19a66]/40 bg-[#d19a66]/10 text-[#ecc59c] shadow-[0_0_10px_rgba(209,154,102,0.22)] [text-shadow:0_0_8px_rgba(209,154,102,0.55)] hover:border-[#d19a66]/80 hover:shadow-[0_0_16px_rgba(209,154,102,0.5)]",
  cyan: "border-[#56b6c2]/40 bg-[#56b6c2]/10 text-[#9adbe4] shadow-[0_0_10px_rgba(86,182,194,0.22)] [text-shadow:0_0_8px_rgba(86,182,194,0.55)] hover:border-[#56b6c2]/80 hover:shadow-[0_0_16px_rgba(86,182,194,0.5)]",
  pink: "border-[#e06c9f]/40 bg-[#e06c9f]/10 text-[#f4a9c8] shadow-[0_0_10px_rgba(224,108,159,0.22)] [text-shadow:0_0_8px_rgba(224,108,159,0.55)] hover:border-[#e06c9f]/80 hover:shadow-[0_0_16px_rgba(224,108,159,0.5)]",
} as const;

export type Tone = keyof typeof TONES;
export const TONE_NAMES = Object.keys(TONES) as Tone[];

/** Small pills. "tag" is the mono, uppercase label used on projects; "chip" is a lit, editor-style pill for names such as skills */
export function TagList({ tags, variant = "tag", tone = "blue" }: { tags: string[]; variant?: "tag" | "chip"; tone?: Tone }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li
          key={tag}
          className={
            variant === "tag"
              ? "rounded-full border border-blue-400/25 bg-blue-500/10 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-[#9cc3ff]"
              : `rounded-md border px-2.5 py-1 font-mono text-[13px] transition-[border-color,box-shadow] duration-150 ${TONES[tone]}`
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
