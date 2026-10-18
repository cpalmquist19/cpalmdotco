import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { asset } from "@/lib/asset";
import quarkCard from "../../../public/quark_card.jpg";
import relayCard from "../../../public/relay_card_new.jpg";
import ticketRadarCard from "../../../public/ticket_radar_card.jpg";
import { ChatPanelV5 } from "./chat-panel-v5";

// Preview of the fit-to-viewport design; out of search results until it replaces the home page.
export const metadata: Metadata = {
  title: "Portfolio | Caleb Palmquist",
  robots: { index: false, follow: false },
};

const GITHUB_URL = "https://github.com/cpalmquist19";

const NAV_LINKS = ["Projects", "Experience", "Skills", "About"];

// On desktop the whole page is one screen. The design is 96 x 64 rem, so the root font size is the largest that fits
// both ways, and everything sized in rem scales with the window. Below the `desk` breakpoint the page scrolls as usual.
const FIT_CSS =
  "@media (min-width:1100px) and (min-height:640px){html{font-size:clamp(10px,min(calc(100vw / 96),calc(100dvh / 64)),40px)}body{overflow:hidden}}";

type IconPath = string | { circle: [number, number, number] } | { rect: [number, number, number, number, number] };

function Icon({ paths, className }: { paths: IconPath[]; className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths.map((p, i) =>
        typeof p === "string" ? (
          <path key={i} d={p} />
        ) : "circle" in p ? (
          <circle key={i} cx={p.circle[0]} cy={p.circle[1]} r={p.circle[2]} />
        ) : (
          <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} rx={p.rect[4]} />
        ),
      )}
    </svg>
  );
}

const ICONS = {
  brain: [
    "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",
    "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",
    "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4",
    "M17.599 6.5a3 3 0 0 0 .399-1.375",
    "M6.003 5.125A3 3 0 0 0 6.401 6.5",
    "M3.477 10.896a4 4 0 0 1 .585-.396",
    "M19.938 10.5a4 4 0 0 1 .585.396",
    "M6 18a4 4 0 0 1-1.967-.516",
    "M19.967 17.484A4 4 0 0 1 18 18",
  ],
  shield: [
    "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
    "m9 12 2 2 4-4",
  ],
  code: ["m18 16 4-4-4-4", "m6 8-4 4 4 4", "m14.5 4-5 16"],
  target: [{ circle: [12, 12, 10] }, { circle: [12, 12, 6] }, { circle: [12, 12, 2] }],
  package: [
    "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",
    "m3.3 7 8.7 5 8.7-5",
    "M12 22V12",
  ],
  checkCircle: ["M21.801 10A10 10 0 1 1 17 3.335", "m9 11 3 3L22 4"],
  layers: [
    "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",
    "m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",
    "m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",
  ],
  cpu: [
    { rect: [4, 4, 16, 16, 2] },
    { rect: [9, 9, 6, 6, 1] },
    "M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2",
  ],
  chart: ["M3 3v16a2 2 0 0 0 2 2h16", "M18 17V9", "M13 17V5", "M8 17v-3"],
  arrowRight: ["M5 12h14", "m12 5 7 7-7 7"],
  arrowUpRight: ["M7 17 17 7", "M8 7h9v9"],
} satisfies Record<string, IconPath[]>;

const PILLS: { label: string; icon: IconPath[] }[] = [
  { label: "AI systems", icon: ICONS.brain },
  { label: "Evaluation", icon: ICONS.shield },
  { label: "Developer tooling", icon: ICONS.code },
];

const PROJECTS: {
  title: string;
  category: string;
  description: string;
  stats: { value: string; label: string; icon: IconPath[] }[];
  tags: string[];
  image: StaticImageData;
  href: string;
}[] = [
  {
    title: "Ticket Radar",
    category: "NLP · Classification · Support",
    description:
      "Fine-tuned DistilBERT that sorts support tickets into Change, Issue, or Request at 98% accuracy.",
    stats: [
      { value: "98.2%", label: "test accuracy", icon: ICONS.target },
      { value: "0.7 MB", label: "ONNX model", icon: ICONS.package },
    ],
    tags: ["Python", "PyTorch", "Hugging Face"],
    image: ticketRadarCard,
    href: `${GITHUB_URL}/ticket_radar`,
  },
  {
    title: "Relay",
    category: "Agent harness · Evaluation · Tools",
    description:
      "Local coding agent plus an 11-task eval harness that scores models on pass rate, speed, and cost.",
    stats: [
      { value: "11", label: "eval tasks", icon: ICONS.checkCircle },
      { value: "5", label: "providers", icon: ICONS.layers },
    ],
    tags: ["Python", "FastAPI", "Playwright"],
    image: relayCard,
    href: `${GITHUB_URL}/relay`,
  },
  {
    title: "Quark",
    category: "ML · Transformers · Experimentation",
    description:
      "Small-GPT workbench: swap in paper-inspired components and compare them with ablations.",
    stats: [
      { value: "8.5M", label: "params", icon: ICONS.cpu },
      { value: "1.48", label: "val loss", icon: ICONS.chart },
    ],
    tags: ["PyTorch", "Muon", "AdamW"],
    image: quarkCard,
    href: `${GITHUB_URL}/quark`,
  },
];

