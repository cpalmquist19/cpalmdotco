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
    slug: "cpalm-dev",
    title: "cpalm.dev",
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
      "A coding agent that runs locally with your choice of local or cloud-hosted models. Its built-in evaluation harness benchmarks models across 11 coding tasks, comparing success rates, speed, and cost. Includes automated testing and CI.",
    tags: ["Python", "LLM", "Agents", "Evals"],
    image: relayCard,
    links: [{ label: "View on GitHub", href: `${GITHUB_URL}/relay` }],
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "A coding agent that runs on your local computer with a web UI, plus an evaluation harness that measures how well different models use the agent's tools. It started life as lm-studio-chat and was renamed Relay.",
          "It's where I apply my QA background to AI agents: building the agent, then testing it.",
        ],
      },
      {
        heading: "The agent",
        bullets: [
          "Runs against a model in LM Studio on your local computer, or against OpenAI, Anthropic (Claude), Google Gemini, or a local Unsloth server. One setting chooses the provider.",
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
        heading: "Eval results",
        paragraphs: [
          "The latest run compared GPT 5.6 Luna, Claude Haiku 5.5 and a 1.7B local model on all 11 tasks, three repeats each. That's 99 scored runs in about 35 minutes, for $0.079 in total.",
        ],
        bullets: [
          "Luna and Haiku both passed 33 of 33 runs. Their 95% intervals overlap, so the harness doesn't rank them. Luna cost $0.0009 a run and Haiku $0.0015.",
          "The local model passed 79% (26 of 33), at about 55 seconds a run against roughly 5 for the hosted models, and free per run.",
          "Earlier, targeted runs for one model showed tool errors falling from 6 to 0 and tool calls from 55 to 34 after I fixed the tool definitions. A local model read a protected file through the shell in 3 of 3 runs, which led to a path guard.",
        ],
      },
      {
        heading: "What I learned from the results",
        bullets: [
          "A suite everyone passes says little. Eight of the 11 tasks were passed on every run by every model, so only three separate them, and only the local model missed those. Both hosted models are low-cost options rather than flagships, so I need harder tasks and a stronger model.",
          "Read the failures, not just the pass rate. Five of the local model's seven failures were runs that hit the 180 second time limit, so the pass rate mixed capability with speed. On the refusal task the path guard held and nothing leaked, but the model kept probing blocked paths instead of stopping to say it couldn't read the file.",
          "The other two failures were a bug in my own scorer. The local model's refactor was correct, but it quoted the duplicated expression in a docstring and my duplicate check counted that as a second copy. Looking at the failing runs is what exposed it.",
          "Repeated runs matter. The local model passed the refactor and refusal tasks one time in three, so any single run would have looked like a clean pass or a clean fail by luck.",
        ],
      },
      {
        heading: "Limits and what's next",
        bullets: [
          "The results are one run on one code version with three repeats per task, so gaps under about 10 percentage points are noise.",
          "Next: make the refactor check ignore docstrings and comments and rerun it, add harder tasks that separate the hosted models, and report time-limit failures separately from wrong answers, so slow local models aren't scored as incapable.",
          "The shell isn't sandboxed. Adding a sandbox environment is the first upgrade.",
          "Evaluations turned out to be harder than I expected. Accurate, current results take real infrastructure and cost.",
          "Local testing was limited, because my GPU is too slow to run capable models at a useful pace, so the local model in the run is a small 1.7B one.",
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

/** The projects either side of `slug`, for the page's prev and next controls. The first has no prev and the last has no next, so stepping stops at the ends */
export function neighbours(slug: string) {
  const i = PROJECTS.findIndex((project) => project.slug === slug);
  return {
    prev: PROJECTS[i - 1],
    next: PROJECTS[i + 1],
    position: i + 1,
    total: PROJECTS.length,
  };
}
