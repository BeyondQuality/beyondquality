# Tokens and costs

Tokens are the unit of every LLM interaction. Whatever you ask the LLM to do, the input you send and the output it sends back are measured in tokens (a token is roughly a word or a piece of a word; [ch1](01-what-is-an-llm.md) introduced it). Tokens cost you money in one of two ways.

**The API.** You pay Anthropic or OpenAI per token. The bill arrives at the end of the month. The meter is running continuously, and you can see it.

**The subscription.** You pay a fixed monthly fee. Anthropic offers four paid plans (Pro, Max, Team, Enterprise); OpenAI offers similar plans for ChatGPT. Either way, the provider gives you a token budget that resets on a schedule (sessions, days, or weeks). When the budget is hit, you're locked out until the next reset. The meter is still running, but you don't see the bill: only the cap shrinking, and only if you check.

If you pay a flat monthly fee, you're on a subscription. If you pay per token of usage, you're on the API. Most readers of this book, including those whose company provides access, are on a subscription.

The careless workflow either hits its limits fast or pays extra. The discipline is the same in both: keep what loads minimal, push work into scripts and tools, watch the meter.

Without those disciplines, the meter runs unchecked and costs compound silently, sometimes for weeks before anyone notices. I've recently read a report how one team came back to a usage bill that was tens of thousands of dollars higher than expected.

They had set up four AI agents to coordinate market research. Two of those agents got trapped in a dialogue loop, and for eleven days they passed messages back and forth. Each individual request succeeded. Each response came back well-formed. The dashboards looked normal. The only signal that anything was wrong was the cumulative cost, and by the time it surfaced four agents had spent the better part of a month talking to each other without producing anything useful. ([Reported on Medium in November 2025](https://medium.com/@theabhishek.040/our-47000-ai-agent-production-lesson-the-reality-of-a2a-and-mcp-60c2c000d904). The pattern is well-attested across many similar accounts; specific figures from any single account aren't independently documented.)

This is not a one-off. The internet is full of similar stories: agents that loop, jobs that retry forever, sessions that outgrow their budget.

## Why a long session costs more than many short ones

Recall from [chapter 1](01-what-is-an-llm.md) that the LLM is stateless. Every time you send a new message, the chat app or agent assembles the entire conversation so far into one big input and sends it. The LLM has no memory of yesterday's session and no memory of the message you sent five turns ago: each turn, it gets the whole transcript fresh. That's what makes long sessions expensive in a way that surprises people.

In a thirty-turn session by turn 30, the input being sent isn't just the latest message: it's all 29 prior user messages, all 29 prior LLM responses, your CLAUDE.md, any files the agent has read, and finally your new message. Every one of those tokens is being charged for, again, on this turn. The same conversation history was charged for on turn 29, and on turn 28, and so on back to turn 2.

Add it all up, and the total cost grows quadratically with conversation length. Doubling the number of turns roughly quadruples the input cost. By turn 30, a single session has used roughly fifteen times the total tokens that thirty separate single-turn sessions would have. On API pricing, where input tokens are cheaper than output, the dollar multiple is closer to five. On a subscription, where every token counts equally toward your cap, the cap-burn multiple is closer to fifteen.

That's the same point [ch8](08-sessions.md) made on attention grounds. A long session blurs the task boundaries and degrades the LLM's focus; the fix was to scope each session to one task and start fresh. The cost lens reaches the same conclusion through different math. Continuing in the same session because "we're already here" looks free in the moment, but you're paying for the full conversation history on every subsequent turn.

Short sessions are cheap. Long sessions are disproportionately expensive.

## The meter

Cost is invisible by default. You don't see the bill until the end of the month, and you don't see the subscription cap until you hit it. Until then, every turn, every paste, every tool call accumulates without registering.

Claude Code has a direct answer. The `/cost` command shows your current session's token use, how it's tracking against your plan limits, and an estimated dollar spend for API users. The Anthropic Console shows your account-wide usage.

Pair it with `/context` from [ch8](08-sessions.md). The two meters tell you different things. `/context` warns when the session is loading up. `/cost` tells you what that loading is costing. They tend to climb together, because per-turn input size drives both. When either climbs past the midpoint, both call for the same response: save what matters to files, end the session, start a new one.

Glance at `/cost` while you work, the way you glance at `/context`. The meter only helps if it's checked during work, not after.

## Two places the cost goes down

**Keep CLAUDE.md minimal.** Every line in CLAUDE.md loads at the start of every session and gets resent on every subsequent turn. A 200-line CLAUDE.md costs roughly twenty times more per turn than a 10-line one, for content that's often the same instructions repeated. [Ch11](11-skills-not-instructions.md) argued for a minimal CLAUDE.md on attention grounds; ch14 adds cost. The two arguments stack. Look at your CLAUDE.md and ask of every line: does the agent need this every session, or only sometimes? Move the "sometimes" content to separate files (`people.md`, `policies.md`, `procedures.md`) and reference them from CLAUDE.md only when needed. [Ch11](11-skills-not-instructions.md)'s first approach (separate files for data) is the same move, now with a cost-side reason on top.

**Push procedures into scripts.** [Ch11](11-skills-not-instructions.md) named "Cheaper" as one of four benefits of converting skills into scripts. The `/standup` skill, before it became a script, spent tokens every time it read each event file, parsed dates, cross-referenced today's date, and composed the output. The Python script does the same work for zero tokens. If you run standup every morning, that's a recurring cost moved off the meter for good. Anywhere you have a skill that does mechanical work without judgement (reading, counting, sorting, reformatting), the same conversion saves you the same way.

The cost lens doesn't add new principles. It adds a second reason for the ones already in place. Minimal CLAUDE.md was already good for attention ([ch11](11-skills-not-instructions.md)); it's also good for cost. Short sessions were already good for focus ([ch8](08-sessions.md)); they're also good for cost. The `/context` meter you already watch doubles as a cost meter when paired with `/cost`. The cheap workflow and the reliable workflow are the same workflow.

---

Previous: [Hooks and linters](13-hooks.md)

