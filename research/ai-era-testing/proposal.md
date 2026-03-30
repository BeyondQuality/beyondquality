# Direction 3: AI-Enabled Collaborative Building

Research by Lilia Abdulina (Head of QA at JetBrains), with Vitaly Sharovatov.

Discussion: https://github.com/BeyondQuality/beyondquality/discussions/28

**Status: early draft. Emerging from discussion, not yet polished.**

---

## Context

The [analysis](analysis.md) identifies two debts that accumulate when AI agents enter the development process: comprehension debt (loss of the "how") and intent debt (loss of the "why"). The [evaluation](evaluation.md) shows that current industry responses (JiTTests, Claude Code Review) are Direction 1/2: they optimise inspection of agent output without addressing the root causes. Section 4 of the analysis poses the central research question: what is the relationship between intent preservation, comprehension level, and agent learning capability?

This document proposes a Direction 3 approach that addresses the root causes directly.

---

## 1. The core observation

When two or more people collaborate while delegating implementation to an AI agent, the debt dynamics change fundamentally:

- **Intent debt does not accumulate.** The people making the decisions are in the room while the thing is being built. Intent is never delegated, so it cannot be lost. This is not "intent debt minimised"; the working model does not produce it.
- **Comprehension debt is structurally minimised.** The engineer participates in incremental construction: they help decide what to build, they see each small step emerge in the context of decisions they just made, they are in a dialogue with the agent. The comprehension they maintain comes from participation in the decisions, not from reading code. This is the Shen & Tamkin (2026) finding in practice: conceptual engagement with AI preserves comprehension, passive review does not.

This is not a theoretical proposal. It is already happening in practice (see discussion thread), and the mechanism is consistent with the cognitive science evidence in the analysis (generation effect, desirable difficulties).

---

## 2. The collaboration model

### Minimum viable team

Three roles, each contributing something the others cannot:

**Product person** (or domain expert): carries the "why". Knows the business problem, the user needs, the tradeoffs the team has consciously accepted. Without them, the team builds the wrong thing.

**Engineer**: participates in incremental construction. Does not "review code" in the traditional sense (the analysis shows that is a weak appraisal method). Instead, helps decide what to build, sees each small step emerge in the context of decisions just made, dialogues with the agent ("build this part", "now handle this edge case", "why did you do it this way?"). Tracks whether the implementation is heading in the right direction technically. Without the engineer, the rest of the team can tell the agent what to build but nobody can keep it technically on track.

**QA engineer**: contributes risk thinking during construction. Raises edge cases ("what if the user submits twice?"), challenges assumptions ("the spec says X but users actually do Y"), brings user behaviour knowledge that shapes implementation in real time. Their edge cases become building instructions, not post-hoc bug reports.

**AI agent**: handles implementation. Writes the code based on the team's collective guidance.

### What changes from pre-AI

Pre-AI, the three amigos model was a *planning* meeting: discuss requirements, then split up and build separately. The developer coded alone. The tester tested after. Sequential handoffs (spec, dev, test, deploy) with all the information loss that entails.

AI changes this because implementation no longer requires everyone to be a developer. The skill barrier that excluded non-developers from the building process is lowered. Anyone with domain knowledge can participate in construction, provided an engineer is in the loop to keep the agent technically on track. The three amigos can now be a *building* session, not just a planning session.

### The QA engineer role

In this model, the QA engineer is not testing. They are preventing. They embed quality thinking into the construction process in real time:

1. **Risk thinking during construction.** "What if the user submits twice?" "What happens when this input is empty?" "This payment flow needs to handle concurrent requests." These become immediate instructions to the agent, not bug reports discovered weeks later.
2. **Challenging assumptions.** "The spec says X but users actually do Y." "Why are we assuming this input is always valid?" The QA engineer questions what the developer and product person take for granted.
3. **Edge cases as specifications.** The tester's edge cases become part of the building instructions. Essentially TDD driven by risk thinking rather than developer intuition alone.
4. **User behaviour knowledge.** "Users always misuse the export feature for regulatory reporting, not for the convenience use case you are building for." This shapes implementation in real time.

This is what "QA engineer" always meant. Quality *assurance*: assuring quality is built in. The industry drifted into using "QA" to mean "person who tests after dev is done," which is quality *control*. The collaborative model does not invent a new role. It makes the existing name accurate.

---

## 3. From prevention to better appraisal

The collaborative building model is prevention. But prevention does not eliminate the need for appraisal. Integration testing, system-level behaviour, and emergent properties at scale still require verification after the fact.

The key insight: **the collaborative session produces exactly the inputs that make agent-generated tests good.**

### Why current AI-generated tests are weak

