"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import { ArrowUpRight } from "./icons";
import { SpotlightCard } from "./spotlight-card";

export type Project = {
  title: string;
  description: string;
  tags: string[];
  image: StaticImageData;
  href: string;
};

const rowRatio = (projects: Project[]) =>
  projects.reduce((sum, { image }) => sum + image.width / image.height, 0);

/**
 * The featured project cards. Clicking a card's image toggles it between open, where a copy panel
 * sits beside the image, and closed, where the card is the image alone. Only one card is open at a
 * time, so opening a card closes the other.
 *
 * Below xl the cards stack in one column, two across from @2xl with an open card spanning both (its
 * image sits beside the copy). On xl they run in one row that fills the height left under the hero:
 * each image keeps its own proportions at that height, and an open card adds its copy panel beside the image.
 */
export function ProjectGrid({ projects }: { projects: Project[] }) {
  // Every card starts closed, and opening one closes the other
  const [openTitle, setOpenTitle] = useState<string | null>(null);
  const openCount = openTitle === null ? 0 : 1;

  function toggle(title: string) {
    setOpenTitle((current) => (current === title ? null : title));
  }

  return (
    // The max height keeps the row inside the column: at height H the images are H * (sum of aspect ratios) wide,
    // plus the open copy panels, gaps and borders (--row-extra), so on tall screens the row stops growing instead of
    // running under the chat panel
    <ul
      style={
        {
          "--row-ratio": rowRatio(projects),
          "--panel-w": "15rem",
          "--row-extra": `calc(${openCount} * var(--panel-w) + ${projects.length - 1}rem + ${projects.length * 2 + openCount}px)`,
        } as React.CSSProperties
      }
      className="grid gap-4 @2xl:grid-cols-2 xl:flex xl:min-h-0 xl:max-h-[calc((100cqw_-_var(--row-extra))/var(--row-ratio))] xl:flex-1 xl:transition-[max-height] xl:duration-300 xl:ease-out"
    >
      {projects.map((project) => {
        const open = openTitle === project.title;
        const panelId = `project-panel-${project.title.replace(/\W+/g, "-").toLowerCase()}`;
        return (
          <li
            key={project.title}
            className={`xl:min-h-0 max-xl:@max-2xl:mx-auto max-xl:@max-2xl:w-full max-xl:@max-2xl:max-w-sm ${
              open ? "max-xl:@2xl:col-span-2 max-xl:@2xl:mx-auto max-xl:@2xl:w-full max-xl:@2xl:max-w-2xl" : ""
            }`}
          >
            <SpotlightCard
              className={`relative flex h-full -translate-y-1 flex-col overflow-hidden rounded-2xl border bg-[#0e1428]/75 backdrop-blur-md transition duration-300 ease-out @2xl:flex-row xl:flex-row ${
                open
                  ? "border-blue-400/50 shadow-[0_25px_50px_-12px_rgba(7,12,30,0.6),0_0_44px_-6px_rgba(59,130,246,0.5)] hover:border-blue-400/80 focus-within:border-blue-400/60"
                  : "border-[#f5a25d]/40 shadow-[0_25px_50px_-12px_rgba(7,12,30,0.6),0_0_36px_-8px_rgba(245,162,93,0.35)] hover:border-[#f8b67d] hover:shadow-[0_25px_50px_-12px_rgba(7,12,30,0.6),0_0_48px_-4px_rgba(245,162,93,0.65)] focus-within:border-[#f8b67d]"
              }`}
            >
              {/* The full image at its own proportions, so nothing is cropped. The image is the toggle */}
              <button
                type="button"
                onClick={() => toggle(project.title)}
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={`${open ? "Hide" : "Show"} details for ${project.title}`}
                className={`group/image relative block w-full shrink-0 cursor-pointer overflow-hidden bg-[#0b1020] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-400 xl:h-full xl:w-auto ${
                  open ? "@2xl:max-xl:w-60" : ""
                }`}
                style={{ aspectRatio: `${project.image.width} / ${project.image.height}` }}
              >
                <Image
                  src={project.image}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 100vw"
                  className="scale-[1.04] object-cover transition-transform duration-500 ease-out group-hover/image:scale-[1.08]"
                />
              </button>
              {/* A closed card says it can be opened with an amber edge (the Contact nav's orange) that pulses softly. On hover or focus the pulse crossfades to a steady, much brighter edge. Both layers sit inside the card border, above the image, and ignore the pointer so clicks reach the button */}
              {!open && (
                <>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0"
                  >
                    <span className="absolute inset-0 rounded-[inherit] opacity-60 shadow-[inset_0_0_0_1px_rgba(245,162,93,0.7),inset_0_0_22px_rgba(245,162,93,0.28)] animate-edge-pulse motion-reduce:animate-none" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 shadow-[inset_0_0_0_2px_rgba(248,182,125,0.95),inset_0_0_30px_rgba(245,162,93,0.5)] transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                  />
                </>
              )}
              {/* Copy panel. Below xl it appears and disappears; on xl its width animates so the row grows and shrinks. The title link stretches over the panel (not the image, which toggles), and the description drops out on short screens, where the card is small. inert keeps a closed panel's link out of the tab order */}
              <div
                id={panelId}
                inert={!open}
                className={`flex min-w-0 overflow-hidden xl:flex-none xl:transition-[width] xl:duration-300 xl:ease-out ${
                  open ? "flex-1 xl:w-[var(--panel-w)]" : "max-xl:hidden xl:w-0"
                }`}
              >
                <div className="group/panel relative flex min-w-0 flex-1 flex-col justify-center gap-3 border-t border-white/10 bg-[#0b1020]/60 p-5 @2xl:border-l @2xl:border-t-0 xl:w-[var(--panel-w)] xl:flex-none xl:border-l xl:border-t-0">
                  <h3 className="text-xl font-semibold leading-tight tracking-tight text-white">
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="after:absolute after:inset-0 focus-visible:outline-none"
                    >
                      {project.title}
                    </a>
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300 xl:[@media(max-height:820px)]:hidden">
                    {project.description}
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-blue-400/25 bg-blue-500/10 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-[#9cc3ff]"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9cc3ff] transition-colors group-hover/panel:text-white">
                    View on GitHub
                    <ArrowUpRight className="size-3.5 transition duration-300 group-hover/panel:-translate-y-0.5 group-hover/panel:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </li>
        );
      })}
    </ul>
  );
}
