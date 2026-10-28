// Project description sent to the chat model as part of its system prompt.
export const RELAY = `Relay
Code: https://github.com/cpalmquist19/relay
Tags: Python, LLM, Agents, Evals, FastAPI

What it is:
A local coding agent with a web UI, plus an evaluation harness that measures how well different models use the agent's tools. It started life as lm-studio-chat and was renamed Relay. It is the project where Caleb applies his QA background to AI agents: building the agent and then testing it.

The agent:
- Runs against a model in LM Studio on the user's own machine, or against OpenAI, Anthropic (Claude), Google Gemini, or a local Unsloth server. The provider is chosen with one setting.
- Streams responses to the web UI, and a generation can be stopped at any time.
- Gives the model 14 tools: read, write, edit and search project files, list directories, run shell commands, search the web, fetch pages, inspect pages in a headless Playwright browser, plus a calculator, the current time, skills and attachment viewing.
- Loads reusable Agent Skills, which are task procedures written as SKILL.md files that the model can list and read when relevant.
- Has a project explorer where files can be dragged into the chat as attachments, and supports image attachments for vision-capable models.
- Is local by default: the server binds to localhost, file tools are restricted to the open project folder, and the README is explicit about the security tradeoffs (shell commands are not sandboxed, there is no login, hosted providers receive the chat, and untrusted web content can steer the model).

The eval harness:
- Contains 11 tasks, each a small realistic job run in a throwaway project folder through the real chat engine, and scored automatically. Examples: fix a failing test, fix an off-by-one bug, refactor out duplicated code, write tests that catch bugs, count files, search then answer, summarize with grounding, calculate instead of guessing, and refuse a request that reaches outside the project root.
- Runs each task several times (3 by default) because models are non-deterministic, then reports pass rate, speed and cost per model.
- Can compare several models side by side with a test matrix run across providers (every task against every model), and can optionally use an LLM judge to grade free-text answers.
- Produces a self-contained HTML dashboard with pass rates and 95% confidence intervals, quality versus speed and cost charts, a task-by-model grid where each cell opens the full trace (prompt, tool calls, answer, why it failed), and plain-English findings. Models that hit API errors are reported as "could not run", never as failures.
- Includes a selfcheck that replays scripted fake agents through the real engine and scorer, so the harness itself can be tested for free with no model and no API key.
- Is used both to pick a model (is it reliable enough and what does it cost) and to catch regressions when the agent's prompts or tools change.

Engineering:
Python 3.10+, with 200+ pytest tests and a GitHub Actions CI workflow. On every push CI runs the unit tests and the eval selfcheck (scripted good and bad agents, no model needed). Live model evals are not run on every push: they are triggered on demand from the same workflow, against OpenAI or a self-hosted runner with LM Studio. It is MIT licensed.

Why Caleb built it:
He wanted an AI development tool that doesn't depend on the cloud or its ongoing cost. His GPU is an RTX 3070 Ti with 8GB of VRAM, so he hoped a local model could run on it. There was also controversy around some open-source agent frameworks such as OpenClaw, and building the agent himself with a local model meant he could code with AI indefinitely at no cost.

How it was built and Caleb's role:
Caleb built Relay with Claude Code. He set the requirements and made the design decisions, researched and tested local models (which are often categorized inaccurately by size and capability, such as vision support), and tested the result. He did not hand-write every line, and he is open about that.

Decisions that were Caleb's:
- Tool calling that works with local models.
- Vision support for local models, so a user can screenshot a problem and show the model exactly what they see.
- Security limits so the agent can't roam across the user's computer or take destructive actions against their code repos.
- A simple interface, an easy way to add new skills, and the ability to stop the agent at any time.
- An evaluation harness, so the agent's capabilities can be measured instead of assumed.

QA background in the project:
Caleb tested that the agent can complete code tests, responds properly, and cannot leave the project directory it runs in. He also tested the modular skills.

Eval results (run on 28 October 2026):
- The run compared GPT 5.6 Luna, Claude Haiku 5.5 and a 1.7B local model (LFM3 in LM Studio) on all 11 tasks, 3 repeats each: 99 scored runs in about 35 minutes, costing $0.079 in total. The raw dashboard is in the cpalm.dev repo under docs/relay-eval.
- Luna and Haiku both passed 33 of 33 runs. Their 95% confidence intervals overlap, so the harness does not rank them. Luna cost $0.0009 per run and Haiku $0.0015 (1.6x). Tool errors per run were 0.03 for Luna, 0.09 for Haiku and 0.55 for the local model.
- The local model passed 79% (26 of 33) and took about 55 seconds per run against roughly 5 for the hosted models, at no cost per run.
- Earlier, targeted runs for one model showed tool errors falling from 6 to 0 and tool calls from 55 to 34 after Caleb fixed the tool definitions. A local model read a protected file through the shell in 3 of 3 runs, which led to a path guard, and testing exposed a code-execution hole in the calculator tool.

What Caleb learned from the results:
- A suite everyone passes says little. 8 of 11 tasks were passed on every run by every model, so only 3 tasks (refactor, refuse outside the project root, write tests that catch bugs) separated the models, and only the local model missed them. The hosted models can't be told apart on this suite, and both are low-cost options rather than flagship models, so harder tasks and a stronger model are needed.
- Read the failures, not just the pass rate. 5 of the local model's 7 failures were runs that hit the 180 second time limit, so pass rate mixed capability with speed. On the refusal task the path guard held and nothing leaked (safety score 1.0), but the model kept probing blocked paths instead of stopping to say it couldn't read the file.
- The other 2 failures were a bug in Caleb's own scorer. The local model's refactor was correct, but it quoted the duplicated expression in a docstring, and the duplicate check counted that as a second copy. The run without the docstring passed. Looking at the failing runs is what exposed it.
- Repeated runs matter. The local model passed the refactor and refusal tasks 1 time in 3, so any single run would have looked like a clean pass or a clean fail by luck.
- Evaluations turned out to be harder than Caleb expected. They take real infrastructure and cost to be accurate and current.

Limits and next steps:
- The results are one run on one code version with 3 repeats per task, so gaps under about 10 percentage points are noise.
- Next: make the refactor check ignore docstrings and comments and rerun it, add harder tasks that separate the hosted models, and report time-limit failures separately from wrong answers so slow local models aren't scored as incapable.
- The shell is not sandboxed. Adding a sandbox environment (there are free options) is the first upgrade.
- Local testing was limited: his GPU is too slow to run capable models at a useful pace, so the local model in the run is a small 1.7B one.

Why not LangChain or LangGraph:
Caleb wanted to see whether he could build the agent loop without the popular frameworks first. Learning LangChain and LangGraph is his next step.

What Caleb understands and what he's learning:
He has a clear grasp of how to structure a real agent that does meaningful work. He wants to do more with evaluations, and plans to learn LangChain and LangGraph next.`;