The analysis (row 5) identifies the bootstrap problem: if AI generates both code and tests, they can share the same blind spots. An AI generating tests from the same spec as the code can produce tests that pass precisely because they share the same misunderstanding.

JiTTests (evaluation) generate tests per-change from scratch. Each generation episode has no memory of what the team learned before. The tests catch regressions in observable behaviour but cannot test intent ("does this code do the right thing?") because they have no access to intent.

### What the collaborative session provides

During the collaborative building session, the team produces:

- **Business rules articulated by the product person.** "Refunds over $500 require manager approval." "The export must include all transactions from the fiscal year, not the calendar year." These are acceptance criteria expressed in natural language, in the agent's context.
- **Edge cases raised by the QA engineer.** "What if the user submits the form twice?" "What happens when the payment gateway times out?" "What if the export file exceeds the email attachment limit?" These are test cases grounded in real risk thinking, not generated from code patterns.
- **Risk assessments.** "This payment flow is critical, test it exhaustively." "The settings page is low-risk, basic coverage is fine." This is the local risk calibration (layer 3 from the analysis) that population-level AI test generation cannot provide.
- **Design decisions and their rationale.** "We chose eventual consistency here because the latency budget is 50ms." "We deliberately skip validation on this internal API because the upstream service already validates." These are constraints that tests should respect, not flag as bugs.

All of this is in the agent's context during the session. The agent can generate tests that are grounded in actual intent, actual risk assessment, and actual edge cases from domain experts, not just code patterns.

### The result

Tests generated from a collaborative session are qualitatively different from tests generated from code alone:

- They have **genuine independence** (the QA engineer's risk thinking is independent of the code, addressing row 5)
- They encode **intent** (the product person's business rules, addressing row 8)
- They reflect **local risk calibration** (the team's assessment of what matters most, addressing row 7)
- They carry **domain knowledge** that population-level AI test generation cannot access

This does not replace all appraisal. System-level integration testing, performance testing, and chaos engineering still operate at a level above individual features. But for feature-level verification, the collaborative model produces both better code (prevention) and better tests (informed appraisal).

---

## 4. The economics argument

The objection to team-based building: "it is expensive to have multiple people working on one thing."

The comparison should not be headcount on a feature. It should be total cost of delivery:

| | Solo developer + AI | Collaborative team + AI |
|---|---|---|
| Implementation speed | Fast | Comparable (AI still writes the code) |
| Intent debt | Accumulates (solo developer may not fully understand the "why") | Zero (product person in the room) |
| Comprehension debt | Accumulates (generation effect, delegation destroys retention) | Minimised (engineer participates in incremental construction) |
| Test quality | AI-generated from code patterns (shared blind spots) | AI-generated from team's intent, risks, and edge cases |
| Rework | High (wrong features, missed edge cases discovered late) | Low (risks addressed during construction) |
| Diagnosis cost | High (nobody understands the code) | Low (engineer participated in building, has context) |

The [economics of testing](../testing_economics/testing_economics.md) framework predicts this: prevention costs less than appraisal, which costs less than failure. The collaborative model shifts effort from appraisal and failure (expensive) to prevention (cheaper). Whether the total cost is lower is an empirical question that needs measurement, but the economic structure favours prevention.

---

## 5. Open questions

- **The 5:1 ratio problem.** One tester, five developers. The tester cannot participate in five concurrent building sessions. Two possible mitigations: (a) reorganise into fewer concurrent workstreams, each with a mini-team, fewer things in parallel but each done right the first time; (b) tester's leverage increases because collaborative building produces less rework, freeing tester time faster. Both need economic modelling to validate.
- **What is the minimum viable team composition?** Is three roles always needed? Can a skilled engineer who understands the business domain do it with just a product person? Can two roles suffice for low-risk features?
- **Does this work at scale?** The examples are small teams and individual features. How does this model apply to platform-level work, cross-team coordination, or large architectural changes?
- **How to capture the session outputs for future use?** The collaborative session produces rich context (intent, risks, decisions). How much of this should be persisted for future sessions, and in what form? This connects to the agentic learning discussion.
- **How to measure the difference?** Finding metrics that specifically capture comprehension and intent debt is itself an open research question (see metrics discussion in the GH thread). Comparing solo-with-AI vs team-with-AI on total cost of delivery would require controlled studies.
- **What happens when the agent becomes more reliable?** If agent reliability increases over time, does the engineer's role in the collaborative session change? Does the minimum viable team shrink?

---

See also: [analysis.md](analysis.md) (problem identification), [evaluation.md](evaluation.md) (industry response evaluation), [references.md](references.md) (annotated sources).