const FOCUS_RING = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400";

function Stat({ icon, value, label }: { icon: IconPath[]; value: ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-[0.6rem]">
      <Icon paths={icon} className="size-[1.6rem] shrink-0 text-[#4f8cff]" />
      <div className="min-w-0 leading-tight">
        <div className="text-[1.06rem] font-semibold text-white">{value}</div>
        <div className="truncate text-[0.75rem] text-[#8ea0c0]">{label}</div>
      </div>
    </div>
  );
}

export default function HomeV5() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-[#050b1e] font-sans text-white desk:h-dvh desk:min-h-0">
      <style dangerouslySetInnerHTML={{ __html: FIT_CSS }} />

      {/* Full-bleed mountain background, darkened toward the bottom and left so the copy and cards stay readable */}
      <div
        aria-hidden="true"
        style={{ backgroundImage: `url(${asset("/distance.jpg")})` }}
        className="absolute inset-0 -z-10 bg-cover bg-[position:60%_50%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,11,30,0.45)_0%,rgba(5,11,30,0.1)_35%,rgba(5,11,30,0.55)_70%,rgba(5,11,30,0.85)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,11,30,0.55)_0%,rgba(5,11,30,0)_60%)]"
      />

      <header className="relative flex shrink-0 items-center justify-between gap-6 border-b border-white/10 bg-[#050b1e]/45 px-6 py-4 backdrop-blur-sm desk:h-[4.375rem] desk:py-0 desk:pl-[4.06rem] desk:pr-[3.4rem]">
        <a href="#" className={`flex items-center gap-[1rem] rounded-full text-[1.25rem] font-semibold tracking-tight ${FOCUS_RING}`}>
          <span className="size-[2.9rem] shrink-0 overflow-hidden rounded-full bg-slate-700 ring-1 ring-white/20">
            <Image
              src={asset("/caleb_avatar_professional.jpg")}
              alt=""
              width={96}
              height={96}
              className="size-full origin-[50%_30%] scale-[1.35] object-cover"
            />
          </span>
          Caleb Palmquist
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-[0.35rem] text-[0.94rem]">
            {NAV_LINKS.map((link) => {
              const isActive = link === "Projects";
              return (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`block rounded-full border px-[1.05rem] py-[0.5rem] transition-colors duration-150 ${FOCUS_RING} ${
                      isActive
                        ? "border-[#4f86f0]/70 bg-[#2757c9]/30 text-white"
                        : "border-transparent text-[#c3cfe3] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link}
                  </a>
                </li>
              );
            })}
            <li className="ml-[1.1rem]">
              <a
                href="#contact"
                className={`block rounded-full border border-[#f5a25d] px-[1.25rem] py-[0.5rem] text-[#f5a25d] transition-colors hover:bg-[#f5a25d]/15 ${FOCUS_RING}`}
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>

        {/* The full nav is hidden below md, so keep the main call to action reachable */}
        <a
          href="#contact"
          className="rounded-full border border-[#f5a25d] px-4 py-2 text-sm text-[#f5a25d] md:hidden"
        >
          Contact
        </a>
      </header>

      <main className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col gap-10 px-6 pb-10 pt-8 desk:grid desk:grid-cols-[minmax(0,1fr)_29.4rem] desk:gap-x-[1.4rem] desk:pb-0 desk:pl-[4.3rem] desk:pr-[3.4rem] desk:pt-0">
        {/* Left column: hero copy, then featured work filling the rest of the screen */}
        <div className="flex min-h-0 min-w-0 flex-col desk:pb-[4.4rem] desk:pt-[2.7rem]">
          <p className="flex items-center gap-[1rem] font-mono text-[0.875rem] uppercase tracking-[0.1em] text-[#5b9bff]">
            <span aria-hidden="true" className="h-px w-[2.4rem] bg-[#5b9bff]/70" />
            Applied AI Engineer
          </p>
          <h1 className="mt-[1.1rem] text-[clamp(2rem,8.5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.04em] desk:text-[4.43rem] desk:leading-[0.93]">
            Better tools.
            <br />
            Bigger{" "}
            <span className="bg-gradient-to-r from-[#8fbfff] to-[#b4d3ff] bg-clip-text text-transparent">
              possibilities.
            </span>
          </h1>
          <p className="mt-[1.1rem] max-w-[30rem] text-[1.07rem] leading-[1.55] text-[#dbe3f0]">
            I build AI-powered tools and evaluation systems that make complex workflows easier to use, test, and trust.
          </p>
          <ul className="mt-[1.4rem] flex flex-wrap gap-[0.85rem]">
            {PILLS.map((pill) => (
              <li
                key={pill.label}
                className="flex h-[2.55rem] items-center gap-[0.55rem] rounded-full border border-[#4f86f0]/50 bg-[#102454]/55 px-[1rem] text-[0.9rem] text-[#e6edf9] backdrop-blur-sm"
              >
                <Icon paths={pill.icon} className="size-[1.25rem] text-[#6aa5ff]" />
                {pill.label}
              </li>
            ))}
          </ul>

          <section
            id="projects"
            aria-labelledby="featured-heading"
            className="@container mt-[2.5rem] flex min-h-0 flex-1 scroll-mt-6 flex-col"
          >
            <div className="mb-[1.55rem] flex shrink-0 items-center justify-between gap-4 desk:pr-[1.05rem]">
              <h2 id="featured-heading" className="text-[1.75rem] font-semibold leading-none tracking-tight">
                Featured work
              </h2>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-[0.5rem] rounded text-[0.94rem] text-[#5b9bff] transition-colors hover:text-[#8fbfff] ${FOCUS_RING}`}
              >
                View all projects
                <Icon paths={ICONS.arrowRight} className="size-[1rem]" />
              </a>
            </div>

            <ul className="grid min-h-0 flex-1 gap-[1.4rem] @2xl:grid-cols-3">
              {PROJECTS.map((project) => (
                <li key={project.title} className="min-h-0">
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-[1rem] border border-[#4f86f0]/30 bg-[#08142f]/85 shadow-xl shadow-black/30 backdrop-blur-md transition duration-300 ease-out focus-within:border-blue-400/70 hover:-translate-y-0.5 hover:border-blue-400/60 @max-2xl:flex-row">
                    <div className="relative aspect-[3/2] shrink-0 overflow-hidden bg-[#0b1020] @2xl:aspect-auto @2xl:basis-[38.7%] @max-2xl:w-2/5">
                      <Image
                        src={project.image}
                        alt=""
                        fill
                        sizes="(min-width: 1100px) 320px, 100vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#08142f] to-transparent"
                      />
                    </div>
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col px-[1.3rem] pb-[1.3rem] pt-[0.8rem]">
                      <h3 className="flex items-center justify-between gap-2 text-[1.34rem] font-semibold leading-tight tracking-tight">
                        <a
                          href={project.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="after:absolute after:inset-0 focus-visible:outline-none"
                        >
                          {project.title}
                          <span className="sr-only"> on GitHub</span>
                        </a>
                        <span
                          aria-hidden="true"
                          className="flex size-[1.75rem] shrink-0 items-center justify-center rounded-full border border-[#4f86f0]/40 bg-[#102454]/50 text-[#9fc0ff] transition-colors group-hover:bg-blue-500/30"
                        >
                          <Icon paths={ICONS.arrowUpRight} className="size-[0.9rem]" />
                        </span>
                      </h3>
                      <p className="mt-[0.45rem] truncate font-mono text-[0.69rem] uppercase tracking-[0.04em] text-[#8ea0c0]">
                        {project.category}
                      </p>
                      <p className="mt-[0.55rem] text-[0.9rem] leading-[1.5] text-[#d3dcec]">
                        {project.description}
                      </p>
                      <div className="mt-auto grid grid-cols-2 gap-[0.5rem] pt-[0.75rem]">
                        {project.stats.map((stat) => (
                          <Stat key={stat.label} {...stat} />
                        ))}
                      </div>
                      <ul className="mt-[1rem] flex flex-wrap gap-[0.45rem]">
                        {project.tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-[0.45rem] border border-white/15 bg-white/[0.06] px-[0.65rem] py-[0.28rem] text-[0.75rem] leading-none text-[#c6d2e6]"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Assistant */}
        <div className="min-h-0 desk:pb-[3.05rem] desk:pt-[1.95rem]">
          <ChatPanelV5 />
        </div>
      </main>
    </div>
  );
}
