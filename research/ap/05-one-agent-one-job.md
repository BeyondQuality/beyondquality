# One agent, one job

Working with local files and having instructions in `CLAUDE.md` is a massive improvement over ChatGPT, but the three problems from chapter 1 (non-determinism, degradation, truncation) don't disappear. The agent still uses an LLM to do the thinking.

When I started using agents, I had one agent for my whole job. Conference logistics, writing, budget tracking, email drafting, BeyondQuality research, video production. My `CLAUDE.md` grew: dates must be in ISO format, amounts in USD, British punctuation for articles, formal tone for sponsor emails, casual for internal messages, always update the right event file, never touch the budget without recalculating totals.

In the morning I opened the agent and started with budget work. Everything was fine: amounts in USD, files updated, totals recalculated. I realised I had to confirm some prices with conference organisers, so I drafted a few sponsor emails. After that I switched to drafting a blog post. The agent carried the formal tone from the sponsor emails. I corrected it. An hour later, when the blog post was ready, I needed to get back to budgets. The first amount showed up in EUR. The blog post had been about cost savings, with figures quoted in euros. The LLM had spent an hour generating text with euro amounts, and when I switched to budgets, it kept going. The instruction says USD. It's right there in `CLAUDE.md`.

You know this feeling from your own work. Ten browser tabs, three half-finished tasks, a Slack thread you need to respond to, an email you started writing an hour ago. You switch between them and each one gets a little worse. You misspell a name in the email because you were just thinking about the spreadsheet. You put the wrong number in the spreadsheet because you were just reading the Slack thread. Not because you're bad at any of these tasks, but because you're doing all of them at once, and your attention is a shared resource.

The LLM has the same problem, mechanically. This is degradation from chapter 1: the context window is the LLM's attention, and everything in it competes. My budget rules were competing with my writing rules, my email rules, my logistics rules, and the entire conversation so far. There is no priority system, no "important" flag. As the session grows, any instruction can lose the competition.

The fix is the same: stop doing everything in one place.

So I split. Conference management and content writing became two separate agents, each in its own folder with its own `CLAUDE.md`.

This is the second engineering principle: **one agent, one job**. Software engineers have a name for it: the [Unix philosophy](https://en.wikipedia.org/wiki/Unix_philosophy). Write programs that do just one thing but do it well.

Fewer instructions in the context means less competition, which means more reliable behaviour. An agent with five rules will follow all five more consistently than an agent with thirty rules will follow any of them.


---

Previous: [Getting started](04-getting-started.md) | Next: [Self-containment](06-setting-up-a-folder.md)