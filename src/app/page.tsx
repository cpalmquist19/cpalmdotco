import Image, { type StaticImageData } from "next/image";
import { asset } from "@/lib/asset";
import quarkCard from "../../public/quark_card.jpg";
import relayCard from "../../public/relay_card_new.jpg";
import ticketRadarCard from "../../public/ticket_radar_card.jpg";
import { ChatPanel } from "./chat-panel";

const GITHUB_URL = "https://github.com/cpalmquist19";

const NAV_LINKS = ["Projects", "Experience", "Skills", "About", "Contact"];
const ACTIVE_LINK = "Projects";
const CTA_LINK = "Contact";

const PROJECTS: {
  title: string;
  description: string;
  tags: string[];
  image: StaticImageData;
  href: string;
}[] = [
  {
    title: "Ticket Radar",
    description:
      "Fine-tuned DistilBERT that sorts support tickets into Change, Issue, or Request at 98% accuracy.",
    tags: ["Python", "PyTorch", "ONNX"],
    image: ticketRadarCard,
    href: `${GITHUB_URL}/ticket_radar`,
  },
  {
    title: "Relay",
    description:
      "Local coding agent with a web UI, plus an 11-task eval harness that scores models on pass rate, speed, and cost.",
    tags: ["Python", "LLM", "Agents", "Evals"],
    image: relayCard,
    href: `${GITHUB_URL}/relay`,
  },
  {
    title: "Quark",
    description:
      "Workbench for small GPT models: swap in paper-inspired components and compare them with paired-seed ablations.",
    tags: ["Python", "PyTorch", "LLM"],
    image: quarkCard,
    href: `${GITHUB_URL}/quark`,
  },
];

function GitHubIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.723-1.335-1.723-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.217 1.838 1.217 1.07 1.799 2.809 1.279 3.495.978.108-.76.417-1.279.76-1.573-2.665-.296-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.317 3.3 1.209a11.7 11.7 0 0 1 3-.399c1.02.004 2.045.136 3 .399 2.28-1.526 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.573-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.499 24 12.292 24 5.78 18.627.5 12 .5z" />
    </svg>
  );
}

function ArrowUpRight({ className }: { className: string }) {
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
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}

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
          className="flex items-center gap-3 rounded-full text-lg font-semibold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
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
                    className={`block rounded-full border px-4 py-2 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${
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

      <main className="mx-auto grid w-full max-w-[1480px] gap-12 px-6 pb-16 pt-6 sm:px-10 lg:px-16 lg:pt-10 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_540px] xl:grid-rows-[auto_minmax(0,1fr)] xl:gap-x-14 xl:gap-y-[clamp(1rem,3dvh,2rem)] xl:pb-[clamp(1rem,3dvh,2rem)] xl:pt-0">
        {/* Hero copy */}
        <div className="flex flex-col items-start gap-6 xl:col-start-1 xl:row-start-1 xl:gap-[clamp(0.75rem,2.2dvh,1.5rem)] xl:pt-[min(3dvh,1.5rem)]">
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-blue-300">
            <span aria-hidden="true" className="h-px w-8 bg-blue-300/60" />
            AI Engineer
          </p>
          <h1 className="text-[clamp(2.5rem,7vw,3.25rem)] font-semibold leading-[1.08] tracking-tight sm:text-5xl xl:text-[clamp(2.25rem,min(3.8vw,7dvh),3.9rem)]">
            Better tools.
            <br />
            <span className="bg-gradient-to-r from-white via-white to-[#9cc3ff] bg-clip-text text-transparent">
              Bigger possibilities.
            </span>
          </h1>
          <p className="max-w-[34rem] text-lg leading-relaxed text-slate-300 xl:text-[clamp(1rem,2dvh,1.125rem)]">
            I build AI systems, developer tools, and automation that help people and teams do
            more.
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
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
          </div>
        </div>

        {/* Assistant: sits beside the copy on wide screens and stays in view while the left column scrolls */}
        <div className="xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:min-h-0">
          <div className="xl:h-full">
            <ChatPanel className="xl:h-full" />
          </div>
        </div>

        {/* Featured work. A container query lets the cards adapt to the width of this column rather than the screen */}
        <section
          id="projects"
          aria-labelledby="featured-heading"
          className="@container scroll-mt-6 xl:col-start-1 xl:row-start-2 xl:flex xl:min-h-0 xl:flex-col"
        >
          <div className="mb-4 flex shrink-0 items-end justify-between gap-4">
            <h2
              id="featured-heading"
              className="text-xl font-semibold tracking-tight"
            >
              Featured work
            </h2>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-white"
            >
              All projects on GitHub
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>

          <ul className="grid gap-4 @2xl:grid-cols-3 xl:min-h-0 xl:flex-1 xl:grid-rows-3 xl:@2xl:flex-none xl:@2xl:grid-rows-1">
            {PROJECTS.map((project) => (
              <li key={project.title} className="xl:min-h-0">
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0e1428]/75 shadow-xl shadow-black/30 backdrop-blur-md transition duration-300 ease-out focus-within:border-blue-400/60 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-950/40 @lg:flex-row @2xl:flex-col xl:min-h-0">
                  <div className="relative aspect-[3/2] shrink-0 overflow-hidden bg-[#0b1020] @lg:w-[40%] @2xl:w-full xl:@max-2xl:aspect-auto xl:@lg:@max-2xl:w-[36%]">
                    <Image
                      src={project.image}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 240px, (min-width: 640px) 33vw, 100vw"
                      className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-col gap-2 p-4 @lg:flex-1 @lg:justify-center @2xl:justify-start xl:min-h-0 xl:p-3.5">
                    <h3 className="flex items-center justify-between gap-2 text-base font-semibold tracking-tight">
                      <a
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="after:absolute after:inset-0 focus-visible:outline-none"
                      >
                        {project.title}
                        <span className="sr-only"> on GitHub</span>
                      </a>
                      <ArrowUpRight className="size-4 shrink-0 text-slate-500 transition-colors group-hover:text-blue-300" />
                    </h3>
                    <p className="text-[13px] leading-5 text-slate-300 @lg:@max-2xl:line-clamp-2 xl:[@media(max-height:800px)]:@max-2xl:line-clamp-1">{project.description}</p>
                    <ul className="mt-auto flex flex-wrap gap-1.5 pt-1 @lg:@max-2xl:hidden xl:[@media(max-height:880px)]:hidden">
                      {project.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] text-slate-300"
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
      </main>
    </div>
  );
}
