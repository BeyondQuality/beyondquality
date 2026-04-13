# QA in the Age of AI-Accelerated Development

Research by Lilia Abdulina (Head of QA at JetBrains), with Vitaly Sharovatov.

Discussion: https://github.com/BeyondQuality/beyondquality/discussions/28

---

## 1. Problem Statement

Many companies are hitting the same wall: as teams adopt agentic AI for code generation, code output accelerates — but existing testing, both manual and automated, cannot cope with the volume and diversity of code being produced. This situation is new, and nobody has a clear answer for what to do about it.

But the testing bottleneck is a symptom, not the root cause. Before AI, writing code was expensive and understanding it was cheap since the author carried a mental model of what they built and why. AI inverts this: writing code becomes cheap, but two kinds of knowledge start eroding:
1. **Comprehension** (how the code works) degrades because nobody carries the deep understanding that the human author used to have.
2. **Intent** (why the code was built, what business problem it solves, what tradeoffs were consciously accepted) erodes as the humans who made the decisions move on and the agents that implemented them retain nothing.

These are different debts with different dynamics: comprehension debt makes diagnosis and rework expensive; intent debt makes it impossible to assess whether the system is still doing the right thing. At the same time, the feedback loops that improved quality over time (testing finds a bug → developer learns → fewer similar bugs next cycle) are weakened when the implementer is an agent that starts roughly fresh each session. The result is not just "more code to test" but a shift in where costs accumulate and which quality mechanisms still function.

**A foundational premise: quality is not a property of code in isolation**. Whether code is "good enough" depends on what business problem it solves, what the consequences of failure are, what lifecycle stage the product is in, and what tradeoffs the team has consciously accepted. A prototype and a payment system have different quality requirements even if the code looks identical. This means that any quality assessment — human or automated — that operates only on the code surface without access to this context can only catch superficial issues. The deeper question ("does this code do the right thing?") is unanswerable without domain understanding.

---

## 2. Pre-AI Baseline: How Development and QA Worked Before Agents

### The general process

