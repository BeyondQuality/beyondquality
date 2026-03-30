# Evaluating Industry Responses to AI-Accelerated Development

Research by Lilia Abdulina (Head of QA at JetBrains), with Vitaly Sharovatov.

Discussion: https://github.com/BeyondQuality/beyondquality/discussions/28

---

## Evaluation framework

The [analysis](analysis.md) identified seven factors that change qualitatively when agents enter the development process:

| # | Factor | Pre-AI | With agents |
|---|--------|--------|-------------|
| 1 | Code volume | — | Accelerated (quantitative change) |
| 2 | Comprehension per line of code | Constant | Degraded — nobody deeply understands agent-written code |
| 3 | Feedback loop (testing → implementation) | Works | Severely degraded — persistence mechanisms exist but provide information recall, not the process of judgment updating; pace mismatch widens the gap |
| 4 | Shared understanding | Fills specification gaps | Absent on agent side — gaps stay unfilled |
| 5 | Test independence | Human testers bring independent perspective | AI tests can share code's blind spots |
| 6 | Failure modes | Predictable, heuristic-detectable | Novel — plausible-looking but subtly wrong |
| 7 | Business domain understanding | Humans carry context: risk profile, product lifecycle, tradeoffs, consequences of failure. Also transferable professional heuristics (oracle concept) | Qualitatively different — LLMs have broad pattern recognition but lack consequence-grounded calibration, contextual exception recognition, and project-specific accumulated knowledge. Open research question |
| 8 | Intent preservation | Humans carry the "why" — business rationale, design decisions, consciously accepted tradeoffs | Eroding — agents don't retain intent; humans who made decisions rotate, forget, or leave. Manifests not when things break, but when decisions need to be made |

Row 1 is a quantitative change. Rows 2-8 are qualitative. Any proposed solution can be evaluated by asking: **which rows does it address?**

We also use the cost model from the analysis:
- Proactive QA: **O(n + εn²)** where ε is the cross-team coordination coefficient
- Reactive QC: **O((n + εn²) / (1-r(n)))** where r(n) is the rework defect injection rate

Agents increase effective n, increase ε, and (in reactive QC companies) increase r(n). A solution that only addresses row 1 (volume) without addressing rows 2-8 will hit a structural ceiling.

### The economic argument: CoQ and Direction 1/2

The [Economics of Testing](../testing_economics/testing_economics.md) research frames testing as an investment within the Cost of Quality (CoQ) framework, which categorizes quality-related costs into four types: prevention, appraisal, internal failure, and external failure. These map directly to our cost models:

| CoQ Category | Maps to |
|---|---|
| Prevention costs | What proactive QA companies invest in to keep ε small |
| Appraisal costs | The warden — inspection after the fact (Direction 1/2) |
| Internal failure costs | The rework feedback loop — the r(n) factor |
| External failure costs | The escape rate — what gets past the warden |

The economic insight is that **prevention costs less than appraisal, which costs less than failure**. The industry responses evaluated below are all appraisal activities — they optimize inspection, not prevention. The economics say this is structurally suboptimal: you can make the warden faster and more thorough, but you're still paying appraisal prices to catch what cheaper prevention could have avoided.

The deeper problem: prevention requires exactly the capabilities that agents lack or have only in degraded form — the judgment components of business domain understanding (row 7), shared understanding (row 4), and the feedback loops that improve quality over time (row 3). Agents have broad statistical pattern recognition, but prevention demands consequence-grounded calibration, contextual exception recognition, and project-specific knowledge — the parts that are missing. You cannot do risk-based testing investment without knowing what risks exist, what failure costs, and what the product lifecycle demands. This is why Direction 1/2 products dominate the market: appraisal can be automated without deep domain understanding, prevention cannot.

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
| 7 | Business domain understanding | **No** — mutation testing treats all code changes as equally important. It cannot distinguish a subtle bug in a payment flow from a cosmetic issue in a settings page. No access to risk profile, product lifecycle, or business tradeoffs |
| 8 | Intent preservation | **No** — no mechanism for preserving or assessing business rationale. Tests are generated per-change with no access to why the code exists |

