import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PROJECTS, findProject, neighbours } from "@/site/projects";
import { ArrowUpRight, GitHubIcon } from "../../../icons";
import { ContentSection, ExternalButton, TagList, View, ViewBody, ViewHeader } from "../../../view";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = findProject((await params).slug);
  return project ? { title: project.title, description: project.description } : {};
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  const { prev, next, position, total } = neighbours(slug);
  const titleId = "project-title";

  return (
    <View key={slug} labelledBy={titleId}>
      <ViewHeader
        back={{ href: "/#projects", label: "All projects" }}
        prev={prev && { href: `/projects/${prev.slug}`, label: prev.title }}
        next={next && { href: `/projects/${next.slug}`, label: next.title }}
        position={`${position} / ${total}`}
      />
      <ViewBody>
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          {/* The card art, at its own proportions */}
          <div
            className="relative w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0b1020] sm:w-32"
            style={{ aspectRatio: `${project.image.width} / ${project.image.height}` }}
          >
            <Image src={project.image} alt="" fill sizes="128px" className="object-cover" priority />
          </div>
          <div className="flex min-w-0 flex-col items-start gap-3">
            <h1 id={titleId} className="text-3xl font-semibold tracking-tight">
              {project.title}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-300">{project.description}</p>
            <TagList tags={project.tags} />
            <div className="mt-1 flex flex-wrap gap-2">
              {project.links.map(({ label, href }) => (
                <ExternalButton key={href} href={href}>
                  <GitHubIcon className="size-4" />
                  {label}
                  <ArrowUpRight className="size-3.5 text-slate-300" />
                </ExternalButton>
              ))}
            </div>
          </div>
        </header>

        {project.sections.map((section) => (
          <ContentSection key={section.heading} section={section} />
        ))}
      </ViewBody>
    </View>
  );
}
