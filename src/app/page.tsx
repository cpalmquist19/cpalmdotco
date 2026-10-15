import Image from "next/image";
import type { ReactNode } from "react";
import { BackgroundMedia } from "./background-media";

const NAV_LINKS = ["Projects", "Experience", "Skills", "About", "Contact"];
const ACTIVE_LINK = "Projects";
const CTA_LINK = "Contact";

const CHAT_PROMPTS = [
  "What projects are you most proud of?",
  "Tell me about your experience with AI and testing.",
  "What technologies do you work with?",
];

const PROJECTS: {
  title: string;
  description: string;
  tags: string[];
  thumbnail: string;
  preview?: ReactNode;
}[] = [
  {
    title: "TestScribeAI",
    description:
      "AI-powered test documentation and automation tool for modern web applications.",
    tags: ["Python", "Flask", "MySQL", "Stripe"],
    thumbnail: "from-[#0b1020] to-[#101a33]",
    preview: (
      <div className="p-2.5 font-mono text-[10px] leading-4 text-emerald-300/80">
        <p>&gt; run e2e</p>
        <p>✓ 12 tests passed (12/12)</p>
        <p>✓ 0 failures</p>
        <p>✓ 0 skipped</p>
        <p className="mt-1 text-sky-300/70">Tests completed in 45.2s</p>
      </div>
    ),
  },
  {
    title: "YourLocalServices",
    description:
      "Local business directory for Indian Trail, NC, helping people find trusted service providers.",
    tags: ["Next.js", "Tailwind", "TypeScript", "PostgreSQL"],
    thumbnail: "from-[#dfe9d8] to-[#c9d8e6]",
  },
  {
    title: "AI Education Companion",
    description:
      "Adaptive learning companion for neurodivergent kids, with personalized support and encouragement.",
    tags: ["Python", "FastAPI", "LLM", "React"],
    thumbnail: "from-[#6b7a3a] to-[#d9c9b0]",
  },
  // TEMP: placeholder cards hidden for a height check
  // {
  //   title: "Placeholder Project 1",
  //   description: "Replace with a short description of this project.",
  //   tags: ["Placeholder"],
  //   thumbnail: "from-[#1a2238] to-[#2a3a5c]",
  // },
  // {
  //   title: "Placeholder Project 2",
  //   description: "Replace with a short description of this project.",
  //   tags: ["Placeholder"],
  //   thumbnail: "from-[#3b2a4a] to-[#1b2c3d]",
  // },
];

const CHIP_STYLES = {
  lang: "border-[rgba(96,165,250,0.30)] bg-[rgba(59,130,246,0.14)] text-[#93c5fd]",
  frame:
    "border-[rgba(167,139,250,0.30)] bg-[rgba(139,92,246,0.14)] text-[#c4b5fd]",
  data: "border-[rgba(45,212,191,0.30)] bg-[rgba(20,184,166,0.13)] text-[#5eead4]",
  ai: "border-[rgba(251,146,60,0.32)] bg-[rgba(245,158,11,0.13)] text-[#fdba74]",
  service:
    "border-[rgba(148,163,184,0.25)] bg-[rgba(148,163,184,0.12)] text-[#cbd5e1]",
};

const TAG_CATEGORY: Record<string, keyof typeof CHIP_STYLES> = {
  Python: "lang",
  TypeScript: "lang",
  Flask: "frame",
  FastAPI: "frame",
  "Next.js": "frame",
  React: "frame",
  Tailwind: "frame",
  MySQL: "data",
  PostgreSQL: "data",
  LLM: "ai",
  Stripe: "service",
};

