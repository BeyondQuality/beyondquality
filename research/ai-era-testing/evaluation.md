# Evaluating Industry Responses to AI-Accelerated Development

Research by Lilia Abdulina (Head of QA at JetBrains), with Vitaly Sharovatov.

Discussion: https://github.com/BeyondQuality/beyondquality/discussions/28

---

## Evaluation framework

The [analysis](analysis.md) identified six factors that change qualitatively when agents enter the development process:

| # | Factor | Pre-AI | With agents |
|---|--------|--------|-------------|
| 1 | Code volume | — | Accelerated (quantitative change) |
| 2 | Comprehension per line of code | Constant | Degraded — nobody deeply understands agent-written code |
| 3 | Feedback loop (testing → implementation) | Works | Severed — agent has no persistent model to update |
| 4 | Shared understanding | Fills specification gaps | Absent on agent side — gaps stay unfilled |
| 5 | Test independence | Human testers bring independent perspective | AI tests can share code's blind spots |
| 6 | Failure modes | Predictable, heuristic-detectable | Novel — plausible-looking but subtly wrong |

Row 1 is a quantitative change. Rows 2-6 are qualitative. Any proposed solution can be evaluated by asking: **which rows does it address?**

We also use the cost model from the analysis:
- Proactive QA: **O(n + εn²)** where ε is the cross-team coordination coefficient
- Reactive QC: **O((n + εn²) / (1-r(n)))** where r(n) is the rework defect injection rate

Agents increase effective n, increase ε, and (in reactive QC companies) increase r(n). A solution that only addresses row 1 (volume) without addressing rows 2-6 will hit a structural ceiling.

---

## 1. JiTTests — Meta (Harman, 2026)

**Source:** [Meta Engineering Blog](https://engineering.fb.com/2026/02/11/developer-tools/the-death-of-traditional-testing-agentic-development-jit-testing-revival/)

**What it proposes:** Replace maintained test suites with Just-in-Time Tests — LLM-generated tests created on the fly for each code change. The process: new code lands → system infers change intention → creates mutants (intentionally faulty code) → generates and runs tests to catch faults → rule-based and LLM-based assessors filter true positives → engineers get reports on unexpected changes.

**What it gets right:**
- Eliminates the test maintenance scaling problem. No suite to maintain means no superlinear maintenance cost as n grows.
- Per-change testing is inherently adaptive — each test is tailored to what actually changed, not to what someone predicted might change years ago.
- The mutation testing approach is clever because it sidesteps the comprehension problem partially: it asks "did this change break observable behavior?" rather than "do I understand what this code does?". This is a behaviorist approach — verify the output, not the reasoning.

**Which rows does it address?**

| # | Factor | Addressed? |
|---|--------|-----------|
| 1 | Code volume | **Yes** — automated, scales with code output |
| 2 | Comprehension per line | **Partially** — mutation testing doesn't require comprehension of intent, but the "infer change intention" step does |
| 3 | Feedback loop | **No** — catches regressions but doesn't update anyone's mental model. The agent that produced the code still starts fresh next session |
| 4 | Shared understanding | **No** — tests are generated, not designed from shared understanding of what the system should do |
| 5 | Test independence | **Partially** — mutation testing provides some independence (testing against behavioral changes, not against the spec). But the LLM inferring "change intention" can share the code-generating LLM's assumptions |
| 6 | Novel failure modes | **Partially** — mutation-based approach can catch some novel failures (behavioral regressions), but not "code looks right but implements the wrong thing" since it only detects changes from previous behavior, not deviations from intended behavior |

**Effect on cost model:**
- Reduces the linear term (no per-team test maintenance cost)
- May reduce ε slightly (less cross-team test conflict since there's no shared suite)
- Does not affect r(n) — rework defect injection rate stays the same because the comprehension gap is unaddressed
- Does not affect the rework multiplier 1/(1-r(n))

**Assessment:** The strongest possible version of Direction 1/2 — automate and optimize the warden. Addresses row 1, partially addresses rows 2, 5, 6, misses rows 3 and 4 entirely. This is a significant engineering contribution but it cannot close the comprehension gap on its own. It makes the "inspect after the fact" approach as good as it can be, which clarifies where the remaining problems lie: specification, learning, and shared understanding.
