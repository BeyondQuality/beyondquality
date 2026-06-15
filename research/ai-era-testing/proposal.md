# Direction 3: AI-Enabled Collaborative Building

Research by Lilia Abdulina (Head of QA at JetBrains), with Vitaly Sharovatov.

Discussion: https://github.com/BeyondQuality/beyondquality/discussions/28

**Status: early draft. Emerging from discussion, not yet polished.**

---

## Context

The [analysis](analysis.md) identifies two debts that accumulate when AI agents enter the development process: comprehension debt (loss of the "how") and intent debt (loss of the "why"); and how this accumulation negatively affects the business. The [evaluation](evaluation.md) shows that current industry responses (JiTTests, Claude Code Review) optimise inspection of agent output without addressing the debts. Section 4 of the analysis poses the central research question: is there a configuration of people, process, and AI agents that can prevent both debts from accumulating during construction, keep comprehension sufficient for supervision and evolution, produce human-authored anchors for lifecycle artifacts, and keep those anchors coherent as the system is maintained and teams rotate?

This document proposes a Direction 3 approach: AI-enabled collaborative building. It aims to satisfy the first three research-question conditions directly and to partially address the fourth.

---

## Scope

This proposal is **one** Direction 3 hypothesis, not the only one. It addresses three of the four research-question conditions (preventing intent debt during construction, keeping comprehension sufficient, producing human-authored anchors for lifecycle artifacts) through a single process change: collaborative building. The fourth condition (maintaining those anchors over turnover and extension) is partially addressed via session-captured inputs feeding downstream artifact generation, but remains open (see §6). Agent learning and reliability are separate levers, out of scope here so that the process-change hypothesis can be tested without entanglement.

The proposal is also a hypothesis, not a settled answer. The collaborative pattern is already happening in practice in some teams, but the claim that it meaningfully reduces comprehension and intent debt at the team and lifecycle level has not been empirically validated. Section 5 sketches what such validation would look like. Section 6 lists what remains genuinely open even if the hypothesis is validated.

---

## 1. The core hypothesis

The hypothesis: when two or more people collaborate at small iteration grain while delegating implementation to an AI agent, three things change at once: intent debt stops accumulating, comprehension debt is structurally minimised, and lifecycle artifacts can be generated from human-authored inputs rather than reverse-engineered from code.

- **Intent debt does not accumulate during construction.** The people making the decisions are present while the thing is being built. Intent is never delegated during the session, so it cannot be lost there. (Lifecycle persistence is a separate problem; see §6.)
- **Comprehension debt is structurally minimised.** The engineer participates in incremental construction: they help decide what to build, they see each small step emerge in the context of decisions they just made, they are in a dialogue with the agent. The comprehension they maintain comes from participation in the decisions, not from reading code. This is consistent with the Shen & Tamkin (2026) finding that conceptual engagement with AI preserves comprehension while passive delegation does not, though that study examined individual conceptual questions rather than multi-person construction sessions.
- **Lifecycle artifacts have a human-authored anchor.** The same collaborative session produces clean inputs of intent, risk, and design rationale. Downstream artifacts (intent docs, comprehension docs, tests, onboarding) generated from these inputs carry the *why* and the *what-we-decided* from the human side of the session rather than being reverse-engineered from AI-generated code, breaking the generative ratification loop from [analysis: lifecycle drift](analysis-lifecycle.md). (Mechanism developed in §3.)
- **Granularity is the load-bearing parameter.** The three claims above depend on the iteration grain staying small enough that the team makes the decisions step by step: what to build next, and whether each result is right. The team is not writing the code, the agent does that; they are guiding it, deciding and judging at each step. An iteration is that small when it produces one coherent commit: a change a person can capture in a hand-written message, the why and the how of it. That message is the change's record of both debts, the intent and the comprehension (the human-authored artifact from §3). It is also self-checking: when no one can write a coherent message, the change was too big or too tangled, so split it. If instead the team prompts the agent to plan and execute large autonomous blocks ("plan this and build it all, no questions asked"), the working mode reverts to delegation: intent gets handed off in one shot, comprehension never builds, session outputs no longer capture the decisions that would anchor lifecycle artifacts, and the debt dynamics return to those of the solo-with-AI baseline. The commit-sized iteration is the operational handle on "small enough"; the exact threshold at which the dynamics collapse, and whether that handle tracks it, is an empirical question (see §5).

