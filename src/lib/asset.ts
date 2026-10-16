const versions: Record<string, string> = JSON.parse(
  process.env.NEXT_PUBLIC_ASSET_VERSIONS ?? "{}",
);

/**
 * URL for a file in `public/`, with its content hash appended as `?v=` so
 * browsers and CDNs refetch it whenever the file changes. The hash manifest is
 * built in `next.config.ts`. Unknown paths are returned unchanged.
 *
 *   asset("/background.webm") // "/background.webm?v=3f9a1c2b"
 */
export function asset(path: string) {
  const version = versions[path];
  return version ? `${path}?v=${version}` : path;
}
