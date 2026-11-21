# Tiden evaluation plan

Discussion: https://github.com/BeyondQuality/beyondquality/discussions/28

Companion to [Preserving Human Intent with Tiden](proposal-tiden2.md).

This plan sets out how to test the hypothesis in [Preserving Human Intent with Tiden](proposal-tiden2.md) empirically. An evaluation has to answer four questions. First, do explicitly stated human decisions, business reasons, and known unknowns survive and guide later work? Second, do session gates and in-session repair loops catch drift genuinely rather than collapsing into [testing theatre](evaluation.md#direction-1-inspection)? Third, where does code-level comprehension debt force manual debugging or allow [structural erosion](analysis-lifecycle.md)? Fourth, do the results justify the full multi-role operating cost?
[agy: these opening questions - do they "match" what we had promised ourselves in the proposal-tiden2.md? ]

---

## What to measure

Four groups of outcome measures test the claims and risks in the proposal:

1. **Intent preservation and use.**
   - Accuracy of recorded business rules, stated reasons, accepted tradeoffs, rejected alternatives, human-versus-agent provenance labels, human corrections, authorised policy revisions, and **preserved known unknowns** (keeping missing business reasons blank rather than inventing them).
   - Counts of omissions, distorted meaning, fabricated rationales attributed to humans, mislabelled provenance, and later sessions following an outdated policy after an authorised revision.
   - Whether relevant intent enters the session before affected code is written, whether newcomers recover it accurately during handover, and whether people and agents actually use it when making follow-on product or technical changes.

2. **Behavioural adherence, gate behaviour, and mechanism attribution.**
   - System behaviour checked against an independent ground-truth test suite, separating **first-pass prevention** (the initial code already conforms thanks to injected context) from **in-session detection and repair** (mistakes caught by session gates and fixed before hand-off).
   - Attribution across the stages of Tiden's [operating model](proposal-tiden2.md#2-the-operating-model):
     - *Retrieval recall and precision:* how well pre-coding text matching and post-edit file-anchor tracking pull in relevant specs and miss others, and how much irrelevant spec clutter enters the session.
     - *Hard session-close blocks:* how often session close refuses completion on missing settlement, undecided touched specs, missing or failing tests on touched and one-hop neighbour specs, or unfulfilled session promises (when strict promise enforcement is enabled), and whether the agent resolves each block cleanly. Also track whether a blocked branch quality gate leads to follow-up repair or stays unresolved.
     - *Advisory checks:* how often file-scope drift checks and current-session LLM decision checks flag a problem, and whether the agent or engineer fixes the issue or closes past the warning.
     - *Escape hatches and false-green tests:* independent audit of every promise waiver, risk acceptance, neighbour test deferral, and claim that a touched spec needs no text update, separating valid reasons from rubber-stamped excuses. Also count **false-green test links**, where a linked test passes in the runner while failing to check, or inverting, what the spec requires.

3. **Supervision, intervention, and structural health under comprehension debt.**
   - *Manual diagnosis when repairs stall or bugs escape* (matching the [comprehension scope](proposal-tiden2.md#scope) and [the collaborative-building experiment](proposal.md#5-experimental-program)): fault-localisation accuracy, human minutes spent reading unfamiliar agent-generated code, number of human repair instructions, and total time to fix a multi-module bug when agent repair gets stuck or a defect escapes past session close.
   - *Predicting behaviour without reading code:* how accurately supervising engineers predict edge-case behaviour on new inputs using specs and session reports alone.
   - *Longitudinal structural erosion* (tracking the SlopCodeBench pattern in [the lifecycle analysis](analysis-lifecycle.md)): code verbosity, duplication, complexity concentration, and architectural boundary violations across sequential feature checkpoints. This tests whether external behavioural specs and functional tests allow internal code structure to decay unless architectural rules or code review step in.

4. **Complete cost, role load, and delivery.**
   - *Model and tool spend:* total input and output tokens, model inference spend across context injection, refreshes, LLM checks, settlement, and repair retries, plus Tiden licensing fees. Report all costs per task and sprint alongside the control group ([economics argument](proposal-tiden2.md#4-the-economics-argument)).
   - *Human effort and waiting time by role:* active minutes and queue delays logged separately for **Product**, **QA**, and **Engineering** participants to test the 5:1 QA ratio and shared-product-specialist assumptions directly.
   - *Time by activity:* authoring or updating specs, answering mid-session clarifications, **reviewing both intent-branch spec diffs and session-close hand-off reports** (where risk acceptances and neighbour test deferrals appear), auditing spec-to-test links, cleaning up brownfield inferred specs, setting up test reporters or JSON report bridges, manual testing, and manual code debugging.
   - *Concurrency friction, rework, and throughput:* file-overlap alerts across parallel sessions, spec and code merge conflicts, untracked Git commits merged outside Tiden, fraction of fixes that introduce new regressions elsewhere, CI runtime and flake rate as agent-written tests accumulate, and total completed, independently verified changes per sprint.

Fewer regressions alone only show better behavioural compliance. Testing the full intent-debt hypothesis also requires showing that human reasons and known unknowns survive and guide later decisions, because intent debt can build up quietly while existing tests still pass.

---

## Conditions to compare

The first controlled trial holds team setup constant across two groups:

| Condition | Workflow |
|---|---|
| Existing workflow | Engineers work in separate agent-assisted sessions using repository specs, ADRs, agent instruction files (`CLAUDE.md`, `REVIEW.md`), chat, and CI test suites, with shared asynchronous access to product and QA specialists. |
| Existing workflow with Tiden | The same team setup, model, and specialist access, adding Tiden's shared specs and decision records, working-contract injection, settlement, runner-backed session gates, and intent branches. |

Both groups receive the exact same initial business rules, stated reasons, rejected alternatives, planned corrections, and authorised policy revisions. To avoid a strawman comparison against undocumented chat, the `Existing workflow` group records those same inputs in structured Markdown specs, ADRs, and CI tests.

To test staffing tradeoffs and whether synchronous and asynchronous approaches complement each other ([open research questions](proposal-tiden2.md#6-open-research-questions)), a follow-up study compares four configurations:

1. **Solo engineer + existing workflow** (disciplined repository specs, ADRs, and CI).
2. **Solo engineer + Tiden** (asynchronous Product and QA spec collaboration plus session gates).
3. **Synchronous collaborative building** ([collaborative-building proposal](proposal.md): Product, Engineer, and QA steering one agent together in commit-sized steps).
4. **Collaborative building + Tiden** (testing whether Tiden provides the missing [session-capture and lifecycle-coherence layer](proposal.md#6-open-questions) to keep shared understanding intact across maintenance and team rotation).

While the main comparison keeps the coding-agent host fixed, a targeted **host-enforcement sub-comparison** runs identical multi-turn tasks and restarts across three host tiers:

- **Claude Code**, which supports prompt reminders, session-restore hooks after restarts or context compaction, CLI output guards, and turn-end verification warnings.
- **Codex**, which supports prompt, output-guard, and turn-end hooks once the user approves hook trust, without session-restore hooks.
- **A hookless host** (such as Cursor, Gemini, or Copilot), which relies on skill instructions and passive end-of-session or post-commit capture.

---

## What to hold fixed

Across compared groups, hold constant the starting codebase, task sequence, base language model and reasoning settings, agent autonomy limits, participant responsibilities, and specialist availability. Whenever someone performs manual testing or manual code reading in any group, log what triggered it, which role did the work, and how long it took.

Evaluators maintain an independent ground-truth register of all supplied human rules, stated reasons, tradeoffs, rejected alternatives, deliberate known unknowns, and authorised revisions. That register is the sole reference for scoring retained intent and running independent black-box behavioural tests; workflow-generated specs and agent-written tests never establish their own correctness. Fresh sessions receive only what their assigned workflow retains naturally, with identical rules on prior chat transcripts across groups.

Evaluators observe sessions passively during the trial without feeding findings back into either workflow. Any post-trial fix prompted by evaluator findings is logged separately from natural workflow recovery.

Record the exact tool and workflow settings that affect enforcement: Tiden CLI and service versions, whether strict promise enforcement blocks session close or only logs open promises, whether intent branches merge automatically or require manual approval, branch and release quality-gate thresholds, whether settlement runs manually in-session or falls back to background capture, whether test results flow through native runner integrations or a JSON report bridge, and which host lifecycle hooks are active. Because automatic intent-branch merging and mandatory manual approval before updating canonical specs are distinct workflows, analyse them separately.

---

## Unit and time horizon

### Optional Stage 0: Brownfield onboarding probe

For experiments on established codebases ([operating model](proposal-tiden2.md#2-the-operating-model)), start from a working application seeded with one subtle pre-existing bug (where current code diverges from intended domain policy) and one undocumented rule whose original business reason does not appear in code. Run Tiden's code-to-spec inference and existing test import, then observe normal human review before feature work begins.

Measure whether reviewers spot and fix the inferred bug or rubber-stamp it into "human-confirmed" baseline intent, whether unrecorded historical reasons stay marked as unknown rather than invented, and how much human time goes into spec cleanup, test-link checking, and test-runner setup.

### Core pilot sequence (Stages 1–5)

A controlled pilot starts from a small application and a fixed set of supplied human inputs. Using the refund scenario, seed the trial with four items: (a) refunds above $500 require manager approval, (b) the team accepts slower large refunds to limit refund abuse, (c) requiring approval for every refund was rejected because support could not handle the volume, and (d) a **deliberate known unknown** (no reason is ever given for choosing $500 rather than $400 or $600). Run five sequential stages:

1. **Asynchronous multi-role setup and cross-feature constraint.** Product records the $500 rule, the abuse reason, and the rejected alternative. QA adds boundary ($500 versus $500.01), mixed-batch, and duplicate-submission test expectations. In a fresh session, an engineer asks the coding agent to build bulk refunds without mentioning the $500 rule.
2. **Inaccurate capture and human correction.** Seed a deliberate error in a captured spec or decision record, have a human correct it through the workflow's normal interface, and run a fresh session in the same area to check whether the corrected intent governs new code and tests.
3. **Authorised policy revision.** Test both revising a decision mid-session (which keeps the earlier wording as a rejected alternative) and authorising a policy change in a later session with a new business reason. Check whether subsequent coding sessions and newcomers follow the revised policy rather than the old one, while still being able to read why the policy changed.
4. **Newcomer handover and known-unknown probe.** Hand the project to a participant with no access to earlier sessions and assign two tasks: (a) propose a change to speed up refunds (testing whether they recover and address both the abuse tradeoff and the rejected approve-all option), and (b) explain why the threshold was set at $500 specifically (testing whether they report that the exact number's reason was never recorded, rather than attributing an invented reason to the original decision-maker).
5. **Stalled-repair intervention and multi-iteration structural check.** After several autonomous feature iterations, introduce a cross-spec fault or architectural change that cannot be fixed by a single-line local edit. Record whether Tiden's session gate and repair loop produce a genuine fix, or whether the agent tries to exit through weak test assertions, questionable risk acceptances, or neighbour test deferrals. When automatic repair stalls or a subtle bug escapes, measure how long an engineer carrying comprehension debt takes to find and fix the fault by hand, alongside code verbosity, complexity, and architectural-boundary trends across all checkpoints.

Between these seeded probes, run ordinary feature tasks to measure natural drift, gate-block rates, and mid-session clarification rates.

### Expansion to concurrent workstreams and longer horizons

Replicate the full sequence across multiple products, tech stacks, and **parallel workstreams** working on separate Tiden intent branches at the same time. Concurrent trials track shared-file overlap alerts, intent-branch merge ordering, commits merged to Git outside Tiden sessions, and **mid-flight policy revisions** (testing whether a policy change merged to canonical specs reaches an already-open sibling session when it refreshes context, or goes unnoticed until session close). Extending these trials across sprint and quarter horizons measures cross-stream coordination friction, rework regression rates, structural erosion, and team rotation over time.

---

## How to judge outcomes

### Intent preservation and use

Score each item from the evaluator's ground-truth register (rule, stated reason, accepted tradeoff, rejected alternative, known unknown, correction, and authorised revision) as faithfully retained, partly retained, missing, mislabelled in provenance, or contradicted. Count fabricated human rationales separately, and evaluate each item across four progressive steps:

| Observation | Evidence |
|---|---|
| Retained in the record | The current record represents the supplied decision, rationale, rejected options, and provenance accurately, reflects authorised revisions while keeping change history readable, and leaves known unknowns uninvented. |
| Available before affected work | The coding agent's injected working contract (or the human participant's retrieved view) contains the relevant current intent before affected code is written. |
| Recovered by a later participant | A newcomer states the active rule, its reason, and the rejected alternative accurately, and recognises when a specific reason (such as why $500 exactly) was never recorded. |
| Used in a subsequent decision | The participant's implementation or proposal respects the active decision or escalates an authorised revision explicitly, addressing the recorded tradeoff rather than ignoring it. |

For example, suppose a newcomer asked to speed up refunds recalls the abuse concern, yet removes manager approval above $500 without addressing fraud risk: that shows retention without appropriate use. Optimising processing within the $500 rule, or asking the product owner for a bounded policy change that weighs delay against abuse, shows appropriate use. Separate consequential intent loss (an unauthorised payout, an outdated policy enforced, or a design built on a fabricated rationale) from latent rationale loss whose behavioural harm has not yet surfaced. Cite the exact ground-truth item and session evidence for every score, and report ambiguous cases separately.

### Prevention, detection, and correction

Save complete session logs and test-runner reports across context retrieval, clarifications, advisory checks, settlement, waivers, gate blocks, and hand-off reports. Exclude expected mid-build red test runs (such as test-first runs before application code is written) from failure counts. Classify each completed task or seeded fault into one of five outcomes:

1. **First-pass prevention:** the first implementation submitted for verification passes all independent behavioural checks without needing gate blocks or human correction.
2. **Hard gate detection and automatic repair:** session close blocks on missing settlement, undecided touched specs, missing or failing tests on touched or neighbour specs, or unfulfilled enforced promises, and the agent fixes the code and tests to pass independent checks without human help. Count false-alarm blocks on already-valid work separately.
3. **Advisory warning heeded versus ignored:** a discrepancy is flagged only by non-blocking checks (file-scope drift or the current-session LLM decision check). Record separately whether the agent or engineer fixed the issue or closed the session past the warning.
4. **False-green pass or invalid escape hatch:** the session closes cleanly while violating ground-truth intent because linked tests make weak or inverted assertions, because the agent wrongly marked a touched spec unchanged or claimed an unmet promise was delivered, or because it exited through a promise waiver, risk acceptance, or neighbour test deferral whose justification fails independent audit. Even factually valid waivers, risk acceptances, and test deferrals are logged as **unresolved obligations** rather than verified completions.
5. **Human-assisted diagnosis and repair:** a person steps in to repeat an existing rule, trace a bug in code, fix a spec or test link, or direct a code fix. Log the role, trigger, active minutes, and queue wait time, separating genuinely new product policy decisions from rescuing stalled agent repairs or repeating already-stated rules.

### Supervision, structural health, and complete cost

Set common per-task time limits, token caps, and human-assistance rules before the main comparison, calibrated during the pilot. Counting a task as a **completed, verified change** requires both the new behaviour and existing rules to pass the evaluator's independent test suite, with the workflow's own verification finished cleanly. Tasks closed via risk acceptances, test deferrals, or promise waivers over unmet ground-truth requirements, or stopped at time or token caps, count as unresolved while keeping 100% of their spent tokens, tool fees, and human minutes in the cost totals.

Sum total delivery cost within the [Cost of Quality framework](evaluation.md#the-economic-argument-coq-and-direction-12). Include model tokens and inference spend, Tiden tool fees, and **role-disaggregated human effort and wait delays (Product, QA, and Engineering)** across spec authoring, clarifications, reviewing both intent-branch spec diffs and session-close hand-off reports, auditing spec-to-test links, brownfield spec cleanup, test-reporter setup and bridge maintenance, manual testing, and manual debugging when repairs stall. Report those costs alongside structural-erosion trends across checkpoints, and log evaluator scoring time separately so measurement work is never mixed into delivery cost.

---

## What would weaken or falsify the hypothesis

- **Retrieval or influence failure:** Captured records are richer than baseline docs, yet relevant specs or active decisions fail to enter affected sessions (through missed matches or noisy context clutter) or fail to improve implementation and handover decisions.
- **Ratification or fabricated rationale:** Human corrections disappear, unstated reasons are fabricated as human-authored rationale (failing the known-unknown probe), or buggy implementations and brownfield defects are routinely ratified into canonical specs during review and merge.
- **Testing theatre via weak assertions or escape hatches:** High session-close pass rates rest on false-green test links, weak agent-written assertions, unreviewed intent-branch merges, or routine risk acceptances, test deferrals, and promise waivers rather than genuine compliance with human intent.
- **Comprehension-debt breakdown and structural erosion:** Skipping line-by-line code reading leads to stalled repairs, slow manual bug hunting, rising rework regressions, or compounding [structural erosion](analysis-lifecycle.md) whose debugging and refactoring costs outweigh construction-time savings.
- **Staffing bottleneck shift rather than relief:** Asynchronous spec writing, clarification queues, reviewing intent-branch diffs and session-close reports, and curating test links consume as much Product, QA, and senior engineering time per verified change as synchronous [collaborative building](proposal.md), or cost more than the defects avoided over disciplined repository specs and ADRs.
- **Lifecycle decay:** Single-feature gains disappear once teams run parallel sessions, revise policies mid-flight, or hand the codebase to newcomers.

Better record retention without better downstream decisions would show only an archival benefit. Matching outcomes at lower total cost would show an efficiency benefit. Better outcomes whose multi-role human effort, token spend, and tool fees exceed the cost of avoided failures would undermine the economic case even if intent preservation succeeds.

Set practical effect-size thresholds before running the main comparison, report uncertainty intervals, and leave inconclusive findings inconclusive. Any benchmark published by Qase or third parties must release its task prompts, Tiden and control configurations, raw session logs, human interventions, waiver and test-link audits, scoring rubrics, and failures in full so independent readers can critique and replicate the results.

---

## Questions for the experimental program

- **How much verification and repair can the supervised loop complete genuinely without human help?** Which mistakes are prevented upfront, which are caught and fixed via hard session-close gates, and which surface only through advisory warnings? How often must humans step in, and how often do false-green test assertions, risk acceptances, promise waivers, or test deferrals hide unresolved bugs?
- **How reliably do session-close gates and host hooks keep unverified work from closing or being forgotten across coding-agent hosts?** How consistently do hard session-close blocks, lifecycle hooks on Claude Code and Codex (including Codex's hook-trust prompt), hookless fallbacks on Cursor, Gemini, and Copilot, and carry-over reminders in later sessions keep unfinished verification visible across restarts?
- **How accurately does context retrieval track affected rules across pre-coding and parallel work?** What are the recall and precision of pre-coding text matching versus post-edit file-anchor tracking, how well are unanchored files handled, and do mid-flight policy changes and shared-file alerts reach open parallel sessions in time?
- **Where does spec-level supervision suffice, and where is manual code or architectural understanding still required?** Can engineers supervise and extend features while carrying line-by-line comprehension debt, or do stalled repairs, cross-module bugs, and [structural erosion](analysis-lifecycle.md) still demand recurring manual code reading and architectural intervention, and at what cost?
- **Do business reasons, tradeoffs, and known unknowns survive alongside behavioural rules?** Does the workflow preserve stated rationale, rejected alternatives, and accurate human-versus-agent provenance while keeping unrecorded reasons recognisably unknown rather than invented?
- **Does human intent stay authoritative through onboarding, intent-branch merges, policy revisions, and turnover?** During brownfield onboarding, intent-branch review and merge, repeated policy revisions, and newcomer handovers, does current human intent govern subsequent work or give way to ratification?
- **What are the complete net economics and role-level staffing effects?** Across full token, inference, and Tiden tool costs plus role-disaggregated Product, QA, and Engineering time, queue delays, spec and hand-off review, test-link auditing, runner setup, and manual debugging, when does Tiden beat disciplined repository specs and ADRs, and does it ease the 5:1 QA ratio?
- **How do asynchronous Tiden supervision, synchronous collaborative building, and their combination compare as complexity and concurrency grow?** Across solo existing workflow, solo with Tiden, synchronous [collaborative building](proposal.md), and **collaborative building paired with Tiden**, how do comprehension debt, intent debt, cross-stream coordination friction, rework regression rates, and long-term spec coherence compare as products and parallel workstreams scale?

---

← [Preserving Human Intent with Tiden](proposal-tiden2.md) | Next: [Industry-response evaluation](evaluation.md) →

See also: [Collaborative-building proposal](proposal.md), [Research question](analysis-research-question.md), [Research hub](analysis.md).
