# Direction 3: Preserving Human Intent with Tiden

Discussion: https://github.com/BeyondQuality/beyondquality/discussions/28

This document proposes a Direction 3 approach (shaping the construction process itself rather than inspecting agent output after the fact): an asynchronous workflow for product, QA, and engineering specialists working with coding agents around [Tiden](https://tiden.ai/). Against our [research question](analysis-research-question.md), it aims to satisfy the intent and lifecycle conditions directly: preventing intent debt during construction for explicitly stated decisions, producing human-authored anchors for tests and documentation, and keeping those anchors coherent through maintenance and team turnover (the lifecycle gap left open by synchronous [collaborative building](proposal.md)). On comprehension, it accepts that line-by-line code comprehension debt will accumulate, and tests whether supervising and gating agents through specs and verification evidence keeps human understanding sufficient to supervise, intervene, and evolve the system.

**Disclosure and evaluation commitment:** Vitaly Sharovatov, a contributor to this research, works at Qase as a developer advocate, and discussions within this research helped inform Qase's development of Tiden. This proposal sets out an open evaluation of whether the Tiden workflow actually satisfies those conditions, following the companion [Tiden evaluation plan](tiden-evaluation2.md). We plan to publish evaluation methods, benchmarks, and results as the work progresses, including negative and inconclusive findings, and to release experiment code as open source where feasible. We invite criticism, collaboration, and application of the evaluation framework to other tools and processes addressing the same problems.

---

## Context

The [analysis](analysis.md) identifies two debts that accumulate when implementation is delegated to coding agents: comprehension debt, the loss of the "how", and intent debt, the loss of the "why" (the business problem, the reasons for decisions, and the tradeoffs people consciously accepted, without which a team cannot judge whether behaviour should remain, change, or disappear even when the code still works). Because inspecting or generating tests from agent output after the fact cannot recover missing intent ([evaluation](evaluation.md)), any candidate that satisfies the [research question](analysis-research-question.md) has to shape construction itself.

The [collaborative-building proposal](proposal.md) investigates a synchronous answer: product, engineering, and QA judgment participate together in commit-sized construction steps while a single agent implements. That arrangement faces practical staffing and scheduling constraints:

- One QA engineer supporting five developers (the 5:1 ratio) cannot attend five concurrent building sessions.
- Product expertise and decision authority are often shared across several parallel workstreams.
- Synchronous multi-role sessions impose calendar, timezone, and opportunity costs even when total delivery economics favour prevention.

At the same time, stepping away from live multi-role sessions gives up capabilities that synchronous collaboration provides by construction: real-time discovery of unstated requirements and edge cases as code emerges, dialogue-driven engineering comprehension retention ([Shen & Tamkin, 2026](analysis-agents.md)), and gradual [cross-role T-shaping](proposal.md#secondary-effect-t-shaping-by-exposure) across product, engineering, and QA participants. Any asynchronous alternative has to compensate for those losses or show where they remain manageable.

This motivates investigating an asynchronous configuration built around [Tiden](https://tiden.ai/): product, QA, and engineering specialists shape shared specs, constraints, and decision records asynchronously, while individual engineers work with coding agents inside a supervisory workflow that supplies relevant intent before coding, gates session completion on verification evidence across affected specs, and stages distilled updates for review (consulting colleagues when unfamiliar ambiguities arise). Separate developer sessions sharing product and QA specialists provide the first experimental setting, though the two proposals are not mutually exclusive: synchronous collaborative building could also pair with Tiden to [capture and maintain session outputs as the system evolves and teams rotate](proposal.md#6-open-questions).

---

## Scope

This document sets out a testable hypothesis and its operating model; empirical validation belongs to the companion [Tiden evaluation plan](tiden-evaluation2.md). Five boundaries define its scope:

- **One concrete tool and process:** This proposal examines a specific asynchronous workflow around Tiden wrapping an external coding agent, not asynchronous or spec-driven development in general.
- **Asynchronous team setting:** It focuses on engineers working in separate agent-assisted sessions with shared Product and QA support. Synchronous multi-role building is covered in the [collaborative-building proposal](proposal.md); combining the two is left as a comparison arm rather than developed here.
- **Boundaries on the two debts:** On intent, it covers decisions, reasons, and tradeoffs that people state or confirm; it does not capture unspoken intuition or judge whether a business decision itself was wise. On comprehension, preserving line-by-line familiarity with generated code is deliberately out of scope; it asks only whether spec-and-gate supervision keeps understanding sufficient to *supervise*, *intervene*, and *evolve*.
- **Model capabilities held fixed:** Improving the underlying LLM's reliability or weight-level learning (such as fine-tuning) is out of scope and treated as an external variable ([research question](analysis-research-question.md)).
- **Behavioural verification on supported stacks:** It covers spec-linked automated testing where test runners and reporters are available. It does not replace system-level practices outside feature specs (such as load testing, chaos engineering, or open-ended exploratory testing).

---

## 1. The core hypothesis

The hypothesis has two parts. First, adding Tiden's shared specs, decision records, pre-coding context injection, and session-close test gates can keep stated human intent intact across sessions, changes, and team turnover. Second, supervising the coding agent through those specs and test gates can reduce the need for line-by-line code comprehension during everyday delivery, at a total cost justified by avoided rework and less manual checking.

On comprehension, the [research question](analysis-research-question.md) notes that "If intent is well-preserved and agents are highly reliable, the team needs less comprehension", while pointing out that unsupervised models today still produce plausible-looking, subtly wrong code. Rather than assuming a better base model, this hypothesis bets on raising the reliability of the *supervised workflow* around the agent. Specs and functional tests check external product behaviour rather than internal code structure, so passing tests can still hide [structural erosion](analysis-lifecycle.md) across repeated autonomous edits. Even if routine manual code reading drops away, teams may still need architectural understanding to *evolve* the system and code-level debugging to *intervene* when automatic repair gets stuck.

The hypothesis predicts four effects from introducing Tiden into the workflow:

- **Earlier decisions constrain new construction.** A feature request rarely repeats every existing obligation, so an agent can satisfy a new prompt while quietly breaking an established rule. Injecting relevant specs and active decisions before coding gives the agent both the requested change and the existing product properties it must preserve.
- **Unverified or incompatible changes trigger in-session repair.** Gating session completion on runner-reported passing tests across touched and neighbouring specs (supported by mandatory spec settlement and advisory scope and decision checks) returns missing coverage and failing checks directly to the agent for investigation and repair before hand-off.
- **Reasoning and known unknowns remain usable across sessions.** A later engineer or newcomer can inspect not only an active rule, but also the stated rationale, rejected alternatives, accepted tradeoffs, and whether a reason was never recorded, even when the original decision-makers have rotated out.
- **Specialists coordinate asynchronously around one operational record.** Product, QA, and engineering contributors can author constraints, test expectations, and corrections asynchronously without attending every coding session live, while each developer's agent receives applicable requirements and file-overlap alerts across concurrent sessions.

For these effects to hold in practice, captured records must represent human intent without fabricating rationale, retrieval must surface the right obligations before and during edits, linked tests must genuinely falsify violations of those specs, and agents must repair real discrepancies rather than routing around gates through weak assertions or rubber-stamped waivers. Section 2 details how Tiden's operating model structures those steps, Section 4 weighs the proposed economic savings against offsetting costs and failure modes, and the [evaluation plan](tiden-evaluation2.md) tests each link in the chain.

---

## 2. The operating model

Physically, Tiden is neither its own coding agent nor a standalone pull-request review bot. It wraps an external coding agent (such as Claude Code, Codex, or Cursor) through a hosted product-record and verification service, a local CLI, agent workflow skills, optional host lifecycle hooks, and test-runner reporters connected to Git and CI. Inside Tiden, editable Markdown **specs** describe observable product behaviour and carry **file anchors** (stored links to the repository file paths that implement them), provenance, and revision history. Separate atomic **decision records** store explicitly stated choices, quoted rationale, rejected alternatives, and whether a human or an agent made the call. Proposed updates to specs, decisions, and test links stage on a reviewable **Tiden intent branch** inside Tiden's store, separate from the repository's Git branch and pull request. Verification also separates two gates: a **session-close gate** controls whether the coding agent can finish its current task session, while a broader **product or branch quality gate** evaluates branch or release readiness across coverage, test results, run freshness, component risk, and production issues.

### Who does what

| Participant | Responsibility |
|---|---|
| People with product or domain authority | Author or review planned and active specs, business rules, stated reasons, rejected alternatives, and accepted tradeoffs asynchronously in Tiden (or state them when starting or clarifying tasks). Answer novel policy questions and authorise policy revisions. |
| People providing engineering and QA judgment | Contribute technical and architectural constraints, edge cases, component risk calibration, and test expectations to shared specs and suites. Review Tiden intent branches, session-close hand-off reports, and test links. Step in for complex diagnosis or architectural decisions. |
| Coding agent (following Tiden's skill workflow) | Rewrites the task into two to five checkable promises and records stated choices and provenance. Writes application and test code, links tests to specs, and records mid-session clarifications. At settlement, judges whether each spec anchored to a touched file needs updating or stays accurate, binds delivered promises, and submits rubric-constrained waivers, risk acceptances, or neighbour test deferrals when obligations remain open. |
| Tiden (CLI and hosted service) | Stores canonical and branched specs, decisions, and test links, and validates structural and rubric rules. Builds the session's working contract from pre-edit text matches and post-edit file anchors. Flags overlapping sessions on shared files and untracked Git merges, runs advisory scope and decision checks, ingests runner-reported test results, and enforces session-close and quality gates. |
| Test runners and reporting integrations | Execute automated test suites in the target environment and report case-level pass/fail results keyed by test signature back to Tiden. |

These are responsibilities rather than job titles or fixed headcount. Product, QA, and engineering contributors can define constraints and review proposed record updates asynchronously without attending every coding session live. In the initial experimental setting, engineers work in separate agent-assisted sessions while sharing access to product and QA specialists; one person may also hold multiple responsibilities.

### Before implementation

Product, QA, and engineering contributors can author or refine planned specs, acceptance criteria, risk constraints, and decisions in Tiden ahead of coding, or an engineer can state a new objective and its reasons when starting a session. Asynchronous authoring avoids three-person calendar alignment, though it introduces a familiar handoff tradeoff: without live construction-time dialogue, pre-written specs can be incomplete, ambiguous, or noisy (echoing the specification limits in [the agents analysis](analysis-agents.md) and the signal-quality risks in the [industry-response evaluation](evaluation.md#direction-1-inspection)).

Before writing code, the coding agent rewrites the user's request as an observable product property and breaks it into two to five concrete, user-observable **promises**. Every stated ask in the prompt must map to a promise, map to a recorded decision, or carry an explicit drop reason, or session start refuses to proceed. Decisions are labelled as human-authored with a quoted rationale only when a person stated both the choice and the reason; agent-inferred choices are labelled as agent-authored with no invented rationale, and unstated business reasons stay blank so known unknowns remain visible ([specs documentation](https://docs.tiden.ai/docs/product/specs)).

Tiden then injects a **working contract** into the agent's context. Because no code diff exists yet at session start, initial retrieval finds candidate specs by **text match** against the stated objective, alongside any named planned specs. The contract also surfaces active historical decisions attached to those specs, their anchored repository paths, unresolved test gaps carried over from prior sessions, unfinished or held intent branches, commits merged to Git outside a Tiden session, and overlap alerts when another open session or linked pull request modifies the same files. Once the agent edits code and refreshes session state, Tiden switches from text match to a deterministic **file-anchor blast radius**: specs directly anchored to changed files, plus one-hop neighbour specs that share an anchored file or sit directly above or below in the spec tree (sharing a product component label alone does not connect specs).

For an established (brownfield) codebase, Tiden can import requirements from issue trackers or documents, ingest supported repository test suites, or draft initial specs from existing code. Code inference, however, describes only what the current implementation does; it cannot recover unrecorded historical business reasons. If legacy or prior AI-generated code contains a bug, cursory or bulk human approval can ratify that bug into "human-confirmed" baseline intent, reproducing the [generative ratification loop](analysis-lifecycle.md) during onboarding unless reviewers check inferred specs carefully against domain knowledge.

### During construction

The coding agent writes application code and automated tests against its working contract, refreshing the contract if requirements shift mid-session so newly affected file anchors enter scope. When the agent recognises an ambiguity, it asks the person running the session (who can consult product or QA colleagues) and records resulting choices as human-authored decisions with quoted rationale and rejected options. Because language models lack tacit shared understanding ([agents analysis](analysis-agents.md)), the agent can still fill unrecognised gaps silently.

At the end of implementation, Tiden separates **hard session-close blocks** (which refuse session completion and keep the session open) from **recorded and advisory checks** (which save findings for context and review without blocking close):

1. **Hard session-close blocks (refusing session completion on open obligations):**
   - *Mandatory settlement:* Any session with a non-empty code diff must record a structured settlement distilling proposed spec updates, new specs, and attached decisions (or explicitly state that a pure refactor, tooling edit, or test-only change alters no product behaviour).
   - *Explicit judgment on touched specs:* Every existing spec anchored to a modified file must receive an explicit settlement decision, either updating its prose, attaching a decision or non-goal, or stating in one line why its current text remains accurate. Risk acceptance cannot bypass an undecided spec on a touched file.
   - *Passing tests across touched and neighbouring specs:* Session close blocks while any active spec anchored to a changed file, created or edited in the session, or sitting one hop away lacks a linked test, lacks a reported run, or fails. Clearing an open spec requires either a **runner-reported passing test**, an explicit **risk acceptance** under a five-part rubric (restricted to environment limits, external blockers, quoted human scope boundaries, changes with no user-observable effect, or broken test infrastructure, rejecting effort, volume, bare out-of-scope claims, or user silence), or, for untouched one-hop neighbour specs with missing or unrun tests only, a **test deferral**. Unsettled planned specs without failing tests do not block close.
   - *Dropped-promise check (when strict enforcement is enabled):* Frozen session promises that are neither bound to a settled spec nor waived under a four-part rubric (superseded, moved to a named task, dropped by a quoted human decision, or already covered by an existing spec) are always flagged at close, and block close when strict promise enforcement is turned on.
2. **Recorded and advisory checks (saved on the session without refusing close):**
   - *File-scope drift check:* Compares edited file paths against the anchored paths retrieved at session start and records whether edits stayed within, extended, or diverged from expected files. It checks file paths rather than internal business logic and never blocks close.
   - *Current-session LLM decision check:* Uses a language-model judge before settlement to compare the diff against decisions frozen *in the current session*. It skips when the session recorded no new decisions and reports divergence as an advisory warning rather than refusing settlement or close.
   - *Historical decisions in scope:* Earlier decision records attached to retrieved specs enter the working contract with quoted rationale and rejected options as read-only context; they do not block gates automatically.
   - *Criteria notes and product or branch quality gates:* Per-criterion coverage notes on touched specs, product-wide background summaries, and branch quality gate verdicts (incorporating run freshness, component risk, and production issues) are reported at session close and prompt follow-up when blocked, without refusing session close itself.

When a hard block refuses close, Tiden returns the exact open test gaps or undecided specs so the coding agent can inspect the discrepancy, repair code or tests, re-run the test reporter, and retry within the same session. This replaces unstructured agent self-certification with runner-backed execution results and rubric checks, subject to a [testing theatre](evaluation.md#direction-1-inspection) risk: the coding agent itself still judges whether touched spec prose remains unchanged, binds delivered promises, drafts risk-acceptance and waiver reasons, and writes new test assertions.

### Closing the session and starting the next

Settlement writes proposed spec updates, atomic decision records, and branch test-link declarations to the session's **Tiden intent branch** rather than overwriting canonical main, and links the Git pull request to that branch. Human review spans two complementary surfaces: Tiden's intent-branch diff preview displays **spec-tree changes only**, whereas risk acceptances and neighbour test deferrals sit on the **session record and session-close hand-off report**. Reviewers must check both surfaces if waived or deferred test gaps are to be caught before merge ([intent capture](https://docs.tiden.ai/docs/how-to/configure-agents#set-up-intent-capture), [branches](https://docs.tiden.ai/docs/product/branches)).

Continuity across turns and sessions depends on the coding-agent host. **Claude Code and Codex** (once the user approves hook trust in Codex) support lifecycle hooks that surface unfinished intents on prompts, block agents from truncating Tiden CLI output, and warn before ending a turn with unchecked verification; Claude Code also restores working contracts after restarts or context compaction. Hosts without equivalent hook APIs, such as **Cursor, Gemini, and Copilot**, rely on skill instructions and passive session-end or post-commit capture. No host hook locks an engineer out of editing unrelated files; hard refusals happen only when CLI gate commands run. How reliably enforcement holds across turns and hosts is tested directly in the [evaluation plan](tiden-evaluation2.md#questions-for-the-experimental-program).

Merging a finished intent branch applies its proposed spec updates, decision records, and test links to canonical main. Because settlement updates behavioural spec prose when code changes, keeping explicit human decision records separate from code-synchronised spec descriptions is essential: updating a record, authorising a policy change, and passing tests are distinct events whose interaction must be tested empirically.

The operating cycle is therefore:

**Shared multi-role intent → working contract injected at task start → implementation and runner-backed session gates → in-session repair, rubric-constrained deferral, or human decision → intent-branch and hand-off review → updated context for subsequent work.**

---

## 3. From preserved intent to prevention and better appraisal

### Earlier intent shapes new construction

Consider an online shop whose product owner decides (adapting the refund example from the [research question](analysis-research-question.md)):

> Refunds above $500 require manager approval. We accept slower processing of large refunds because we want to limit refund abuse.

Suppose the team also records a rejected alternative (requiring approval for every refund was rejected because support could not handle the volume), while never stating why $500 specifically was chosen rather than $400 or $600.

Weeks later, an engineer asks a coding agent to add bulk refunds without repeating the $500 approval rule. A batch containing a $100 refund and a $1,000 refund must still leave the $1,000 refund awaiting manager approval. When Tiden pulls the refund approval spec and its attached decision record into the working contract before coding (or resolves it through file anchors once refund files are edited), the agent receives both the new bulk-refund objective and the existing $500 rule it must preserve.

The recorded rationale matters alongside the rule. An engineer who notices that a user could split a $1,200 refund into three $400 batch entries can read the recorded abuse concern and consult the product owner. Any resulting cumulative-limit decision and rationale then enter the shared record for later sessions. Supplying cross-feature intent before incompatible code is written is the workflow's primary prevention mechanism.

### Verification returns incompatible work for correction

Suppose that despite receiving the working contract, the coding agent writes bulk-refund code that pays both the $100 and $1,000 refunds automatically. Applying the gate rules from Section 2 shows what catches that mistake and what does not:

- **Advisory checks do not block session close here.** Bulk refunds edit the expected refund module files, so the file-scope check sees expected paths. Because the bulk-refund prompt recorded no new decision in this session, the current-session LLM decision check skips (and is advisory even when active), while the earlier $500 decision record sits in the working contract as read-only context.
- **Blocking session close therefore depends on touched and neighbouring test gates** (alongside forcing the agent to review touched spec text during settlement). If an existing automated test linked to the $500 approval spec exercises the shared refund path and fails, or if a touched or one-hop neighbour spec lacks a reported passing run, session close blocks and returns the failure or missing test to the agent for repair.

Two practical boundaries govern that test evidence ([Tests documentation](https://docs.tiden.ai/docs/product/tests), [reporting integrations](https://docs.tiden.ai/docs/integrations/overview#test-reporters)):

1. **Runner signature matching versus assertion quality.** Tiden's import and linking skills instruct the coding agent to read existing test bodies before linking them to specs. A test linked to the approval spec that only submits $100 refunds, or asserts that a $1,000 refund pays automatically, still produces a green gate status unless a person or agent checks the test body against the spec.
2. **Test-runner and import support.** Automated gating depends on supported runners and static test import. Native wrappers or reporters currently cover Go and JavaScript suites in Vitest and Playwright, whereas Jest and unintegrated runners require a JSON report bridge, and several ecosystems (such as pytest, PHPUnit, XCTest, and C++) lack native reporters or static signature import rules.

Within the [Cost of Quality framework](evaluation.md#the-economic-argument-coq-and-direction-12), this makes the Tiden workflow a hybrid: authoring and injecting multi-role human intent before coding is construction-time prevention, while gating session close on reported test runs and driving in-session repair are automated inspection and testing embedded inside construction.

### Interrupting the generative ratification loop

The [lifecycle analysis](analysis-lifecycle.md) describes how self-referential artifact generation turns compensation artifacts into drift ratifiers:

**Wrong AI-generated code → tests generated from that code accept the wrong behaviour → documentation generated from the code and tests presents it as intended → a new session treats those artifacts as authoritative.**

As in the [collaborative-building proposal](proposal.md#from-tests-to-all-lifecycle-artifacts), breaking that loop requires anchoring downstream artifacts in human-confirmed intent rather than code surface. Tiden aims to provide that external anchor by storing human-stated specs and atomic decision records separately from repository code.

Because settlement updates touched spec prose when code changes, keeping explicit human decision records (with human-versus-agent provenance and quoted rationale) separate from behavioural spec descriptions prevents routine code edits from quietly overwriting the recorded "why". Human review of intent branches and hand-off reports before merge remains the primary safeguard against ratifying a buggy implementation into canonical specs, a boundary tested directly in the [evaluation plan](tiden-evaluation2.md#unit-and-time-horizon).

### Corrections and revised decisions change future work

People can correct an inaccurate captured spec or formally revise a business policy when product requirements change. Within an active session, revising an earlier session decision keeps the prior wording as a rejected alternative under the new rationale rather than silently overwriting it. Across later sessions, an authorised policy revision records a new atomic decision record and updated spec prose on an intent branch while retaining spec change history.

A newcomer can use both retained rationale and **preserved known unknowns** before proposing changes. Someone asked to speed up refunds can read the abuse tradeoff and the rejected approve-all option, choosing either to optimise processing within the $500 policy or to ask the product owner to revisit that tradeoff explicitly. Conversely, if asked why $500 was chosen rather than $400, the absence of any invented human rationale lets the newcomer recognise a genuine unknown rather than acting on a fabricated explanation.

### Mapping to the eight-factor framework

To maintain strict rubric parity with the [industry-response evaluation](evaluation.md#evaluation-framework), the table below uses the same `{Yes, Partially, No}` scale. Unlike the shipped products assessed there, every rating here describes a **hypothesised mechanism under empirical evaluation, not an established result**:

| # | Factor | Addressed? |
|---|---|---|
| 1 | Code volume | **Partially** (candidate): context injection, file-anchor test gating, runner reporting, and in-session repair execute per session at agent speed, *but* human scrutiny of intent-branch spec diffs, session-close hand-off reports, clarifications, and test links still scales with change velocity (skipping that review increases ratification risk). |
| 2 | Comprehension per line | **No** (by design): does not preserve line-by-line human comprehension of generated code; instead tests whether spec-level supervision and session gates suffice for routine delivery, and measures where stalled repairs, escaped faults, or [structural erosion](analysis-lifecycle.md) still require manual code and architectural understanding. |
| 3 | Feedback loop | **Partially**: closes the in-session test-and-repair loop and persists specs, decisions, and production issues across sessions, *but* provides structured recall and gate enforcement rather than the consequence-grounded human judgment updating described in [the agents analysis](analysis-agents.md#cant-we-just-patch-this-the-limits-of-current-compensation-mechanisms), and human spec and risk curation still runs slower than machine-speed change. |
| 4 | Shared understanding | **Partially**: narrows specification gaps by sharing explicit multi-role specs, constraints, and decisions asynchronously across sessions, *but* the coding agent still lacks tacit shared understanding for assumptions nobody has articulated ([pre-AI baseline](analysis-pre-ai.md), [agents analysis](analysis-agents.md)). |
| 5 | Test independence | **Partially**: human-authored specs and existing suites define *what* gets tested independently of new code, and Tiden's linking skills have the agent read existing test bodies before linking them. When the same coding agent writes both new feature code and new tests, however, they can share a misreading of the spec, and Tiden's gates verify a fresh passing run by test identity rather than checking test assertions. |
| 6 | Novel failure modes | **Partially**: catches plausible-looking but wrong code when linked tests fail on recorded obligations, *but* advisory LLM checks share model blind spots and subtle errors in unspecified behaviour or weakly asserted tests can pass. |
| 7 | Business domain understanding | **Partially**: retains and injects explicitly stated domain rules, rationale, tradeoffs, rejected alternatives, and component criticality, *but* still relies on people for company-specific risk calibration ([business domain understanding](analysis-pre-ai.md#business-domain-understanding)) and recognising novel business exceptions. |
| 8 | Intent preservation | **Partially** (primary target, under test): preserves *explicitly stated* human decisions, quoted rationale, rejected alternatives, known unknowns, and human-versus-agent provenance across sessions and turnover, subject to agent classification accuracy and branch-merge behaviour; tacit unstated intent and previously lost historical reasons remain outside its reach. |

---

## 4. The economics argument

The research began with a capacity and Cost of Quality problem: agent-generated code arrives faster than humans can inspect and test it after the fact, while flawed specifications amplify into wrong code at machine speed. Tiden's economic case rests on three proposed savings, weighed against per-session overheads, human curation demands, and comprehension-debt risks.

### Proposed saving mechanisms

- **Fewer incorrect attempts.** Supplying cross-feature specs and active decisions before coding aims to prevent locally plausible implementations that break existing product rules. That avoids tokens and engineering time otherwise spent reconstructing context, diagnosing avoidable regressions, and rewriting code.
- **Less manual appraisal against stated intent.** Product and QA specialists can record a business rule, abuse rationale, or boundary expectation once rather than re-explaining and manually re-checking it on every pull request. Routine omissions or failing neighbour checks return directly to the coding agent inside the session.
- **Less manual regression testing on supported stacks.** Where native runner wrappers or reporters exist, automated test execution and in-session repair loops can reduce repetitive manual regression checking after code edits and fixes.

### Offsetting costs, failure risks, and scaling limits

- **Per-session token and tool overhead.** Every Tiden-supervised session adds token spend (injecting and refreshing working contracts, fetching candidate specs, running pre-settlement LLM decision checks, distilling settlements, and running repair retries) on top of commercial platform licensing. **Cost transparency note:** Just as [Claude Code Review](evaluation.md#direction-1-inspection) charges a linear per-PR inspection fee (the "trust tax") and [JiTTests](evaluation.md#direction-2-ai-generated-tests) carries unpublished per-change inference costs, Tiden's commercial pricing and token-overhead multipliers cannot be assumed away. Evaluation reports must publish complete token, model inference, and tool costs per task so linear cost growth with agent output volume stays visible.
- **Human curation effort versus testing theatre.** Maintaining a trustworthy product record takes recurring human work: authoring or refining planned specs, answering mid-session clarifications, **reviewing both intent-branch spec diffs and session-close hand-off reports**, auditing spec-to-test links, fixing brownfield inferred specs, and maintaining JSON report bridges for unintegrated test runners. If teams skip that curation and rely passively on green test statuses while agents satisfy gates with weak assertions or routine risk-acceptance waivers, supervision degrades into [testing theatre](evaluation.md#direction-1-inspection): green checks that give the appearance of thorough verification without real assurance.
- **Parallel-session collisions and growing test suites.** Letting engineers run parallel solo sessions increases total change volume, creating more cross-stream collisions as every active stream can interact with every other ([agents analysis](analysis-agents.md#two-types-of-companies-now-with-agents)). Pre-coding spec injection and file-overlap alerts aim to cut those collisions without live three-role sessions, while neighbour test gates aim to catch knock-on regressions inside the session. Even so, untangling real conflicts across streams is harder when neither engineer deeply knows the generated code, and growing suites of agent-written tests increase shared CI flakiness ([pre-AI baseline](analysis-pre-ai.md#proactive-qa-companies)).
- **High debugging cost when bugs escape and agent repair stalls.** Skipping line-by-line code reading saves time during routine delivery, yet makes manual diagnosis harder when humans must step in ([agents analysis](analysis-agents.md#the-economics-shift-boehms-curve-in-the-ai-era)). Having preserved specs and decisions alongside the code may let the coding agent diagnose many escaped bugs itself (though agent debugging capability itself sits outside this research). When the agent gets stuck on a subtle fault, however, tracing unfamiliar AI-generated modules by hand is slow and expensive. Whether upfront prevention and session gates save more than those stalled repairs and escaped bugs cost over time is an empirical question.

### Measuring the complete cost

Within the [Cost of Quality framework](evaluation.md#the-economic-argument-coq-and-direction-12), fewer implementation retries or faster initial coding yield a net economic gain only if total prevention, appraisal, internal rework, and external failure costs fall per verified change. Evaluation must therefore sum all model tokens, inference spend, and Tiden tool fees alongside role-disaggregated human effort and wait-queue delays (Product, QA, and Engineering), setup and curation work, and the full cost of diagnosing stalled repairs or escaped defects.

---

## 5. Evaluation

An empirical evaluation must test four linked questions: whether explicitly stated human intent and known unknowns survive and guide subsequent work; how much drift is prevented upfront versus caught by hard test gates or advisory signals (versus masked by weak assertions or escape hatches); where code-level comprehension debt forces manual code inspection or permits structural erosion; and whether net outcomes justify the complete multi-role operating cost.

The first experiment isolates what Tiden adds by keeping everything else equal. Two groups run the same tasks with the same coding agent, model, and access to Product and QA specialists: one group uses Tiden and the control group does not. To avoid a strawman comparison against undocumented chat, the control group records the exact same human decisions, reasons, and revisions in standard repository files (Markdown specs, ADRs, `CLAUDE.md`, and CI tests). That tests whether Tiden's context injection, file-anchor tracking, and session-close gates outperform disciplined repository documentation alone.

Testing organisational staffing claims requires extending beyond that two-arm baseline to a four-way comparison across solo existing workflow, solo with Tiden, synchronous [collaborative building](proposal.md), and collaborative building paired with Tiden, complemented by a targeted sub-comparison of hook-enabled versus hookless coding-agent hosts. The companion [Tiden evaluation plan](tiden-evaluation2.md) specifies the outcome metrics, experimental controls, longitudinal stress scenarios, scoring rubrics, and falsification criteria.

---

## 6. Open research questions

- **How much verification and repair can the supervised loop complete genuinely, and where do escape hatches or host limits weaken it?** Which discrepancies do agents prevent or fix autonomously under Tiden's session gates, how often do false-green test assertions or risk-acceptance, promise-waiver, and test-deferral exits require human audit, and how much does enforcement degrade on hookless agent hosts compared with Claude Code and Codex?
- **Where does spec-level supervision suffice, and where does code-level comprehension debt still require code understanding?** Can engineers supervise and extend a growing system primarily through specs and session gates, or do stalled repairs, cross-module bugs, and longitudinal [structural erosion](analysis-lifecycle.md) still demand recurring manual code reading and architectural intervention, and at what cost?
- **Does human intent stay authoritative through retrieval, intent-branch merges, concurrent sessions, and turnover?** When brownfield code is onboarded, when intent branches are reviewed and merged, or when policies change mid-flight across parallel sessions, does current human intent govern subsequent work while keeping unstated reasons recognisably unknown?
- **When is asynchronous Tiden supervision economically and organisationally preferable, or complementary, to synchronous collaborative building?** Across role-disaggregated Product, QA, and Engineering load (including the 5:1 QA ratio), full token and tool costs, cross-stream coordination friction, and rework rates, where does solo development with Tiden outperform a disciplined repository spec/ADR baseline or synchronous collaborative building, and where does combining collaborative building with Tiden perform best?

---

← [Collaborative-building proposal](proposal.md) | Next: [Tiden evaluation plan](tiden-evaluation2.md) →

See also: [Research question](analysis-research-question.md), [Industry-response evaluation](evaluation.md), [Research hub](analysis.md).
