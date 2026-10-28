import { ogCard } from "@/lib/og-card";

// The preview for the whole site. A page with its own opengraph-image, like a project's, replaces it
export const alt = "Caleb Palmquist, AI quality engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Portfolio",
    title: "Caleb Palmquist",
    subtitle: "AI quality engineer. I build and evaluate LLM agents.",
    picture: { file: "beame/BEAM-E.jpg", aspect: 1 },
  });
}
