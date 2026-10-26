// What the Experience and Skills pages show. It follows the resume in src/content/resume.ts (the text BEAM-E answers
// from) and the downloadable files in public/resume, so when the resume changes, update all three together

export const SUMMARY =
  "Senior Software Development Engineer in Test with 14 years in healthcare SaaS and a focus on AI quality engineering. I build LLM-powered systems (AI-powered SaaS applications, RAG pipelines, tool-calling agent harnesses) and evaluate them with a tester's discipline: eval harnesses, regression detection, and groundedness checks.";

export const EMPLOYER = {
  name: "eRSP",
  about: "A multi-tenant healthcare SaaS platform",
  where: "Matthews, NC, remote",
  period: "Jun 2012 to present",
};

export type Role = { title: string; period: string; highlights: string[] };

// Newest first
export const ROLES: Role[] = [
  {
    title: "Senior Software Development Engineer in Test",
    period: "May 2024 to present",
    highlights: [
      "Architected a Playwright test automation framework using Page Object Model: 192+ automated tests across 6 critical application areas in a monolithic, database-heavy multi-tenant system.",
      "Built a QA Dashboard tracking thousands of code files, unit tests, and automation coverage across 13 test areas: real-time test health, coverage confidence, and complexity metrics for leadership.",
      "Cut regression environment setup 90% (30 min to 3 min) by automating admin-portal and in-app settings across the multi-tenant environment.",
      "Integrated AI-assisted workflows into QA practice: LLM-generated test scaffolding and documentation review via Copilot and Cursor, with human verification gates on all AI-generated output.",
      "Automated REST API validation with Postman collections; identified endpoint coverage and CI/CD gaps.",
      "Mentors QA team members on automation best practices, framework architecture, and test strategy.",
    ],
  },
  {
    title: "QA Lead",
    period: "Mar 2019 to May 2024",
    highlights: [
      "Architected a Python/Selenium/PyTest automation framework for a legacy monolithic architecture with complex database interdependencies.",
      "Led end-to-end testing and rollout of mobile applications (iOS/Android); built the original mobile test automation framework in C#/Appium, then migrated it to Python/Appium.",
      "Built internal QA tools, including test management utilities, reducing rework cycles.",
      "Ran code reviews and peer-review alignment to reduce refactoring overhead and production bugs.",
    ],
  },
  {
    title: "Web Developer",
    period: "Mar 2018 to Mar 2019",
    highlights: [
      "Refactored inefficient SQL queries and stored procedures; centralized data access patterns for performance and maintainability.",
      "Engineered an admin approval workflow for critical scheduling operations, including new UI and database-layer governance.",
    ],
  },
  {
    title: "QA Lead",
    period: "Jun 2017 to Mar 2018",
    highlights: [
      "Built a real-time QA analytics dashboard on the Jira REST API with local database caching: defect escape rate, rework cycles, developer coverage gaps.",
      "Helped drive the company-wide Agile transformation: QA practices, acceptance criteria standards, reporting frameworks.",
    ],
  },
  {
    title: "QA Analyst",
    period: "Aug 2016 to Jun 2017",
    highlights: [
      "Executed test plans for bug fixes, feature updates, and releases.",
      "Managed Jenkins CI/CD pipelines: code deployment and SQL script execution across test environments.",
    ],
  },
  {
    title: "Early career",
    period: "Jun 2012 to Aug 2016",
    highlights: ["Product Support Specialist, then Enterprise Account Manager, then Junior Web Developer."],
  },
];

export type SideProject = { title: string; meta: string; description: string };

export const SIDE_PROJECTS: SideProject[] = [
  {
    title: "Local Agent",
    meta: "2025 to present · Python, FastAPI",
    description:
      "A tool-calling AI agent harness: a local multi-round LLM agent on LM Studio's OpenAI-compatible API with a 12-round tool loop and empty-response recovery, 14 tools (files, shell, web search, Playwright page inspection), SKILL.md-based agent skills, and a streaming web UI with a tool-activity timeline. The system prompt is written as a behavior contract, with provider abstraction, fallbacks, and stop and kill-switch controls.",
  },
  {
    title: "TestScribeAI",
    meta: "Mar 2023 to present · Python, Flask, OpenAI API",
    description:
      "An AI test documentation SaaS. I architected and deployed to production a platform that generates test plans and technical documentation from application screenshots via LLM integration (testscribeai.com).",
  },
  {
    title: "RAG Chatbot",
    meta: "2024 · Python, Ollama, vector database",
    description:
      "An internal support tool proof of concept: a retrieval-augmented generation system over technical documentation. I evaluated Llama 3, Mistral, and Phi 3 on quality and latency trade-offs and delivered the demo and findings to leadership.",
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

export const CERTIFICATIONS = ["Prompt Engineering: How to Talk to the AIs, LinkedIn Learning (Nov 2025)"];
