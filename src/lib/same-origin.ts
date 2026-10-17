/**
 * Whether a request came from a page served by this site, judged by the browser-set Origin
 * header (Referer as a fallback) against the host the request was addressed to.
 *
 * Browsers always send Origin on cross-site POSTs and scripts on another site cannot change
 * it, so this stops other websites from using this API from their visitors' browsers. It does
 * not stop a script or curl, which can send any headers; that needs rate limits or bot protection.
 *
 * Extra allowed origins (for example a separate staging front end) can be listed in the
 * CHAT_ALLOWED_ORIGINS environment variable, comma separated: "https://staging.example.com".
 */

function originOf(value: string | null) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isSameOrigin(request: Request) {
  const origin = originOf(request.headers.get("origin")) ?? originOf(request.headers.get("referer"));
  if (!origin) return false;

  const extra = (process.env.CHAT_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((entry) => originOf(entry.trim()))
    .filter(Boolean);
  if (extra.includes(origin)) return true;

  // Behind a proxy (Vercel) the public host is in x-forwarded-host
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ?? request.headers.get("host");
  return !!host && new URL(origin).host === host;
}
