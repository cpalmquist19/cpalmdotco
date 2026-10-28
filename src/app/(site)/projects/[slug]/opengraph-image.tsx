import { ogCard } from "@/lib/og-card";
import { PROJECTS, findProject } from "@/site/projects";

export const alt = "A project by Caleb Palmquist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return PROJECTS.map(({ slug }) => ({ slug }));
}

// The card art for each project, as a file in public/. A project without an entry here gets the BEAM-E picture
const CARD_FILES: Record<string, string> = {
  "cpalm-dev": "cpalm_dot_dev_minimal.jpg",
  relay: "relay_agent_card_minimal.jpg",
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = findProject(slug);
  const file = CARD_FILES[slug];

  return ogCard({
    eyebrow: "Project",
    title: project?.title ?? "Caleb Palmquist",
    subtitle: project?.tags.join(" · ") ?? "",
    picture:
      project && file
        ? { file, aspect: project.image.width / project.image.height }
        : { file: "beame/BEAM-E.jpg", aspect: 1 },
  });
}
