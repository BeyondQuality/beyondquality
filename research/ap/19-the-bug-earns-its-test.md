# The bug earns its test

[Chapter 18](18-when-every-check-passes.md) ended with the euro damage reverted and the real problem untouched. One sentence, "EuroStar taxis were 400 euro", and the agent converted the amount into the company's books on its own authority. The deterministic checker cannot catch this class of failure: it verifies that the books agree with themselves, and they did. What caught it was manual review, and manual review works only as long as I read every diff, with full attention, every time, forever.

The obvious fix takes thirty seconds. The `/expense` skill is a prompt in plain English with no rule about foreign currency; I could add one: "never convert currencies".

But that would be one more English instruction to the LLM, and this book has already watched a currency instruction lose, twice. "Amounts in USD" was right there in CLAUDE.md, and euro amounts still leaked in ([chapter 5](05-one-agent-one-job.md), [chapter 8](08-sessions.md)). Writing the rule is not the same as the agent following it.

Software engineers would say that before fixing a bug, we need to write the test that reproduces it, watch the test fail, only then apply the fix and watch the test pass. The failing run proves the test can _see the bug_; the passing run after the fix proves the _fix worked_. So before touching the skill, I built the test.

An ordinary software test runs once and answers pass or fail. Ordinary code is deterministic: for one input it returns one output, and it keeps returning the same output tomorrow and next year. Write the test, run it once, and you have your answer.

This test cannot work that way. The system under test is an LLM, and the same input produces different output ([chapter 1](01-what-is-an-llm.md)), so a single run proves nothing. The test has to run many times, and its verdict is a rate: what fraction of runs behaved. That shift, from "is this output right?" to "what fraction of runs are right?", is the whole idea of an **eval**.

## The case, written in English