This pattern is already happening in practice (see discussion thread), and the mechanism is consistent with the cognitive science evidence in the analysis (generation effect, desirable difficulties). What has not yet been empirically validated is whether the collaborative configuration produces the predicted reduction in comprehension and intent debt at the team and lifecycle level. Section 5 sketches what such validation would look like.

---

## 2. The collaboration model

### Minimum viable team

The baseline is three roles, each contributing something the others cannot. Q #2 in §6 considers when fewer may suffice for lower-risk features.

**Product person** (or domain expert): carries the "why". Knows the business problem, the user needs, the tradeoffs the team has consciously accepted. Without them, the team builds the wrong thing.

**Engineer**: participates in incremental construction. Does not "review code" in the traditional sense (code review is a very weak appraisal method, particularly when code changes volume is big). Instead, helps decide what to build, sees each small step emerge in the context of decisions just made, dialogues with the agent ("build this part", "now handle this edge case", "why did you do it this way?"). Tracks whether the implementation is heading in the right direction technically. Without the engineer, the rest of the team can tell the agent what to build but nobody can keep it technically on track.

**QA engineer**: contributes risk thinking before and during construction. Before the session: maps the work to the risk register and compliance landscape, chooses verification strategy fit for the consequence-of-failure profile. During construction: raises edge cases ("what if the user submits twice?"), challenges assumptions ("the spec says X but users actually do Y"), brings user behaviour knowledge that shapes implementation in real time. Edge cases become building instructions, not post-hoc bug reports. (See "The QA engineer role" below for both layers in detail.)

**AI agent**: handles implementation. Writes the code based on the team's collective guidance.

What the ensemble has to hold, the why and the how, is not confined to the feature: it extends to how the change fits the wider system, which is the whole team's responsibility, brought out by the diversity of the three roles rather than owned by any one of them.

### What changes from pre-AI

Pre-AI, the three amigos model was a *planning* meeting: discuss requirements, then split up and build separately. The developer coded alone. The tester tested after. Sequential handoffs (spec, dev, test, deploy) with all the information loss that entails.

AI changes this in two ways. The first is the skill barrier: implementation no longer requires everyone to be a developer, so anyone with domain knowledge can participate in construction (provided an engineer is in the loop to keep the agent technically on track). The second is speed: the agent generates code fast enough that the rest of the team is not waiting on the implementer. Pre-AI, the developer would type for hours while the others sat idle; in a collaborative session with an agent, code emerges at a pace that lets the team stay engaged and respond to each step as it lands. Together these turn the three amigos pattern from a *planning* session into a *building* session.

### The QA engineer role

In this model, the QA engineer is not testing. They are preventing. They embed quality thinking into the construction process at two layers.

**Strategic layer: at the framing of the work.**

Before the building session starts (or as it opens), the QA engineer maps the work to the risk register and compliance landscape. What categories of risk does this feature touch (data handling, financial transactions, security boundaries, regulatory scope)? What compliance frameworks apply (GDPR, PCI-DSS, SOC 2)? What is the consequence-of-failure profile, and what verification strategy fits that profile (lightweight unit tests, property-based testing, chaos engineering, formal methods)? What lifecycle stage is the product in, and what quality bar is appropriate? These are not edge-case questions; they shape what gets built and how the building session is constrained from the start. This is the [economics of testing](../testing_economics/testing_economics.md) framework operating at the QA engineer's seat: risk-based investment decisions applied to a single feature.

**Tactical layer: during construction.**

