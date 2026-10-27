// What the Experience and Skills pages show. The Experience copy follows the resume text (summary, roles, projects). It
// sits alongside src/content/resume.ts (the text BEAM-E answers from) and the downloadable files in public/resume, so
// when the resume changes, update all three together

export const SUMMARY =
  "Software engineering and quality professional with 14 years of experience across healthcare SaaS, test automation, and software development. Hands-on experience building tool-calling LLM agents and evaluation infrastructure, including a multi-model evaluation harness with repeated-run scoring, safety checks, cost tracking, and GitHub Actions regression gates. Combines Python-based engineering, systematic failure analysis, and automation expertise with experience testing complex, data-intensive business systems in healthcare.";

export const EMPLOYER = {
  name: "eRSP",
  about: "Formerly Kaleida Systems · Home-care management SaaS",
  period: "Jun 2012 to Present",
};

export type Role = { title: string; period: string; highlights: string[] };

// Newest first
export const ROLES: Role[] = [
  {
    title: "Senior Software Development Engineer in Test",
    period: "May 2024 to Present",
    highlights: [
      "End-to-End Automation: Built a Playwright/TypeScript framework using the Page Object Model, with 60+ tests covering login, account creation, viewing and editing across account types, and core configuration workflows such as services and pricing. Automated a legacy ColdFusion monolith with no central API; each run replaces approximately four hours of manual testing.",
      "Environment Setup Automation: Automated admin-portal and application settings for the five most common customer configuration profiles, reducing regression-environment setup time by 90%, from 30 minutes to 3 minutes.",
      "CI/CD Integration: Built a GitHub Actions workflow on a self-hosted runner to launch UI automation on demand. Users can select the target server and tests by component, smoke suite, or full suite, or list tests without executing them. Passed selections to a custom test runner as parameters.",
      "Unit Test Recovery: Restored a neglected 192-test unit suite to a working state and kept it passing.",
      "Quality Metrics: Built a QA dashboard tracking code files, unit tests, and automation coverage across 13 test areas.",
      "ML Experimentation & Mentoring: Prototyped an ML classifier to triage support tickets by routing category (support versus development) and severity. Advised two QA teammates on automation and test strategy.",
    ],
  },
  {
    title: "QA Lead",
    period: "Mar 2019 to May 2024",
    highlights: [
      "Designed a Python/Selenium/PyTest automation framework for a legacy monolith with complex database interdependencies.",
      "Led testing and rollout of iOS and Android applications; built mobile automation frameworks in C#/Appium and later Python/Appium.",
      "Built internal QA tools, made automation tooling decisions, and guided two QA teammates on automation and test strategy.",
    ],
  },
  {
    title: "Web Developer",
    period: "Mar 2018 to Mar 2019",
    highlights: [
      "Optimized slow SQL queries and stored procedures; built an administrative approval workflow for broadcasting open caregiver visits and developed custom reports for franchise customers.",
    ],
  },
  {
    title: "QA Lead",
    period: "Jun 2017 to Mar 2018",
    highlights: [
      "Built a QA analytics dashboard using the Jira REST API to track defect escape rates, rework, and coverage gaps.",
      "Helped transition the company to Agile/Scrum and authored QA, development, and support policies.",
    ],
  },
  {
    title: "QA Analyst",
    period: "Aug 2016 to Jun 2017",
    highlights: [
      "Executed test plans for fixes and releases, managed Jenkins deployments and SQL script runs, and evaluated mobile test automation using Selenium and Appium.",
    ],
  },
  {
    title: "Junior Web Developer",
    period: "Jun 2015 to Aug 2016",
    highlights: [
      "Fixed defects, refactored core application code, and automated a reporting workflow that replaced hours of manual Excel tracking.",
    ],
  },
  {
    title: "Enterprise Account Manager",
    period: "Oct 2013 to Jun 2015",
    highlights: [
      "Managed two of the company's largest customer accounts and built an internal issue tracker adopted by the development team.",
    ],
  },
  {
    title: "Product Support Specialist",
    period: "Jun 2012 to Oct 2013",
    highlights: ["Supported 1,000+ home-care agencies by phone and email and developed internal support reports."],
  },
];

