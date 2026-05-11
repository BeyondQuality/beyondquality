# One session, one task

Chapter 5 solved the problem of one agent doing too many jobs. Separate agents, separate folders, separate instructions. But within a single agent, the same problem comes back at the session level.

I have a conference planning agent. One morning I opened it and started reconciling the event budget: pulling numbers from sponsor agreements, checking venue invoices, updating totals. The agent did this well. The context filled up with budget data, currency conversions, line items, calculations.

When the budget was done, I asked the agent what else we had planned for today. It reminded me: the abstract for my talk was due tomorrow. The talk was about economics of testing. Same agent, same conference folder. I drafted the abstract and we started revising and polishing it.

But the context was still full of budget numbers. The LLM has no concept of a finished task. You can tell it "we're done with the budget", but that changes nothing. The budget data is still in the context, and the LLM processes the entire context every time. It can't remember that a task is done, and it can't forget the data from it. Everything in the context competes for attention, always.

The problem showed up immediately: the agent started mixing currencies. The budget had been full of euro figures, and now the abstract about testing economics was getting EUR where it should have been USD. The instruction in `CLAUDE.md` says USD. It didn't matter. Thirty messages of EUR were louder than one line in the instructions.

This is the same problem chapter 5 solved, one level down. Chapter 5 said: separate agents by job, because mixed instructions compete for attention. Within a single agent, separate sessions by task, for the same reason.

The unit of a session is not time. It's a task. "Reconcile the budget" is a session. "Draft the abstract" is a session. "Work on conference stuff for two hours" is not.

This is the fifth engineering principle: **one session, one task**. When you sit down with an agent, pick one thing. Do it. Save the results to files (chapter 6). End the session. Start a new one for the next thing.

When a session has one task, you only load what that task needs. The agent reads fewer files, gets fewer instructions, and operates in a smaller, cleaner context. The output becomes easier to verify (chapter 7), because you know exactly what went in and what should come out.

One task per session solves the attention competition. But a single task can still be too big for one session. A budget reconciliation that involves reading dozens of files, updating spreadsheets, and calling external tools can fill the context window on its own. If your task outgrows the context, you get the same degradation, just from volume instead of mixing.

To keep track, type `/context`.

![/context output](img/context.png)

This session is at 20%, with 77% of the context window still free. That's healthy. When the number climbs past the midpoint, the task is either too big or it's time to save progress and continue in a fresh session.

When you switch sessions, save anything you want to carry forward to files first. Nothing else survives.

---

Previous: [Reviewing changes](07-git.md) | Next: [Risks](09-risks.md)