function ArrowRight({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ChatCard() {
  return (
    <aside
      aria-label="Ask me about Caleb"
      className="w-full max-w-[460px] rounded-3xl xl:w-[480px] xl:max-w-[480px] border border-white/10 bg-[#0e1428]/80 shadow-2xl shadow-black/40 backdrop-blur-md"
    >
      <header className="flex items-center gap-4 border-b border-white/5 px-6 py-3">
        <div className="relative">
          <div className="size-10 overflow-hidden rounded-full bg-slate-700">
            <Image
              src="/caleb_avatar_professional.jpg"
              alt="Caleb Palmquist"
              width={80}
              height={80}
              className="size-full origin-[50%_30%] scale-[1.35] object-cover"
            />
          </div>
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 -right-0.5 size-[0.7rem] rounded-full bg-emerald-500 ring-2 ring-[#0e1428]"
          />
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold text-white">Ask me about Caleb</p>
          <p className="text-sm text-slate-400">
            AI assistant · answers from my work
          </p>
        </div>
        <button
          type="button"
          aria-label="Close chat"
          className="rounded-full p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="size-5"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div className="flex flex-col gap-2 px-6 py-4">
        {CHAT_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-left text-base text-slate-100 transition-colors hover:bg-white/10"
          >
            <span>{prompt}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5 shrink-0 text-slate-400"
              aria-hidden="true"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        ))}
      </div>

      <form className="px-6 pb-5" action="#">
        <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-[#0a0f20]/70 py-2 pl-5 pr-2">
          <input
            type="text"
            placeholder="Type a question…"
            aria-label="Type a question"
            className="min-w-0 flex-1 bg-transparent text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send"
            className="flex size-10 items-center justify-center rounded-full border border-blue-400/40 bg-blue-500/20 text-white transition-colors duration-150 hover:bg-blue-500/30"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
              <g transform="translate(10 14) scale(0.83) translate(-12 -12)">
                <path d="M12 3C12.6 8.4 15.6 11.4 21 12C15.6 12.6 12.6 15.6 12 21C11.4 15.6 8.4 12.6 3 12C8.4 11.4 11.4 8.4 12 3Z" />
              </g>
              <path d="M19 2C19.2 3.8 20.2 4.8 22 5C20.2 5.2 19.2 6.2 19 8C18.8 6.2 17.8 5.2 16 5C17.8 4.8 18.8 3.8 19 2Z" />
            </svg>
          </button>
        </div>
      </form>
    </aside>
  );
}

export default function Home() {
  return (
    <div className="relative isolate flex min-h-dvh flex-1 flex-col overflow-hidden bg-[#070b1a] text-white lg:h-dvh lg:min-h-0 lg:flex-none">
      {/* Static mountain image, with the video layered on once it plays */}
      <BackgroundMedia />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-[#060a18] via-[#060a18]/85 to-transparent"
      />

      <header className="mx-auto flex w-full max-w-[1480px] shrink-0 items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <a href="#" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="size-10 shrink-0 overflow-hidden rounded-full bg-slate-700">
            <Image
              src="/caleb_avatar_professional.jpg"
              alt=""
              width={80}
              height={80}
              className="size-full origin-[50%_30%] scale-[1.35] object-cover"
            />
          </span>
          Caleb Palmquist
        </a>
        <nav aria-label="Primary" className="hidden md:block md:w-full md:max-w-[460px] xl:max-w-[480px]">
          <ul className="flex w-full items-center justify-between gap-1 rounded-full border border-[#9cc3ff]/15 bg-white/[0.04] p-1 text-sm backdrop-blur-xl">
            {NAV_LINKS.map((link) => {
              const isActive = link === ACTIVE_LINK;
              const isCta = link === CTA_LINK;
              return (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`block rounded-full border px-4 py-2 transition-colors duration-150 ${
                      isCta
                        ? "border-transparent bg-[#f5a25d] font-semibold text-[#1a0f05] hover:bg-[#f8b67d]"
                        : isActive
                          ? "border-blue-400/40 bg-blue-500/20 text-white"
                          : "border-transparent text-[#a9b6cc] hover:bg-[#9cc3ff]/10 hover:text-white"
                    }`}
                  >
                    {link}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-[1480px] gap-10 px-6 pb-12 pt-8 sm:px-10 lg:flex-none lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-16 lg:pb-6 lg:pt-2">
        <div className="flex max-w-xl flex-col items-start gap-5 lg:justify-center lg:gap-7">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-blue-300">
            AI Engineer
          </p>
          <h1 className="-mt-2 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[clamp(2.75rem,4.2vw,4rem)]">
            Better tools.
            <br />
            Bigger possibilities.
          </h1>
          <p className="max-w-[42ch] text-base leading-relaxed text-slate-300 sm:text-lg">
            I build AI systems, developer tools, and automation that help
            people and teams do more.
          </p>
          <a
            href="#projects"
            className="mt-2 inline-flex items-center gap-3 rounded-full bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-500"
          >
            Explore my work
            <ArrowRight />
          </a>
        </div>

        <ChatCard />
      </section>

      {/* Featured work */}
      <div className="relative w-full bg-[#0e1428]/80 backdrop-blur-md lg:flex lg:flex-1 lg:flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-transparent to-[#0e1428]/80"
        />
        <section
          id="projects"
          className="mx-auto w-full max-w-[1480px] px-6 pb-12 pt-[3rem] sm:px-10 lg:flex lg:flex-1 lg:flex-col lg:px-16 lg:pb-12"
        >
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              Featured Work
            </h2>
            <a
              href="#projects"
              className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white/70"
            >
              View all
              <ArrowRight />
            </a>
          </div>

          <ul className="mt-3 grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] lg:flex-1">
            {PROJECTS.map((project) => (
              <li key={project.title}>
                <article className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0c1226]/95">
                  <div
                    aria-hidden="true"
                    className={`h-[5.4rem] overflow-hidden bg-gradient-to-br lg:h-auto lg:max-h-[18rem] lg:min-h-0 lg:flex-1 ${project.thumbnail}`}
                  >
                    {project.preview}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-base font-semibold tracking-tight">
                      {project.title}
                    </h3>
                    <p className="mt-1 flex-1 text-[13px] leading-5 text-slate-300">
                      {project.description}
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <li
                          key={tag}
                          className={`rounded-full border px-2.5 py-0.5 text-xs ${
                            CHIP_STYLES[TAG_CATEGORY[tag] ?? "service"]
                          }`}
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
    </div>
  );
}