1. **Risk thinking during construction.** "What if the user submits twice?" "What happens when this input is empty?" "This payment flow needs to handle concurrent requests". These become immediate instructions to the agent, not bug reports discovered weeks later.
2. **Challenging assumptions.** "The spec says X but users actually do Y". "Why are we assuming this input is always valid?" The QA engineer questions what the developer and product person take for granted.
3. **Edge cases as specifications.** The tester's edge cases become part of the building instructions. Essentially TDD driven by risk thinking rather than developer intuition alone.
4. **User behaviour knowledge.** "Users always misuse the export feature for regulatory reporting, not for the convenience use case you are building for". This shapes implementation in real time.

Both layers are necessary. The tactical layer without the strategic layer produces tests with good local fidelity but the wrong overall risk allocation. The strategic layer without the tactical layer produces a well-prioritised feature with mediocre execution.

This is what "QA engineer" always meant. Quality *assurance*: assuring quality is built in. The industry drifted into using "QA" to mean "person who tests after dev is done", which is quality *control*. The collaborative model does not invent a new role. It makes the existing name accurate.

### Secondary effect: T-shaping by exposure

The collaborative session has a side effect that mob programming practitioners have long observed: each role's expertise becomes visible to the others by exposure. The product person, listening to the QA engineer raise consequence-of-failure questions, develops risk intuitions. The engineer, watching the product person make tradeoff decisions, absorbs business context. The QA engineer, dialoguing with the agent on technical details, picks up architectural reasoning. Over time, each role may develop a flatter T: deep in their primary specialism, with usable competence in the others.

