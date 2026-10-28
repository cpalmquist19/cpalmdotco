import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/site/projects";
import { ArrowRight } from "./icons";
import { SpotlightCard } from "./spotlight-card";

const rowRatio = (projects: Project[]) =>
  projects.reduce((sum, { image }) => sum + image.width / image.height, 0);

/**
 * The featured project cards. Each card is its image alone; clicking it opens that project's write-up at
 * /projects/[slug], which replaces the left column while the chat stays where it is.
 *
 * Below xl the cards stack in one column, two across from @2xl. On xl they run in one row that fills the height
 * left under the hero, and each image keeps its own proportions at that height.
 */
export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    // The max height keeps the row inside the column: at height H the images are H * (sum of aspect ratios) wide,
    // plus the gaps and borders (--row-extra), so on tall screens the row stops growing instead of running under the chat panel
    <ul
      data-card-list // AlignToCards finds the cards by this
      style={
        {
          "--row-ratio": rowRatio(projects),
          "--row-extra": `calc(${projects.length - 1}rem + ${projects.length * 2}px)`,
        } as React.CSSProperties
      }
      className="grid gap-4 @2xl:grid-cols-2 xl:flex xl:min-h-0 xl:max-h-[calc((100cqw_-_var(--row-extra))/var(--row-ratio))] xl:flex-1 xl:transition-[max-height] xl:duration-300 xl:ease-out"
    >
      {projects.map((project) => (
        <li
          key={project.slug}
          className="xl:min-h-0 max-xl:@max-2xl:mx-auto max-xl:@max-2xl:w-full max-xl:@max-2xl:max-w-sm"
        >
          <SpotlightCard
            spotlightRadius={180}
            className="relative flex h-full -translate-y-1 flex-col overflow-hidden rounded-2xl border border-cta/40 bg-surface/75 shadow-[0_25px_50px_-12px_rgba(7,12,30,0.6),0_0_36px_-8px_rgba(245,162,93,0.35)] backdrop-blur-md transition duration-300 ease-out hover:border-cta-hover hover:shadow-[0_25px_50px_-12px_rgba(7,12,30,0.6),0_0_48px_-4px_rgba(245,162,93,0.65)] focus-within:border-cta-hover @2xl:flex-row xl:flex-row"
          >
            {/* The full image at its own proportions, so nothing is cropped. The image is the link */}
            <Link
              href={`/projects/${project.slug}`}
              aria-label={`${project.title}: read the write-up`}
              className="group/image relative block w-full shrink-0 overflow-hidden bg-[#0b1020] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-400 xl:h-full xl:w-auto"
              style={{ aspectRatio: `${project.image.width} / ${project.image.height}` }}
            >
              <Image
                src={project.image}
                alt=""
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 100vw"
                className="scale-[1.04] object-cover transition-transform duration-500 ease-out group-hover/image:scale-[1.08]"
              />
              {/* Says the card opens something, in the art's empty top-right corner. Always shown, since touch screens have no hover */}
              <span
                aria-hidden="true"
                className="absolute right-3 top-3 z-20 flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors duration-300 group-hover/image:border-cta-hover group-hover/image:bg-cta group-hover/image:text-cta-ink group-focus-visible/image:border-cta-hover group-focus-visible/image:bg-cta group-focus-visible/image:text-cta-ink"
              >
                <ArrowRight className="size-4 transition-transform duration-300 group-hover/image:translate-x-0.5" />
              </span>
            </Link>
          </SpotlightCard>
        </li>
      ))}
    </ul>
  );
}
