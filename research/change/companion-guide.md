# Implementing rational QA improvements: a companion guide for engineers

This guide is a companion to the [economics of testing](https://beyondquality.org/research/testing_economics/testing_economics) research and the [social resistance to rational change](first.md) analysis. The economics of testing tells you _what_ to propose; the resistance analysis tells you _why_ rational proposals get rejected; this guide tells you _how_ to land the proposal.

**Audience**: engineers who have identified a rational, justified improvement to their organisation's testing strategy and want to implement it.

**Assumption**: the proposed change is instrumentally rational under the economics-of-testing model (i.e., it improves expected total cost of quality over an appropriate horizon). This guide does not address how to design the right testing strategy; it addresses how to get a good strategy adopted.

## Why rational proposals fail for rational reasons

A common experience: an engineer analyses the testing portfolio, identifies a clear improvement (e.g., shift investment from redundant end-to-end checks to earlier prevention and targeted appraisal), presents a well-reasoned case, and gets rejected. The engineer perceives the rejection as irrational. It is not.

The manager's rejection is often locally rational given their constraints:

- **Budget rigidity**: budgets are typically planned annually. A mid-cycle reallocation means the manager must renegotiate commitments, re-justify headcount, and accept accountability for the change. The status quo carries no such cost.
- **Blame asymmetry**: if the current approach fails, it fails in a familiar, expected way. If the new approach fails, the manager who approved it is personally accountable for a visible deviation from the plan.
- **Time scarcity**: managers are often overloaded. Reviewing a proposal thoughtfully, building internal support for it, and shepherding it through approval takes time they may not have.
- **Incentive misalignment**: the manager may be measured on delivery velocity, headcount, or feature throughput. A testing improvement that reduces rework in Q3 does not help their Q1 OKR review. Worse, if the improvement succeeds and reduces the need for manual testing effort, the manager may fear headcount reduction.
- **Identity and role threat**: an engineer proposing organisational change can be perceived as overstepping their role, implying that current leadership is insufficient, or advocating for their own function rather than business outcomes.

These are not personal failings. They are predictable consequences of how organisations structure incentives, accountability, and decision-making. The [CFIR-based resistance analysis](first.md) maps these forces systematically.

The implication: **the technical quality of the proposal is necessary but not sufficient. Engineers must also address the social, political, and structural conditions that determine whether a rational proposal gets adopted.**

## Strategy 1: Build a coalition and quantify in the organisation's own language

The single most effective move is to stop being the sole messenger. Before proposing the change, build a cross-functional coalition that makes the business case visible in terms the organisation already cares about.

**Why this works (mapped to resistance factors):**

- Shifts **source credibility**: the proposal is no longer "QA wants more QA". It is a cross-functional finding backed by data from multiple departments.
- Strengthens **evidence strength**: the organisation's own numbers are harder to discount than a theoretical model or external benchmarks.
- Builds **coalition** (CFIR process domain): by the time the proposal reaches the decision-maker, it already has allies. This mirrors the structural advantage that external consultants have: their ground is prepared before the proposal is made.
- **De-risks the manager**: if the proposal is backed by Support, Sales, Finance, and Engineering, the manager is not alone in sponsoring the change. Shared ownership reduces personal blame exposure.

**How to do it:**

1. **Partner with Customer Support** to identify which escaped defects cost the most in ticket handling, escalations, and resolution time. Support teams often have this data already but no one asks them for it in a quality context.

2. **Partner with Sales / Account Management** to identify which bugs, outages, or quality issues put renewals and expansions at risk. Sales teams experience quality failures as deal risk and can often attach revenue figures.

3. **Partner with Finance** to quantify SLA credits, refunds, contractual penalties, and incident response costs. Finance can provide the monetary framing that makes the case legible to executive decision-makers.

4. **Partner with Engineering** to quantify incident response effort, hotfix cycles, rework hours, and delivery drag caused by quality issues.

5. **Aggregate into Cost of Quality language**: the data from steps 1-4 gives you external failure costs (production incidents, support load, revenue impact, penalties) and internal failure costs (rework, retesting, debugging, delayed releases). This is the CoQ framework from the economics of testing model, but populated with your organisation's actual numbers.

The result: a business case grounded in cross-functional data, delivered by a coalition rather than a single engineer. This is structurally different from presenting a testing framework and asking the manager to trust it.

**Caveat: read the culture first.** Cross-functional data-gathering requires navigating organisational norms. In some cultures, reaching out to Sales or Finance as an engineer is welcomed; in others, it may be perceived as going around your manager or overstepping your role. Frame the data-gathering as understanding the organisation's cost structure ("I want to understand how quality issues affect us across departments") rather than building a case against current practices.

## Strategy 2: Align the proposal with the manager's incentives

The resistance analysis identifies incentive misalignment (Kerr's "Rewarding A while hoping for B") as a key blocker. The most direct counter is to reframe the proposal in terms of the manager's existing goals.

**How to do it:**

1. **Identify the manager's OKRs/KPIs.** What are they measured on this quarter and this year? Common metrics include delivery velocity, feature throughput, team capacity, incident counts, or customer satisfaction scores.

2. **Map the proposal to those metrics.** Show how the change helps the manager hit their existing targets, not just how it improves quality in the abstract.

   Examples:
   - Manager is measured on **delivery velocity**: show that rework and hotfixes currently consume X% of sprint capacity. Prevention investment removes drag on the metric they are already measured on. The proposal is not "slow down to improve quality"; it is "remove the thing that is already slowing you down".
   - Manager is measured on **incident count or availability SLOs**: show that the proposed testing changes target the specific failure modes that cause incidents. The proposal directly reduces the metric they are accountable for.
   - Manager is measured on **customer satisfaction / NPS**: connect the quality-in-use data (from the economics of testing Step 2) to the satisfaction signals the manager is already tracking.

3. **Address the headcount concern explicitly.** If the manager fears that a successful improvement will lead to headcount reduction, address this directly. Reframe: freed-up capacity is reallocated to higher-value work (exploratory testing, prevention, new capabilities), not eliminated. If you cannot make this case honestly, acknowledge the tension rather than hiding it.

**Why this works:** the proposal stops being a request to take a risk and becomes an offer to hit existing targets more effectively. The manager's rational self-interest is aligned with the change rather than against it.

## Strategy 3: Time the proposal to the budgeting and planning cycle

The resistance analysis identifies budget rigidity and structural inertia as blockers. Timing the proposal to when the organisation is structurally ready to hear it is a low-effort, high-impact move.

**How to do it:**

1. **Learn when planning happens.** Most organisations plan budgets and headcount on an annual cycle, often in Q3 for the following year. Some have quarterly planning or rolling budgets. Understand your organisation's rhythm.

2. **Plant the seed before the planning window.** If annual planning happens in September, start the coalition-building and data-gathering in June-July. By the time planning starts, the data is ready and the allies are already engaged.

3. **Propose during the planning window, not after it.** A proposal that arrives after budgets are locked competes against committed plans. A proposal that arrives during planning is one option among many, evaluated on its merits.

4. **Use natural trigger events.** Major incidents, architecture changes, regulatory shifts, or leadership changes create windows where the organisation is temporarily more receptive to change. The CFIR framework calls these event-driven review triggers. Be ready with data when these windows open, but avoid the perception of exploiting a crisis.

**Why this works:** the same proposal that feels like a disruptive mid-cycle reallocation in May can feel like a sensible planning input in September. The content is identical; the structural context determines reception.

## Strategy 4: Size the ask to the change

The economics of testing model supports changes ranging from "add a linter to CI" to "restructure the entire testing portfolio". The coalition-and-data approach described above is heavy machinery. Match the change strategy to the size of the change.

**Small, reversible changes** (adding a tool, adjusting a CI gate, changing a test practice within one team):
- May not need a cross-functional coalition.
- Often need only the immediate manager's permission to experiment.
- Frame as a low-risk experiment with a defined evaluation point.

**Medium changes** (reallocating effort across testing types, introducing a new testing level, changing coverage targets across teams):
- Benefit from data and at least one ally outside the immediate team.
- Frame as a bounded pilot with measurable outcomes (see Strategy 5).

**Large changes** (restructuring the testing portfolio, changing the balance between prevention and appraisal, rebudgeting across departments):
- Require the full coalition, data, incentive alignment, and timing approach.
- Require an explicit sponsor (someone with budget authority who owns the outcome).

**Why this matters:** over-engineering the change process for a small improvement creates unnecessary friction and may signal to the manager that the engineer does not understand organisational proportionality. Under-engineering it for a large change leads to the "everyone agrees in principle" failure mode where consensus never translates into action.

## Strategy 5: Start small, show results, expand

When the full proposal faces resistance, a bounded pilot reduces the manager's perceived risk while creating internal evidence.

**How to do it:**

1. **Propose a pilot on one team or one product area.** Choose a scope where the risk is visible (e.g., high escaped-defect rate, frequent incidents) and the change is measurable.

2. **Define success criteria in advance.** Use the metrics from Step 4 of the economics of testing: defect containment ratio, escaped defect rate, rework hours, incident frequency, or CoQ shift. Agree on these with the manager before starting.

3. **Run the pilot with a defined time horizon.** Long enough to produce meaningful data (typically one to two quarters), short enough that the manager has an exit ramp if it does not work.

4. **Report results in the manager's language.** Not "we achieved 85% branch coverage"; instead "rework hours dropped by X%, incident rate dropped by Y%, and the team shipped Z% more features in the same period".

5. **Use pilot results as internal evidence for expansion.** Internal success cases are structurally similar to the "prior success cases" that consultants are asked to provide, but with the advantage of being from the organisation's own context. They are harder to dismiss as non-transferable.

**Why this works:** the pilot addresses multiple resistance factors simultaneously:
- **Reduces perceived risk**: the manager is not committing to a portfolio-wide restructuring; they are approving an experiment.
- **Creates internal evidence**: addresses the evidence strength gap without relying on external benchmarks.
- **Builds credibility incrementally**: the engineer's track record of delivering measurable results increases source credibility for the next proposal.
- **Provides an exit ramp**: if the pilot underperforms, the manager can stop it without organisational consequences. This makes saying "yes" much cheaper than saying "yes" to a full rollout.

## When it still fails

Even with allies, aligned incentives, good timing, a right-sized ask, and pilot evidence, some organisations will not change. The resistance may be structural (deeply misaligned incentives, leadership that does not value quality), cultural (a climate where slowing down is always punished), or political (decision-makers who have committed to the status quo and cannot reverse without losing face).

This is worth acknowledging honestly rather than pretending that better technique always wins.

**Options when the organisation will not move:**

- **Reduce the scope further.** Some changes can be made within the engineer's own sphere of control (their own team, their own code, their own testing practices) without organisational approval. These do not address portfolio-level issues, but they build local evidence and protect local quality.
- **Document the case and wait for a trigger event.** Major incidents, leadership changes, regulatory shifts, or competitive pressure can open windows that were previously closed. Having a ready, data-backed proposal when the window opens is valuable.
- **Escalate with evidence.** If the engineer has quantified the cost of the status quo and the organisation is knowingly accepting avoidable risk, escalating to higher leadership (with data, not complaints) is a legitimate professional action. This carries personal risk and should be done deliberately.
- **Accept the constraint and adapt.** Not every organisation can be changed from within. Professional ethics require the engineer to advocate for quality, but they do not require martyrdom. Understanding when to push, when to wait, and when to accept the boundary is itself a professional skill.

## Summary

| Strategy | Resistance factors addressed | When to use |
|----------|------------------------------|-------------|
| Build a coalition with data | Source credibility, evidence strength, coalition/process, manager's blame exposure | Medium to large changes |
| Align with manager's incentives | Incentive misalignment, perceived relative advantage | Always |
| Time to budgeting cycle | Budget rigidity, structural inertia, organisational readiness | Changes that require budget reallocation |
| Size the ask | Proportionality, perceived complexity and cost | Always |
| Start small with a pilot | Perceived risk, evidence strength, source credibility | When full proposal faces resistance |

The common thread: **shift from presenting a rational argument to creating the structural conditions under which the argument can be heard.** The economics of testing provides the content; this guide provides the delivery mechanism.

## References

- [Economics of testing](https://beyondquality.org/research/testing_economics/testing_economics) — the model for identifying and justifying testing improvements.
- [Social resistance to rational change in QA](first.md) — CFIR-based analysis of why rational proposals get rejected.
- [Consolidated Framework for Implementation Research (CFIR)](https://cfirguide.org/) — the organising taxonomy for resistance factors.
- [Klein & Sorra (1996). The Challenge of Innovation Implementation.](https://www.jstor.org/stable/259164) — implementation climate: whether innovation use is expected, supported, and rewarded.
- [Kerr (1975). On the Folly of Rewarding A, While Hoping for B.](https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Motivation/Kerr_Folly_of_rewarding_A_while_hoping_for_B.pdf) — incentive misalignment.
- [Hovland & Weiss (1951). The Influence of Source Credibility on Communication Effectiveness.](https://doi.org/10.1086/266350) — source credibility and persuasion.
- [Kahneman & Tversky (1979). Prospect Theory: An Analysis of Decision under Risk.](https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Behavioral_Decision_Theory/Kahneman_Tversky_1979_Prospect_theory.pdf) — loss aversion and reference dependence.
- [Kotter (1995). Leading Change: Why Transformation Efforts Fail.](https://hbr.org/1995/05/leading-change-why-transformation-efforts-fail-2) — recurring failure patterns in organisational change.
