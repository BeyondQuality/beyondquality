# Risks

Within my conference planning agent, I often have to email organisers to clarify or confirm something. I draft these emails with Claude Code. I do not let Claude Code send them.

The draft sits in a file. I read it, check the tone, fix anything that's off, and send it myself. The agent could send the email directly if I gave it access to my email client. It would save me a step every time.

But a sent email is not a local file change. When the agent changes a file, I see it in `git diff` before anyone else does, and I fix it or revert it. A sent email has no such safety net. If the agent gets the tone wrong, uses the wrong amount, or addresses the wrong person, it's already in someone's inbox with my name on it.

LLM producers bear no legal accountability for what their models do. Every major provider's terms of service say the same thing: the output is your responsibility. When the agent sends an email with the wrong number in it, your name is on it, not Anthropic's. Only you are accountable.

The engineering principles from the earlier chapters (self-containment, git review, one session one task) all limit what can go wrong. But they work because the agent operates within a scoped folder where changes are reviewable and reversible. What happens when the agent gets access to your entire computer?

Desktop agents like Claude Cowork and OpenClaw work this way. They run on your machine and interact with your files, applications, and browser. Anthropic's own [documentation for Cowork](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork) states: "Cowork has unique risks due to its agentic nature and internet access". It also states: "Cowork activity is not captured in Audit Logs, Compliance API, or Data Exports. Do not use Cowork for regulated workloads".

These tools invert every safety principle this series has built. The agent is not scoped to a folder (chapter 6). The changes are not reviewable with `git diff` (chapter 7). The blast radius, the scope of what the agent can affect when something goes wrong, is not just your machine but everyone the agent can reach through it: email recipients, web services, APIs. With Claude Code in a git-tracked directory, the blast radius is one folder. What determines the blast radius is what access you give the agent.

This is the sixth engineering principle: **the principle of least privilege**. Give the agent only the access it needs and can reliably handle. In software engineering, [least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege) means a system should operate with the minimum permissions required to do its job. For an agent built on a non-deterministic LLM (chapter 1), this principle is not optional. The agent will make mistakes. The question is how much damage those mistakes can do.

My conference planning agent can draft an email but not send it. It can modify files in its folder but not outside it. Since the agent is non-deterministic (chapter 1) and I am the one accountable for its output, I stay in control of what it does.

When you give an agent access to something, ask two questions: can I review what it's about to do before it does it? And if it gets it wrong, can I undo it with no consequences? If the answer to either is no, don't give the agent that access.