This matters for two reasons. First, it partially addresses the 5:1 ratio problem (Q #1 in §6): if QA risk thinking diffuses into the engineer over time, low-risk features may not need a dedicated QA engineer present. Second, the operational cost of the collaborative session may be partly an investment in cross-skilling rather than pure overhead. Whether T-shaping actually appears, at what rate, and how much it offsets session cost, is itself empirically testable (see §5).

---

## 3. From prevention to better appraisal

The collaborative building model is prevention. But prevention does not eliminate the need for appraisal. Integration testing, system-level behaviour, and emergent properties at scale still require verification after the fact.

The key idea, still a hypothesis: **the collaborative session produces exactly the inputs that make agent-generated tests good.**

### Why current AI-generated tests are weak

The analysis (row 5) identifies the bootstrap problem: if AI generates both code and tests, they can share the same blind spots. An AI generating tests from the same spec as the code can produce tests that pass precisely because they share the same misunderstanding.

JiTTests (evaluation) generate tests per-change from scratch. Each generation episode has no memory of what the team learned before. The tests catch regressions in observable behaviour but cannot test intent ("does this code do the right thing?") because they have no access to intent.

### What the collaborative session provides

During the collaborative building session, the team produces:

- **Business rules articulated by the product person.** "Refunds over $500 require manager approval". "The export must include all transactions from the fiscal year, not the calendar year". These are acceptance criteria expressed in natural language, in the agent's context.
- **Edge cases raised by the QA engineer.** "What if the user submits the form twice?" "What happens when the payment gateway times out?" "What if the export file exceeds the email attachment limit?" These are test cases grounded in real risk thinking, not generated from code patterns.
- **Risk assessments.** "This payment flow is critical, test it exhaustively". "The settings page is low-risk, basic coverage is fine". This is the local risk calibration (layer 3 from the analysis) that population-level AI test generation cannot provide.
- **Design decisions and their rationale.** "We chose eventual consistency here because the latency budget is 50ms". "We deliberately skip validation on this internal API because the upstream service already validates". These are constraints that tests should respect, not flag as bugs.

All of this is in the agent's context during the session. The agent can generate tests that are grounded in actual intent, actual risk assessment, and actual edge cases from domain experts, not just code patterns.

### The result

Tests generated from a collaborative session are qualitatively different from tests generated from code alone:

- They have **input-stage independence** (the QA engineer's risk thinking is independent of the code, addressing row 5 at the input)
- They encode **intent** (the product person's business rules, addressing row 8)
- They reflect **local risk calibration** (the team's assessment of what matters most, addressing row 7)
- They carry **domain knowledge** that population-level AI test generation cannot access

A residual asymmetry on row 5: the inputs are independent of the code (because they come from the QA engineer's reasoning), but the output is still LLM-generated. The agent's test code shares LLM-level blindspots in the test-generation step. If the same model family generates both code and tests, model-level shared blindspots remain regardless of how independent the inputs are. Independence is restored where it matters most (in *what* gets tested), but it is not absolute (in *how* the tests are written). This is partial restoration of row 5, not full restoration.

This does not replace all appraisal. System-level integration testing, performance testing, and chaos engineering still operate at a level above individual features. But for feature-level verification, the collaborative model produces both better code (prevention) and better tests (informed appraisal).

### From tests to all lifecycle artifacts

The same logic generalises beyond tests. The collaborative session produces clean inputs of intent, risk, and design rationale. AI generates downstream artifacts well from clean intent. The session's outputs can therefore feed:

- **Intent docs** (PRD-like). The business problem the feature solves, what success looks like, the tradeoffs the team consciously accepted. These anchor the *why*.
- **Comprehension docs** (ADR-like). The design decisions, why this architecture, what alternatives were rejected. These anchor the *how*.
- **Onboarding material.** New joiners need to know *how* the system works and *why* it was built that way. The session output is essentially a structured record of both. Generated onboarding material derived from session capture has the property pre-AI documentation had at its best: it tells you what was wanted, not just what is.

"Documentation" is too broad to be one artifact, because the two debts it has to anchor are different: intent docs carry the *why*, comprehension docs carry the *how*. Both are human-verified, because both are the human-authored anchors the third [research-question condition](analysis-research-question.md) demands, captured from the session rather than reverse-engineered from code.

Generation runs in one direction, from the anchor to the artifacts. The intent and comprehension docs hold the team's reasoning from the session, and the team owns and verifies them. The code, tests, and onboarding material are drafted by the agent from those docs, which sit in its context, and verified by the team in turn. The dividing line from the [generative ratification loop](analysis-lifecycle.md) is not whether a human or the agent does the typing; it is the source. Generated from the human-authored anchor, an artifact carries the team's intent forward; generated from another code-derived artifact with no human understanding in between (documentation from code surface, say), it ratifies whatever was already there. The agent can draft in both cases; only the source makes one prevention and the other the loop.

The commit message is a special case of the same rule. Left to the agent, it gets written from the diff, which makes it documentation derived from code: the ratification loop at the grain of a single commit. Written by the team, it comes from their understanding of what the change was for. So the commit message is human-authored, and that carries a second benefit: an agent can always produce a plausible message whether or not anyone understood the change, so writing it by hand is what confirms someone did, and it restates the intent of the change in the team's own words.

The anchor is not frozen at the start of the session. Working on any one artifact can surface something that revises the team's understanding: the code reveals a case the tests should cover, a test exposes an ambiguity in the intent doc, an edge case forces a design decision nobody anticipated. The team revises the anchor, re-articulating the intent or rationale and correcting the docs that hold it, and the agent re-drafts the affected artifacts from it. Influence between artifacts is real, but it always passes through the team's understanding and the anchor that records it, never artifact-to-artifact directly. That routing is the checkpoint the ratification loop lacks.

The team's hand-maintained consistency holds during the session, but not across the lifecycle. As the system is maintained and extended and the team turns over, it gets changed by people who did not make the original decisions, and mismatches between the code, the tests, and the docs appear that nobody is positioned to prevent. Catching them after the fact needs a tool that compares the artifacts and flags where they disagree. That is not the artifact-to-artifact generation ruled out above: a comparison reports a mismatch for a human to resolve, it never produces one artifact from another. Some of this is easy to automate and some is not. Comparing code against its tests is easy: run the tests, and a failure marks the mismatch. Comparing the code against the docs, or the tests against the docs, means matching meaning rather than syntax (does the code actually do what the doc says?), and there is no reliable automatic method for that yet; doing it at all would need an LLM, which reopens the agent-reliability question this research treats as a separate variable. This is an open research direction toward the fourth [research-question condition](analysis-research-question.md), lifecycle coherence, not a capability the proposal delivers.

A possible follow-on, beyond the scope of this proposal: AI-based mentors for new joiners that can answer "why" questions from the session record. Speculative, but a natural extension of the same mechanism.

This matters specifically because we are QA. Quality begins long before code is written. Employee onboarding is itself a quality investment: a new joiner who learns the system correctly, including the *why*, makes better decisions later, even if their work is guiding agents in collaborative sessions rather than writing code themselves. They will still need to know properly what the hows and whys were. Lifecycle artifacts are how that knowledge transfers.

This is a candidate mechanism for rebuilding the lifecycle bridge (as defined in [analysis: lifecycle drift](analysis-lifecycle.md)), not a solved problem. We have translated the lifecycle persistence question from "no mechanism exists" to "we have a candidate mechanism that needs to be developed and tested". The format, the tooling, and the discipline required to capture session outputs in a form AI can reliably use downstream are themselves an open research direction (see Q #4 in §6).

---

## 4. The economics argument

The objection to team-based building: "it is expensive to have multiple people working on one thing".

The comparison should not be headcount on a feature. It should be total cost of delivery:

| | Solo developer + AI | Collaborative team + AI |
|---|---|---|
| Implementation speed | Fast | Comparable (AI still writes the code) |
| Intent debt | Accumulates (solo developer may not fully understand the "why") | Prevented at construction time (product person present) |
| Comprehension debt | Accumulates (generation effect, delegation destroys retention) | Minimised (engineer participates in incremental construction) |
| Test quality | AI-generated from code patterns (shared blind spots) | AI-generated from team's intent, risks, and edge cases |
| Rework | High (wrong features, missed edge cases discovered late) | Low (risks addressed during construction) |
| Diagnosis cost | High (nobody understands the code) | Low (engineer participated in building, has context) |

The [economics of testing](../testing_economics/testing_economics.md) framework predicts this: prevention costs less than appraisal, which costs less than failure. The collaborative model shifts effort from appraisal and failure (expensive) to prevention (cheaper). Whether the total cost is lower is an empirical question that needs measurement, but the economic structure favours prevention.

The economics argument above is about dollar cost. It does not address the logistical cost of synchronous collaboration: timezone alignment, calendar overhead, opportunity cost of pulling three people off other work during the session. This is a real operational constraint and does not disappear even when the rework math favours the collaborative model. Teams adopting the model need to solve the synchronous-coordination problem in parallel with the economic one. Whether async variants of the pattern exist (staged collaboration, pre-session capture followed by review cycles, partial-attendance formats) is an open question that the experimental program in §5 can begin to address.

This comparison also leaves out the AI cost itself, tokens and inference. That is deliberate: the proposal does not claim this cost is equal across the two models, it simply does not address it. A full cost decomposition (tokens, human time, rework, diagnosis) belongs with the [economics of testing](../testing_economics/testing_economics.md) work, where the four can be weighed together within the Cost of Quality framework; pricing tokens alone, without the rest, would mislead.

---

## 5. Experimental program

The hypothesis predicts that collaborative building reduces comprehension and intent debt relative to solo-with-AI development, and that the reduction is large enough to offset the operational cost of multi-person sessions. This is empirically testable.

### What to measure

Three families of outcome variables:

- **Comprehension debt proxies.** Time to diagnose a fault in code produced under each condition. Correctness of fault localisation when team members debug code their team produced. Ability to predict behaviour on novel inputs without re-reading the code in detail.
- **Intent debt proxies.** Ability of team members (including those who joined after the session) to articulate why each major design choice was made. Alignment of system behaviour with originally stated business intent over time, as the system evolves.
- **Total cost of delivery.** Implementation time plus rework cost plus diagnosis cost plus maintenance cost, measured per feature or per sprint.

### Conditions to compare

At minimum: solo-developer-with-AI vs collaborative-team-with-AI. A third arm (solo developer without AI) would clarify whether observed effects are about the team configuration or about the AI-vs-no-AI baseline. Iteration grain should also be manipulated within the collaborative arm (small step-by-step prompts vs large autonomous "plan and build" blocks) to find the threshold at which the model collapses back into delegation.

### Unit and time horizon

Feature-level measurement is tractable but may underestimate lifecycle effects. Sprint-level captures rework but not turnover. Quarter-level captures both but is operationally hard. A staged programme starting feature-level and extending to sprint and quarter is more realistic than a single-shot study.

### What would falsify the hypothesis

- Collaborative-with-AI shows no statistically meaningful difference from solo-with-AI on the comprehension and intent proxies.
- The measured difference exists but is too small for the operational cost of collaborative sessions to be justified.
- The reduction at the moment of creation is real, but does not survive into the maintenance phase, suggesting the proposal addresses creation but not lifecycle.

Any of these results would be informative. The third in particular would refine the proposal rather than reject it: it would tell us that collaborative building solves part of the problem but needs to be paired with persistence mechanisms (which connects to the open question on agent learning, §6).

---

## 6. Open questions

- **The 5:1 ratio problem.** One tester, five developers. The tester cannot participate in five concurrent building sessions. Two possible mitigations: (a) reorganise into fewer concurrent workstreams, each with a mini-team, fewer things in parallel but each done right the first time; (b) tester's leverage increases because collaborative building produces less rework, freeing tester time faster. Both need economic modelling to validate.
- **What is the minimum viable team composition?** Is three roles always needed? Can a skilled engineer who understands the business domain do it with just a product person? Can two roles suffice for low-risk features?
- **Does this work at scale?** The examples are small teams and individual features. How does this model apply to platform-level work, cross-team coordination, or large architectural changes?
- **How to capture the session outputs for future use?** The collaborative session produces rich context (intent, risks, decisions, design rationale). How much of this should be persisted, in what format, with what tooling, and through what team discipline? This is the open problem that determines whether the generative ratification loop ([analysis: lifecycle drift](analysis-lifecycle.md)) can be broken at the lifecycle scale. Now that we have a candidate hypothesis (Direction 3 plus capture plus AI-generated downstream artifacts), the research direction is concrete: build a system that captures session outputs, generates downstream artifacts from them, and measures the resulting lifecycle outcomes (extension cost, defect rates, onboarding time).
- **How to measure the difference?** Finding metrics that specifically capture comprehension and intent debt is itself an open research question (see metrics discussion in the GH thread). Comparing solo-with-AI vs team-with-AI on total cost of delivery would require controlled studies.
- **What happens when the agent becomes more reliable?** If agent reliability increases over time, does the engineer's role in the collaborative session change? Does the minimum viable team shrink?
- **Does collaborative building substitute for agent learning?** At the moment of creation, plausibly yes: the intent and comprehension that agent learning would provide are already present in the humans guiding the session. Across the system lifecycle (maintenance, team turnover, scaling), a candidate mechanism exists but needs to be built and tested: session capture produces clean human-authored intent, from which AI generates lifecycle artifacts (intent docs, comprehension docs, tests, onboarding) that carry the bridge across team turnover. This works precisely because the artifacts' anchor is human-authored rather than AI-derived (avoiding the generative ratification loop in [analysis: lifecycle drift](analysis-lifecycle.md)). The lifecycle persistence problem is therefore no longer "no mechanism exists" but "candidate mechanism exists, needs validation". Whether it delivers in practice depends on solving Q #4 (capture format and discipline) and on the analysis distinction between information recall and judgment updating.

---

← [Research Question](analysis-research-question.md) | Next: [Evaluation](evaluation.md) →

See also: [analysis.md](analysis.md) (problem identification), [references.md](references.md) (annotated sources).
