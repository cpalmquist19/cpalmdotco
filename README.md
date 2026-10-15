# Caleb Palmquist — Portfolio

Personal portfolio site for Caleb Palmquist, an AI engineer. It presents featured projects over a full-bleed background video and includes a chat panel meant to answer questions about Caleb's work.

Built with Next.js (App Router), React, TypeScript, and Tailwind CSS v4.

## Features

- Hero section with headline and call to action
- Featured work grid with tech tags and GitHub links
- Background that shows a still image and fades in a short video once it is playing, then fades back to the image
- Responsive layout: single column on small screens, two-column hero on large screens
- Chat panel UI (see [Status](#status))

## Requirements

- Node.js 20.9 or newer (required by Next.js 16)
- npm (the repo includes `package-lock.json`)

## Getting Started

```bash
git clone <repo-url>
cd cpalmdotco
npm ci
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

## Project Structure

```
src/app/
  layout.tsx            Root layout, fonts, and page metadata
  page.tsx              Home page: hero, chat panel, and featured work
  background-media.tsx  Background image and video
  globals.css           Tailwind import and base styles
public/                 Images, video, and other static assets
next.config.ts          Next.js configuration
```

## Customizing

- **Projects:** edit the `PROJECTS` array in `src/app/page.tsx`. Each entry sets the title, description, tags, thumbnail image, and GitHub link.
- **Chat prompts:** edit `CHAT_PROMPTS` in `src/app/page.tsx`.
- **Navigation:** edit `NAV_LINKS` and `ACTIVE_LINK` in `src/app/page.tsx`.
- **Site title and description:** edit `metadata` in `src/app/layout.tsx`.
- **Background:** replace `public/distance.jpg` (still image) and `public/background.webm` / `public/background-opt.mp4` (video). The video sources are listed in `src/app/background-media.tsx`.
- **Avatar:** replace `public/caleb_avatar_professional.jpg`.

## Status

The chat panel is a UI preview. Its prompt buttons and input do not send messages yet. The `ai` and `@ai-sdk/anthropic` packages are installed for a planned chat backend but are not used by the code.

## Development Notes

- `next.config.ts` sets `allowedDevOrigins` to `192.168.*.*`, so the dev server can be reached from other devices on your local network (for example, a phone). This setting only applies to `npm run dev`.

## Deployment

The simplest option is [Vercel](https://vercel.com/new), which detects Next.js automatically. To run it on any other Node.js host:

```bash
npm ci
npm run build
npm start
```

The app listens on port 3000 by default.

## Credits

- Typography: [Geist](https://vercel.com/font) by Vercel, loaded with `next/font`.
