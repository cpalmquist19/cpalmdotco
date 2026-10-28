import type { MetadataRoute } from "next";
import { SITE_URL } from "@/site/config";
import { PROJECTS } from "@/site/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/experience", "/skills", ...PROJECTS.map(({ slug }) => `/projects/${slug}`)];
  return paths.map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}` }));
}