1. **Decision**: An agreement is made by humans on what needs to be built (idea, hypothesis, PRD, specification, whatever you call it). Decisions are always incomplete — humans fill the gaps using shared context, domain knowledge, and tacit understanding of the system. This shared understanding is a load-bearing quality mechanism.
2. **Implementation**: From this agreement, a human designs and builds implementation (architecture, design, code, other assets). The resulting codebase is comprehensible because humans wrote it — other humans can read it, infer intent, and reason about behavior. This comprehensibility is an implicit assumption underlying code review, debugging, and maintenance.
3. **Testing**: Testing is done to verify that the implementation matches the decision from step 1. But testing also produces *learning* — discovering that the spec was ambiguous, that the user's real workflow doesn't match the PRD, that two features interact unexpectedly. This learning flows back to step 1 and updates the shared understanding. Testing thus has two functions: **verdict** (pass/fail) and **learning** (updating the team's model of the system).

Testing was done in a few ways:
- Fully manually (a human interprets the decision and the implementation, "tries it") and reports
- Manually and automatically (same as previous, but also humans write automated tests)
- Only automatically

### Business domain understanding

In all three steps above, humans carry business domain understanding — and they accumulate it for free, just by doing their jobs.

In **decisions**, domain knowledge shapes what gets specified and what gets left implicit. "We need to handle refunds" means very different things depending on whether you know the business processed 3 months of chargebacks last quarter.

In **implementation**, domain knowledge shapes design choices — what to optimize, where to be paranoid, where "good enough" is fine. A developer who's been on the payment team for a year doesn't write the same code as a contractor who just joined.

In **testing**, domain knowledge shapes risk-based prioritization. The tester who knows users constantly misuse the export feature tests it harder. This is invisible in the process — nobody writes "test this harder because of domain risk" — the human just does it.

**NB**: This domain knowledge feeds into both comprehension (understanding how the system works) and intent (understanding why it was built this way), the two debts introduced above.

This matters because **business domain understanding was mostly not an explicit activity — it was a byproduct of humans being in the loop**. It didn't appear as a line item in anyone's cost model. Nobody budgeted for "domain knowledge accumulation" because it happened automatically. Some companies did make parts of it explicit — risk registers, architecture decision records (ADRs), component criticality classifications — but these captured a fraction of the domain knowledge that humans carried implicitly. The explicit artifacts were supplements to human judgment, not substitutes for it.

**Why doing-the-work produces learning.** The mechanism behind "free" domain knowledge accumulation is well-established in cognitive science. The **generation effect** (Slamecka & Graf, 1978; meta-analysed across 310 experiments from 126 articles by McCurdy et al., 2020) shows that actively producing information yields dramatically better retention than passively receiving it, and the advantage grows with time, roughly doubling at longer retention intervals. Bjork's **desirable difficulties** framework (1994, 2020) formalises the principle: the cognitive effort of doing something yourself *is* the learning. The struggle is not a cost to be eliminated; it's the process by which understanding forms.

This is why the absence of domain understanding with agents is so easy to miss: you lose the generative act that produced the learning, but you don't notice because you never tracked the learning as a separate activity.

Domain understanding also includes **transferable professional heuristics** — what Howden called the "oracle concept". QA professionals don't just know *this* project; they reason by analogy from other systems, languages, and domains. When testing a new language feature in Kotlin, a tester draws on how Java or Scala handle the same concept. When testing a new web service, they draw on how similar services work. This is not project-specific knowledge — it's cross-domain professional intuition accumulated across a career.

This raises an interesting question about agents. LLMs are trained on an extremely broad corpus (code, documentation, postmortems across thousands of systems). In some sense, they possess *something* in the heuristic space too: statistical pattern recognition across far more systems than any individual human could experience. They do carry asymmetric risk weighting ("payment flow" appears in thousands of incident reports across the training corpus; "settings page" doesn't) and they will treat them differently. But this weighting operates at the level of "payments are risky" and "authentication is security-sensitive". The risk knowledge that actually drives testing decisions is always project-specific (see [economics of testing](../testing_economics/testing_economics.md)).

It helps to distinguish three layers of risk knowledge:

1. **Strategic risk knowledge** (how to assess risk, how to build a risk register, how to map testing to business exposure): transferable across projects. Available to experienced humans and potentially to LLMs guided by the right framework. This is where the [economics of testing](../testing_economics/testing_economics.md) framework operates.
2. **Population-level risk weighting** (payments are risky, settings pages aren't): present in both experienced humans and LLMs. A useful starting point, but potentially miscalibrated for any specific project. An experienced tester who lived through a payment disaster at their previous company arrives at a new team overcautious about payments, while the real risk may be in the export module that nobody's testing. Their "lived experience weighting" is just a bias at that point. LLMs have the same problem: their training-data associations may not match this project's reality.
3. **Local risk calibration** (in THIS project, the export module is where the real risk lives): only comes from engagement with this specific codebase, this team, this product. For humans, this is the implicit learning from doing the work. For LLMs, the calibration mechanisms are context injection, fine-tuning, and persistent memory, all with open questions about staleness, pace mismatch, and what's not written down.

The gap between layers 2 and 3 is where the real challenge lies. How LLM heuristics compare to human professional heuristics (in breadth, calibration, and exception recognition) is an open research question. We don't yet have a methodology for answering it.

### Two types of companies

Some people talk about "QA cultures" or maturity models with multiple levels, but for simplicity I see two types of companies on the market. To understand how different QA approaches scale — and why agents make the difference matter more — we need to model QA costs at the team level:

#### Proactive QA companies

Humans design the processes within steps 1-3 so that each step's probability of creating something of good quality is higher, and that the system stays in this regime. Practices include: Kaizen, zero bug policy, pair/mob programming, TDD, shift-left testing, continuous training, etc. Quality control measures (testing at different stages) are also present and act as inspection/verification (appraisal) activities, but the balance of effort is shifted towards **prevention over appraisal**.

Practices like pair programming and mob programming serve the function of **shared understanding amplifiers**. They keep mental models aligned across the team.

Domain knowledge is embedded in their prevention practices: risk-based testing, quality gates calibrated to component criticality, architecture decisions shaped by business risk — all of these are domain understanding made structural.

The operational version of this is a risk-based investment model: identify business risks, prioritize by exposure (likelihood × impact), select testing approaches that produce credible evidence at minimal cost, and review periodically to rebalance. This is described in detail in the [Economics of Testing](../testing_economics/testing_economics.md) research, which frames testing as an economic investment within the Cost of Quality (CoQ) framework. The key economic insight is that prevention costs less than appraisal, which costs less than failure — so proactive QA companies invest heavily in prevention and use appraisal (testing) deliberately where it produces the highest marginal risk reduction. Every step of this model depends on business domain understanding: what risks exist, what failure costs, what the product lifecycle demands, what tradeoffs are acceptable.

Scaling characteristics when adding *n* teams:

Intra-team costs (the "linear" part):
- QA prevention practices (TDD, pairing, etc.) are per-team — each team bears its own QA cost. Adding a team adds a roughly constant marginal cost.
- Automated tests are written by developers as part of development — they scale with the team, not as a separate coordination overhead.

Cross-team costs (the "hidden superlinear" part):
- **CI infrastructure pressure**: tests run in a shared pipeline. CI run time grows with total test count. Flaky test probability compounds: if each of *t* tests has independent flake probability *p*, probability of at least one flake per run is 1-(1-p)^t, which approaches 1 quickly. Flaky test investigation is a shared cost, not per-team.
- **Cross-team test conflicts**: team A's change breaks team B's tests. Investigation cost grows with the number of team pairs = O(n^2).
- **Shared test utilities/fixtures**: maintenance becomes a coordination problem as more teams depend on them.
- **Architectural coherence**: the system becomes harder to reason about as a whole. Coordination mechanisms (architecture reviews, platform teams, interface contracts) are needed.

**Actual cost function: O(n + εn^2)** where:
- *n* = number of teams
- *ε* = cross-team coordination coefficient
- In proactive QA companies, architectural practices (clear module boundaries, APIs, contracts) exist specifically to keep *ε* small
- *ε* is never zero — the "linearity" of proactive QA companies means they've invested in making the quadratic term's coefficient small, not that the quadratic term is absent

The difference between proactive QA and reactive QC companies is not just the size of ε — it's **small ε and no rework multiplier vs. large ε compounded by the rework feedback loop** (see reactive QC below).

#### Reactive QC companies

Little to no proactive QA. Quality is mostly controlled, not assured. Testing is often done "after" development and frequently struggles to cope with delivery. Dev and tester mental models drift apart — testing becomes "guess what the developer meant" rather than "verify what we all agreed on".

Domain knowledge still exists in people's heads, even if processes don't leverage it formally. The individual tester still knows "this area is risky" — they just can't act on it structurally.

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

This is the same principle behind risk-based E2E testing: it's infeasible to test every user journey, so teams prioritize critical flows — accepting incompleteness in exchange for tractability.

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
   - **Comprehension inversion**: before, the implementer understood the code best. Now, the implementer (agent) has no persistent understanding. The code exists, but nobody has the deep understanding the author traditionally had. This is qualitatively new — not "more code" but "code with less understanding per line".
   - **Comprehensible artifact degrades**: AI-generated code is syntactically fluent but its "intent" is derivative of the prompt, not of deep design reasoning. It may look idiomatic while being subtly wrong.
   - **Shared understanding doesn't accumulate**: a human developer builds a mental model over months. An agent starts roughly fresh each session. Each generation episode is somewhat context-free.

   The comprehension inversion is empirically supported. The generation effect described in Section 2 predicts that when we move from producing code to reviewing or accepting agent-generated code, we remove the generative act that produces retention. Recent experiments confirm it. Bastani et al. (2025, *PNAS*) found that students using GPT-4 performed 17% worse on assessments once access was removed, compared to students who never had access. Shen & Tamkin (2026, Anthropic) found that engineers who delegated code generation to AI scored 50% on comprehension vs 67% for those who coded manually. Crucially, engineers who used AI for *conceptual questions* rather than delegation maintained their comprehension. And the METR study (Becker et al., 2025) found that experienced developers using AI took 19% longer on their own repos while believing they were 20% faster. The perception gap itself is evidence that comprehension debt accumulates invisibly.

3. **Testing**: Three functions are stressed differently:
   - **Verdict function is overwhelmed**: more code to verify, same (or fewer) humans to do it.
   - **Learning function is broken**: testing produces learning, but the agent has no persistent mental model to update. The feedback loop from testing → implementation is severely degraded. The same class of bug can recur indefinitely.
   - **Feedback to decision still works**: humans still learn from testing. But the loop that improved *implementation quality over time* is gone.
   - **AI-generated tests have a bootstrap problem**: if AI generates both code and tests, they can share the same blind spots. A human tester brings independent domain understanding. An AI generating tests from the same spec as the code can produce tests that pass precisely because they share the same misunderstanding.
   - **Failure modes are novel**: human-written bugs are in predictable places (off-by-one, missing edge cases). AI-generated bugs are different — code "reads right" but implements subtly wrong logic. Existing testing heuristics may systematically miss these.

**Business domain understanding is qualitatively degraded, both the "how" and the "why".** The agent lacks comprehension of the code it produces (the "how"): it generates syntactically correct implementations without building a mental model that persists across sessions. But it also lacks intent (the "why"): it has no knowledge of *this* business domain, *this* risk profile, *this* product lifecycle, or *this team's* consciously accepted tradeoffs. The agent may have broad statistical pattern recognition from training data (recognising common patterns across thousands of systems) but it lacks consequence-grounded calibration, contextual exception recognition, and project-specific accumulated knowledge. It can be given some context via prompts or configuration files, but it doesn't accumulate domain understanding over time the way a human does. A human developer who fixes a production incident in the payment flow carries that experience into every subsequent decision. An agent starts roughly fresh each session. Even when explicitly provided with domain context, the agent lacks the judgment that comes from having lived through the consequences of getting it wrong.

Three mechanisms partially compensate for the degraded feedback loop: external persistence (CLAUDE.md, memory tools, REVIEW.md files that carry knowledge across sessions), hosted fine-tuning (adjusting model weights on team-specific patterns via provider APIs), and local tuning of open-weight models (LoRA and similar techniques). These are real and worth exploring. However, what they provide — information recall and pattern adjustment — is categorically different from what the pre-AI feedback loop provided: a self-correcting *process* where risk emerges → pain is felt → humans analyse root causes → judgment updates → behaviour changes, all at a pace matched to code production. The mechanisms persist *snapshots of past conclusions* (labels, facts, rules), but lack economic weighting (how risky relative to what?), reassessment triggers (when does a persisted fact become stale?), awareness of what's *not* written down, and — critically — they operate at human speed while risk emergence now operates at machine speed. Whether these mechanisms, combined with a proper economic framework, can restore a functional feedback loop is an open research question.

### The economics shift: Boehm's curve in the AI era

Pre-AI, Boehm's cost-of-change curve showed that fixing a defect grows exponentially more expensive as you move from requirements → design → code → testing → production. The driver: the later you find a flaw, the more work products are built on top of it, and all need rework.

In the AI era, code generation and rewriting become cheap. An agent can regenerate a function in seconds. This might suggest the curve flattens — but it doesn't. The cost driver shifts from **rework volume** to **comprehension debt**, and the curve gets steeper:

| Activity | Pre-AI | AI era |
|---|---|---|
| Writing code | Expensive (human time) | Cheap (agent generates it) |
| Understanding code | Free (the author understands it) | Expensive (nobody deeply understands agent-written code) |
| Rewriting code | Expensive (human time) | Cheap (agent regenerates it) |
| Finding what to rewrite | Moderate (humans trace through code they understand) | Very expensive (comprehension gap) |

The consequences:

- **Wrong ideas get amplified faster.** A flawed specification used to produce one developer writing wrong code at human speed. Now it produces volumes of wrong code at machine speed. More wrong artifacts to find and correct.
- **Diagnosis is more expensive.** When you find a production defect in human-written code, the author can often fix it quickly — they understand it. In agent-written code, nobody deeply understands it. Diagnosis cost goes UP even though rewrite cost goes DOWN.
- **Integration costs are unchanged or worse.** Rewriting a function is cheap. Understanding how that function interacts with the rest of the system, what else breaks, what the ripple effects are — that's the expensive part, and it's worse because comprehension is degraded.
- **Production failure costs are completely unchanged.** Customer churn, outages, regulatory fines, reputational damage — these have nothing to do with how cheaply you can rewrite code. They're business costs.

The AI-era Boehm curve: the "coding" section collapses (cheap to write and rewrite), but the "idea → specification" section becomes MORE critical (wrong ideas amplified at machine speed), and the "testing → production" section becomes steeper (diagnosis harder, comprehension degraded). The total cost of defects may increase even though the cost of writing code decreases.

The pre-AI curve was driven by "how much work was built on top of the flaw". The AI-era curve is driven by "how little anyone understands what was built on top of the flaw". The exponential cost driver shifts from rework volume to comprehension debt.

This has a direct economic implication: the [Cost of Quality framework](../testing_economics/testing_economics.md) says prevention is cheaper than appraisal, which is cheaper than failure. In the AI era, this gap widens — prevention (getting the idea and specification right) becomes even more critical relative to appraisal (inspecting the code after generation), because the amplification from wrong ideas to volumes of wrong code is faster and the comprehension debt makes late-stage diagnosis more expensive.

### Two types of companies — now with agents

#### Proactive QA companies

Prevention practices partially break:
- **TDD** still works if the human writes tests first and the agent implements. But writing good tests requires understanding the system — the specification problem returns.
- **Pair programming** with an agent is fundamentally different: the agent doesn't push back on design, doesn't bring independent domain knowledge. It's a powerful tool, not a thinking partner.
- **Shared understanding amplifiers** were designed for human-to-human knowledge transfer. They don't directly apply when one "pair" is an agent.

Architectural coherence cost increases — agents don't inherently respect architectural boundaries unless explicitly constrained.

**But** — proactive QA companies are better positioned. Their mindset is already "embed quality into the process". They'll naturally try to embed quality constraints into agent workflows (better prompts, architectural guardrails, specification-level testing). They experience this as "we need to adapt our practices" rather than "everything is breaking".

Scaling with agents — using the O(n + εn^2) framework, agents cause two simultaneous effects:
1. **Effective *n* increases**: agents multiply code output per team, so the equivalent "team count" in terms of code volume grows. Even a small ε starts to bite at higher *n*.
2. **ε itself increases**: the cross-team coordination cost assumed humans could read each other's code and resolve conflicts. When agent-generated code is less comprehensible, the coordination cost per team-pair rises — i.e., ε grows.

Combined effect on O(n + εn²): if agents raise effective team count to n' and coordination coefficient to ε', the quadratic term grows by (ε'/ε)·(n'/n)² — both multipliers compound. Outcome: **uncertain but plausibly manageable** if prevention practices can be adapted to constrain both effects.

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
| Feedback loop (testing → implementation) | Works | **Severely degraded** — persistence mechanisms (memory, CLAUDE.md), fine-tuning, and LoRA exist but provide information recall, not the process of judgment updating. The pace mismatch (human-speed documentation vs. machine-speed risk emergence) widens the gap over time |
| Shared understanding | Fills specification gaps | **Absent on agent side** — gaps stay unfilled |
| Test independence | Human testers bring independent perspective | **AI tests can share code's blind spots** |
| Failure modes | Predictable, heuristic-detectable | **Novel** — plausible-looking but subtly wrong |
| Business domain understanding | Humans carry context: risk profile, product lifecycle, tradeoffs, consequences of failure. Also transferable professional heuristics — reasoning by analogy from other systems and domains (the "oracle concept") | **Qualitatively different** — LLMs have broad statistical pattern recognition from training data, but lack consequence-grounded calibration, contextual exception recognition, and project-specific accumulated knowledge. The easy half is present; the hard half — the parts prevention depends on — is missing. The comparison is an open research question |
| Intent preservation | Humans carry the "why" — business rationale, design decisions, consciously accepted tradeoffs. Accumulated implicitly through participation in decisions and shared understanding | **Eroding** — agents don't retain intent; humans who made the decisions rotate, forget, or leave. Intent debt accumulates invisibly and manifests not when things break, but when decisions need to be made: should we build this feature? Is this product still serving its purpose? |

Row 1 is quantitative change. Rows 2-8 are qualitative changes. This is why "just add more wardens" has a structural ceiling — it addresses row 1 but not rows 2-8.

---

## 4. Research Questions

The analysis points to a central asymmetry: **the two debts are not equally non-negotiable**.

**Intent is absolute.** Without the "why", you cannot define success, assess the product, or decide what to build next. Lose the intent and you are not building a product; you are just generating code. Intent debt manifests not when things break, but when decisions need to be made, and at that point, no amount of comprehension can compensate for not knowing why the system exists.

**Comprehension is conditional.** You need enough of it to *supervise* (catch when agents go wrong), *intervene* (debug when things break), and *evolve* (make architectural decisions about the system's future). But you might not need line-by-line understanding of generated code, or the level of comprehension you would have if you wrote it yourself. Practical experience with AI-assisted pairing (where a domain expert and an engineer collaborate while delegating implementation to an agent) suggests that teams can operate with partial comprehension and full intent, provided the right collaboration structures are in place.

**A worked example.** Consider a payment refund flow.

*Scenario A: full intent, degraded comprehension.* The team knows the refund policy precisely. Refunds over $500 require manager approval. Fraud cases bypass the manager and route to legal. Partial refunds for subscription disputes prorate to the day. The implementation was generated by an agent six months ago, and no one on the current team has read the code in detail. A bug surfaces: a customer was refunded twice. The team re-runs the flow with logging, compares actual behaviour to the policy they understand, decides whether the fix is "patch this branch" or "redesign the deduplication". They debug slowly, but they recover. The product still does the right thing for new customers in the meantime, because the intent is intact and the team can supervise.

*Scenario B: full comprehension, fuzzy intent.* Same codebase, but now the team has read every line and understands the implementation perfectly. What they have lost is *why* some branches exist. Why does the fraud-case refund bypass the manager? Was that a compliance requirement, an old ops decision, or a hack from an A/B test that was never cleaned up? Why does the partial refund prorate to the day rather than the hour? Does anyone still need that, or was it for a customer who left two years ago? The team cannot answer "is this still doing the right thing?" without intent. They cannot decide whether to keep, refactor, or remove. They cannot evaluate whether new requirements (a regulatory change, a product redesign) are compatible with what is already there. The codebase becomes a museum of decisions whose context is gone.

The asymmetry: degraded comprehension is a cost of *speed and risk*. Debugging is slower, regressions more likely, but the system continues to function and decisions remain possible. Lost intent is a cost of *direction*. You do not know whether to keep, change, or rebuild. The first is recoverable. The second compounds.

How much comprehension you need depends on how reliable the agent is and how well intent is preserved. If intent is rock-solid and agents are highly reliable, you need less comprehension. If agents are unreliable or intent is fuzzy, you need more.

This leads to the central research question:

**What is the relationship between intent preservation, comprehension level, and agent learning capability — and under what conditions can reduced comprehension be safely compensated by stronger intent control and better agent learning?**

This opens a design space rather than defending a fixed position. It connects directly to the [economics of testing](../testing_economics/testing_economics.md) framework: comprehension is an investment, and how much you need depends on risk, agent reliability, and the quality of your intent mechanisms.

---

See also: [evaluation.md](evaluation.md) — industry responses evaluated against this framework. [references.md](references.md) — annotated link collection.