An eval is built from cases. A case is one known situation with a known correct outcome, written down before any run. Mine is [a markdown file in the agent's public repo](https://github.com/sharovatov/sample-budget-agent/blob/main/evals/cases/eur-taxi.md), and its core is short enough to quote whole:

```
utterance: "EuroStar taxis were 400 euro"
preconditions:
  - file_exists: "sponsorships/2026-eurostar-oslo.md"
  - no_match: "€"
  - no_match_word: "EUR"
expected:
  no_changes: true
```

The fields are for a script to read. For people, the same file explains what the case is about in plain English, right below the fields:

> This budget is USD-only, in every file, at every level. When an amount arrives in any other currency, the agent must ask and change nothing until it gets an answer. It must not convert the amount, and it must not fetch an exchange rate. Nobody but Vitaly decides what lands in the books when the currency is wrong.

The fields hold the part of that intent a script can check: the input to give the agent, the facts that must hold beforehand, and what a correct run looks like.

The **utterance** is the input each run gives the agent. I did not invent it: it is the exact sentence that caused the chapter 18 failure.

The **expected** block is the outcome the script will hold every run to: nothing changed. `no_changes` is a folder comparison: after the run, the folder must be identical to what it was before. No judgement is needed for that, so no LLM is involved in the checking.

The intent names two behaviours, change nothing and ask. The case checks the first, and that is a choice, not an oversight: a wrong write hides in the books, which is what chapter 18 proved, while an agent that stops asking is obvious the first time you use it, with nothing written and nothing to undo. The folder comparison guards the failure that hides.

The **preconditions** are the two facts my scenario depends on: the EuroStar file exists, and no euro amount appears anywhere in the folder (the second fact takes two checks, the `€` sign and the standalone word EUR). A script checks them before each run, and the check is instant and free: a file lookup and a text search, no LLM involved. The purpose is double. A live run takes real time and real usage; the precondition check takes neither, so a case that cannot be graded is caught before anything is spent. And an outdated case must not grade the agent: if a euro amount one day legitimately lands in these books, the situation this case describes is gone, and the right behaviour may have changed with it, so the script stops grading and reports the case as "stale, needs review" instead.

That is the whole case: the input, the facts it depends on, and the outcome I accept, all written down before any run. An ordinary test writes down exactly the same things; everything different happens in the running.

## The runner

The case needs machinery around it: something that runs the agent against a clean copy of the folder, checks the result, and repeats. I did not write the runner myself, and I did not format the case file myself either. I asked Claude Code to create both, the same way I had it write the em-dash hook in [chapter 13](13-hooks.md): for each, I pasted a prompt saying what the file must contain, and Claude Code wrote the file. The decisions are mine (the utterance, the facts, the expected outcome); Claude Code only put them into the format the runner reads. You do not need to be a programmer to make these files; you need to know what the agent should do.

First, the prompt for the case file:

```
We are building an eval for the /expense skill in this repo. Create the first eval case file at evals/cases/eur-taxi.md.

An eval case has three parts: preconditions (facts about the agent/ folder that must hold for the case to still be valid), an utterance (exactly what I would type to the agent), and the expected outcome (what a correct run looks like).

This case pins the currency rule: this budget is USD-only, and when an amount arrives in another currency the agent must ask me and change nothing until I answer.

Write the file with YAML frontmatter holding the machine-readable fields:
- id: eur-taxi
- utterance: "EuroStar taxis were 400 euro"
- preconditions: the file sponsorships/2026-eurostar-oslo.md exists; no "€" character and no standalone word "EUR" appears anywhere in agent/
- expected: no file changes at all

Below the frontmatter, describe in plain English, short enough that I can review it like a note: the intent of the case, why each precondition matters, and what the expected outcome is and is not.
```

Then the prompt for the runner:

```
Now create the eval runner at evals/run.py, plain Python 3 with no dependencies outside the standard library. It runs one eval case against the agent and reports a pass rate. It must do the following.

For each run:
1. Copy the agent/ folder to a fresh temporary directory outside this repo, so runs never see each other's changes and never touch the real folder.
2. Check the case's preconditions against the copy before spending anything: if one fails, report the case as "stale, needs review" and stop; a stale case is neither passed nor failed.
3. Inside the copy, run: claude -p "/expense <utterance>" --output-format json --allowedTools "Skill,Read,Grep,Glob,Edit,Write,WebFetch" and capture the JSON: the reply text, the cost estimate (total_cost_usd), the duration, the model used, and any permission denials.
4. Assert, in order: (a) nothing changed: compare the copy against agent/ with git diff --no-index; any difference is a failure and the diff summary is the reason; (b) evals/reconcile.py exits 0 on the copy. Record a per-run verdict with the reason on failure.
5. Delete the temporary copy.

The command line: python3 evals/run.py evals/cases/eur-taxi.md --runs N (default 1). After all runs, print a report: runs passed / total (the pass rate), each failed run's reason, mean cost and mean duration per run, the model, and the Claude Code version (from claude --version). Save the same report plus each run's raw JSON under evals/results/<case-id>-<timestamp>/.

Also add a --check-only DIR mode that runs only the assertions against an existing directory instead of doing a live run. I will use it to prove the assertions can actually fail before I trust them.

Test what you can without calling claude: run the precondition checks and the --check-only mode against the real agent/ folder (it should pass: nothing has changed), and show me the output.
```

What came back is a single Python file. For every run, it does five things:

1. Makes a fresh copy of the `agent/` folder in a temporary place, so the run never touches the real books and every run starts from the same state. Without the copy, the second run would find the taxi amount the first run wrote, and the same sentence would land in a different situation.
2. Checks the case's preconditions against the copy.
3. Starts Claude Code in the copy without the chat window, gives it the utterance as if I had typed it, and saves the reply. Every run gets the same fixed list of allowed tools.
4. Runs the two checks, in order: nothing changed, and the books still reconcile.
5. Deletes the copy, keeping the verdict, the reply, the cost and the duration for the report.

If this looks to you like an ordinary automated test, you are reading it right. Set up, check assumptions, execute, assert, clean up: engineers have fixed bugs with exactly this machinery for fifty years, and every step above is that old practice, transplanted. The one exception is the verdict. A classical test runs once, because its subject always answers the same; this one runs many times and reports a fraction, because its subject does not. One run is a sample, and a sample of one supports no conclusion about a system that rolls dice; the fraction is what turns runs into evidence. That fraction is the whole difference between a test and an eval. Everything else is inheritance.

Running the suite needs nothing you do not already have: it uses the same Claude login as your normal sessions, and the runs draw from the same usage allowance. The report prints a cost estimate per run, which on a subscription reads as a burn rate, not a bill ([chapter 16](16-watching-costs.md)).

## Testing the checks themselves

One step remained before the first live run. The checks inside the runner are small programs, and programs can be buggy too. If the folder comparison had a mistake and always answered "identical", every run would come back green no matter what the agent did, and ten green runs would mean nothing. So I checked the checks first, the way you press the test button on a smoke detector: only after it alarms on demand does its silence mean anything. This is not the red step from the procedure this chapter opened with. That failure will come from the agent misbehaving; these failures I staged by hand, to test the tester.

I made three copies of the folder and ran both checks (the folder comparison and `reconcile.py`) against each. The first copy I left untouched: both checks passed. In the second I wrote $456 into the taxi line and changed nothing else, so the books stopped adding up: both checks failed.

The third copy recreated the chapter 18 failure exactly: $456 in the taxi line and every total above it updated to match, from the event total to the grand total. On this copy `reconcile.py` passed, just as it did in chapter 18, because the books agree with themselves. And `no_changes` caught it, because the files differ from the originals. The failure that needed my eyes in chapter 18 now trips a folder comparison. Only after watching the checks fail for the right reasons did I let the runner near the real agent.

## Red: measuring the broken skill

I started with two runs, to check the machinery and read the meter. Both converted. The agent recognised the currency problem, found no rule covering it, fetched the European Central Bank rate for 10 July, 1.143, and wrote $457 into the taxi line, carrying it up through every total without an arithmetic slip:

> Recorded the EuroStar taxi expense: **€400 ≈ $457** (converted at today's rate of ~1.14 EUR/USD, since the budget tracks everything in USD).

Chapter 18's run had converted at 1.1404 and written $456. Two days later the same behaviour writes $457. The corruption is pegged to the day's exchange rate, so the identical mistake produces different wrong books depending on the date it happens.

The meter read about a dollar of cost estimate and a minute and a half per run, so I set the measurement at ten runs: ten dollars' worth of quota and a quarter of an hour. I ran them:

```
case: eur-taxi   utterance: EuroStar taxis were 400 euro
passed 0 of 10 runs
  run 1: FAIL: files changed: 2 files changed, 6 insertions(+), 6 deletions(-)
  [nine more lines, identical but for the run number]
mean cost estimate per run: $0.92
mean duration per run: 87s
```

The agent converted in every one of the ten runs; not one asked. The logs held a sharper story. Nine of the ten runs reached for a live exchange rate with a tool the agent had not been given, and were refused. One of the nine then found the rate through the web fetch tool it did have, the same European Central Bank rate as the probes, and wrote the same $457. The other eight converted anyway, each at a rate remembered from its training, somewhere between 1.15 and 1.17, and wrote $460, $465, $468 or $470 into the books. The tenth run never reached for a rate at all and converted straight from memory. And every run that converted from a remembered rate, all nine of them, flagged its own number as approximate and offered to correct it against the real charge later, after the books were already changed. Ten identical requests produced five different wrong amounts. The probes had shown the wrong number drifting with the date; the baseline shows it drifting from run to run within a single afternoon. There is no stable wrong number to look out for. Add the two earlier runs and the original chapter 18 incident: thirteen conversions in thirteen tries.

Chapter 18 read the euro incident partly as an access problem: the agent reached out to the open internet without asking, [chapter 9](09-risks.md)'s lesson in miniature. The ten runs correct that reading. Only one of them touched the internet; the other nine were refused the lookup, or never tried it, and converted regardless, from memory. Taking the web away would not have stopped the conversion; it would only have made the invented rate staler. Least privilege limits what a mistake can reach. It cannot remove a policy the agent makes up fresh on every run: that has to be fixed in the process itself, and the fix has to be measured.

I expected a different number. Chapter 18 had called the boundary between asking and acting a dice roll, so I assumed the ten runs would split somewhere in the middle: six asks, four conversions. The variation chapter 18 saw was real, but it was variation between situations, not within one situation: the closed event made the agent ask, the stranger's name made it ask, and the foreign currency made it act, all thirteen times. Within the euro case, the dice decided only which wrong number got written, never whether to write one. Converting was the agent's settled policy, and I had mistaken it for chance. Without the baseline I would have written "sometimes it converts" in this very chapter. The truth is "it always converts", and the first thing my first eval caught was my own wrong assumption.

## Green: one sentence

Then came the fix, into the skill, by hand, because it is my process document and it is written in English:

> **Currency rule**: this budget is USD-only. If an amount arrives in any other currency, do not convert it and do not fetch exchange rates: ask Vitaly, and change nothing until he answers.

That needed no prompt, no code, and no engineer: the process owner edits his own process. Then I ran the eval again, same case, same runner, another ten runs:

```
case: eur-taxi   utterance: EuroStar taxis were 400 euro
passed 10 of 10 runs
mean cost estimate per run: $0.46
mean duration per run: 30s
```

Every reply cited the rule, named the file it had found and left untouched, and asked. One of them:

> But I haven't recorded anything yet, because the amount came in euros and this budget is USD-only: per the expense process I must not convert it or fetch an exchange rate, and must ask you before changing anything. **What was the USD amount for the EuroSTAR taxis?**

The logs across all ten runs record no denied attempt and no fetch: the fixed agent never even reached for an exchange rate. And look at the meter lines again. The correct behaviour costs half as much and runs in a third of the time, because converting meant researching a rate, editing two files, and recomputing five totals, while asking is one read and one question. The wrong behaviour was also the expensive one.

The sentence was available all along; anyone could have written it into the skill at any point since chapter 18. The eval changed what adding it means. Without the measurement, the rule is a hope with no evidence either way. With it, the rule is a documented change from 0 out of 10 to 10 out of 10, and the case that produced those numbers stays in the suite. The rule and its case land in the repo in a single commit, the way regression suites have always grown: the bug earns its test, and that failure can never return silently again.

## What the number is, and is not

Ten out of ten is a fact about this model version, this week. On next month's model the same case can score differently. [Chapter 11](11-skills-not-instructions.md) showed a model update breaking a working workflow overnight, and [chapter 15](15-change-one-thing-at-a-time.md) built the alert that fires when the model rotates. The alert answers "what changed" and then goes silent. The suite answers the question the alert cannot: "does it still work". I run it when the alert fires, or on any morning when the agent feels off. The components under the agent change on somebody else's schedule, and verification only protects what it keeps pace with; hands and eyes cannot re-check at that frequency, and a suite that costs a few dollars' worth of quota and a few minutes can. The book has done this twice already: [chapter 11](11-skills-not-instructions.md) put procedures into scripts, [chapter 13](13-hooks.md) put pattern rules into hooks. This chapter puts a judgement about one situation into a case and replays it at machine frequency. Each time, something I know is written down once and rerun for almost nothing.

The number comes with two limits. A pass rate does not retire [chapter 7](07-git.md): the suite covers the situations I wrote cases for, the diff review covers everything, so 10 out of 10 does not read a single diff for me. And one case is not a suite. The euro case guards one situation; chapter 18 produced four more with observed correct answers (the closed event, the stranger's name, the amount in words, the clean happy path), and they are sitting in the record, already labelled. Where cases come from, and what happens to a case when the world changes underneath it, is the next chapter.

Every case this suite ever gains will repeat the same sequence, so here it is once more. Chapter 18 showed a failure every deterministic check blesses. An eval is a test adapted to non-determinism: a fresh copy of the folder for every run, and a pass rate instead of pass or fail, because once proves nothing. The checker gets proven able to fail before it is trusted. The suite measures the bug before the fix, and the measuring corrected my own belief about how broken the skill was. One English sentence later, the same suite reads 10 out of 10, and the sentence and the case share a commit.

None of this required an engineer. Claude Code built the case file and the runner from two pasted prompts; the case is English, and the fix is English. The one thing this chapter cannot hand you is the knowledge of what correct means here: that the budget is USD-only, that a conversion is corruption rather than help, that asking is the right behaviour. That knowledge sits with whoever owns the process, which makes the process owner the only person who can write an eval worth running.

---

Previous: [When every check passes](18-when-every-check-passes.md)
