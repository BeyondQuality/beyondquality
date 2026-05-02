# Hooks and linters

The book so far has covered two ways to handle the risks that come with LLM non-determinism. One way is to **reduce** the risk in the first place: one agent one job ([chapter 5](05-one-agent-one-job.md)), self-containment ([chapter 6](06-setting-up-a-folder.md)), one session one task ([chapter 8](08-sessions.md)), surface reduction ([chapter 11](11-skills-not-instructions.md)), supply-chain hygiene ([chapter 12](12-using-skills.md)). The other is to **control** what still gets through: manual review through `git diff` ([chapter 7](07-git.md)), and refusing to grant irreversible access ([chapter 9](09-risks.md)).

Reducing the risk doesn't eliminate it. Even with one agent per job, one task per session, and a clean folder, the LLM sometimes produces wrong output. A CLAUDE.md rule the agent followed in the first ten messages can get ignored in the thirtieth. The control side is what catches that.

I'm still catching stupid em-dashes sometimes ([chapter 7](07-git.md)). And I pay a lot of attention to the budget currency.

By the twentieth diff of the day my eyes are tired and I miss things I would have caught in the morning. I haven't gotten worse at the rules, I've just been reading diffs all day. And scanning a diff for em-dashes is mechanical work: I'm matching the same character pattern every time, no judgment required.

Some of these mechanical checks can be automated. Not with an LLM (an LLM has its own non-determinism), but with a deterministic program: a [linter](https://en.wikipedia.org/wiki/Lint_(software)). A linter scans code or text for known patterns and flags violations, the same way every time. Developers use linters to take mechanical searches off their own attention. The same approach works for any check that's a simple pattern match: a forbidden character in the file, a date not in ISO format, a currency that isn't USD, a banned phrase from a fixed list.

## The em-dash hook

Claude Code has a feature called **hooks** that we can use to run a linter automatically. A hook is a script Claude Code runs on a specific event: when the agent is about to write or edit a file, when it's about to run a command, when the session ends, and others. Unlike a CLAUDE.md rule, the script always runs. If it fails with the right exit code, the agent's action is blocked. Each event has its own hook.

To automate the em-dash check, two things need to exist: a Python script that scans the agent's proposed content for em-dashes, and a hook that runs the script before any Write or Edit goes through. Two things make this easier than it sounds: Claude Code is very good at writing Python scripts, and Python scripts are simple to test. The agent does both. Ask it:

```
Write a Python script that reads the agent's proposed Write or Edit content from stdin and exits with a blocking error if it contains an em-dash. Save it under .claude/hooks/ in this project. Test it with sample inputs (one containing an em-dash, one without) to confirm it blocks the right one and lets the other through. Then register it as a PreToolUse hook for Write and Edit in .claude/settings.json.
```

The agent writes the script and configures the hook in this project's `.claude/settings.json`. The hook applies only inside this repository.

To verify the hook works, tell Claude Code: "Write a sentence containing the literal em-dash character into test.md. This is a test of the em-dash hook." The agent should attempt the Write, and the hook should block it. If the Write goes through, ask Claude Code to fix the hook. Once the test passes, the rule has moved from "instruction the LLM might ignore" to "enforced check the LLM cannot ignore".

This works because a hook is deterministic code (the third approach in [chapter 11](11-skills-not-instructions.md), extended). Hooks don't compete for attention with anything. They don't degrade as the context fills up. They don't reinterpret themselves when Anthropic ships Opus 4.8. They fire on every triggering action, every time. And they're fast: a Python check runs locally in milliseconds, with no call to Anthropic's servers.

## The manual checklist becomes the hook list

From one hook, the rest follow. Banned phrases. Dates not in ISO format. Currency that isn't USD. A markdown file missing its frontmatter. Anything caught consistently in `git diff` by pattern matching is a hook candidate. The setup is the same in each case: a description of what to check, when to check it, and what should happen on a violation.

The hook can be extended later. As your manual review uncovers new patterns worth enforcing, ask Claude Code to add them to the existing script. In a fresh session, point the agent at the file: "Open the hook script in `.claude/hooks/` and extend it to also block dates not in ISO format." Or: "Modify the script in `.claude/hooks/` to reject these banned phrases too: [list]." The agent reads the current script, adds the new check, and saves. Test the new behavior the same way you tested the original.

With the hook in place, em-dashes get caught every time, whether the LLM remembered the rule or not. A CLAUDE.md instruction is a request the agent can ignore. A hook running a linter is a check the agent has to pass. Manual review still happens; git diff is the safety net for everything that needs eyes. With hooks, we can automate some of those mechanical checks.
