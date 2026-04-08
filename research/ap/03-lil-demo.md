# A real workflow

I use several agents for different parts of my job. Let me show you one.

Part of my job is events work: sponsored conferences across the US and Europe, regular meetups in Berlin, speaking engagements at events where Qase isn't a sponsor. At any given moment there are dozens of active threads: booth logistics, speaker coaching, travel, vendor invoices, budget tracking across EUR, USD and other currencies, deadlines for all kinds of tasks and follow-up emails that need to go out this week.

This is just one part of my job, and I'm one person. My attention to details is limited. Before, I was using Notion, Google Spreadsheets, calendar notifications, and email. Just keeping all of these updated was hard enough, let alone making sure they agreed with each other.

Now, I manage all of it with one agent, I'm way more productive and I never forget anything.

My day starts like this: I open Claude Code and type "standup".

![Standup procedure in Claude Code](img/events-standup.png)

The agent recalls everything, checks dates, and comes back with what's overdue, what's due this week, what's blocked, organised by event.

From there I pick what to work on. I have a Deutsche Bank call tomorrow and I don't remember the details:

![Preparing for a Deutsche Bank call](img/db-call.png)

The agent tells me the purpose of the call and gives me a five-point prep list. No digging through email, no re-reading old threads. I just ask.

To complete another task from standup, I messaged Maryia about train logistics for EuroStar Oslo. I tell the agent:

![messaging Maryia](img/maryia.png)

You can see on the screenshot that the agent searched for the relevant context, found it, and updated `sponsorships/2026-eurostar-oslo.md`. That's a file on my computer.

**File search and file editing**: the same tools from the previous chapter. That's all the agent needs to keep track of everything.

Every conference, every meetup, every speaking engagement has its own file. The agent reads them to know what's going on, and writes to them when something changes. That's how it "recalls everything" during standup: it reads the files. That's how it "knows" to update the EuroStar Oslo file when I tell it about Maryia. Tomorrow morning when I type "standup", the agent will re-read the Oslo file, and the Maryia update will be there.

When I tell the agent that Anastasia had another coaching session with Radik, it knows that Anastasia is our speaking coach and Radik is a speaker at the Berlin meetup on April 20th. It knows exactly what to do:

![Budget tracking process](img/budget.jpg)

Three files updated, amounts converted, totals recalculated. 

How does the agent know this process if the LLM is stateless? We covered that in chapter 1: every session starts from zero. The agent doesn't remember yesterday's session or last week's conventions.

With ChatGPT, for each new chat you have to paste all the necessary details and instructions yourself.

With agents, you can store the instructions in a special file, for Claude Code it's called `CLAUDE.md`. Instructions are written in the same natural English you use to talk to the LLM. The agent reads this file at the start of every session and follows it.

![standup instructions](img/standup-instructions.png)

These are my standup instructions for the agent: what files to read to get all the necessary information, and how to process it before displaying.

![budget instructions](img/budget-instructions.png)

These are my budgeting instructions for the agent: what files to update, in which order and how.

Every process I care about is written down in `CLAUDE.md`:

- morning standup
- updating the budget when expenses come in
- drafting emails to conference organisers
- evaluating new sponsorship proposals
- tracking speaker coaching sessions
- keeping track of who's flying where and when
- updating Notion with fresh info for my manager

All of this across six sponsored conferences, four speaking engagements (and more to come!), and nine meetups. Not a single dollar unaccounted for, not a single deadline missed.

You could try doing all of this in ChatGPT by pasting the contents of every file into one chat. But with dozens of event files, budgets, travel plans, and instructions, you'd hit the context limit from chapter 1 long before you covered everything. The agent doesn't have this problem: it reads only the files it needs for the current task, not all of them at once.
