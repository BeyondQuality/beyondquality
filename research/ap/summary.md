# Summary

## Foundational properties

| Property | Description |
|---|---|
| Non-determinism | The same input always produces different output. The LLM generates plausible text, not correct text. |
| Degradation | The longer the input, the less precisely the LLM attends to each part. Earlier instructions get buried. |
| Truncation | When input exceeds the context limit, older content is summarised or dropped. Information is silently lost. |

## Engineering principles

| # | Principle | Chapter | Software engineering name | One-line summary |
|---|---|---|---|---|
| 1 | Only build workflows around things you already do well | [4](04-getting-started.md) | — | You must be an expert at the process before you automate it. |
| 2 | One agent, one job | [5](05-one-agent-one-job.md) | [Unix philosophy](https://en.wikipedia.org/wiki/Unix_philosophy) | Separate work into distinct agents with separate folders and instructions. |
| 3 | Self-containment | [6](06-setting-up-a-folder.md) | [Encapsulation](https://en.wikipedia.org/wiki/Encapsulation_(computer_programming)) | Everything the agent needs must be in its folder, and nothing else. |
| 4 | Always verify non-deterministic output | [7](07-git.md) | — | Every change the LLM makes could be wrong; every change must be checked. |
| 5 | One session, one task | [8](08-sessions.md) | — | Pick one thing, do it, save the results, end the session. |
| 6 | Principle of least privilege | [9](09-risks.md) | [Least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege) | Give the agent only the access it needs and can reliably handle. |
| 7 | Reduce the surface where non-determinism can act | [11](11-skills-not-instructions.md) | [Attack surface reduction](https://en.wikipedia.org/wiki/Attack_surface) | Move procedures into skills, data into separate files, and mechanical work into scripts. |
| 8 | Practise supply-chain hygiene | [12](12-using-skills.md) | [Supply-chain security](https://en.wikipedia.org/wiki/Supply_chain_attack) | Every dependency you import is a trust decision. Read, learn, then build your own. |

## Antipatterns

| Antipattern | Chapter | What goes wrong |
|---|---|---|
| Auto-memory | [10](10-global-memory.md) | Claude Code's automatic memory writes rules outside the project folder without review. Casual remarks get escalated to commandments, stale snapshots become lies the agent follows. Breaks self-containment, review, and least privilege. |
| Mixing tasks in one session | [8](08-sessions.md) | Data from a finished task stays in context and contaminates the next one. Thirty messages that say 'EUR' are louder than one line in CLAUDE.md saying 'use USD'. |
| Overloaded CLAUDE.md | [11](11-skills-not-instructions.md), [14](14-tokens-and-costs.md) | Putting all instructions, data, and procedures in CLAUDE.md loads everything every session. Wastes attention and tokens on content the current task doesn't need. |
| Using LLM for mechanical work | [11](11-skills-not-instructions.md) | Having the LLM read, parse, count, or sort when a deterministic script could do it. Adds non-determinism to steps that don't need judgement, costs more, and breaks on model updates. |
| Enforcing rules via CLAUDE.md instead of hooks | [13](13-hooks.md) | Pattern-matching checks (em-dashes, date formats, banned phrases) as CLAUDE.md instructions that the LLM can ignore. A hook running a linter cannot be ignored. |
| Giving the agent irreversible access | [9](09-risks.md) | Letting the agent send emails, post to APIs, or interact with services where mistakes can't be undone. A sent email has no `git revert`. |
| Desktop agents with full system access | [9](09-risks.md) | Tools like Claude Cowork that access the entire computer, browser, and email. The blast radius is not one folder but everyone the agent can reach. |
| Importing third-party skills directly | [12](12-using-skills.md) | Installing someone else's skill without review. No audit gate, no test harness, and the same skill produces different output on different machines due to non-determinism. |
| No bounds or circuit breakers for costs | [14](14-tokens-and-costs.md) | Without spending limits or automatic stops, costs compound silently. In one case, two agents in a multi-agent setup got trapped in a dialogue loop for eleven days, running up tens of thousands of dollars before anyone noticed. |
