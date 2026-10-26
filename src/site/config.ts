// Site-wide links and the navigation. The nav is data so the desktop pill, the mobile row and any
// future footer all render from one list, and the active state is derived from the route.

export const GITHUB_URL = "https://github.com/cpalmquist19";
export const LINKEDIN_URL = "https://www.linkedin.com/in/calebfrommaine";

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
  { kind: "external", label: "Contact", href: LINKEDIN_URL, cta: true },
];

export function isActive(paths: string[], pathname: string) {
  return paths.some((path) => (path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`)));
}
