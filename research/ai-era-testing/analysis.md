# QA in the Age of AI-Accelerated Development

Research by Lilia Abdulina (Head of QA at JetBrains), with Vitaly Sharovatov.

Discussion: https://github.com/BeyondQuality/beyondquality/discussions/28

---

## 1. Problem Statement

Agentic AI accelerates code production, but the team's ability to understand, verify, and maintain the resulting system does not accelerate at the same rate. This creates a growing gap between what is being built and what is being comprehended. If this gap widens unchecked, the codebase becomes progressively less governable — changes carry unknown risks, defects accumulate silently, and the team loses the ability to evolve the product with confidence. The existing quality assurance model — which relies on inspecting code after it's produced — may not scale to close this gap, and we don't yet know what does.

---

## 2. Pre-AI Baseline: How Development and QA Worked Before Agents

### The general process

1. **Decision**: An agreement is made by humans on what needs to be built (idea, hypothesis, PRD, specification, whatever you call it). Decisions are always incomplete — humans fill the gaps using shared context, domain knowledge, and tacit understanding of the system. This shared understanding is a load-bearing quality mechanism.
2. **Implementation**: From this agreement, a human designs and builds implementation (architecture, design, code, other assets). The resulting codebase is comprehensible because humans wrote it — other humans can read it, infer intent, and reason about behavior. This comprehensibility is an implicit assumption underlying code review, debugging, and maintenance.
3. **Testing**: Testing is done to verify that the implementation matches the decision from step 1. But testing also produces *learning* — discovering that the spec was ambiguous, that the user's real workflow doesn't match the PRD, that two features interact unexpectedly. This learning flows back to step 1 and updates the shared understanding. Testing thus has two functions: **verdict** (pass/fail) and **learning** (updating the team's model of the system).

Testing was done in a few ways:
- Fully manually (a human interprets the decision and the implementation, "tries it") and reports
- Manually and automatically (same as previous, but also humans write automated tests)
- A mixture of the two

### Two types of companies

#### Proactive QA companies

Humans design the processes within steps 1-3 so that each step's probability of creating something of good quality is higher, and that the system stays in this regime. Practices include: Kaizen, zero bug policy, pair/mob programming, TDD, shift-left testing, continuous training, etc. Quality control measures (testing at different stages) are also present and act as inspection/verification (appraisal) activities, but the balance of effort is shifted towards **prevention over appraisal**.

Practices like pair programming and mob programming serve the function of **shared understanding amplifiers**. They keep mental models aligned across the team.

Scaling characteristics when adding *n* teams:

Per-team costs (the "linear" part):
- QA prevention practices (TDD, pairing, etc.) are per-team — each team bears its own QA cost. Adding a team adds a roughly constant marginal cost.
- Automated tests are written as part of development — no additional load on testers when teams are added.

Cross-team costs (the "hidden superlinear" part):
- **CI infrastructure pressure**: tests run in a shared pipeline. CI run time grows with total test count. Flaky test probability compounds: if each test has independent flake probability *p*, probability of at least one flake per run is 1-(1-p)^n, which approaches 1 quickly. Flaky test investigation is a shared cost, not per-team.
- **Cross-team test conflicts**: team A's change breaks team B's tests. Investigation cost grows with the number of team pairs = O(n^2).
- **Shared test utilities/fixtures**: maintenance becomes a coordination problem as more teams depend on them.
- **Architectural coherence**: the system becomes harder to reason about as a whole. Coordination mechanisms (architecture reviews, platform teams, interface contracts) are needed.

**Actual cost function: O(n + εn^2)** where:
- *n* = number of teams
- *ε* = cross-team coordination coefficient
- In proactive QA companies, architectural practices (clear module boundaries, APIs, contracts) exist specifically to keep *ε* small
- *ε* is never zero — the "linearity" of proactive QA companies means they've invested in making the quadratic term's coefficient small, not that the quadratic term is absent

The difference between proactive QA and reactive QC companies is not linear vs. superlinear — it's **small ε vs. large ε**.

#### Reactive QC companies

Little to no proactive QA. Quality is mostly controlled, not assured. Testing is often done "after" development and frequently struggles to cope with delivery. Dev and tester mental models drift apart — testing becomes "guess what the developer meant" rather than "verify what we all agreed on."

Scaling characteristics when adding *n* teams — **much harder**:

- **Rework feedback loop** (superlinear): defects found → rework → rework introduces new defects at rate *r*. Total defect resolution effort is multiplied by ~1/(1-r). As system complexity grows, *r* increases (fixes are more likely to break something else), so the multiplier itself grows. This is a positive feedback loop — scaling is between linear and quadratic depending on defect injection rate. Formally: if base defect count scales as O(n) and each fix injects *r* new defects, total effort ≈ O(n / (1-r)). Since *r* is itself an increasing function of system complexity (which grows with *n*), the denominator shrinks as *n* grows — making the effective scaling superlinear.
- **Automated test maintenance** (superlinear): *writing* new tests may be O(n), but *maintenance* grows with system interconnectedness. Each new feature can break existing tests due to changing assumptions, not bugs. The fragility grows with the number of cross-module dependencies, which scales as O(n^2) in the worst case.
- **Manual testing** (superlinear): combinatorial state explosion. If the system has *k* interacting features, the state space grows combinatorially. Each new team adds features that interact with existing ones; testing the interactions grows faster than the number of features.

Using the same framework as proactive QA: cost is also **O(n + εn^2)**, but ε is **much larger** because there are no architectural or process investments to suppress the quadratic term. Additionally, the rework loop adds a **multiplicative factor** 1/(1-r(n)) on top, making the actual cost closer to **O((n + εn^2) / (1-r(n)))** — which accelerates sharply as *r* approaches 1.

### Historical evidence: the warden model was already hitting ceilings

Even before AI, as systems grew more complex, deterministic testing repeatedly hit combinatorial walls. Each time, the industry responded by inventing a new paradigm that accepted incompleteness. Each paradigm is a historical marker of a specific scaling wall being hit:

| Paradigm | Year | What hit the wall | The wall | Response |
|---|---|---|---|---|
| Fuzzing | 1988 | **Input space** | Can't enumerate all inputs to a program | Sample randomly from input space, observe what breaks |
| Property-based testing | 2000 | **Scenario space** | Can't enumerate all combinations of valid inputs and states | Specify invariants, let the framework generate cases automatically |
| Chaos engineering | 2011 | **Interaction/failure space** | Can't enumerate all failure combinations in distributed systems | Inject random failures in production, observe emergent behavior |

**The common move**: when enumeration becomes intractable, shift from **deterministic verification** to **probabilistic exploration**. This is the Monte Carlo method applied to testing — when you can't compute the integral analytically, you sample.

These paradigms did not *replace* traditional testing — they *supplemented* it. Companies still write unit tests AND do chaos testing. Each paradigm emerged as a new layer because the previous layers couldn't reach certain kinds of defects. The testing stack keeps growing.

All three paradigms, despite accepting incompleteness in *enumeration*, still relied on **human comprehension** as their foundation:
- Fuzzing requires humans to recognize which crashes matter and diagnose root causes
- Property-based testing requires humans to specify the invariants (which requires understanding what "correct" means)
- Chaos engineering requires humans to interpret system behavior under failure and design resilience patterns

This is the critical setup for the AI transition: the pre-AI testing world was already evolving toward probabilistic approaches because deterministic enumeration couldn't scale — but every new paradigm still assumed that humans understood the system deeply enough to design the tests, interpret the results, and act on the findings. AI-accelerated development threatens precisely this foundation.

---

## 3. With Agents: How the Process Works Now

### The general process — same steps, different dynamics

1. **Decision**: Humans still decide what to build. But the specification now serves two audiences — humans and agents. The agent has no shared understanding, no history with the codebase, no tacit knowledge. The specification becomes simultaneously **more critical** (the agent can only work from what it's given) and **more insufficient** (the compensation mechanism — shared understanding — is absent on the agent side).

2. **Implementation**: Agents produce code dramatically faster, but several things break:
   - **Comprehension inversion**: before, the implementer understood the code best. Now, the implementer (agent) has no persistent understanding. The code exists, but nobody has the deep understanding the author traditionally had. This is qualitatively new — not "more code" but "code with less understanding per line."
   - **Comprehensible artifact degrades**: AI-generated code is syntactically fluent but its "intent" is derivative of the prompt, not of deep design reasoning. It may look idiomatic while being subtly wrong.
   - **Shared understanding doesn't accumulate**: a human developer builds a mental model over months. An agent starts roughly fresh each session. Each generation episode is somewhat context-free.

3. **Testing**: Three functions are stressed differently:
   - **Verdict function is overwhelmed**: more code to verify, same (or fewer) humans to do it.
   - **Learning function is broken**: testing produces learning, but the agent has no persistent mental model to update. The feedback loop from testing → implementation is severed. The same class of bug can recur indefinitely.
   - **Feedback to decision still works**: humans still learn from testing. But the loop that improved *implementation quality over time* is gone.
   - **AI-generated tests have a bootstrap problem**: if AI generates both code and tests, they can share the same blind spots. A human tester brings independent domain understanding. An AI generating tests from the same spec as the code can produce tests that pass precisely because they share the same misunderstanding.
   - **Failure modes are novel**: human-written bugs are in predictable places (off-by-one, missing edge cases). AI-generated bugs are different — code "reads right" but implements subtly wrong logic. Existing testing heuristics may systematically miss these.

### Two types of companies — now with agents

#### Proactive QA companies

Prevention practices partially break:
- **TDD** still works if the human writes tests first and the agent implements. But writing good tests requires understanding the system — the specification problem returns.
- **Pair programming** with an agent is fundamentally different: the agent doesn't push back on design, doesn't bring independent domain knowledge. It's a powerful tool, not a thinking partner.
- **Shared understanding amplifiers** were designed for human-to-human knowledge transfer. They don't directly apply when one "pair" is an agent.

Architectural coherence cost increases — agents don't inherently respect architectural boundaries unless explicitly constrained.

**But** — proactive QA companies are better positioned. Their mindset is already "embed quality into the process." They'll naturally try to embed quality constraints into agent workflows (better prompts, architectural guardrails, specification-level testing). They experience this as "we need to adapt our practices" rather than "everything is breaking."

Scaling with agents — using the O(n + εn^2) framework, agents cause two simultaneous effects:
1. **Effective *n* increases**: agents multiply code output per team, so the equivalent "team count" in terms of code volume grows. Even a small ε starts to bite at higher *n*.
2. **ε itself increases**: the cross-team coordination cost assumed humans could read each other's code and resolve conflicts. When agent-generated code is less comprehensible, the coordination cost per team-pair rises — i.e., ε grows.

Agents attack both the coefficient and the base simultaneously. Outcome: **uncertain but plausibly manageable** if prevention practices can be adapted to constrain both effects.

#### Reactive QC companies

Already struggling with superlinear scaling, now compounded:
- Code volume multiplies → the warden army needs to multiply faster
- The rework loop accelerates at higher velocity
- Manual testing becomes utterly overwhelmed
- The comprehension gap is widest here because there's no process to compensate

This is what Lilia describes at JetBrains (which sits somewhere between the two types, making the signal more alarming).

Scaling with agents — using the O((n + εn^2) / (1-r(n))) framework:
1. **Effective *n* increases** dramatically (same as proactive QA case)
2. **ε is already large** and grows further (agent code is less comprehensible, coordination harder)
3. **r(n) increases**: with more agent-generated code, rework introduces defects at a higher rate because the humans doing the rework understand the surrounding code less well. The denominator (1-r(n)) shrinks faster.

All three terms move in the wrong direction simultaneously. The compounding is multiplicative, not additive — the superlinear costs don't just increase, they accelerate.

### What is qualitatively new (not just "more of the same")

| Factor | Pre-AI | With agents |
|---|---|---|
| Code volume | — | Accelerated (quantitative change) |
| Comprehension per line of code | Constant | **Degraded** — nobody deeply understands agent-written code |
| Feedback loop (testing → implementation) | Works | **Severed** — agent has no persistent model to update |
| Shared understanding | Fills specification gaps | **Absent on agent side** — gaps stay unfilled |
| Test independence | Human testers bring independent perspective | **AI tests can share code's blind spots** |
| Failure modes | Predictable, heuristic-detectable | **Novel** — plausible-looking but subtly wrong |

Row 1 is quantitative change. Rows 2-6 are qualitative changes. This is why "just add more wardens" (Lilia's Directions 1+2) has a structural ceiling — it addresses row 1 but not rows 2-6.


See also: [evaluation.md](evaluation.md) — industry responses evaluated against this framework. [references.md](references.md) — annotated link collection.
