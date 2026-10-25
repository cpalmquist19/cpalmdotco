import Image from "next/image";
import { asset } from "@/lib/asset";
import calmdotcoCard from "../../public/calmdotco.jpg";
import relayCard from "../../public/relay_featured.jpg";
import { AlignToCards } from "./align-to-cards";
import { ChatPanel } from "./chat-panel";
import { ArrowUpRight } from "./icons";
import { ProjectGrid, type Project } from "./project-grid";
import { SpotlightCard } from "./spotlight-card";

const GITHUB_URL = "https://github.com/cpalmquist19";

const NAV_LINKS = ["Projects", "Experience", "Skills", "About", "Contact"];
const ACTIVE_LINK = "Projects";
const CTA_LINK = "Contact";

const PROJECTS: Project[] = [
  {
    title: "cpalm.co",
    description:
      "This portfolio site, with a built-in AI assistant that answers questions about Caleb's projects.",
    tags: ["Next.js", "TypeScript", "LLM"],
    image: calmdotcoCard,
    href: `${GITHUB_URL}/cpalmdotco`,
  },
  {
    title: "Relay",
    description:
      "Local coding agent with a web UI, plus an 11-task eval harness that scores models on pass rate, speed, and cost.",
    tags: ["Python", "LLM", "Agents", "Evals"],
    image: relayCard,
    href: `${GITHUB_URL}/relay`,
  },
];

function GitHubIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.723-1.335-1.723-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.217 1.838 1.217 1.07 1.799 2.809 1.279 3.495.978.108-.76.417-1.279.76-1.573-2.665-.296-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.317 3.3 1.209a11.7 11.7 0 0 1 3-.399c1.02.004 2.045.136 3 .399 2.28-1.526 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.573-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.499 24 12.292 24 5.78 18.627.5 12 .5z" />
    </svg>
  );
}

function BrainIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 18V5" />
      <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
      <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
      <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
      <path d="M18 18a4 4 0 0 0 2-7.464" />
      <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" />
      <path d="M6 18a4 4 0 0 1-2-7.464" />
      <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CodeIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="m14.5 4-5 16" />
    </svg>
  );
}

function WorkflowIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="8" height="8" x="3" y="3" rx="2" />
      <path d="M7 11v4a2 2 0 0 0 2 2h4" />
      <rect width="8" height="8" x="13" y="13" rx="2" />
    </svg>
  );
}

const FOCUS_AREAS: {
  label: string;
  Icon: typeof BrainIcon;
  highlight: boolean;
}[] = [
  { label: "AI Agents", Icon: BrainIcon, highlight: true },
  { label: "Evaluations", Icon: ShieldCheckIcon, highlight: true },
  { label: "Automation", Icon: WorkflowIcon, highlight: true },
];

// { label: "Developer Tooling", Icon: CodeIcon, highlight: true },

