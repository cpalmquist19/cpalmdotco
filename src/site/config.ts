// Site-wide links and the navigation. The nav is data so the desktop pill, the mobile row and any
// future footer all render from one list, and the active state is derived from the route.

export const GITHUB_URL = "https://github.com/cpalmquist19";
export const LINKEDIN_URL = "https://www.linkedin.com/in/calebfrommaine";

// Where the site lives. Link previews and the sitemap need absolute addresses, so they are built from this
export const SITE_URL = "https://www.cpalm.dev";
export const SITE_NAME = "Caleb Palmquist";
export const SITE_TITLE = "Caleb Palmquist | AI Quality Engineer";
export const SITE_DESCRIPTION =
  "AI quality engineer who builds and evaluates LLM agents. Browse my projects and experience, or ask BEAM-E, a live AI assistant, about my work.";

export type NavItem =
  // A page of this site. `paths` are the routes it is active on, where a path also covers its children ("/projects" covers "/projects/relay")
  | { kind: "route"; label: string; href: string; paths: string[] }
  // The resume dropdown, which downloads files rather than navigating
  | { kind: "resume"; label: string }
  // A link out of the site. `cta` marks the highlighted one
  | { kind: "external"; label: string; href: string; cta?: boolean };

export const NAV: NavItem[] = [
  { kind: "route", label: "Projects", href: "/#projects", paths: ["/", "/projects"] },
  { kind: "route", label: "Experience", href: "/experience", paths: ["/experience"] },
  { kind: "route", label: "Skills", href: "/skills", paths: ["/skills"] },
  { kind: "resume", label: "Resume" },
  { kind: "external", label: "LinkedIn", href: LINKEDIN_URL, cta: true },
];

export function isActive(paths: string[], pathname: string) {
  return paths.some((path) => (path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`)));
}
