import type { Metadata } from "next";
import { SKILLS } from "@/site/experience";
import { TONE_NAMES, TagList, View, ViewBody, ViewHeader } from "../../view";

export const metadata: Metadata = {
  title: "Skills",
  description: "Languages, AI and LLM tooling, web frameworks, test automation, data, and CI/CD tools Caleb Palmquist works with.",
};

export default function SkillsPage() {
  const titleId = "skills-title";

  return (
    <View labelledBy={titleId}>
      <ViewHeader back={{ href: "/", label: "Home" }} />
      <ViewBody>
        <header className="flex max-w-3xl flex-col gap-3">
          <h1 id={titleId} className="text-3xl font-semibold tracking-tight">
            Skills
          </h1>
          <p className="text-base leading-relaxed text-slate-300">
            What I work with day to day, from the AI systems I build to the tools I test them with.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {SKILLS.map(({ group, items }, i) => {
            // Each group gets its own syntax color, in the order of the theme's palette
            const tone = TONE_NAMES[i % TONE_NAMES.length];
            return (
              <section key={group} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h2 className="text-base font-semibold tracking-tight text-white">{group}</h2>
                <TagList tags={items} variant="chip" tone={tone} />
              </section>
            );
          })}
        </div>
      </ViewBody>
    </View>
  );
}