export default function HomeV2() {
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

      <header className="mx-auto flex w-full max-w-[1480px] shrink-0 items-center justify-between gap-6 px-6 py-5 sm:px-10 lg:px-16">
        <a
          href="#"
          className="flex items-center gap-3 whitespace-nowrap rounded-full text-lg font-semibold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
        >
          <span className="size-10 shrink-0 overflow-hidden rounded-full bg-slate-700 ring-2 ring-white/15">
            <Image
              src={asset("/caleb_avatar_professional.jpg")}
              alt=""
              width={80}
              height={80}
              className="size-full origin-[50%_30%] scale-[1.35] object-cover"
            />
          </span>
          Caleb Palmquist
        </a>

        <nav aria-label="Primary" className="hidden md:block md:w-full md:max-w-[480px]">
          <ul className="flex w-full items-center justify-between gap-1 rounded-full border border-[#9cc3ff]/15 bg-[#0e1428]/50 p-1 text-sm shadow-lg shadow-black/20 backdrop-blur-xl">
            {NAV_LINKS.map((link) => {
              const isActive = link === ACTIVE_LINK;
              const isCta = link === CTA_LINK;
              return (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`block rounded-full border px-3 py-2 transition-colors lg:px-4 duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${
                      isCta
                        ? "border-transparent bg-[#f5a25d] font-semibold text-[#1a0f05] hover:bg-[#f8b67d]"
                        : isActive
                          ? "border-blue-400/40 bg-blue-500/20 text-white"
                          : "border-transparent text-[#b6c2d8] hover:bg-[#9cc3ff]/10 hover:text-white"
                    }`}
                  >
                    {link}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* The full nav is hidden below md, so keep the main call to action reachable */}
        <a
          href="#contact"
          className="rounded-full bg-[#f5a25d] px-4 py-2 text-sm font-semibold text-[#1a0f05] transition-colors hover:bg-[#f8b67d] md:hidden"
        >
          Contact
        </a>
      </header>

      <main className="mx-auto grid w-full max-w-[1480px] gap-12 px-6 pb-16 pt-6 sm:px-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-16 lg:pt-10 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_480px] xl:grid-rows-[auto_minmax(0,1fr)] xl:gap-x-14 xl:gap-y-[clamp(1rem,3dvh,2rem)] xl:pb-[clamp(1rem,3dvh,2rem)] xl:pt-0">
        {/* Hero copy */}
        <div className="flex flex-col items-start gap-6 lg:col-start-1 lg:row-start-1 lg:justify-center xl:justify-start xl:col-start-1 xl:row-start-1 xl:gap-[clamp(0.75rem,2.2dvh,1.5rem)] xl:pt-[min(3dvh,1.5rem)]">
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-blue-300">
            <span aria-hidden="true" className="h-px w-8 bg-blue-300/60" />
            AI Engineer
          </p>
          <h1 className="text-[clamp(1.875rem,9.4vw,3.25rem)] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[2.75rem] xl:text-[clamp(2.25rem,min(3.8vw,7dvh),3.9rem)]">
            Better tools.
            <br />
            <span className="text-white">Bigger</span>{" "}
            <span className="bg-gradient-to-b from-[#a8d8ff] to-[#5aa9ff] bg-clip-text text-transparent">
              possibilities.
            </span>
          </h1>
          <p className="max-w-[34rem] text-lg leading-relaxed text-slate-300 xl:text-[clamp(1rem,2dvh,1.125rem)]">
            I build AI-powered tools and evaluation systems that make complex workflows easier to
            use, test, and trust.
          </p>
          <ul className="flex flex-wrap gap-2.5">
            {FOCUS_AREAS.map(({ label, Icon, highlight }) => (
              <li key={label}>
                {/* Same hover as the project cards: lift, brighter border, blue glow, and the pointer-following light */}
                <SpotlightCard
                  spotlightRadius={90}
                  className={`relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-md transition duration-300 ease-out hover:shadow-[0_10px_24px_-8px_rgba(7,12,30,0.6),0_0_24px_-4px_rgba(59,130,246,0.5)] ${
                    highlight
                      ? "border-blue-400/40 bg-blue-500/15 text-[#9cc3ff] hover:border-blue-400/80"
                      : "border-white/15 bg-white/[0.06] text-slate-200 hover:border-white/30"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </SpotlightCard>
              </li>
            ))}
          </ul>
          {/* <div className="mt-1 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
            >
              Explore my work
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:border-white/35 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
            >
              <GitHubIcon className="size-4" />
              GitHub
              <ArrowUpRight className="size-3.5 text-slate-400" />
            </a>
          </div> */}
        </div>

        {/* Assistant: sits beside the copy on wide screens and stays in view while the left column scrolls */}
        <div className="lg:col-start-2 lg:row-start-1 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:min-h-0">
          <div className="xl:h-full">
            <ChatPanel className="xl:h-full" />
          </div>
        </div>

        {/* Featured work. A container query lets the cards adapt to the width of this column rather than the screen */}
        <section
          id="projects"
          aria-labelledby="featured-heading"
          className="@container scroll-mt-6 lg:col-span-2 lg:col-start-1 lg:row-start-2 xl:col-span-1 xl:col-start-1 xl:row-start-2 xl:flex xl:min-h-0 xl:flex-col"
        >
          <AlignToCards className="mb-4 flex shrink-0 items-end justify-between gap-4">
            <h2
              id="featured-heading"
              className="whitespace-nowrap text-xl font-semibold tracking-tight"
            >
              Featured Projects
            </h2>
            {/* Same hover as the hero chips: brighter border, blue glow, and the pointer-following light. The link stretches over the pill so the whole pill is clickable */}
            <SpotlightCard
              spotlightRadius={90}
              className="relative inline-flex overflow-hidden rounded-full border border-white/10 bg-black/40 backdrop-blur-sm transition duration-300 ease-out hover:border-white/30 hover:shadow-[0_10px_24px_-8px_rgba(7,12,30,0.6),0_0_24px_-4px_rgba(59,130,246,0.5)]"
            >
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-sm font-medium text-white transition-colors hover:text-white after:absolute after:inset-0"
              >
                <span><span className="max-sm:hidden">View all projects on </span>GitHub</span>
                <GitHubIcon className="size-3.5" />
                <ArrowUpRight className="size-3.5" />
              </a>
            </SpotlightCard>
          </AlignToCards>

          <ProjectGrid projects={PROJECTS} />
        </section>
      </main>
    </div>
  );
}
