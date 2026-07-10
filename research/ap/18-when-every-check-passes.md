# When every check passes

In [chapter 3](03-lil-demo.md) I showed the agent that runs my events: conferences, meetups, speaking engagements, and the budget that ties them together. For this chapter I took the budget tracking part and rebuilt it as a small agent of its own: a folder with one file per event, a `budget.md` that aggregates every event's expenses into subtotals and a grand total, a `people.md` with the speakers and the coach, a minimal `CLAUDE.md`, and a single skill, `/expense`, that loads the tracking process ([chapter 11](11-skills-not-instructions.md)). The folder is self-contained ([chapter 6](06-setting-up-a-folder.md)) and git-tracked ([chapter 7](07-git.md)). The whole agent is public, and you can read every file: [github.com/sharovatov/sample-budget-agent](https://github.com/sharovatov/sample-budget-agent).

A spreadsheet could hold these expense numbers. The reason it is an agent instead is that I can talk to it: I hand it a sentence, the way I would brief a PA, ask it questions, and it finds the right file, the right row, and the right amount on its own.

This is what a normal working day with it looks like.

**"Anastasya had another coaching call with Olga yesterday"**. That is the whole request. Anastasya is the coach, Olga is one of the speakers she preps, and nothing in the sentence says which event, which file, which amount, or which date.

