# With Agents: How the Process Works Now

Part of [QA in the Age of AI-Accelerated Development](analysis.md). Pre-requisite: [Pre-AI baseline](analysis-pre-ai.md).

---

In the [pre-AI baseline](analysis-pre-ai.md) we saw that "testing-after" was already doomed under scale, and that what kept the process working at all was business domain understanding, required by every step and accumulated implicitly through human collaboration. Now let's review what happens when code generation is delegated to agents.

## The general process: same steps, different dynamics

1. **Decision**: Humans still decide what to build. But the specification now serves two audiences: humans and agents. The agent has no shared understanding, no history of working with the codebase, no tacit knowledge. The specification becomes simultaneously **more critical** (the agent can only work from what it's given) and **more insufficient** (the compensation mechanism of shared understanding is absent on the agent side).

2. **Implementation**: Agents produce code dramatically faster, but several things break:
   - **Comprehension inversion**: before, the implementer understood the code best. Now, the implementer (agent) has no persistent understanding. The code exists, but nobody has the deep understanding the author traditionally had. This is qualitatively new, not "more code" but "code with less understanding per line".
   - **Comprehensible artifact degrades**: AI-generated code is syntactically fluent but its "intent" is derivative of the prompt, not of deep design reasoning. It may look idiomatic while being subtly wrong.
   - **Shared understanding doesn't accumulate**: a human developer builds a mental model over months. An agent starts roughly fresh each session. Each generation episode is somewhat context-free.

The comprehension inversion is empirically supported. The generation effect described in the [pre-AI baseline](analysis-pre-ai.md) predicts that when we move from producing code to reviewing or accepting agent-generated code, we remove the generative act that produces retention. Recent experiments confirm it. Bastani et al. (2025, *PNAS*) found that students using GPT-4 performed 17% worse on assessments once access was removed, compared to students who never had access. Shen & Tamkin (2026, Anthropic) found that engineers who delegated code generation to AI scored 50% on comprehension vs 67% for those who coded manually. Crucially, engineers who used AI for *conceptual questions* rather than delegation maintained their comprehension. And the METR study (Becker et al., 2025) found that experienced developers using AI took 19% longer on their own repos while believing they were 20% faster. The perception gap itself is evidence that comprehension debt accumulates invisibly.

3. **Testing**: Three functions are stressed differently:
   - **Verdict function is overwhelmed**: more code to verify, same (or fewer) humans to do it.
   - **Learning function is broken**: testing produces learning, but the agent has no persistent mental model to update. The feedback loop from testing → implementation is severely degraded. The same class of bug can recur indefinitely.
   - **Feedback to decision still works**: humans still learn from testing. But the loop that improved *implementation quality over time* is gone.
   - **AI-generated tests have a bootstrap problem**: if AI generates both code and tests, they can share the same blind spots. A human tester brings independent domain understanding. An AI generating tests from the same spec as the code can produce tests that pass precisely because they share the same misunderstanding.
   - **Failure modes are novel**: human-written bugs are in predictable places (off-by-one, missing edge cases). AI-generated bugs are different: code "reads right" but implements subtly wrong logic. Existing testing heuristics may systematically miss these.

**Business domain understanding is qualitatively degraded, both the "how" and the "why".** The agent lacks comprehension of the code it produces (the "how"): it generates syntactically correct implementations without building a mental model that persists across sessions. But it also lacks intent (the "why"): it has no knowledge of *this* business domain, *this* risk profile, *this* product lifecycle, or *this team's* consciously accepted tradeoffs. The agent may have broad statistical pattern recognition from training data (recognising common patterns across thousands of systems) but it lacks consequence-grounded calibration, contextual exception recognition, and project-specific accumulated knowledge. It can be given some context via prompts or configuration files, but it doesn't accumulate domain understanding over time the way a human does. A human developer who fixes a production incident in the payment flow carries that experience into every subsequent decision. An agent starts roughly fresh each session. Even when explicitly provided with domain context, the agent lacks the judgment that comes from having lived through the consequences of getting it wrong.

These two gaps are the two debts this research interrogates: **comprehension debt** (nobody carries the "how") and **intent debt** (nobody carries the "why"). They were sketched as symptoms in the [hub problem statement](analysis.md#1-problem-statement); this page is where they emerge as a mechanism rather than a label, and where the rest of the research picks them up.

Given these two debts, what does this do to the economics of defects?

## The economics shift: Boehm's curve in the AI era

Pre-AI, Boehm's cost-of-change curve showed that fixing a defect grows exponentially more expensive as you move from requirements → design → code → testing → production, because the later you find a flaw, the more work products are built on top of it, and all need rework.

In the AI era, code generation and rewriting become cheap. An agent can regenerate a function in seconds. This might suggest the curve flattens, but it doesn't. The cost driver shifts from **rework volume** to **comprehension debt**, and the curve gets steeper:

| Activity | Pre-AI | AI era |
|---|---|---|
| Writing code | Expensive (human time) | Cheap (agent generates it) |
| Understanding code | Free (the author understands it) | Expensive (nobody deeply understands agent-written code) |
| Rewriting code | Expensive (human time) | Cheap (agent regenerates it) |
| Finding what to rewrite | Moderate (humans trace through code they understand) | Very expensive (comprehension gap) |

The consequences:

- **Wrong ideas get amplified faster.** A flawed specification used to produce one developer writing wrong code at human speed. Now it produces volumes of wrong code at machine speed. More wrong artifacts to find and correct.
- **Diagnosis is more expensive.** When you find a production defect in human-written code, the author can often fix it quickly because they understand it. In agent-written code, nobody deeply understands it. Diagnosis cost goes UP even though rewrite cost goes DOWN.
- **Integration costs are unchanged or worse.** Rewriting a function is cheap. Understanding how that function interacts with the rest of the system, what else breaks, what the ripple effects are. That's the expensive part, and it's worse because comprehension is degraded.
- **Production failure costs are completely unchanged.** Customer churn, outages, regulatory fines, reputational damage, all these have nothing to do with how cheaply you can rewrite code. They're business costs.

The AI-era Boehm curve: the "coding" section collapses (cheap to write and rewrite), but the "idea → specification" section becomes MORE critical (wrong ideas amplified at machine speed), and the "testing → production" section becomes steeper (diagnosis harder, comprehension degraded). The total cost of defects may increase even though the cost of writing code decreases.

The pre-AI curve was driven by "how much work was built on top of the flaw". The AI-era curve is driven by "how little anyone understands what was built on top of the flaw". The exponential cost driver shifts from rework volume to comprehension debt.

This has a direct economic implication: the [Cost of Quality framework](../testing_economics/testing_economics.md) says prevention is cheaper than appraisal, which is cheaper than failure. In the AI era, this gap widens: prevention (getting the idea and specification right) becomes even more critical relative to appraisal (inspecting the code after generation), because the amplification from wrong ideas to volumes of wrong code is faster and the comprehension debt makes late-stage diagnosis more expensive.

### Can't we just patch this? The limits of current compensation mechanisms

Three mechanisms partially compensate for the degraded feedback loop: external persistence (CLAUDE.md, memory tools, REVIEW.md files that carry knowledge across sessions), hosted fine-tuning (adjusting model weights on team-specific patterns via provider APIs), and local tuning of open-weight models (LoRA and similar techniques). These are real and worth exploring. However, what they provide (information recall and pattern adjustment) is categorically different from what the pre-AI feedback loop provided: a self-correcting *process* where risk emerges → pain is felt → humans analyse root causes → judgment updates → behaviour changes, all at a pace matched to code production. The mechanisms persist *snapshots of past conclusions* (labels, facts, rules), but lack economic weighting (how risky relative to what?), reassessment triggers (when does a persisted fact become stale?), awareness of what's *not* written down, and they operate at human speed while risk emergence now operates at machine speed. Whether these mechanisms, combined with a proper economic framework, can restore a functional feedback loop is an open research question.

## Two types of companies, now with agents

### Proactive QA companies

Prevention practices partially break:
- **TDD** still works if the human writes tests first and the agent implements. But writing good tests requires understanding the system, and the specification problem returns.
- **Pair programming** with an agent is fundamentally different: the agent doesn't push back on design, doesn't bring independent domain knowledge. It's a powerful tool, not a thinking partner.
- **Shared understanding amplifiers** were designed for human-to-human knowledge transfer. They don't directly apply when one "pair" is an agent.

Architectural coherence cost increases: agents don't inherently respect architectural boundaries unless explicitly constrained.

**But** proactive QA companies are better positioned. Their mindset is already "embed quality into the process". They'll naturally try to embed quality constraints into agent workflows (better prompts, architectural guardrails, specification-level testing). They experience this as "we need to adapt our practices" rather than "everything is breaking".

Scaling with agents: using the O(n + εn^2) framework, agents cause two simultaneous effects:
1. **Effective *n* increases**: agents multiply code output per team, so the equivalent "team count" in terms of code volume grows. Even a small ε starts to bite at higher *n*.
2. **ε itself increases**: the cross-team coordination cost assumed humans could read each other's code and resolve conflicts. When agent-generated code is less comprehensible, the coordination cost per team-pair rises — i.e., ε grows.

Combined effect on O(n + εn²): if agents raise effective team count to n' and coordination coefficient to ε', the quadratic term grows by (ε'/ε)·(n'/n)² — both multipliers compound. Outcome: **uncertain but plausibly manageable** if prevention practices can be adapted to constrain both effects.

### Reactive QC companies

Already struggling with superlinear scaling, now compounded:
- Code volume multiplies → the testing-after workforce needs to multiply faster
- The rework loop accelerates at higher velocity
- Manual testing becomes utterly overwhelmed
- The comprehension gap is widest here because there's no process to compensate

This is what Lilia describes at JetBrains (which sits somewhere between the two types, making the signal more alarming).

Scaling with agents: using the O((n + εn^2) / (1-r(n))) framework:
1. **Effective *n* increases** dramatically (same as proactive QA case)
2. **ε is already large** and grows further (agent code is less comprehensible, coordination harder)
3. **r(n) increases**: with more agent-generated code, rework introduces defects at a higher rate because the humans doing the rework understand the surrounding code less well. The denominator (1-r(n)) shrinks faster.

All three terms move in the wrong direction simultaneously. The compounding is multiplicative, not additive, the superlinear costs don't just increase, they accelerate.

## What is qualitatively new (not just "more of the same")

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

Row 1 is quantitative change. Rows 2-8 are qualitative changes. This is why "just scale testing-after" has a structural ceiling: it addresses row 1 but not rows 2-8.

---

← [Pre-AI baseline](analysis-pre-ai.md) | Next: [Lifecycle drift](analysis-lifecycle.md) →
