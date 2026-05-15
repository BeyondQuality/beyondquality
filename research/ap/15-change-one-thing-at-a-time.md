# Change one thing at a time

When my standup broke after Opus 4.7 ([chapter 11](11-skills-not-instructions.md)), I found out where the problem was in minutes. I **knew** that Anthropic had recently updated the model, and I knew I hadn't changed anything else in my agentic system.

That kind of fast diagnosis only works when you can answer one specific question: between the working version and the broken one, what changed? To answer it, you first have to know what the agent is actually made of.

## The agent is not one thing

The agent is a collection of components. Some of them live inside your repo, where git tracks every change (chapters [7](07-git.md) and [13](13-hooks.md) covered how to make use of that). Others live outside your repo, where no version control reaches.

**Inside the repo (every change shows up in `git diff`):**

1. `CLAUDE.md`.
2. Skills under `.claude/skills/`, whether you wrote them yourself or copied them in from elsewhere.
3. Hooks under `.claude/hooks/`.
4. Settings in `.claude/settings.json`. The `/effort` level lives here too when you set it in the file rather than via the slash command.
5. Working files and the prompt you just typed.

**Outside the repo (no `git diff` catches these):**

1. The Claude Code app itself, which Anthropic updates regularly. Updates can change the system prompt, the default tools, and the way hooks fire, even when the underlying model is unchanged.
2. Which model the agent uses by default. Anthropic changes this when a new version ships. Opus 4.7 from [chapter 11](11-skills-not-instructions.md) is the textbook case.
3. Skills installed via `/plugin install`. From Anthropic's official marketplace, Claude Code checks for updates at startup and pulls new versions automatically. From third-party marketplaces, auto-updates are off by default.
4. Auto-memory files at `~/.claude/projects/<project>/memory/`, which the agent writes mid-session unless you denied writes per [chapter 10](10-global-memory.md).

Inside your repo, git is your safety net ([chapter 7](07-git.md)): when something changes, you see exactly what. Outside your repo, components can change without you ever knowing. When the agent behaves differently, you have no way to connect the new behaviour to its cause.

You cannot stop out-of-repo components from changing on their own, but you do control your in-repo changes. When both happen at once, every behaviour shift has multiple suspects and you cannot tell which is responsible. The discipline applies to what you control: **change one thing at a time**.

This is the ninth engineering principle. The discipline is older than software: scientists call it controlled variables, statisticians call it One Variable at a Time (or OVAT), and engineers debugging call it bisection. The names differ, the idea is the same: when you want to know what caused a change in behaviour, only one thing should be allowed to change between the working state and the broken state.

## Inside the repo: discipline plus git

For the in-repo variables, OVAT is straightforward: edit one file at a time, run the agent, and see what happens. If something breaks, `git diff` shows you exactly what changed between the working version and the broken one.

If you edit `CLAUDE.md` and add a new skill in the same session, and the agent starts behaving oddly, you have two suspects and no way to narrow it down. Make one change, run the agent on its normal workload, then make the next change.

## Outside the repo: the alerting hook

Even when you make no in-repo changes, the model can change overnight, and OVAT on its own can tell you only that it wasn't your fault, not what did change.

The 4.7 incident from the opening was diagnosable only because Anthropic announced the update the same week. Without that external signal, all I'd have known is "not me", which is better than nothing (the search space halves) but far from enough when you depend on the agent daily.

A hook from [chapter 13](13-hooks.md) can warn you at session start when an out-of-repo component has changed. It costs nothing to maintain and stays silent unless there's something to warn about.

The implementation below covers the Claude Code version and the default model. Plugin-installed skills need a separate check, not covered here.

Ask Claude Code:

> Write a SessionStart hook that warns me when the Claude Code version or the model has changed since my last session.
>
> 1. Read the SessionStart input JSON from stdin. It includes a `model` field with the current session's model.
> 2. Capture the current CC version with `claude --version`.
> 3. Compare both values against the ones stored at `~/.claude/last-session-state.json`.
> 4. On first run (no state file): write the current values and exit silently.
> 5. If either value differs, emit a `systemMessage` JSON field with text like "ALERT: model changed from sonnet-4-6 to opus-4-7 since your last session" or "ALERT: Claude Code updated to 0.6.4". Then update the state file.
>
> Register the hook as a SessionStart hook in `~/.claude/settings.json` so it applies across all projects.
>
> Test the hook by running the script three times with sample SessionStart input on stdin:
> 1. With no state file present: the hook should write a state file and produce no `systemMessage`.
> 2. With a state file containing fake old values: the hook should produce a `systemMessage` alert and update the state file to current values.
> 3. With the state file now containing current values: the hook should produce no `systemMessage`.
>
> After testing, delete the state file so the first real session creates it from scratch.

Claude writes, installs, and tests the hook. After that, every time CC updates or Anthropic rotates the default model, the session opens with a one-line warning. The rest of the time it stays silent.

When the alert fires, hold any in-repo changes and run the agent on its normal workload first. If it breaks, the out-of-repo change is your suspect. If it doesn't, you can proceed.

---

Previous: [Tokens and costs](14-tokens-and-costs.md)