![The Olga request, the agent's reasoning, and its summary of the three files it changed](img/01-olga.png)

The agent worked out all four. Olga speaks at the 16 July meetup, "yesterday" was 8 July, this was her fourth coaching call, and a call costs $70. Three files changed: the call table in `speakers-prep.md`, the meetup's expense table, and `budget.md`. It also noticed, without being asked, that the fourth call took Olga to her coaching cap, and rewrote the forecast note to say so.

Then the ritual from [chapter 7](07-git.md): before anything is accepted, I read the diff.

![The whole three-file diff on one screen](img/02-olga-diff.png)

This is `git diff --word-diff -U0`, a compact form of the diff chapter 7 introduced: only the changed lines, with the old and new values highlighted inside each line. The whole change fits on one screen, and you can watch the same $70 climb the chain: speaker prep, event total, meetups subtotal, grand total.

**"EuroStar food came to $850"**. Two files this time: the EuroStar expense table and `budget.md`.

![EuroStar food: the request and the agent's summary](img/04-eurostar.png)

I hadn't said whether the bill was already paid, and the agent didn't guess: it left the Status column blank and asked me.

![The two-file diff for the EuroStar change](img/05-eurostar-diff.png)

**"StarEast taxis came to four hundred and twenty dollars"**. This time the amount arrived in words instead of digits. The agent wrote $420 into StarEast's taxi line, carried it through the totals above, and marked the line Paid.

![StarEast taxis: the request and the agent's summary](img/10-stareast-usd.png)

Three requests in plain English produced seven file updates, and every amount was correct. This is the workflow the whole book has been building, and it works.

## The arithmetic goes to a script

Budgets are money, so the checks around this agent are stricter than around anything else I run. [Chapter 11](11-skills-not-instructions.md) said mechanical work belongs in deterministic scripts, and [chapter 13](13-hooks.md) said mechanical checks do too. The budget's arithmetic is exactly such a check: line items must sum to each event's total, each event's total must match its row in `budget.md`, the rows must sum to the subtotals, the subtotals to the grand total, and every speaker-prep amount must equal the number of calls times $70.

So a small Python script, `reconcile.py`, checks all of it. It rederives every sum from scratch, prints one line per check, and ends with a verdict. I run it after every session that touched money.

![reconcile.py after the Olga change: 32 checks, 0 failed](img/03-olga-reconcile.png)

![reconcile.py after the EuroStar change: the books balance](img/06-eurostar-reconcile.png)

The division of labour is the one chapter 13 set up: my eyes on the diff for meaning, the script on the numbers for arithmetic. The script does not get tired at the twentieth diff of the day.

If you read [chapter 11](11-skills-not-instructions.md) closely, you might ask a sharper question here. The standup skill became a Python script and stopped being the LLM's job entirely, so why not do the same to budgeting and remove the LLM altogether? Because one step cannot be scripted. "Anastasya had another coaching call with Olga yesterday" has to be interpreted: a person resolved to an event, "yesterday" to a date, a call to a rate. That is free-form language, and interpreting it is precisely the part that needs an LLM. It is also the part I keep the agent for: when I say that sentence, I do not have to remember which meetup Olga speaks at, which file tracks it, or what Anastasya charges per call. I give the signal, and the remembering happens on the other side, the way it does with a good PA. You can script the arithmetic, which is what `reconcile.py` is, but not the understanding.

That split is also why the PA-style flexibility from the opening has a lifespan. While a process is young, its structure changes with every event, and a sentence to an agent beats a rigid template. If the process settles down after another season of events, more of it can be standardised away, the way standup was, and what remains is the understanding.

So the agent's work has two layers. Below the boundary sits everything scripted: the sums, the totals, `reconcile.py`. That layer behaves the same way on every run, so checking it once is enough. Above the boundary sits everything the LLM generates: reading the sentence, picking the file, deciding what to do. That layer is produced fresh on every run, and no single check ever settles it. Everything that happens in the rest of this chapter happens in the upper layer.

## The behaviour no script can see

I then made two requests designed to be trouble. Both are bad signals, and the test of a good PA is not how they handle a clear instruction but what they do with a garbled one.

**"Anastasya did a session with Radik on Monday"**. Radik spoke at the 20 April meetup. That event is over, its coaching block is closed and marked FINAL in the records, and Radik already had five calls against a cap of four. There is no right file to add this to. The agent found all of that and stopped:

![The agent asks which event Radik's session should be billed to](img/07-radik.png)

Look at option 3. It does not just offer to reopen the closed block, it prices the consequences: a sixth call against a cap of four, the event total going to $2,870+, the block to twelve calls. The agent understood exactly what saying yes would mean, and it made me choose.

**"Anastasya had a coaching call with Marcus yesterday"**. There is no Marcus in `people.md`, in the prep records, or in any event file. The agent searched all of them, then checked the upcoming events for any hint of a new speaker, and then asked which event Marcus is being coached for:

![The agent asks who Marcus is](img/09-marcus.png)

Both times the agent did exactly what I would want a careful assistant to do: it stopped and asked. And both times, look at what that leaves behind for a checker: nothing. No file changed, so there is no diff to review, and `reconcile.py` reports that the books balance, because nothing touched the books. The behaviour I care about most in an agent that handles money, knowing when not to act, produces no artifact that any deterministic check could inspect. There is nothing to check.

It stopped and asked this time.

## The failure every check blesses

**"EuroStar taxis were 400 euro"**.

The whole book has been circling this bug. [Chapter 5](05-one-agent-one-job.md) told the story of euro amounts leaking into a dollar budget, and [chapter 8](08-sessions.md) told it again at the session level. This budget is dollars-only, every amount in every file. The request hands the agent a euro amount, and no rule anywhere says what to do with one.

![The agent decides to convert, and the confident summary that follows](img/08-taxi-EUR.png)

Read the agent's reasoning in the screenshot from top to bottom, because every step of it is sensible. It notices the event file tracks everything in USD. It checks `budget.md` for how currencies are handled. It searches the repo for a conversion precedent and correctly finds none. Up to this point it has understood the situation perfectly, the same way it understood Radik's closed event and the nonexistent Marcus. Then, instead of asking, it acts. It fetches the day's exchange rate from the internet, converts, writes $456 into the taxi line, keeps a note about the original €400, and carries the amount up the chain without a single arithmetic slip.

Then I ran `reconcile.py`: 32 checks, 0 failed. The books balance.

The books are wrong. Nobody decided that this budget converts currencies. Nobody chose that day's rate. Nobody approved $456 as the amount the company will later reconcile against a bank statement. The agent invented a policy, executed it competently, and produced records that are perfectly consistent and quietly false. The checker passes because the checker verifies that the books agree with themselves, and they do. Consistency is not correctness. A deterministic check can prove the arithmetic; it cannot know what I meant.

This is [chapter 1](01-what-is-an-llm.md)'s exact warning. The LLM generates plausible text, and this failure is more plausible than the correct behaviour would have been: it cites the official exchange rate with its date, it preserves the original amount for reconciliation, it even offers a follow-up correction if the bank charge differs. If I skimmed this diff at the end of a long day, I would approve it. The agent also reached out of its folder to the open internet without asking, which is [chapter 9](09-risks.md)'s lesson about access in miniature.

Now line up the three probes. Radik: no covering rule, and the agent asked. Marcus: no covering rule, and the agent asked. Euro taxis: no covering rule, and the agent acted. It is the same class of situation across three runs, with two different behaviours. The boundary between asking and acting is not a policy: it is a dice roll. It asked twice, but next time it might simply pass.

In the EuroStar food request the agent left the Status column blank and asked me. In the StarEast taxi request it wrote Paid on its own. Both runs succeeded, and they still disagree about the same small decision. Variation is everywhere, in the failures and in the successes. Some of it is harmless, like a Status cell, and some of it is a fabricated exchange rate in the company's books. The only thing that decides which kind you got, today, is a human reading every diff with full attention, every time, forever.

My git history for that day shows a baseline and two tidy commits: Olga's call, EuroStar's food. The euro incident is not in it, because I reverted it. The repo remembers what survived review. Nothing remembers what didn't.

## Once proves nothing

Add up where this leaves the discipline this book has built. Manual diff review catches everything, but only while a human reads everything, and eyes tire. The deterministic checker is precise, but it verifies consistency rather than intent, and it blessed the worst mistake in this chapter. The behaviour I most want from the agent, stopping to ask, leaves nothing behind to verify at all. And every observation above came from a single run of a system that, as [chapter 1](01-what-is-an-llm.md) established, gives different answers to the same question.

This is where the PA comparison stops working. A good PA earns trust, because the person who showed judgment yesterday is the same person showing up tomorrow. The agent is not a person. Its judgment is rolled fresh on every request, and no amount of good behaviour yesterday accumulates into a promise about today. The trust I give a PA is earned once and extended; the only trust an agent can hold is trust that gets re-verified.

There is also another dimension to this complexity. Everything above happened on one model version, in one week. [Chapter 11](11-skills-not-instructions.md) showed what a model update did to a working standup overnight, and [chapter 15](15-change-one-thing-at-a-time.md) built the alert that fires when the model under your agent changes. But that alert answers only "what changed". It cannot answer "does it still work". The complaint I keep hearing from teams that built their own agents ("once it worked, now it doesn't, and I've no clue why") splits into exactly those two questions, and the book so far answers only the first.

The second question needs a way to put the agent into known situations, on purpose, and watch what it does. The euro request, the closed event, the stranger's name, the amount written in words: each of these, replayed against the agent, is a small verdict on whether the behaviour I once reviewed and approved is still the behaviour I get. Replaying them once is not enough: this chapter just showed that once proves nothing. They need to run repeatedly, and again after every model update, because behaviour that survived yesterday proves nothing about tomorrow.

Software engineering has a name for this kind of verification, and [chapter 12](12-using-skills.md) promised this book would come back to it: an evaluation harness, an eval. Building one for this agent, without being a programmer, is the next chapter.

---

Previous: [Analysing your own work](17-analysing-your-own-work.md)
