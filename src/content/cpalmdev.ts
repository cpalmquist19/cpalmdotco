// Project description sent to the chat model as part of its system prompt. Written from the cpalm.dev write-up in
// src/site/projects.ts and the README, so keep the three in step: the numbers here are checked against src/lib.
export const CPALMDEV = `Portfolio site and BEAM-E
Site: cpalm.dev
Code: https://github.com/cpalmquist19/cpalmdotco
Live: https://www.cpalm.dev
Tags: Next.js, TypeScript, LLM, AI Safety

What it is:
This portfolio site, and BEAM-E, the streaming assistant the visitor is talking to right now. It is a small production-style app: a live deployment, a test suite, CI, and written limits. It is built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 and the Vercel AI SDK with Anthropic and OpenAI providers, and hosted on Vercel with Vercel Analytics.

How BEAM-E works:
- It answers using only Caleb's resume and project write-ups, which are placed in its system prompt. It is not a retrieval system: everything it knows is in that prompt, and it is told to say so when something isn't covered. Replies stream to the browser as plain text.
- Visitors choose Claude Haiku 5.5 (the default) or GPT 5.6 Luna. The model is picked on the server from an allowlist of model IDs, so a request can't name any other model.
- The conversation is kept in the visitor's browser. Earlier turns are sent back inside the visitor's message as an unverified transcript, never with the assistant role, and any earlier assistant turn that reads like a prompt injection is left out. That way a forged "assistant" message can't make the model think it already broke its rules.
- The resume part of its knowledge is generated from a single source file by a script (npm run resume:sync) that also rebuilds the resume downloads and the Experience and Skills pages. The script redacts Caleb's phone number and email first, then searches every output for what it removed and stops if anything got through.

Safeguards before a message reaches the model:
Every request to the chat endpoint passes these checks, in order, before any model is called. A blocked message never reaches the model.
1. Same-origin check: requests that don't come from a page on this site are refused.
2. Per-visitor rate limits: 5 requests a minute and 60 an hour, counting every request, including ones the screening later blocks. Blocked messages also add strike points: 2 for abuse, illegal requests and injection attempts, 1 for spam, gibberish and off-topic, and 0 for empty, too-long and self-harm messages. Reaching 4 points within 10 minutes locks the visitor out for 10 minutes, so two serious blocked messages are enough.
3. Request validation: capped body size (40 KB), message count (20) and message length (500 characters for the visitor), and the model must be on the list.
4. Message screening for prompt injection, abuse, illegal requests, spam and links, gibberish, and off-topic requests such as homework. Input is normalized first, so leetspeak, zero-width characters and spaced-out letters don't slip through. The same rules run in the browser for instant feedback and on the server as the authoritative check.
5. A site-wide daily cap on model calls (2,000 by default, set by an environment variable), so spend has a ceiling even if everything else fails.

Testing and CI:
- A script runs the screening against 100+ messages it must allow and block. The allow cases include tricky honest questions like "I hacked together a prototype last week", because blocking too much counts as a failure too.
- Playwright browser tests cover the site with the chat endpoint mocked, so no API key or model call is needed.
- One GitHub Actions workflow runs the guard tests, the type check, lint with zero warnings allowed, the production build and the Playwright tests on every push and pull request.

Product details:
- Responsive from a 360px phone to a 3440px ultrawide display, with a set of 22 screenshots across device sizes. The chat stays mounted as the visitor moves between pages. It also has generated link-preview cards, a sitemap, and cache-busted static assets.

How it was built and Caleb's role:
Caleb built most of the repo with Claude Code. He set the requirements, made the design calls, reviewed the output and tested the result, and he is open about that. The git history shows it: commits carry a co-author line.

Limits and next steps:
- The screening is heuristic. It is tuned to avoid blocking honest questions about a portfolio, and it won't catch everything.
- Rate-limit and daily-cap state lives in memory on each server instance, so a serverless host running several instances, or a restart, resets the counts. A shared store such as Upstash or Vercel KV is the upgrade for hard guarantees.
- The same-origin check stops other websites from using the endpoint through their visitors' browsers. It doesn't stop a script or curl, which can send any headers.`;
