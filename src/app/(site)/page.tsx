import { GITHUB_URL } from "@/site/config";
import { PROJECTS } from "@/site/projects";
import { AlignToCards } from "../align-to-cards";
import { ArrowUpRight, BrainIcon, GitHubIcon, ShieldCheckIcon, WorkflowIcon } from "../icons";
import { ProjectGrid } from "../project-grid";
import { SpotlightCard } from "../spotlight-card";

const FOCUS_AREAS = [
  { label: "AI Agents", Icon: BrainIcon },
  { label: "Evaluations", Icon: ShieldCheckIcon },
  { label: "Automation", Icon: WorkflowIcon },
];

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
          {FOCUS_AREAS.map(({ label, Icon }) => (
            <li key={label}>
              {/* Same hover as the project cards: lift, brighter border, blue glow, and the pointer-following light */}
              <SpotlightCard
                spotlightRadius={90}
                className="relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-blue-400/40 bg-blue-500/15 px-4 py-2 text-sm font-medium text-[#9cc3ff] backdrop-blur-md transition duration-300 ease-out hover:border-blue-400/80 hover:shadow-[0_10px_24px_-8px_rgba(7,12,30,0.6),0_0_24px_-4px_rgba(59,130,246,0.5)]"
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </SpotlightCard>
            </li>
          ))}
        </ul>
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
