import type { StaticImageData } from "next/image";
import calmdotcoCard from "../../public/cpalm_dot_dev_minimal.jpg";
import relayCard from "../../public/relay_agent_card_minimal.jpg";
import relayEvalCost from "../../docs/relay-eval/cost.webp";
import relayEvalHeatmap from "../../docs/relay-eval/heatmap.webp";
import relayEvalSummary from "../../docs/relay-eval/summary.webp";
import { GITHUB_URL } from "./config";

// The projects on the home page and their write-ups at /projects/[slug]. Add one here and both appear.
// The write-ups are display copy. What BEAM-E knows about a project lives in src/content, so keep the two in step

// Screenshots are shown at half their pixel width (they're taken at 2x), or the column's width if that is less
export type SectionImage = { src: StaticImageData; alt: string };

export type Section = {
  heading: string;
  paragraphs?: string[];
  // Shown between the paragraphs and the bullets
  images?: SectionImage[];
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
      "A tool-calling coding agent and the evaluation harness I built to measure it. The latest run compares seven models, four hosted and three local, across 11 tasks and 231 scored runs for $1.39, with pass rate, confidence intervals, speed and cost for each.",
    tags: ["Python", "LLM", "Agents", "Evals"],
    image: relayCard,
    links: [
      { label: "View on GitHub", href: `${GITHUB_URL}/relay` },
      { label: "Eval results and raw data", href: `${GITHUB_URL}/cpalmdotco/tree/main/docs/relay-eval` },
    ],
    sections: [
      {
        heading: "At a glance",
        bullets: [
          "The agent: a tool-calling loop with 14 tools (files, shell, web, and headless-browser page inspection), reusable SKILL.md instructions, streaming with a stop control, and one setting to switch between LM Studio, a local server such as Ollama, OpenAI, Anthropic or Gemini.",
          "The evals: 11 tasks, each a small realistic job run in a throwaway project folder through the real chat engine. Every task runs three times, because models are non-deterministic, and is scored on tool selection, argument validity, end-state correctness, efficiency and safety. Cost per run is tracked, and an LLM judge is optional.",
          "Trusting the harness: 200+ automated tests, plus a self-check that replays scripted good and bad agents through the real engine and scorer, so the scorer is tested with no model and no API key. Both run in GitHub Actions on every push, and live model evals run on demand from the same workflow.",
          "Built with Claude Code. I set the requirements, made the design calls, researched local models and tested the result. Python 3.10+, MIT licensed.",
        ],
      },
      {
        heading: "Latest eval results",
        paragraphs: [
          "Run on 28 October 2026: four hosted models (GPT 5.6 Luna and Terra, Claude Haiku 5.5 and Sonnet 5.5) and three small local models (LFM3 1.7B, LFM3 VL 2B and Spark X2.6 4B), every task three times. That's 231 scored runs in 1 hour 45 minutes, for $1.39 in total.",
        ],
        images: [
          {
            src: relayEvalSummary,
            alt: "Relay eval dashboard summary: 231 runs, 7 models, 3 of 11 tasks separate them, $1.39 spent, with the dashboard's generated findings",
          },
        ],
        bullets: [
          "The four hosted models tie. All four passed 33 of 33 runs, and their 95% confidence intervals overlap, so the harness doesn't rank them.",
          "Most of my suite can't tell the models apart. Eight of the 11 tasks were passed on every run by every model. Only three separate them, and only the local models missed those, so nothing here separates the hosted models.",
          "The local models passed 79% to 91% and averaged 40 to 62 seconds a run against 4 to 7 for the hosted models. All three failed every run of writing tests that catch planted bugs, 9 of 9, where the hosted models passed all 12.",
          "Tool errors per run: 0.00 for both GPT 5.6 models, 0.09 for both Claude models, 0.36 to 0.52 for the local models.",
        ],
      },
      {
        heading: "Cost and speed",
        images: [
          {
            src: relayEvalCost,
            alt: "Relay eval dashboard cost table: the local models are free, GPT 5.6 Luna costs $0.0009 a run, Claude Haiku 5.5 $0.0015, GPT 5.6 Terra $0.0090 and Claude Sonnet 5.5 $0.031",
          },
        ],
        bullets: [
          "Cost per run ran from $0.0009 (Luna) to $0.031 (Sonnet), a 35x spread, with identical pass rates. Sonnet alone was $1.01 of the $1.39 total. On this suite the extra spend bought nothing measurable, which says more about the suite than about the models.",
          "Cost per passing run is reported next to cost per run, so a cheap model that fails often can't look like a bargain.",
          "The local models were free per run, at about 10 times the latency.",
        ],
      },
      {
        heading: "Where the models differ",
        images: [
          {
            src: relayEvalHeatmap,
            alt: "Pass and fail heatmap by task and model. Only count_files, refuse_outside_root and write_tests_that_catch_bugs separate the models, and only the local models miss them",
          },
        ],
        bullets: [
          "Twelve of the local models' 15 failures were runs that never finished, because they ran out of time or tool-call rounds.",
          "On the refusal task the path guard held and no model touched the protected file: the safety score was 1.0 across all 231 runs. The models that failed kept probing blocked paths, using 12 tool calls where 4 were allowed, instead of stopping to say they couldn't.",
          "LFM3 1.7B passed the refactor task 3 of 3 here and 1 of 3 in an earlier run of the same code. Those earlier failures were a bug in my own scorer: the refactor was correct, but it quoted the duplicated expression in a docstring and my duplicate check counted that as a second copy.",
        ],
      },
      {
        heading: "What I learned",
        bullets: [
          "A suite everyone passes says little. Even with the pricier models added, all four hosted models hit 100%, so I need harder tasks that separate them.",
          "Price and quality are separate questions. A 35x cost spread with no difference in pass rate means either the cheap models are enough for these tasks or the tasks are too easy, and this run can't say which.",
          "Read the failures, not just the pass rate. Most failures were runs that never finished rather than wrong answers, and reading the failing runs is what exposed the scorer bug.",
          "Repeated runs matter, and so does repeating the whole run. The same model on the same code went from 1 of 3 to 3 of 3 on one task between runs.",
          "Evaluations turned out to be harder than I expected. Accurate, current results take real infrastructure and cost.",
        ],
      },
      {
        heading: "What the evals found in my own agent",
        bullets: [
          "In targeted runs for one model, tool errors fell from 6 to 0 and tool calls from 55 to 34 after I fixed the tool definitions.",
          "A local model read a protected file through the shell in 3 of 3 runs, which led to a path guard.",
          "Testing exposed a code-execution hole in the calculator tool, and Linux child-process cleanup failures.",
        ],
      },
      {
        heading: "Why I built it",
        paragraphs: [
          "I wanted an AI development tool that doesn't depend on the cloud or its ongoing cost. My GPU is an RTX 3070 Ti with 8GB of VRAM, so I hoped a local model could run on it.",
          "I didn't use LangChain or LangGraph because I wanted to see whether I could build the agent loop without the popular frameworks first. Learning them is my next step.",
          "The decisions that were mine:",
        ],
        bullets: [
          "Tool calling that works with local models.",
          "Vision support for local models, so a user can screenshot a problem and show the model exactly what they see.",
          "Security limits: file tools stay in the project folder, and the server binds to localhost. The README is explicit about what isn't covered: shell commands aren't sandboxed, there's no login, and hosted providers receive the chat.",
          "A simple interface, an easy way to add new skills, and the ability to stop the agent at any time.",
          "An evaluation harness, so the agent's capabilities are measured instead of assumed.",
        ],
      },
      {
        heading: "Limits and what's next",
        bullets: [
          "The results are one run on one code version, with three repeats per task and a 320 second limit per run. Gaps under about 10 percentage points are noise, so the differences between the three local models are mostly within it.",
          "Next: make the refactor check ignore docstrings and comments, add harder tasks that separate the hosted models, and report runs that ran out of time or rounds separately from wrong answers, so slow local models aren't scored as incapable.",
          "The shell isn't sandboxed. Adding a sandbox environment is the first upgrade.",
          "Local testing was limited, because my GPU is too slow to run capable models at a useful pace, so the local models in the run are small ones, 1.7B to 4B.",
        ],
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
