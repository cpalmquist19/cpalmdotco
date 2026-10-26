import type { StaticImageData } from "next/image";
import calmdotcoCard from "../../public/cpalm_dot_dev_minimal.jpg";
import relayCard from "../../public/relay_agent_card_minimal.jpg";
import { GITHUB_URL } from "./config";

// The projects on the home page and their write-ups at /projects/[slug]. Add one here and both appear.
// The write-ups are display copy. What BEAM-E knows about a project lives in src/content, so keep the two in step

export type Section = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type Project = {
  slug: string;
  title: string;
  // One or two sentences, used on the project's page and as its meta description
  description: string;
  tags: string[];
  // The card art, shown alone on the home page
  image: StaticImageData;
  links: { label: string; href: string }[];
  sections: Section[];
};

export const PROJECTS: Project[] = [
  {
    slug: "cpalm-co",
    title: "cpalm.co",
    description:
      "Portfolio site with BEAM-E, a live AI assistant that answers questions about my work on either Claude or GPT. Messages are screened for injection and abuse before they reach the model, with per-visitor rate limits and a daily spend cap, all backed by a test suite and CI.",
    tags: ["Next.js", "TypeScript", "LLM", "AI Safety"],
    image: calmdotcoCard,
    links: [{ label: "View on GitHub", href: `${GITHUB_URL}/cpalmdotco` }],
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "This site. It presents my projects and includes BEAM-E, a streaming assistant that answers questions about my work. Visitors can run it on Claude Haiku 5.5 or GPT 5.6 Luna.",
          "It's built with Next.js (App Router), React, TypeScript, Tailwind CSS and the Vercel AI SDK.",
        ],
      },
      {
        heading: "How BEAM-E works",
        paragraphs: [
          "BEAM-E answers using only my resume and project write-ups, which are placed in its system prompt. It isn't a retrieval system: everything it knows is in that prompt, and it's told to say so when something isn't covered. Replies stream to the browser as plain text.",
        ],
      },
      {
        heading: "Safeguards before a message reaches the model",
        paragraphs: ["Every request passes these checks, in order, before any model is called:"],
        bullets: [
          "A same-origin check, so requests that don't come from a page on this site are refused.",
          "Per-visitor rate limits: 5 requests a minute and 60 an hour. Blocked messages also add strike points, 2 for abuse, illegal requests and injection attempts and 1 for spam, gibberish and off-topic. Reaching 4 points in 10 minutes locks the visitor out for 10 minutes, so two serious blocked messages are enough.",
          "Request validation: capped body size, message count and message length, and the model must be one on the list.",
          "Message screening for prompt injection, abuse, illegal requests, spam and links, gibberish, and off-topic requests such as homework. Input is normalized first, so leetspeak, zero-width characters and spaced-out letters don't slip through. The same rules run in the browser for instant feedback and on the server as the authoritative check.",
          "A site-wide daily cap on model calls.",
        ],
      },
      {
        heading: "Testing",
        paragraphs: [
          "A script runs the guard against messages it must allow, including tricky honest questions like \"I hacked together a prototype last week\", and messages it must block. CI runs it on every push and pull request, along with the type check and lint.",
        ],
      },
      {
        heading: "Limits",
        bullets: [
          "The screening is heuristic. It's tuned to avoid blocking honest questions about a portfolio, and it won't catch everything.",
          "Rate-limit and cap state lives in memory on each server instance, so a serverless host running several instances, or a restart, resets the counts. A shared store such as Upstash or Vercel KV is the upgrade for hard guarantees.",
          "The same-origin check stops other websites from using the endpoint through their visitors' browsers. It doesn't stop a script or curl, which can send any headers.",
        ],
      },
    ],
  },
  {
    slug: "relay",
    title: "Relay",
    description:
      "Local coding agent with a web UI, plus an eval harness that runs an 11-task test matrix across models and scores pass rate, speed, and cost.",
    tags: ["Python", "LLM", "Agents", "Evals"],
    image: relayCard,
    links: [{ label: "View on GitHub", href: `${GITHUB_URL}/relay` }],
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "A coding agent that runs on my own machine with a web UI, plus an evaluation harness that measures how well different models use the agent's tools. It started life as lm-studio-chat and was renamed Relay.",
          "It's where I apply my QA background to AI agents: building the agent, then testing it.",
        ],
      },
      {
        heading: "The agent",
        bullets: [
          "Runs against a model in LM Studio on my own machine, or against OpenAI, Anthropic (Claude), Google Gemini, or a local Unsloth server. One setting chooses the provider.",
          "Streams responses to the web UI, and a generation can be stopped at any time.",
          "Gives the model tools to read, write, edit and search project files, list directories, run shell commands, search the web, fetch pages, and inspect pages in a headless Playwright browser.",
          "Loads reusable Agent Skills: task procedures written as SKILL.md files that the model can list and read when relevant.",
          "Is local by default. The server binds to localhost, file tools are restricted to the open project folder, and the README is explicit about the trade-offs: shell commands aren't sandboxed, there's no login, hosted providers receive the chat, and untrusted web content can steer the model.",
        ],
      },
      {
        heading: "The eval harness",
        bullets: [
          "Eleven tasks, each a small realistic job run in a throwaway project folder through the real chat engine and scored automatically: fix a failing test, fix an off-by-one bug, refactor out duplicated code, write tests that catch bugs, search then answer, refuse a request that reaches outside the project root.",
          "Runs each task several times (three by default) because models are non-deterministic, then reports pass rate, speed and cost per model.",
          "Compares several models side by side across providers, and can use an LLM judge to grade free-text answers.",
          "Produces a self-contained HTML dashboard: pass rates with 95% confidence intervals, quality against speed and cost, and a task-by-model grid where each cell opens the full trace. Models that hit API errors are reported as \"could not run\", never as failures.",
          "Includes a selfcheck that replays scripted fake agents through the real engine and scorer, so the harness itself can be tested for free with no model and no API key.",
        ],
      },
      {
        heading: "Why I built it",
        paragraphs: [
          "I wanted an AI development tool that doesn't depend on the cloud or its ongoing cost. My GPU is an RTX 3070 Ti with 8GB of VRAM, so I hoped a local model could run on it. There was also controversy around some open-source agent frameworks, and building the agent myself with a local model meant I could code with AI indefinitely at no cost.",
          "I didn't use LangChain or LangGraph because I wanted to see whether I could build the agent loop without the popular frameworks first. Learning them is my next step.",
        ],
      },
      {
        heading: "How I built it",
        paragraphs: [
          "I built Relay with Claude Code. I set the requirements and made the design decisions, researched and tested local models (which are often categorized inaccurately by size and capability, such as vision support), and tested the result. I didn't hand-write every line.",
          "The decisions that were mine:",
        ],
        bullets: [
          "Tool calling that works with local models.",
          "Vision support for local models, so a user can screenshot a problem and show the model exactly what they see.",
          "Security limits so the agent can't roam across the computer or take destructive actions against code repos.",
          "A simple interface, an easy way to add new skills, and the ability to stop the agent at any time.",
          "An evaluation harness, so the agent's capabilities are measured instead of assumed.",
        ],
      },
      {
        heading: "Limits and what's next",
        bullets: [
          "The shell isn't sandboxed. Adding a sandbox environment is the first upgrade.",
          "An early round of evals comparing models on success rate and cost was lost and needs redoing, so I have no published results to cite yet.",
          "Evaluations turned out to be harder than I expected. Accurate, current results take real infrastructure and cost, and they have to represent modern agents rather than just cheap, fast models.",
          "Local testing wasn't extensive, because my GPU is too slow to run capable models at a useful pace.",
        ],
      },
      {
        heading: "Engineering",
        paragraphs: ["Python 3.10+, unit tests run by pytest, and a GitHub Actions CI workflow. MIT licensed."],
      },
    ],
  },
];

export function findProject(slug: string) {
  return PROJECTS.find((project) => project.slug === slug);
}

/** The projects either side of `slug`, wrapping around, so the page's prev and next controls can step through them */
export function neighbours(slug: string) {
  const i = PROJECTS.findIndex((project) => project.slug === slug);
  return {
    prev: PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length],
    next: PROJECTS[(i + 1) % PROJECTS.length],
    position: i + 1,
    total: PROJECTS.length,
  };
}
