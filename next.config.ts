import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

/**
 * Identifies this deployment. Next.js appends `?dpl=<id>` to its own asset
 * URLs and forces a full reload when an open tab is talking to a newer
 * deployment, so stale tabs never mix old and new bundles.
 */
function getDeploymentId() {
  if (process.env.NEXT_DEPLOYMENT_ID) return process.env.NEXT_DEPLOYMENT_ID;
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA;
  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return Date.now().toString(36);
  }
}

/**
 * Maps every file in `public/` to a short content hash, e.g.
 * `{ "/background.webm": "3f9a1c2b" }`. Files in `public/` keep a stable URL,
 * so browsers and CDNs would otherwise serve old copies after an edit. The
 * `asset()` helper in `src/lib/asset.ts` appends the hash as `?v=`, so the URL
 * only changes when the file's bytes do.
 */
function hashPublicFiles(dir = "public", urlPrefix = ""): Record<string, string> {
  const manifest: Record<string, string> = {};
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const url = posix.join(urlPrefix || "/", name);
    if (statSync(path).isDirectory()) {
      Object.assign(manifest, hashPublicFiles(path, url));
    } else {
      manifest[url] = createHash("sha1")
        .update(readFileSync(path))
        .digest("hex")
        .slice(0, 8);
    }
  }
  return manifest;
}

export default function nextConfig(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    // Let devices on the LAN (phone, other PC) hydrate and use HMR in `next dev`.
    allowedDevOrigins: ["192.168.*.*"],
    // Disabled to rule out stale pages during dev; re-enable if not the cause.
    // cacheComponents: true,
    // partialPrefetching: true,
    ...(isDev ? {} : { deploymentId: getDeploymentId() }),
    env: {
      NEXT_PUBLIC_ASSET_VERSIONS: JSON.stringify(hashPublicFiles()),
    },
    images: {
      // `asset()` adds a `?v=` query to public images; allow it through
      // the image optimizer so each version gets its own optimized copy.
      localPatterns: [{ pathname: "/**" }],
    },
    async headers() {
      return [
        {
          // Versioned public files (`?v=<hash>`) can never change under the
          // same URL, so they are safe to cache for a year.
          source: "/:file(.+\.(?:jpg|jpeg|png|webp|avif|gif|svg|mp4|webm|woff2?))",
          has: [{ type: "query", key: "v" }],
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
      ];
    },
    turbopack: {
      rules: {
        "*.css": {
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
      },
    },
  };
}
