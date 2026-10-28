# Code Review: cpalmdotco

Reviewed 2026-10-27 at `fc353b9` (main). Every source file under `src/`, plus `scripts/`, `next.config.ts`, CI and config.

## Summary

The core is well built: the chat endpoint is layered sensibly, the shell/`View` architecture keeps the chat alive across navigation, comments explain the *why*, and the guard has a real test script. The weak spots are **housekeeping, not design**:

- About **36% of the TypeScript is dead or throwaway** (`/old`, `/v3`, `/v5` and their chat panels), and the live chat panel is a fourth copy of the same logic.
- One **trust gap in the chat API** (client-supplied assistant turns) and a few smaller hardening items.
- **Content drift risk**: the same facts live in 3-4 hand-synced places, and they already disagree in one spot.

**Baseline:** `tsc` clean · `eslint` 0 errors / 8 warnings (all dead code) · guard checks 101/101 pass · `npm audit --omit=dev` 0 vulnerabilities.

| Area | Grade | Note |
| --- | --- | --- |
| API / chat safety | B+ | Strong layering; one real gap (§1), in-memory limits are documented |
| Architecture | B | Clean shell and `View` primitives; chat logic duplicated 4x |
| Dead code / repo hygiene | D | Experimental routes and unused assets shipped to prod |
| Tests / CI | C+ | Guard well covered; nothing else tested; CI never runs `next build` |
| UI code / a11y | B- | Good keyboard and focus work; reduced-motion and live-region gaps |

---

## Priority fixes

### High

