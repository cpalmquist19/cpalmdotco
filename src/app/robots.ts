import type { MetadataRoute } from "next";
import { SITE_URL } from "@/site/config";

export default function robots(): MetadataRoute.Robots {
  return {
    // The chat endpoint is for the page's own use, and crawlers have no business calling it
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
