import { GITHUB_URL } from "@/site/config";
import { PROJECTS } from "@/site/projects";
import { AlignToCards } from "../align-to-cards";
import { ArrowUpRight, GitHubIcon } from "../icons";
// import { ExternalLinkIcon, LinkedInIcon } from "../icons";
import { ProjectGrid } from "../project-grid";
import { SpotlightCard } from "../spotlight-card";

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

export default function Home() {
  return (
    <>
      {/* Hero copy */}
      <div className="flex flex-col items-start gap-6 max-lg:order-1 lg:col-start-1 lg:row-start-1 lg:justify-center xl:justify-start xl:col-start-1 xl:row-start-1 xl:gap-[clamp(0.75rem,2.2dvh,1.5rem)] xl:pt-[min(3dvh,1.5rem)]">
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

      {/* Featured work. A container query lets the cards adapt to the width of this column rather than the screen */}
      <section
        id="projects"
        aria-labelledby="featured-heading"
        className="@container scroll-mt-6 max-lg:order-3 lg:col-span-2 lg:col-start-1 lg:row-start-2 xl:col-span-1 xl:col-start-1 xl:row-start-2 xl:flex xl:min-h-0 xl:flex-col"
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
              <span><span className="max-sm:hidden">Explore the Code on </span>GitHub</span>
              <GitHubIcon className="size-3.5" />
              <ArrowUpRight className="size-3.5" />
            </a>
          </SpotlightCard>
        </AlignToCards>

        <ProjectGrid projects={PROJECTS} />
      </section>
    </>
  );
}