export type SideProject = { title: string; meta: string; highlights: string[] };

export const SIDE_PROJECTS: SideProject[] = [
  {
    title: "Relay: Local AI Agent & Evaluation Harness",
    meta: "Python, FastAPI, LM Studio, GitHub Actions",
    highlights: [
      "Agent Engineering: Built a tool-calling LLM agent using LM Studio's OpenAI-compatible API, with 14 tools for file operations, shell execution, web access, and Playwright page inspection. Implemented reusable SKILL.md instructions, a streaming UI, up to 12 tool rounds per turn, recovery from incomplete model responses, and stop controls that terminate running commands.",
      "Evaluation Framework: Designed an 11-task evaluation suite covering scenarios such as fixing a failing test, performing a behavior-preserving refactor, and writing tests that detect planted bugs. Scored tool selection, argument validity, end-state correctness, efficiency, and safety; added repeated runs, cost-per-run tracking, and an optional LLM judge.",
      "Automated Verification & CI: Built 200+ automated tests and scripted good- and bad-reference agents to verify the evaluation scorer's behavior. Integrated evaluation runs into GitHub Actions on every push as a regression gate.",
      "Model Benchmarking & Failure Analysis: Compared local, OpenAI, and Anthropic models, then used observed failures to improve agent behavior. In targeted runs for one model, reduced tool errors from 6 to 0 and tool calls from 55 to 34 by fixing tool definitions and behavior.",
      "Safety & Runtime Reliability: Detected protected-file access through shell execution in 3 of 3 runs by a local model and added a path guard. Also fixed a code-execution hole in the calculator tool and Linux child-process cleanup failures discovered through testing.",
    ],
  },
  {
    title: "Portfolio Site (cpalm.dev)",
    meta: "Next.js, React, TypeScript, Tailwind CSS, Vercel AI SDK, GitHub Actions",
    highlights: [
      "Site Build: Built a responsive portfolio site with the Next.js App Router, React, TypeScript, and Tailwind CSS v4, featuring a hero section, a featured-work grid with tech tags and GitHub links, and a script that converts MP4 background video to web-optimized WebM and MP4.",
      "Live AI Assistant: Built BEAM-E, a streaming chat assistant that answers questions about my work using only my resume and project write-ups supplied in its system prompt, and says so when something isn't covered. Visitors can choose between Claude Haiku 5.5 and GPT 5.6 Luna, with the provider selected server-side from an allowlist of model IDs.",
      "Chat Safeguards: Layered protections on the chat endpoint: same-origin check, per-visitor rate limits with temporary lockouts, request size and model validation, message screening for prompt injection, abuse, illegal requests, spam, and gibberish (run in the browser for instant feedback and on the server as the authoritative check), and a daily model-call cap. Blocked messages never reach the model.",
      "Testing & CI: Wrote a test script with 100+ allow and block cases for the message screening, including honest questions that must not be blocked. GitHub Actions runs it, plus type checking and linting, on every push and pull request.",
    ],
  },
];

export const SKILLS: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "SQL", "JavaScript", "ColdFusion", "HTML/CSS"] },
  {
    group: "AI / LLM",
    items: [
      "LLM API integration (OpenAI-compatible)",
      "Ollama",
      "LM Studio",
      "RAG pipelines",
      "Vector databases & embeddings",
      "Prompt engineering",
      "Agent tool-calling architectures",
    ],
  },
  { group: "Test automation", items: ["Playwright", "Selenium WebDriver", "PyTest", "Appium", "MSTest", "Postman"] },
  {
    group: "Data",
    items: ["SQL Server", "T-SQL", "Stored procedures", "Query optimization", "Database regression testing"],
  },
  {
    group: "CI/CD & DevOps",
    items: ["Jenkins", "Git", "CI/CD pipelines", "Code deployment", "SQL script execution"],
  },
  {
    group: "Tools & methods",
    items: [
      "Cursor",
      "Copilot",
      "Jira",
      "REST APIs",
      "QA dashboards",
      "Coverage reporting",
      "Page Object Model",
      "Agile/Scrum",
    ],
  },
];