**Effect on cost model:**
- Reduces the linear term (no per-team test maintenance cost)
- May reduce ε slightly (less cross-team test conflict since there's no shared suite)
- Does not affect r(n) — rework defect injection rate stays the same because the comprehension gap is unaddressed
- Does not affect the rework multiplier 1/(1-r(n))

**Cost transparency note:** Unlike the Anthropic approach (where per-review pricing is published), Meta has not published cost figures for JiTTests infrastructure — LLM inference for mutation generation, test generation, and assessment per code change. Without these numbers, direct economic comparison between the two approaches is incomplete.

**Assessment:** The strongest possible version of Direction 1/2 — automate and optimize the warden. Addresses row 1, partially addresses rows 2, 5, 6, misses rows 3, 4, 7, and 8 entirely. This is a significant engineering contribution but it cannot close the comprehension gap on its own. It makes the "inspect after the fact" approach as good as it can be, which clarifies where the remaining problems lie: specification, learning, shared understanding, and business domain context.

However, eliminating maintained test suites also eliminates one of the few places where domain knowledge is encoded in machine-readable form. A test that exists because the team learned that users misuse a feature in a specific way is organisational memory crystallised into code. JiTTests, by generating tests per-change from scratch, eliminate this accumulated knowledge along with the maintenance cost. Each generation episode has no memory of what the team learned before. The tradeoff — lower maintenance cost in exchange for lost organisational memory — should be evaluated explicitly, not treated as a pure win.

---

## 2. Claude Code Review — Anthropic (2026)

**Source:** [Anthropic announcement](https://techcrunch.com/2026/03/09/anthropic-launches-code-review-tool-to-check-flood-of-ai-generated-code/), [documentation](https://code.claude.com/docs/en/code-review)

**What it proposes:** Multi-agent automated PR review. When a pull request opens, multiple specialized AI agents analyze the code simultaneously — each targeting a different class of issue: logic errors, boundary conditions, API misuse, authentication flaws, and compliance with project-specific conventions. A verification step then attempts to disprove each finding before results are posted (false positive filter). Surviving findings are deduplicated, ranked by severity, and posted as inline PR comments. $15-25 per review, ~20 minutes completion time. Configurable via CLAUDE.md / REVIEW.md files.

**What it gets right:**
- Parallelized multi-agent analysis covers more issue classes simultaneously than a single human reviewer could.
- The falsification step (attempting to disprove each finding before posting) is a good engineering choice — it reduces noise, which is the main failure mode of automated review tools.
- Configuration via project files lets teams encode some domain context.

**What it does not address:**

The fundamental question is: can we reason about code quality without understanding the business domain, the company's risk profile, and the product lifecycle stage?

The answer is: only superficially. Automated review can catch syntax errors, known vulnerability patterns, and generic logic issues. But it cannot assess whether the code does the right thing — and "doing the right thing" is the most important dimension of quality. Code that is perfectly clean, well-structured, passes all automated checks, and solves the wrong problem is zero-quality code.

An automated reviewer has no access to:
- What business problem this code is solving
- What the consequences of failure are for this specific product
- Whether this is a prototype where "good enough" is fine, or a payment system where subtle bugs cost millions
- What tradeoffs the team has consciously accepted
- The history of decisions that led to the current architecture

A REVIEW.md file can encode a thin slice of this context, but it's a fraction of what a human reviewer carries in their head.

**Evolution path and its risks:**

One could imagine strengthening this approach by connecting the reviewer to richer context: bug trackers, PRDs, Slack threads, commit history. In principle, this would bring more of the missing context back into the picture, and if the product evolves this way, that would be welcome.

However, treating multiple document channels as inputs carries two significant risks:

*Multi-channel noise.* The fundamental problem with feeding Jira, PRDs, and Slack into an automated reviewer is that the noise level of any individual message is uncharacterisable from the message alone. A manager says "the UI feels off" — is that critical stakeholder feedback or an offhand remark? A tester files "another bug in module X" — is that a catastrophic security hole or a cosmetic glitch? An experienced QA professional has seen hundreds of bad PRDs and confluence docs, and their expertise allows them to spot when a document is insufficient and go talk to the author to enrich it. This skill is not obviously transferrable into an algorithm — what are the "acceptance criteria" for a PRD, or a Slack message, or an email? There is no way to programmatically determine the signal-to-noise ratio of a message. To distinguish signal from noise, you need to know what matters. And knowing what matters requires a risk register — which is exactly the economic framework from the [Economics of Testing](../testing_economics/testing_economics.md) research. The economic model is needed first; and with it in place, we can then evaluate whether feeding inherently noisy information sources into the reviewer produces any additional value.

*Testing theatre.* Without an economic foundation — where testing measures are derived from risk registers and economic analysis (see [Economics of Testing](../testing_economics/testing_economics.md)) — consuming documents as inputs gives the appearance of thorough analysis without the reasoning that makes it meaningful. Even companies without formal risk management benefit from humans' implicit *feeling* of risks, derived from sources far beyond any document system. An enriched automated reviewer that "checked Jira, read the PRDs, and consulted Slack" looks comprehensive — so no one is prompted to ask the foundational question: "are we testing the right things at the right investment level?" This could be worse than the non-enriched version, where the limitation is at least visible.

Even with full enrichment, the Direction 1/2 classification holds: a smarter warden with better context is still a warden. The economic insight — prevention costs less than appraisal — remains unchanged.

**Which rows does it address?**

| # | Factor | Addressed? |
|---|--------|-----------|
| 1 | Code volume | **Yes** — automated, multi-agent parallelism |
| 2 | Comprehension | **No** — inspection is not comprehension. After the review is done, nobody understands the code any better than before. A human reviewer builds a mental model while reviewing; an LLM reviewer does not accumulate understanding |
| 3 | Feedback loop | **No** — findings posted as PR comments, but the code-generating agent doesn't learn from them. The same class of issue can recur indefinitely |
| 4 | Shared understanding | **No** — agents analyze code against generic patterns and project conventions, not against the team's understanding of what the system should do |
| 5 | Test independence | **Partially** — the review agents are separate from the code-generating agent, providing some independence. But both are LLMs working from the same code surface, so shared blind spots are possible |
| 6 | Novel failure modes | **No** — "code looks right but implements the wrong thing" is precisely what another LLM will also think looks right. To catch subtly wrong logic, you need to know what "right" means — which requires understanding intent, not just inspecting code |
| 7 | Business domain understanding | **No** — the reviewer has no access to business context, risk profile, or product lifecycle stage. A REVIEW.md file can encode a thin slice of this, but it's a fraction of what a human reviewer carries. The tool cannot distinguish a critical payment flow bug from a cosmetic settings page issue unless explicitly told to |
| 8 | Intent preservation | **No** — the reviewer inspects code surface, not business rationale. It cannot assess whether the code serves the right purpose, only whether it appears correct |

**Effect on cost model:**
- Does not reduce the linear term — in fact, adds a per-PR cost ($15-25) that scales linearly with code volume. The faster agents generate code, the more reviews are needed.
- Does not affect ε — cross-team coordination requires understanding, not inspection.
- Does not affect r(n) — the comprehension gap that causes rework is unaddressed.

**The economic structure:** The same company sells tools that accelerate code production (Claude Code) and tools that inspect the resulting output (Claude Code Review). Whether intentional or not, this is commercially significant evidence that the industry recognizes the comprehension gap as real and costly. The economic incentive is to optimize the warden (Direction 1/2), not to prevent the gap from forming (Direction 3) — because prevention reduces the demand for inspection.

At $25 per review and 20 PRs/day, a team pays ~$10K/month for automated inspection alone. This is the trust tax made visible — and it scales linearly with code velocity, which is the one thing agents are designed to increase.

**A nuance: review as agent calibration.** There is one practice enabled by this tool that crosses the Direction 1/2 boundary. When teams use review findings not just to fix individual PRs but to identify recurring agent failure patterns and refine the agent's instructions, they are doing prevention — improving the production process, not just inspecting output. Microsoft's .NET/Copilot data illustrates this: their PR success rate jumped from 38% to 69% after establishing detailed `copilot-instructions.md`, a direct result of humans reviewing early output, identifying patterns, and calibrating the agent. This is testing the agent, not the code — a meta-level shift that is genuinely Direction 3. However, the feedback loop operates at human review speed while generation operates at machine speed, so it is inherently lagging. It is also a manual version of what persistent agent memory should eventually automate. Worth recognising as a transitional practice — real prevention, but with pace limitations.

**Assessment:** Primarily a Direction 1/2 product. Addresses row 1 and partially row 5. Does not address rows 2, 3, 4, 6, 7, or 8. The review-as-agent-calibration practice described above is the one exception — a Direction 3 activity enabled by the tool but not inherent to it. The product confirms the problem our analysis describes — its very existence is evidence that AI-generated code creates a quality gap that inspection alone cannot close. The pricing model makes the cost of the warden approach explicit and demonstrates that it scales linearly with the problem it's trying to solve.
