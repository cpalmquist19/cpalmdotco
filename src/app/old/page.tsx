import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import { asset } from "@/lib/asset";
import type { ReactNode } from "react";
import quarkCard from "../../../public/quark_card.jpg";
import relayCard from "../../../public/relay_card_new.jpg";
import ticketRadarCard from "../../../public/ticket_radar_card.jpg";
import { FeaturedCarousel } from "../featured-carousel";
import { ChatCard } from "../chat-card";

// The previous home page, kept for reference at /old; out of search results.
export const metadata: Metadata = {
  title: "Portfolio | Caleb Palmquist",
  robots: { index: false, follow: false },
};

const NAV_LINKS = ["Projects", "Experience", "Skills", "About", "Contact"];
const ACTIVE_LINK = "Projects";
const CTA_LINK = "Contact";

const PROJECTS: {
  title: string;
  description: string;
  tags: string[];
  thumbnail: string;
  image?: StaticImageData;
  href: string;
  github: string;
  preview?: ReactNode;
  overlay?: boolean;
  caption?: boolean;
  imageFit?: "cover" | "contain";
  aspect?: "3/2";
}[] = [
  {
    title: "Ticket Radar",
    href: "/projects/ticket-radar",
    description:
      "Fine-tuned DistilBERT that sorts support tickets into Change, Issue, or Request at 98% accuracy.",
    tags: ["Python", "PyTorch", "ONNX"],
    github: "https://github.com/cpalmquist19/ticket_radar",
    thumbnail: "from-[#0b1020] to-[#101a33]",
    image: ticketRadarCard,
    overlay: false,
    caption: false,
    imageFit: "cover",
    aspect: "3/2",
  },
  {
    title: "Relay",
    href: "https://github.com/cpalmquist19/relay",
    description:
      "Local coding agent with a web UI, plus an 11-task eval harness that scores models on pass rate, speed, and cost.",
    tags: ["Python", "LLM", "Agents", "Evals"],
    github: "https://github.com/cpalmquist19/relay",
    thumbnail: "from-[#0b1020] to-[#101a33]",
    image: relayCard,
    overlay: false,
    caption: false,
    imageFit: "cover",
    aspect: "3/2",
  },
  {
    title: "Quark",
    href: "/projects/quark",
    description:
      "Workbench for small GPT models: swap in paper-inspired components and compare them with paired-seed ablations.",
    tags: ["Python", "PyTorch", "LLM"],
    github: "https://github.com/cpalmquist19/quark",
    thumbnail: "from-[#0b1020] to-[#101a33]",
    image: quarkCard,
    overlay: false,
    caption: false,
    imageFit: "cover",
    aspect: "3/2",
  },
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

export default function Home() {
  return (
    <div className="relative isolate flex min-h-dvh flex-1 flex-col overflow-hidden bg-[#070b1a] text-white lg:flex-none">
      {/* Full-bleed mountain background */}
      <div
        aria-hidden="true"
        style={{ backgroundImage: `url(${asset("/distance.jpg")})` }}
        className="absolute inset-0 -z-10 bg-cover bg-center"
      />

      <header className="mx-auto flex w-full max-w-[1480px] shrink-0 items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <a href="#" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="size-10 shrink-0 overflow-hidden rounded-full bg-slate-700">
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
      <section className="mx-auto grid w-full max-w-[1480px] gap-10 px-6 pb-12 pt-8 sm:px-10 lg:flex-none lg:grid-cols-[minmax(0,1fr)_625px] xl:grid-cols-[minmax(0,1fr)_650px] lg:items-start lg:gap-y-0 lg:px-16 lg:pb-12 lg:pt-2">
        <div className="flex max-w-xl flex-col items-start gap-5 lg:col-start-1 lg:row-start-1 lg:self-stretch lg:justify-center lg:gap-7">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-blue-300">
            AI Engineer
          </p>
          <h1 className="-mt-2 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[clamp(2.75rem,4.2vw,4rem)]">
            Better tools.
            <br />
            Bigger possibilities.
          </h1>
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <ChatCard />
        </div>

        {/* Featured work, sitting directly under the hero copy in the left column */}
        <section
          id="projects"
          className="relative w-full rounded-3xl border border-white/10 bg-[#0e1428]/80 px-5 pb-5 pt-4 shadow-2xl shadow-black/40 backdrop-blur-md lg:col-start-1 lg:row-start-2 lg:mt-[5dvh] lg:w-[87%]"
        >
          {/*
          Glowing sky-blue transition line; tapers out at both ends
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[2.75rem] h-1.5 w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#7dd3fc]/30 to-transparent blur-md"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[2.75rem] h-0.5 w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#7dd3fc] to-transparent"
          />
          */}
          <div className="flex items-end justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              Featured Work on GitHub
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                <path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.723-1.335-1.723-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.217 1.838 1.217 1.07 1.799 2.809 1.279 3.495.978.108-.76.417-1.279.76-1.573-2.665-.296-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.317 3.3 1.209a11.7 11.7 0 0 1 3-.399c1.02.004 2.045.136 3 .399 2.28-1.526 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.573-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.499 24 12.292 24 5.78 18.627.5 12 .5z" />
              </svg>
            </h2>
          </div>

          <p className="mt-3 max-w-[42ch] text-base leading-relaxed text-slate-300">
            I build AI systems, developer tools, and automation that help
            people and teams do more.
          </p>

          <div className="mt-5 flex">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Explore my work
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-3.5"
              >
                <path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
              </svg>
            </a>
          </div>

          <div className="mt-6 flex min-h-0 flex-1 flex-col">
            <FeaturedCarousel>
              {PROJECTS.map((project) => (
                <li
                  key={project.title}
                  className="w-full shrink-0 snap-start md:w-[calc((100%_-_1rem)/2)] lg:w-[calc((100%_-_3rem)/4)]"
                >
                  <article className={`relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0c1226]/95 transition-all duration-[400ms] ease-out hover:-translate-y-1 hover:scale-[1.05] hover:border-2 hover:border-[#ff5555] ${project.aspect ? "aspect-[3/2]" : "h-full"}`}>
                    <div
                      aria-hidden="true"
                      className={`absolute inset-0 bg-gradient-to-br ${project.thumbnail}`}
                    >
                      {project.preview}
                    </div>
                    {project.image && (
                      <Image
                        src={project.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 100vw"
                        className={
                          project.imageFit === "contain"
                            ? "object-contain object-center"
                            : "object-cover object-top"
                        }
                      />
                    )}
                    {project.overlay !== false && (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-b from-[#0c1226]/20 via-[#0c1226]/70 to-[#0c1226]"
                      />
                    )}
                    {/*
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} on GitHub`}
                      className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
                        <path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.723-1.335-1.723-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.217 1.838 1.217 1.07 1.799 2.809 1.279 3.495.978.108-.76.417-1.279.76-1.573-2.665-.296-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.317 3.3 1.209a11.7 11.7 0 0 1 3-.399c1.02.004 2.045.136 3 .399 2.28-1.526 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.573-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.499 24 12.292 24 5.78 18.627.5 12 .5z" />
                      </svg>
                      Code on GitHub
                    </a>
                    */}
                    {project.caption !== false && (
                      <div className="relative mt-auto bg-[#0c1226]/85 p-4 backdrop-blur-sm">
                        <h3 className="text-base font-semibold tracking-tight">
                          {project.title}
                        </h3>
                        <p className="mt-1 text-[13px] leading-5 text-slate-300">
                          {project.description}
                        </p>
                        {/*
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
                        */}
                      </div>
                    )}
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={project.title}
                      className="absolute inset-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                    />
                  </article>
                </li>
              ))}
            </FeaturedCarousel>
          </div>

        </section>
      </section>
    </div>
  );
}
