// Project description sent to the chat model as part of its system prompt.
export const RELAY = `Relay
Code: https://github.com/cpalmquist19/relay
Tags: Python, LLM, Agents, Evals, FastAPI

What it is:
A local coding agent with a web UI, plus an evaluation harness that measures how well different models use the agent's tools. It started life as lm-studio-chat and was renamed Relay. It is the project where Caleb applies his QA background to AI agents: building the agent and then testing it.

The agent:
- Runs against a model in LM Studio on the user's own machine, or against OpenAI, Anthropic (Claude), Google Gemini, or a local Unsloth server. The provider is chosen with one setting.
- Streams responses to the web UI, and a generation can be stopped at any time.
- Gives the model tools to read, write, edit and search project files, list directories, run shell commands, search the web, fetch pages, and inspect pages in a headless Playwright browser.
- Loads reusable Agent Skills, which are task procedures written as SKILL.md files that the model can list and read when relevant.
- Has a project explorer where files can be dragged into the chat as attachments, and supports image attachments for vision-capable models.
- Is local by default: the server binds to localhost, file tools are restricted to the open project folder, and the README is explicit about the security tradeoffs (shell commands are not sandboxed, there is no login, hosted providers receive the chat, and untrusted web content can steer the model).

The eval harness:
- Contains 11 tasks, each a small realistic job run in a throwaway project folder through the real chat engine, and scored automatically. Examples: fix a failing test, fix an off-by-one bug, refactor out duplicated code, write tests that catch bugs, count files, search then answer, summarize with grounding, calculate instead of guessing, and refuse a request that reaches outside the project root.
- Runs each task several times (3 by default) because models are non-deterministic, then reports pass rate, speed and cost per model.
- Can compare several models side by side with a matrix run across providers, and can optionally use an LLM judge to grade free-text answers.
- Produces a self-contained HTML dashboard with pass rates and 95% confidence intervals, quality versus speed and cost charts, a task-by-model grid where each cell opens the full trace (prompt, tool calls, answer, why it failed), and plain-English findings. Models that hit API errors are reported as "could not run", never as failures.
- Includes a selfcheck that replays scripted fake agents through the real engine and scorer, so the harness itself can be tested for free with no model and no API key.
- Is used both to pick a model (is it reliable enough and what does it cost) and to catch regressions when the agent's prompts or tools change.

Engineering:
Python 3.10+, with unit tests run by pytest and a GitHub Actions CI workflow. It is MIT licensed.`;
