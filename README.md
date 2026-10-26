# Caleb Palmquist — Portfolio

Personal portfolio site for Caleb Palmquist, an AI engineer. It presents featured projects over a full-bleed background image and includes BEAM-E, a streaming AI assistant that answers questions about Caleb's work.

Built with Next.js (App Router), React, TypeScript, Tailwind CSS v4, and the Vercel AI SDK.

## Features

- Hero section with headline and call to action
- Featured work grid with tech tags and GitHub links
- Full-bleed background image
- Responsive layout: single column on small screens, two-column hero on large screens
- BEAM-E chat assistant that streams answers, with a model picker (Claude Haiku 5.5 or GPT 5.6 Luna)
- Layered safeguards on the chat endpoint (see [Chat safeguards](#chat-safeguards))

## Requirements

- Node.js 22.18 or newer (the guard tests run TypeScript directly; Next.js 16 itself needs 20.9+)
- npm (the repo includes `package-lock.json`)
- An Anthropic and/or OpenAI API key for the chat assistant
- [ffmpeg](https://ffmpeg.org/) on your PATH, only for `npm run optimize-video`

## Getting Started

```bash
git clone <repo-url>
cd cpalmdotco
npm ci
```

Create a `.env` file with the keys for the providers you want to use:

```
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

Then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The page reloads as you edit files in `src/`.

## Scripts

| Command         | Description                                              |
| --------------- | -------------------------------------------------------- |
| `npm run dev`   | Start the development server                             |
| `npm run build` | Create a production build (includes the TypeScript check) |
| `npm start`     | Serve the production build (run `npm run build` first)   |
| `npm run lint`  | Lint the project with ESLint                             |
| `npm run check:guard` | Run the chat guard against its allow and block cases |
| `npm run optimize-video -- <file.mp4>` | Convert an MP4 into web-optimized WebM and MP4 files (see below) |

### Optimizing videos

Put source MP4s in a `raw` folder under `public/` (these are gitignored for `public/beame/raw`) and run:

```bash
npm run optimize-video
```

Every `.mp4` in each `public/**/raw` folder is converted to `<name>.webm` (VP9) and `<name>-opt.mp4` (H.264, faststart) in the folder above it, with the name made URL-safe (`BEAM-E Send Data.mp4` becomes `beam-e-send-data`). Output is silent, capped at 1280px wide and 24 fps. Files whose outputs already exist and are newer than the source are skipped; use `--force` to redo them.

You can also pass specific files or folders, e.g. `npm run optimize-video -- clip.mp4 --out public --poster`. Run with `--help` for width, fps, quality, trim, and output options.

## Project Structure

```
src/app/
  layout.tsx            Root layout, fonts, and page metadata
  page.tsx              Home page: hero, chat panel, and featured work
  chat-panel.tsx        Chat UI: streaming replies, model picker, client-side screening
  api/chat/route.ts     Chat endpoint: origin check, limits, screening, model call
  globals.css           Tailwind import and base styles
src/lib/
  chat-guard.ts         Message screening (injection, abuse, spam, gibberish, and more)
  chat-limits.ts        Per-visitor rate limits, lockouts, and the daily model-call cap
  same-origin.ts        Rejects requests that don't come from this site
  models.ts             Models the chat can run on (shared by the picker and the route)
src/content/            Resume and project write-ups sent to the model as context
scripts/
  check-chat-guard.mjs  Allow and block cases for the chat guard
  optimize-video.mjs    Video conversion helper
public/                 Images, video, and other static assets
next.config.ts          Next.js configuration
```

## Chat assistant

BEAM-E answers questions about Caleb using only the resume and project write-ups in `src/content/`, which are placed in the system prompt. It is not a retrieval system: everything it knows is in that prompt, and it is told to say so when something isn't covered. Replies stream to the browser as plain text.

### Chat safeguards

Every request to `/api/chat` passes through these checks, in order, before any model is called:

1. **Same-origin check** (`same-origin.ts`): requests that don't come from a page on this site get a 403.
2. **Per-visitor rate limits** (`chat-limits.ts`): 8 requests per minute and 60 per hour, plus a 10-minute lockout for visitors who keep sending blocked messages.
3. **Request validation**: capped body size, message count, and message length, and the model must be one of the listed ids.
4. **Message screening** (`chat-guard.ts`): rejects prompt-injection attempts, abuse, illegal requests, spam and links, gibberish, and off-topic requests such as homework. It normalizes input first, so tricks like leetspeak, zero-width characters, and spaced-out letters don't slip through. The same rules run in the browser for instant feedback and on the server as the authoritative check. A blocked message never reaches the model.
5. **Daily spend cap** (`chat-limits.ts`): a site-wide ceiling on model calls per day.

Limits and caveats:

- The screening is heuristic. It is tuned to avoid blocking honest questions about a portfolio, and it will not catch everything.
- Rate-limit and cap state lives in memory on each server instance. That slows a script hammering one instance, but a serverless host may run several instances and restarts reset the counts. A shared store such as Upstash or Vercel KV is the upgrade for hard guarantees.
- The same-origin check stops other websites from using the endpoint through their visitors' browsers. It does not stop a script or curl, which can send any headers.

### Environment variables

| Variable | Purpose |
| -------- | ------- |
| `ANTHROPIC_API_KEY` | Key for the Claude models |
| `OPENAI_API_KEY` | Key for the OpenAI models |
| `CHAT_DAILY_LIMIT` | Site-wide model calls per day (default 2000) |
| `CHAT_ALLOWED_ORIGINS` | Extra allowed origins, comma separated, for example a separate staging front end |

### Testing

`npm run check:guard` runs `scripts/check-chat-guard.mjs`, which checks the guard against messages it must allow (including tricky honest questions like "I hacked together a prototype last week") and messages it must block. CI runs it on every push and pull request, along with the type check and lint.

## Customizing

- **Projects:** edit the `PROJECTS` array in `src/app/page.tsx`. Each entry sets the title, description, tags, thumbnail image, and GitHub link.
- **What the assistant knows:** edit the files in `src/content/`.
- **Models:** edit `CHAT_MODELS` in `src/lib/models.ts`. The first entry is the default.
- **Suggested chat prompts:** edit `CHAT_PROMPTS` in `src/app/chat-panel.tsx`.
- **Navigation:** edit `NAV_LINKS` and `ACTIVE_LINK` in `src/app/page.tsx`.
- **Site title and description:** edit `metadata` in `src/app/layout.tsx`.
- **Background:** replace `public/distance.jpg`.

## Development Notes

- `next.config.ts` sets `allowedDevOrigins` to `192.168.*.*`, so the dev server can be reached from other devices on your local network (for example, a phone). This setting only applies to `npm run dev`.
- Files in `public/` get a content hash appended as `?v=` (via `asset()` in `src/lib/asset.ts`) and are cached for a year, so an edited file is never served stale. Each deployment also gets its own id so open tabs reload instead of mixing old and new bundles.

## Deployment

The simplest option is [Vercel](https://vercel.com/new), which detects Next.js automatically. Add the environment variables above in the project settings. To run it on any other Node.js host:

```bash
npm ci
npm run build
npm start
```

The app listens on port 3000 by default.

## Credits

- Typography: [Geist](https://vercel.com/font) by Vercel, loaded with `next/font`.
