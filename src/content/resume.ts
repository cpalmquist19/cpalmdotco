// Plain-text resume sent to the chat model as part of its system prompt.
// Phone number is intentionally left out because the model can quote this to anyone.
export const RESUME = `Caleb Palmquist
LinkedIn: linkedin.com/in/calebfrommaine

Professional summary:
Senior Software Development Engineer in Test with 14 years in healthcare SaaS and a focus on AI quality engineering. Builds LLM-powered systems (AI-powered SaaS applications, RAG pipelines, tool-calling agent harnesses) and evaluates them with a tester's discipline: eval harnesses, regression detection, and groundedness checks. At eRSP he architected three test automation frameworks (Python/Playwright, Python/Selenium, Python/Appium), shipped 192+ automated tests across 6 application areas, and cut regression environment setup time by 90%.

Technical skills:
- Languages: Python, SQL, JavaScript, ColdFusion, HTML/CSS
- AI / LLM: LLM API integration (OpenAI-compatible), Ollama, LM Studio, RAG pipelines, vector databases & embeddings, prompt engineering, agent tool-calling architectures
- Test automation: Playwright, Selenium WebDriver, PyTest, Appium, MSTest, Postman
- Data: SQL Server, T-SQL, stored procedures, query optimization, database regression testing
- CI/CD & DevOps: Jenkins, Git, CI/CD pipelines, code deployment, SQL script execution
- Tools & methods: Cursor, Copilot, Jira, REST APIs, QA dashboards, coverage reporting, Page Object Model, Agile/Scrum

Professional experience:
eRSP, a multi-tenant healthcare SaaS platform (Matthews, NC, remote), Jun 2012 to present

Senior Software Development Engineer in Test, May 2024 to present
- Architected a Playwright test automation framework using Page Object Model; 192+ automated tests across 6 critical application areas in a monolithic, database-heavy multi-tenant system.
- Built a QA Dashboard tracking thousands of code files, unit tests, and automation coverage across 13 test areas: real-time test health, coverage confidence, and complexity metrics for leadership.
- Cut regression environment setup 90% (30 min to 3 min) by automating admin-portal and in-app settings across the multi-tenant environment.
- Integrated AI-assisted workflows into QA practice: LLM-generated test scaffolding and documentation review via Copilot/Cursor, with human verification gates on all AI-generated output.
- Automated REST API validation with Postman collections; identified endpoint coverage and CI/CD gaps.
- Mentors QA team members on automation best practices, framework architecture, and test strategy.

QA Lead, Mar 2019 to May 2024
- Architected a Python/Selenium/PyTest automation framework for a legacy monolithic architecture with complex database interdependencies.
- Led end-to-end testing and rollout of mobile applications (iOS/Android); built the original mobile test automation framework in C#/Appium, then migrated it to Python/Appium.
- Built internal QA tools, including test management utilities, reducing rework cycles.
- Ran code reviews and peer-review alignment to reduce refactoring overhead and production bugs.

Web Developer, Mar 2018 to Mar 2019
- Refactored inefficient SQL queries and stored procedures; centralized data access patterns for performance and maintainability.
- Engineered an admin approval workflow for critical scheduling operations, including new UI and database-layer governance.

QA Lead, Jun 2017 to Mar 2018
- Built a real-time QA analytics dashboard on the Jira REST API with local database caching: defect escape rate, rework cycles, developer coverage gaps.
- Helped drive the company-wide Agile transformation: QA practices, acceptance criteria standards, reporting frameworks.

QA Analyst, Aug 2016 to Jun 2017
- Executed test plans for bug fixes, feature updates, and releases.
- Managed Jenkins CI/CD pipelines: code deployment and SQL script execution across test environments.

Early career, Jun 2012 to Aug 2016
- Product Support Specialist, then Enterprise Account Manager, then Junior Web Developer.

Applied AI & side projects:
- Local Agent, a tool-calling AI agent harness (2025 to present; Python, FastAPI): a local multi-round LLM agent harness on LM Studio's OpenAI-compatible API with a 12-round tool loop and empty-response recovery, 14 tools (files, shell, web search, Playwright page inspection), SKILL.md-based agent skills, and a streaming web UI with a tool-activity timeline. The system prompt is written as a behavior contract, with provider abstraction, fallbacks, and stop/kill-switch controls.
- RAG Chatbot, an internal support tool proof of concept (2024; Python, Ollama, vector database): a retrieval-augmented generation system over technical documentation; evaluated Llama 3, Mistral, and Phi 3 on quality/latency tradeoffs and delivered the demo and findings to leadership.

Roles Caleb is looking for:
Applied AI Engineer, AI Engineer, AI Developer, SDET, AI SDET, Agentic Workflows, AI Agents, Automated Workflows, Automated Processes, Developer Experience (DX), AI Integrations, API Integrations, AI Applications.

Certifications:
- Prompt Engineering: How to Talk to the AIs, LinkedIn Learning (Nov 2025)`;
