import type { Metadata } from "next";
import { EMPLOYER, ROLES, SIDE_PROJECTS, SUMMARY } from "@/site/experience";
import { Bullets, Section, Timeline, TimelineItem, View, ViewBody, ViewHeader } from "../../view";

export const metadata: Metadata = {
  title: "Experience",
  description: SUMMARY,
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  const titleId = "experience-title";

  return (
    <View labelledBy={titleId}>
      <ViewHeader back={{ href: "/", label: "Home" }} />
      <ViewBody>
        <header className="flex max-w-3xl flex-col gap-3">
          <h1 id={titleId} className="text-3xl font-semibold tracking-tight">
            Experience
          </h1>
          <p className="text-base leading-relaxed text-slate-300">{SUMMARY}</p>
        </header>

        <Section heading={EMPLOYER.name}>
          <p className="-mt-2 font-mono text-xs text-faint">
            {EMPLOYER.about} · {EMPLOYER.period}
          </p>
          <Timeline>
            {ROLES.map((role) => (
              <TimelineItem key={`${role.title}-${role.period}`} title={role.title} meta={role.period}>
                <Bullets items={role.highlights} />
              </TimelineItem>
            ))}
          </Timeline>
        </Section>

        <Section heading="Selected AI & evaluation projects">
          <Timeline>
            {SIDE_PROJECTS.map((project) => (
              <TimelineItem key={project.title} title={project.title} meta={project.meta}>
                <Bullets items={project.highlights} />
              </TimelineItem>
            ))}
          </Timeline>
        </Section>
      </ViewBody>
    </View>
  );
}
