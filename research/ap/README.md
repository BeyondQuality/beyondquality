# Agentic Workflows: Engineering Principles for Non-Engineers

## Background

I've been building non-coding agentic workflows for my own work (conference management, content production, research) and pairing with colleagues to build theirs. At the Paris Anthropic meetup, I presented on RAG to marketers and sales folks and got flooded with questions about agentic workflows. The questions were all about pains people had with ChatGPT, Claude, OpenAI: lost context, unreliable outputs, workflows that break after a few sessions. Pains I didn't have, because I'd been applying engineering principles to non-engineering work.

That gap is what this research addresses.

## Table of contents

1. [What is an LLM](01-what-is-an-llm.md) — statelessness, non-determinism, degradation, truncation
2. [From chat to agent](02-from-chat-to-agent.md) — agents, tools, the LLM as a helper
3. [A real workflow](03-lil-demo.md) — conference management little demo
4. [Getting started](04-getting-started.md) — start from pain, first principle: only build workflows around things you already do well
5. [One agent, one job](05-one-agent-one-job.md) — second principle: one agent, one job (Unix philosophy)
6. [Self-containment](06-setting-up-a-folder.md) — third principle: self-containment (encapsulation)
7. [Reviewing changes](07-git.md) — fourth principle: always verify non-deterministic output (git)
8. [One session, one task](08-sessions.md) — fifth principle: scope sessions to a task, not to time
9. [Risks](09-risks.md) — sixth principle: least privilege, give the agent only the access it needs and can reliably handle
10. [Memory](10-global-memory.md) — tattoos in the folder, and why Claude Code's automatic memory is an anti-pattern
11. [Skills and scripts](11-skills-not-instructions.md) — seventh principle: reduce the surface where non-determinism can act (attack surface reduction)
12. [Using third-party skills](12-using-skills.md) — eighth principle: practise supply-chain hygiene
13. [Hooks and linters](13-hooks.md) — automating mechanical checks
14. [Tokens and costs](14-tokens-and-costs.md) — billing models, why long sessions cost disproportionately more, and watching the meter

## Status

Early draft, chapters 1-14 published. More chapters planned.