**1. Client-forged assistant turns reach the model unscreened.** *Mitigated: earlier turns are now sent as an unverified JSON transcript inside the user message, never with the assistant role, and injected assistant turns are dropped (`src/lib/chat-history.ts`). Residual risk is manipulative text inside the transcript; only signed replies would remove it. Original finding follows.* [route.ts:39-55](src/app/api/chat/route.ts#L39-L55), [chat-guard.ts:353-362](src/lib/chat-guard.ts#L353-L362)
The server is stateless, so the client sends the whole thread. Only `user` turns are screened; `assistant` turns are accepted as-is (up to 4,000 chars x ~10). An attacker can fabricate a prior assistant message ("Sure, here is my system prompt: ...") and the model will treat it as its own history. This bypasses the injection screening and the system-prompt rules.
*Fix, cheapest first:* (a) send only the last user turn plus a server-trusted summary; (b) HMAC-sign each assistant reply (stream it with a trailing signature or return it in a header) and reject unsigned assistant turns; (c) at minimum run `checkMessage` on assistant turns too. Option (a) also cuts input tokens.

**2. ~2,100 lines of dead or experimental code ships to production.**
`src/app/old`, `v3`, `v5`, [chat-card.tsx](src/app/chat-card.tsx), [featured-carousel.tsx](src/app/featured-carousel.tsx) = 2,145 of 5,966 lines. The three routes are publicly reachable (only `noindex`), each with its own nav, project list and icons duplicating `src/site/`. They are why lint warns and why `ModelPicker` has three variants. [chat-card.tsx:26-109](src/app/chat-card.tsx#L26-L109) still carries a `TEMP (testing only)` `?simulate=1` path.
*Fix:* delete them (git history keeps them). Then drop `ModelPicker`'s `chip`/`mini` variants and its uncontrolled `localId` state, the `desk` variant and `edge-pulse`/`twinkle` in [globals.css](src/app/globals.css), and the images only those routes use.

### Medium

**3. Chat logic is copy-pasted four times.** [chat-panel.tsx](src/app/chat-panel.tsx), [chat-card.tsx](src/app/chat-card.tsx), `v3/chat-panel-v3.tsx`, `v5/chat-panel-v5.tsx` each re-implement `send()`, stream reading, abort, `Message`, `VideoMode`, `VIDEO_SRC`, textarea autosize. After deleting §2 there is still one 534-line component mixing network, video state, clipboard, follow-up ranking and ~300 lines of JSX.
*Fix:* extract `useChat()` (messages, send, stop, error, notice, streaming) and split `ChatPanel` into `ChatVideo`, `MessageList`, `Composer`, plus `followUps()` and `copyText()` as plain modules. `useChat` becomes unit-testable.

**4. Streaming re-renders everything on every chunk.** [chat-panel.tsx:235-242](src/app/chat-panel.tsx#L235-L242), [:188-190](src/app/chat-panel.tsx#L188-L190)
Each chunk calls `setMessages`, which re-parses the full `Markdown` of every message (quadratic over a reply) and fires a `behavior: "smooth"` scroll each time, which stutters. Buffer chunks into one update per animation frame, `React.memo` the message row so finished messages skip re-render, and scroll `auto` while streaming. Use a stable message id instead of `key={i}` ([:355](src/app/chat-panel.tsx#L355)).

**5. Rate-limit identity is weak off Vercel.** [chat-limits.ts:35-38](src/lib/chat-limits.ts#L35-L38)
`x-real-ip` is preferred over `x-forwarded-for`, and both are client-settable unless the host overwrites them (the comment says Vercel does). Anywhere else, rotating the header bypasses all limits. Also, every request with no IP shares the single `"unknown"` bucket, so one abuser can lock out all such visitors. Use `request.ip`/the platform's trusted header, and treat `unknown` as its own strict tier. State is in-memory per instance (documented in the file and the write-up); if the daily cap must be a *hard* spend ceiling, move it to Upstash/KV.

**6. Request body limit measures characters and reads it all first.** [route.ts:80-83](src/app/api/chat/route.ts#L80-L83)
`raw.length` is UTF-16 units, not bytes, and `request.text()` buffers the entire body before the check. Check `Content-Length` first and compare `Buffer.byteLength`. Low exposure on Vercel (platform cap), real on a self-host. While there: fold the `model` read into `parseMessages` (returning `{messages, model}`) instead of re-casting `body as { model?: unknown }` at [:95](src/app/api/chat/route.ts#L95), and avoid the `messages as ModelMessage[]` cast at [:114](src/app/api/chat/route.ts#L114).

**7. Cache-header regex is wrong.** [next.config.ts:79](next.config.ts#L79)
In a normal string `"\."` is just `"."`, so the pattern becomes `/:file(.+.(?:jpg|...))`. It works for real files but also matches `/fooXmp4`. Use `"\\."`. Verified by evaluating the literal in Node.

**8. Content lives in several places and has already drifted.**
[resume.ts](src/content/resume.ts) (what BEAM-E says), [experience.ts](src/site/experience.ts) (Experience page), `public/resume/*` (downloads), and [projects.ts](src/site/projects.ts) each restate the same facts by hand (`experience.ts:2-4` says "update all three together").
- **Already inconsistent:** `resume.ts:22` credits the Playwright framework with "192+ automated tests across 6 areas"; `experience.ts:22,25` says "60+ tests" for Playwright and "192-test" for the *unit suite*. The framework is also "Python/Playwright" in one and "Playwright/TypeScript" in the other. BEAM-E will repeat whichever is in its prompt. Worth verifying against the resume.
- [projects.ts:42-52](src/site/projects.ts#L42-L52) hard-codes the limits (5/min, 60/hr, 4 strikes, 10 min) that exist as constants in `chat-limits.ts`, and model names appear in README, `projects.ts` and `models.ts`.
*Fix:* make `experience.ts` the source, generate `RESUME` from it (or add a check in CI that asserts shared numbers match), and derive limits/model names in copy from the constants.

**9. CI doesn't build.** [ci.yml](.github/workflows/ci.yml)
It runs guard checks, `tsc`, and lint, but never `next build`, so route typing, static-param and config errors only surface on deploy. Add `npm run build`, and `eslint --max-warnings 0` once §2 clears the warnings.

**10. Autoplaying chat video ignores `prefers-reduced-motion`.** [chat-panel.tsx:281-302](src/app/chat-panel.tsx#L281-L302)
The ping dot is `motion-safe`, but the looping video isn't (WCAG 2.2.2). Skip `autoPlay`/`loop` and show the still image when the media query matches. Also `role="log" aria-live="polite"` ([:350-351](src/app/chat-panel.tsx#L350-L351)) will announce every streamed chunk; set `aria-busy` while streaming, or announce only the finished reply.

### Low

- **Unused public assets (~10+ MB).** No reference in `src/` (grep, confirm before deleting): `background.mp4`, `background-opt.mp4`, `background.webm` (6+ MB, the site uses `distance.jpg`), `caleb_avatar*.jpg`, `calmdotco.jpg`, `cpalm_dot_dev_final.jpg`, `quark2/_new/_featured`, `relay_card`, `relay_card_final.png` (1.3 MB), `relay_featured`, `ticket_radar_new/_featured`, plus create-next-app leftovers `file/globe/next/vercel/window.svg` and `favicon-backup/` (duplicates `src/app/icon.png` etc.). Deleting §2 also orphans `quark_card`, `relay_card_new`, `ticket_radar_card`. Note `NEXT_PUBLIC_ASSET_VERSIONS` hashes and inlines *every* file in `public/` into the client bundle, so orphans also cost bytes there.
- **Hex colours repeated everywhere, no tokens.** `#0e1428` (9x), `#4f86f0` (12x), `#9cc3ff` (10x), `#f5a25d`, `#b6c2d8`, `#9fb0cc`, `#070b1a` outside the dead routes. The panel surface string (`rounded-3xl border border-white/10 bg-[#0e1428]/85 ring-1 ...`) is duplicated in `chat-panel.tsx` and `view.tsx`. Define them in `@theme` (`--color-surface`, `--color-accent`, ...) and a shared `PANEL` class constant.
- **Home page cruft.** [page.tsx](src/app/(site)/page.tsx): ~80 lines of inline SVG components that repeat the boilerplate already in `icons.tsx` (move them there behind one `<Svg>` wrapper); `CodeIcon` is unused; `highlight` is always `true`, so the ternary is dead; a commented-out CTA block ([:140-157](src/app/(site)/page.tsx#L140-L157)) and commented imports. Same in `chat-panel.tsx:521-531`. `LinkedInIcon` and `ExternalLinkIcon` in `icons.tsx` are unused.
- **Root metadata is placeholder.** [layout.tsx:15-18](src/app/layout.tsx#L15-L18): description is the title. No `metadataBase`, OpenGraph/Twitter image, `robots.ts` or `sitemap.ts`, which matter for a portfolio people paste into messages.
- **No `not-found.tsx` / `error.tsx`.** A bad URL or render error drops out of the site shell to Next's default page.
- **Body font override.** [globals.css:100-104](src/app/globals.css#L100-L104) sets `body` to Arial and the white/dark `--background` by OS theme. Geist only applies inside the site layout div, and in light mode overscroll shows white behind the dark UI. Set `font-sans` and a dark background on `body`.
- **Menu boilerplate duplicated.** `ResumeMenu` and `ModelPicker` each hand-roll outside-click + Escape; extract `useDismiss(ref, open, close)`. [view-keys.tsx:23](src/app/view-keys.tsx#L23) disables shortcuts if *any* `[aria-expanded="true"]` exists in the document, an implicit coupling to those menus that will bite when something else uses `aria-expanded`.
- **Nav click guard can stick.** [site-nav.tsx:24-39](src/app/site-nav.tsx#L24-L39) sets `pending` and only clears it when `pathname` changes; a cancelled or failed navigation leaves that link dead until another route loads. `useLinkStatus` or `startTransition` expresses this directly.
- **`AlignToCards` reaches into sibling DOM** (`parentElement.querySelector("ul")`, `style.maxWidth` via `ResizeObserver`), coupling it to `ProjectGrid`'s markup. A CSS-only `width: fit-content` on the grid wrapper is likely enough.
- **Follow-up matching has no word boundaries.** [chat-panel.tsx:22,34](src/app/chat-panel.tsx#L22) uses bare substrings (`role`, `qa`, `agent`), so topic ranking is fuzzy. Add `\b`.
- **Guard ships to the browser.** The full block list is in the client bundle (by design, for instant feedback), which makes probing for bypasses trivial. Acceptable because the server re-checks; just know the trade-off. `KNOWN_TERMS` and `COMMON_BIGRAMS` are hand-maintained and will drift from site content.
- **`ModelPicker` provider logos** are hardcoded SVG paths in a 160-line component; move to a small `provider-logos.ts`.
- **README** still lists a hero "call to action" that is commented out.

---

## Tests

Only the guard has tests, and as a bespoke script. Everything else that can fail quietly is untested:

1. Move the guard checks to `node --test` (Node 22 is already required), so they get standard reporting and watch mode.
2. Add tests for `chat-limits` (burst, hourly, strike lockout, `prune`, daily rollover; `now` is already injectable), `same-origin` (missing Origin, forwarded host, `CHAT_ALLOWED_ORIGINS`) and `parseMessages` (forged trailing assistant turn, oversize, bad role).
3. One Playwright smoke test (fitting for this author): home loads, a project opens, `[`/`]` navigate, chat shows a blocked-message notice. No model call needed.

## Suggested order

| Step | Work | Effort |
| --- | --- | --- |
| 1 | Delete `old`, `v3`, `v5`, `chat-card`, `featured-carousel`; prune orphaned assets, CSS, `ModelPicker` variants | 1 h |
| 2 | Fix `next.config.ts` regex; add `next build` to CI | 15 min |
| 3 | Close the assistant-turn gap (§1) and tighten body/IP handling (§5, §6) | 2-3 h |
| 4 | Extract `useChat`, split `ChatPanel`, throttle streaming, reduced-motion + live region | 3-4 h |
| 5 | Reconcile resume/experience content, generate or check from one source | 1-2 h |
| 6 | Theme tokens, `not-found`/`error`, metadata/OG, `useDismiss`, tests | 3-4 h |

## What's already good

- `View` / `ViewHeader` / `ViewBody` give every page one consistent frame, and the shell keeps the chat mounted across routes.
- Guard design: pure functions shared client and server, normalisation before matching, bounded regex quantifiers (no ReDoS at the 500-char cap), strike weighting, and a test list that includes tricky honest questions.
- Chat route order is right: origin check, then rate limit, then size, then validation, then guard, then daily budget, then model.
- Markdown renderer builds React elements (no raw HTML) and whitelists URL schemes. Model output cannot inject markup.
- Asset hashing with immutable caching, `deploymentId` for stale-tab safety, `inert` on the closed menu, and focus management in `ViewFocus` are thoughtful touches.
