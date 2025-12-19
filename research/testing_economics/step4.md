## Table of contents

- [Step 1 — Identify & quantify risks](step1.md)
- [Step 2 — Categorize & prioritize risks](step2.md)
- [Step 3 — Decide where, how and how much to test](step3.md)
- Step 4 — Review and rebalance the portfolio
- [Complete testing taxonomy](taxonomy.md)

## Step 4 — Review and rebalance the portfolio

Once a testing strategy is defined and implemented, we must plan for its evaluation. Like any investment portfolio, the strategy should be reviewed to confirm that the chosen mix of testing approaches is still reducing the most important risks in a cost-effective way.

Two questions frame this evaluation: when to review the strategy, and how to measure whether it is delivering sufficient value for its cost. The first ensures evaluation is built into the lifecycle rather than deferred to a postmortem after a risk has materialized; the second defines the criteria and metrics used to judge return on investment.

Evaluation is not the end of the process but a feedback loop. As risks, priorities, and results change, the portfolio must change too: increase investment in approaches that prove effective, reduce or retire low-return work, and reallocate resources when new risks appear.

**Testing strategy is not a one-time plan, but a continuous cycle of investment, review, and adjustment.**

### When to review

Reviews should be part of the normal lifecycle, not something you do only in postmortems after risks have materialized. In practice, it helps to use a simple structure that covers both *when* to review and *what* to look at. The table below lists example evaluation areas, triggers, and metrics.

**Note**: These are illustrations, not a template. Every product, team, and organization has its own context, so you must recreate the contents for your case. The goal is not to adopt someone else's metrics wholesale, but to choose evaluation criteria that reflect your risks, priorities, and tolerance for investment.

| Evaluation Area | Example Triggers / Metrics | Purpose |
| --------------- | -------------------------- | ------- |
| **When to review** | 1. **Scheduled cadence**: Per release, quarterly, semi-annual, annual <br>2. **Event-driven**: Architecture change, new risks identified, regulatory shift, technology change, team changes, market changes <br>3. **Early-warning signals**: Spike in escaped defects, increased customer complaints, delivery slowdowns, increased support tickets, performance degradation, security incidents | Ensures the portfolio is reassessed regularly and reactively when risk context changes. |
| **Outcome effectiveness** | 1. **Defect containment**: Pre-release vs. post-release defect ratio, defect escape rate, time-to-detect vs. time-to-fix <br>2. **Severity-weighted defect density**: Critical/high/medium/low defects per unit (KLOC, feature, module), trend over time <br>3. **CoQ framework**: Track all four categories (Prevention, Appraisal, Internal failure, External failure) and ratios; over time, external failure should decrease while prevention + appraisal investment becomes more deliberate and stable <br>4. **Customer impact**: Support tickets volume/severity, customer churn rate, NPS scores, user complaints, feature adoption rates <br>5. **Risk reduction**: Number of high-priority risks mitigated, risk score reduction over time | Determines if the testing investment actually reduced critical risks. |
| **Efficiency of portfolio** | 1. **Test effort vs. coverage balance**: Hours spent per risk/feature vs. coverage achieved, cost per high-severity defect found (or cost per risk exposure point reduced) <br>2. **Lead time for change / delivery speed**: Time from code commit to production, deployment frequency, cycle time <br>3. **Redundancy vs. gaps**: Overlap analysis (same risk covered by multiple activities), gap analysis (risks with no coverage), coverage map completeness <br>4. **ROI proxy**: Testing cost vs. avoided rework cost, cost of defects found in testing vs. cost if found in production, testing investment vs. incident cost reduction <br>5. **Resource allocation**: Distribution of effort across testing types/levels, static vs. dynamic balance, manual vs. automated ratio <br>6. **Leading indicators**: Flaky test rate, change failure rate (DORA), test reliability, mutation score | Shows whether resources are being optimally allocated across testing approaches. |

**How to set up review cadence:**

1. **Start with scheduled reviews**: Establish a regular cadence (for example, quarterly) so reviews happen even when there are no obvious signals.
2. **Define event triggers**: Document which events trigger an immediate review (for example, major architecture change, new high-priority risk, new regulatory requirement).
3. **Set up early-warning monitoring**: Implement dashboards or reports that surface leading indicators automatically (for example, escaped defects, incident rate, change failure rate, flaky tests).
4. **Define ownership and outputs**: Ensure the right stakeholders participate, and make the outcome explicit: decisions, owners, and rebalancing actions.

**Common pitfalls:**

- Reviewing too late (only after incidents occur).
- No scheduled reviews (relying only on ad-hoc reviews).
- Ignoring early-warning signals (seeing spikes in defects or complaints, then doing nothing).
- Reviewing too frequently (a cadence shorter than your metrics can meaningfully change).
- Missing decision-makers (reviews happen, but no one can approve rebalancing).

### How to measure effectiveness

Effectiveness metrics answer a single question: did our testing investment reduce the critical risks we care about? Use both leading indicators (early signals) and lagging indicators (real outcomes). Leading indicators help you adjust before failures occur; lagging indicators confirm whether risk actually went down.

**Leading indicators** (early signals, faster feedback):

- Review coverage: percentage of relevant changes (code, design, requirements) that receive a defined level of review.
- Static analysis trend: direction and severity mix of findings (for example, critical security findings decreasing over time).
- Test reliability: flaky test rate and test stability (if tests are noisy, evidence quality is low).
- Change failure rate (DORA): percentage of changes that result in production failures.
- Mean time to detect (MTTD): how quickly you detect a defect or incident after it is introduced.
- Mutation score: how well tests detect injected faults (a proxy for test sensitivity).
- SLO burn rate: how quickly error budgets are consumed (an early warning that reliability risk is increasing).

**Lagging indicators** (actual outcomes, slower but definitive):

- Escaped defects: defects found in production, ideally severity-weighted.
- Production incidents: count, severity, and user impact of outages or degradations.
- Customer churn attributed to quality: users leaving due to quality or reliability issues.
- External failure cost: the realized cost of production failures (response, remediation, support load, revenue loss, penalties).

Use leading indicators to adjust strategy before problems materialize. Use lagging indicators to validate whether the strategy reduced risk. The following sections detail specific lagging indicators.

**Why most ROI metrics are proxies:**

We cannot directly observe the counterfactual, "what would have happened without these controls (including testing)," so most testing ROI measures are proxies. Instead, we triangulate using (1) leading indicators (coverage of critical controls, detection speed, test reliability, change failure rate), (2) lagging indicators (escaped defects, incidents, customer impact, external failure cost), and (3) trends against a baseline (historical performance or a defined pre-change period). The goal is not perfect attribution, but continuous learning: reallocate investment toward controls that correlate with lower risk exposure and lower failure costs over time.

**Defect containment:**

Measure how well defects are contained before release by comparing defects found pre-release versus post-release. Higher pre-release detection (especially for high severity) generally indicates stronger containment.

- **Pre-release vs post-release ratio**: Track over time and split by severity. Define the boundary explicitly (e.g., "pre-release" = found before production deployment; "post-release" = found in production).
- **Defect escape rate**: Escaped defects / Total defects discovered, where "escaped defects" means defects first detected after release.
- **Time-to-detect vs time-to-fix**: How quickly defects are detected versus how quickly they are mitigated or fixed, tracked separately for pre-release and post-release defects.

**Note:** Targets are context-specific. In some products, teams intentionally learn in production (experiments, canary rollouts, observability-driven discovery). The goal is to reduce high-severity escapes and shorten time-to-detect and time-to-mitigate, not to optimize a single ratio.

**Severity-weighted defect density:**

Not all defects are equal. Weight defects by severity to reflect impact and to avoid gaming the metric by finding many low-impact issues.

- **Severity-weighted defects per unit**: Critical/high/medium/low defects per KLOC, per feature, or per module (choose one unit and keep it stable).
- **Trend over time**: Is severity-weighted density decreasing across releases?
- **Distribution shift**: Are critical and high-severity defects decreasing faster than low-severity defects?

**Cost of quality (CoQ):**

Use the CoQ framework (introduced in the foundation section) to assess whether your quality investment is economically sound. Track all four categories, ideally using allocated cost (time × loaded rate) plus tools and infrastructure.

- **Prevention costs**: Spending to prevent defects from being introduced
  - Training, standards, process improvements
  - Design and architecture reviews
  - Threat modeling, secure design
  - Coding standards and guardrails

- **Appraisal costs**: Spending to detect defects and produce evidence before customers are impacted
  - Testing effort (manual and automated)
  - Test tooling and infrastructure (CI minutes, environments, devices)
  - Code reviews, static analysis (SAST, linters)
  - Quality audits and reviews

- **Internal failure costs**: Spending caused by defects found before release
  - Rework, bug fixing, debugging time
  - Re-testing after fixes
  - Delayed releases and rework overhead

- **External failure costs**: Spending and losses caused by defects found after release
  - Incidents, outages, on-call response
  - Customer support and escalations
  - Lost revenue, churn, credits/refunds
  - Regulatory fines, legal liability
  - Reputational damage (when you can approximate it)

**Key metrics:**
- **Total cost of quality**: Prevention + Appraisal + Internal failure + External failure
- **Shift-left ratio**: (Prevention + Appraisal) / (Internal failure + External failure)
- **External failure ratio**: External failure / Total CoQ
- **Appraisal cost per internal defect (severity-weighted)**: Appraisal cost / Internal defects found, preferably weighted by severity

**Target:** Over time, you want external failure costs (especially high-severity incidents) to trend down. Prevention and appraisal spend should be deliberate and stable relative to delivery volume, and total CoQ should improve relative to outcomes (fewer escapes, lower incident cost), even if some categories temporarily rise during capability building.

**Maturity progression (typical patterns):**
- **Early or maturing quality systems**: External failure costs often dominate. The economic goal is to reallocate investment toward prevention and appraisal to reduce failure costs over time.
- **Mature quality systems**: External failure costs (especially high-severity incidents) trend down. Prevention and appraisal are stable, justified, and continuously tuned, and total CoQ improves relative to delivery volume and outcomes.

**Customer impact:**

Measure real-world impact on users and the business. These metrics reflect quality-in-use, how well the system meets user needs in real-world contexts.

- **Support tickets**: Volume, severity, and time-to-resolution (ideally normalized per customer or per active user). Categorize by quality characteristic to identify recurring quality-in-use issues.
- **Customer churn**: Churn rate attributable to quality issues (when you can classify it). Persistent quality-driven churn indicates degraded quality-in-use.
- **NPS**: Trend in Net Promoter Score. NPS is a coarse but useful signal of experienced quality-in-use.
- **User complaints**: Volume and severity, categorized by issue type and quality characteristic.
- **Feature adoption**: Adoption and sustained usage of key features. Low adoption can indicate usability or functional suitability issues in real usage.
- **Task success rate**: Percentage of users who successfully complete key tasks (quality-in-use effectiveness).
- **Time-on-task**: Time to complete key tasks (quality-in-use efficiency).
- **User error rate**: Frequency of user errors or failed attempts (quality-in-use effectiveness).

**Risk reduction:**

Track whether high-priority risks from Step 2 are being reduced, controlled, or explicitly accepted with evidence. This is where traceability becomes operational: each risk statement from the test basis is linked to indicators in a risk register.

- **High-priority risks addressed**: How many high-priority risks have been reduced, controlled, or formally accepted (with rationale and evidence)?
- **Risk exposure trend**: Is each risk's exposure (likelihood × impact) trending down over time, or staying within the acceptance threshold?
- **New or changed risks**: Are new risks emerging, or are existing risks changing due to architecture, dependencies, scale, or usage?
- **Risk-level indicators**: For each risk statement, track a small set of leading and lagging indicators (e.g., for "Payment module regression", leading: CI gate failures in payment tests; lagging: payment failure rate, transaction success rate).

**How to collect and analyze:**

1. **Maintain a risk register**: For each risk statement, define an owner, acceptance threshold, and the indicators that show whether exposure is changing.
2. **Automate data collection where possible**: Pull defect/incident data, deployment metrics, and customer signals from systems of record to avoid manual reporting drift.
3. **Create dashboards by risk**: Visualize indicator trends over time, grouped by risk and quality characteristic, so reviews stay outcome-focused.
4. **Report on a cadence**: Prepare a short risk-by-risk snapshot before each review (what changed, why, and what decision is required).
5. **Compare to baselines**: Track trends against a baseline period and note context shifts (seasonality, traffic growth, major releases) to avoid false conclusions.

**Common pitfalls:**

- Using indicators that measure activity (test counts) rather than exposure or outcomes.
- No owner or thresholds, so "tracking" never leads to decisions.
- Point-in-time reporting without trends or baselines.
- Ignoring customer impact signals and focusing only on internal metrics.
- Metrics without context (no definition of "good enough" for this product and risk tolerance).

### How to assess efficiency

Efficiency metrics indicate whether resources are being allocated to the highest marginal risk reduction per unit of effort. These metrics focus on cost-effectiveness: are we getting strong evidence and improved outcomes for the resources invested?

**Test effort vs. coverage balance:**

Measure whether the effort invested is proportional to the *evidence produced* (coverage) and the *outcomes observed* (risk indicators and escapes).

- **Effort per risk (by approach)**: Hours (or cost) spent per high-priority risk, broken down by approach (static review/analysis, unit, contract/integration, system/E2E, production guardrails).
- **Cost per defect found**: Total testing cost / number of defects found.
  - **Qualification**: This metric is easy to game (finding many low-value defects). Prefer one of these alternatives:
    - **Cost per high-severity defect found** (severity-weighted).
    - **Cost per unit of exposure reduced**: testing cost / change in aggregate risk exposure for the risks addressed (a proxy; avoid false precision).
    - Track alongside leading indicators (e.g., flaky test rate, change failure rate) to catch "cheap" improvements that degrade reliability.
- **Coverage achieved (evidence proxies)**: Code coverage, risk coverage, requirement coverage (use explicit definitions; coverage is not the same as risk reduction).
- **Target**: Higher-quality evidence with reasonable effort, lower cost per high-severity defect (or per unit of exposure reduced), without degrading delivery speed or test reliability.

**Lead time for change / delivery speed:**

Measure whether testing is creating unproductive delay in delivery, rather than providing timely feedback.

- **Time from code commit to production**: End-to-end delivery time.
- **Deployment frequency**: How often you can deploy to production.
- **Cycle time**: Time from work start to work in production.
- **Interpretation**: Separate *productive* time (feedback that prevents/reduces risk) from *queueing* and *waiting* time (slow environments, flaky gates, long-running suites).
- **Target**: Fast feedback loops and predictable gates; testing should not be the dominant source of waiting time, while high-severity escapes and incident rates remain controlled.

**Redundancy vs. gaps:**

Analyze whether there is appropriate overlap (safety margins) or problematic gaps (uncovered risks).

- **Overlap analysis**: Which risks are covered by multiple testing approaches (types/levels/techniques/practices)? Prefer **diverse redundancy** (low-correlation checks), avoid correlated duplication.
- **Gap analysis**: Which risks have no explicit testing coverage? Use traceability: for each risk in your test basis, ensure at least one testing approach produces evidence against it.
- **Coverage map completeness**: Percentage of prioritised risks with at least one linked source of evidence (and an owner). This demonstrates traceability: all risks in the test basis should have corresponding evidence-producing work.
- **Target**: Zero uncovered high-priority risks; strategic, diverse overlap only where the risk justifies it.

**ROI proxy:**

Estimate the return on testing investment using proxies. We cannot directly observe the counterfactual ("what would have happened without this testing"), so treat these as modeled comparisons, not precise truth.

- **Testing cost vs. modeled avoided cost**: Compare the cost of testing to an estimated range of costs you would likely have incurred from defects/incidents without that evidence (state assumptions, use ranges).
- **Cost if found earlier vs. later**: Compare the cost to detect + fix a defect pre-release vs. the cost to mitigate + fix it post-release (include operational impact and customer impact where relevant).
- **Testing investment vs. incident cost trend**: Compare incident cost, severity, and frequency before and after changes in the testing portfolio (control for major product/traffic changes).
- **Target**: Over time, testing cost should be economically justified by reduced high-severity escapes and reduced incident impact, within your stated assumptions and uncertainty bounds.

**Resource allocation:**

Analyze how testing effort is distributed across different testing approaches, and whether that distribution matches prioritised risks.

- **Distribution across testing types**: Effort split across functional, performance, security, reliability, usability, etc. (mapped to ISO/IEC 25010 quality characteristics).
- **Distribution across test levels**: Effort split across unit, contract/integration, system, acceptance.
- **Static vs. dynamic balance**: Ratio of static (reviews, analysis) to dynamic (execution) evidence.
- **Manual vs. automated ratio**: Portion of effort and runtime spent in manual vs. automated checks.
- **Target**: A distribution that reflects risk exposure (likelihood × impact): high-exposure risks get more and better evidence, low-exposure risks get proportionate coverage.

**How to calculate and interpret:**

1. **Collect effort data**: Track time, tooling, and infrastructure cost by type/level/practice (enough granularity to see where the money and time go).
2. **Attach effort to risks**: For each major risk, link the evidence-producing work that targets it (traceability map: risk -> controls/tests -> evidence).
3. **Compute proxy metrics**: Examples include cost per high-severity defect found, cost per risk exposure point addressed, and time-to-detect/time-to-mitigate for key risks.
4. **Compare to baselines**: Evaluate trends over time (release-over-release or quarter-over-quarter), and normalize for major contextual changes (scope, traffic, architecture shifts).
5. **Identify inefficiencies**: Find areas with high cost and weak outcomes (slow gates, flaky suites, correlated redundancy, coverage gaps).
6. **Rebalance**: Shift investment toward approaches that correlate with reduced high-severity escapes and reduced incident impact, and away from low-signal, high-cost work.

**Common pitfalls:**

- Only looking at cost (ignoring effectiveness and speed).
- Only looking at speed (optimizing lead time by pushing risk into production unnoticed).
- Treating ROI proxies as precise truth (ignoring assumptions and uncertainty).
- "Goodharting" the metric (gaming defect counts, under-reporting incidents, optimizing for "cheap defects").
- Not tracking resource allocation (no visibility into where effort is spent).
- Not acting on the data (continuing low-signal, high-cost work).

### How to conduct a review meeting/workshop

A structured review meeting turns measurement into decisions: what to increase, reduce, add, or remove in the testing portfolio.

**Preparation (before the meeting):**

1. **Collect data**: Pull the latest effectiveness and efficiency metrics, plus the inputs that explain them (risk register, traceability map, defect/incident summaries, and effort/tooling costs).
2. **Prepare analysis**: Summarize trends since the last review, highlight deltas (improved/worse), and identify the top risks and top cost drivers.
3. **Review risks**: Revisit the prioritised risks from Step 2. Confirm what changed (new risks, changed likelihood/impact, lifecycle shifts), and mark any risks that need re-scoring.
4. **Invite stakeholders**: Include the roles needed to decide and act (engineering, product, operations, security as applicable, and test leadership).
5. **Set agenda**: List the decisions you need to make (keep, cut, rebalance, add controls, change gates), and attach the relevant data to each agenda item.

**Meeting structure:**

1. **Review current state** (30 minutes):
   - Effectiveness: Are prioritised risks trending down (or are high-severity escapes increasing)?
   - Efficiency: Are we getting credible evidence at acceptable cost and cycle time?
   - Trends: What improved, what degraded, and what changed since the last review?

2. **Identify issues** (30 minutes):
   - Which prioritised risks are not adequately controlled (gaps in evidence or high-severity escapes)?
   - Which parts of the portfolio have low return (high cost, slow feedback, flaky evidence)?
   - Where are the coverage gaps and where is the redundancy overly correlated?
   - What new or changed risks should be added or re-scored?

3. **Analyze root causes** (30 minutes):
   - Why is evidence weak or late (wrong level, wrong technique, missing oracle, poor data/env)?
   - Why are costs high (slow suites, duplication, manual bottlenecks, unstable environments)?
   - What changed in the system or context (architecture, deps, workload, team, compliance)?

4. **Decide on rebalancing** (30 minutes):
   - What to **increase** (controls/tests that reduce top risks efficiently)?
   - What to **reduce or remove** (low-value, highly correlated, or brittle checks)?
   - What to **add** (missing controls, new testing types, new gates, new telemetry)?
   - What to **reallocate** (people, time, tooling budget) to match current risk exposure?

5. **Document decisions** (15 minutes):
   - Record decisions as portfolio changes (risk -> control -> evidence -> metric).
   - Assign owners and target dates for each change.
   - Set the next review date and define what "success" will look like by then.

**Facilitation tips:**

- Use data to anchor discussion; opinions are allowed only as hypotheses to test.
- Keep the frame: risks -> controls/tests -> evidence -> outcomes (don’t debate tools in isolation).
- Timebox debates; if data is missing, assign an owner to collect it and move on.
- Force decisions: for each issue, choose **increase / reduce / add / stop / accept risk**.
- Capture action items with an owner, a due date, and a success metric.

**Common pitfalls:**

- Meeting without data (turns into "feelings-driven" status updates).
- No decisions (discussion loops without portfolio changes).
- Poor documentation (no one remembers what changed and why).
- No follow-up (decisions don’t get implemented or measured).
- Wrong scope/attendance (too many people, or missing the decision makers).

### How to rebalance

Rebalancing means reallocating effort across the portfolio based on evidence: invest more where controls/tests reduce important risks efficiently, reduce or stop where returns are low, and add new controls/tests when new risks or gaps appear.

**Decision framework:**

1. **Increase** effective controls/tests: evidence shows strong risk reduction per unit cost.
2. **Reduce** low-return controls/tests: weak outcomes, high cost, or misaligned with prioritised risks.
3. **Stop** controls/tests that add little evidence (redundant, highly correlated, or obsolete).
4. **Add** missing controls/tests: new risks, coverage gaps, or failure modes not addressed.
5. **Accept** residual risk explicitly: document rationale, owner, thresholds, and review date.
6. **Reallocate within a budget**: every increase should name what gets reduced or stopped.

**Examples of rebalancing decisions:**

**Example 1: Shift from E2E to unit tests for logic errors**
- **Context**: High-priority risk "Payment calculation error" is covered only by system/E2E tests.
- **Signal**: Defects found late; E2E is slow and brittle.
- **Decision**: Add unit tests for payment logic with explicit boundary/decision coverage.
- **Portfolio change**: Reduce E2E coverage for payment logic; keep a small E2E happy path.
- **Expected outcome**: Faster feedback, lower cost, earlier defect detection.

**Example 2: Increase security investment by adding earlier evidence**
- **Context**: Security vulnerabilities are escaping to production.
- **Signal**: Incidents/escapes indicate current controls are insufficient.
- **Decision**: Add SAST in CI, mandatory security-focused code review, and periodic dynamic security testing.
- **Portfolio change**: Shift effort from late-stage pen testing only to a mix of static + dynamic evidence.
- **Expected outcome**: Fewer escapes, reduced incident frequency and cost.

**Example 3: Reduce manual regression by automating the highest-value checks**
- **Context**: Manual regression takes two weeks per release and blocks delivery.
- **Signal**: High effort; diminishing returns; many checks duplicate automated coverage.
- **Decision**: Automate critical regression scenarios; narrow manual scope to exploratory/high-uncertainty areas.
- **Portfolio change**: Invest in automation; retire low-value manual scripts.
- **Expected outcome**: Faster releases, maintained risk coverage, lower recurring cost.

**Example 4: Add performance evidence for a new high-traffic feature**
- **Context**: A new feature will operate under high load.
- **Signal**: Performance risk is unaddressed in the current portfolio.
- **Decision**: Add load/stress tests and define performance thresholds tied to the risk statement.
- **Portfolio change**: Allocate capacity for performance testing in CI/nightly; add telemetry guardrails for rollout.
- **Expected outcome**: Issues found pre-release, fewer performance regressions in production.

**Example 5: Rebalance static vs. dynamic to improve maintainability**
- **Context**: Technical debt is slowing delivery.
- **Signal**: Rising cycle time and rework; issues discovered late.
- **Decision**: Add static controls (linters, code review focus areas or pair programming sessions, architecture review gates) and track trends.
- **Portfolio change**: Increase prevention/appraisal early; reduce late-stage churn from avoidable issues.
- **Expected outcome**: Earlier detection of maintainability risks, reduced rework, faster delivery over time.

**Rebalancing process:**

1. **Review metrics**: Analyze effectiveness and efficiency metrics against the current risk register and portfolio assumptions.
2. **Identify imbalances**: Find low-return controls/tests, coverage gaps, and high-cost evidence that does not reduce prioritised risks.
3. **Propose changes**: Draft specific portfolio changes (increase, reduce, stop, add, accept), each tied to a risk and a metric signal.
4. **Evaluate impact**: Estimate expected risk reduction and cost/speed impact; name what will be reduced or stopped to fund any increase.
5. **Decide and document**: Make explicit decisions, assign owners, record rationale, and set acceptance thresholds where residual risk remains.
6. **Implement changes**: Update tests/controls, CI gates, rollout guardrails, and documentation/traceability links.
7. **Monitor results**: Track whether metrics and risk signals move as expected; recalibrate assumptions if they do not.

**Common pitfalls:**

- Not rebalancing (keeping the same portfolio even when evidence shows it is not reducing prioritised risks).
- Rebalancing too frequently (changing before signals stabilize, creating noise and churn).
- Ignoring new risks (failing to add controls/tests when the risk landscape changes).
- Only reducing (cutting cost without closing coverage gaps or strengthening evidence for critical risks).
- Not monitoring outcomes (no feedback loop, so the portfolio never learns).

### The feedback loop

Reviews may reveal new risks that were not identified in Step 1, or changes in the risk landscape that require revisiting earlier steps. The four-step process is not linear; it is a continuous cycle.

**How the cycle works:**

1. **Step 1**: Identify & quantify risks -> **Step 2**: Categorize & prioritize -> **Step 3**: Decide controls/tests and evidence -> **Step 4**: Review & rebalance
2. **Step 4 produces signals**: new risks, changed priorities, weak evidence, or poor cost-effectiveness.
3. **Those signals determine where to loop back**:
   - New risks -> **Step 1**
   - Changed priorities / context -> **Step 2**
   - Weak or inefficient evidence / controls -> **Step 3**

**When to restart the cycle:**

- **New risks identified**: Step 4 surfaces new risk statements -> loop back to Step 1.
- **Risk priorities changed**: Business priorities shift, lifecycle stage changes, or context changes -> loop back to Step 2.
- **Portfolio underperforms**: Metrics show poor risk reduction per cost (or unacceptable escapes) -> loop back to Step 3.
- **Major change event**: Architecture change, technology change, regulatory change, or operating-model change -> loop back to Step 1.

**Example cycle:**

1. **Initial cycle**: Identify payment risks -> Prioritize -> Implement controls and evidence (e.g., functional + reliability testing, rollout guardrails) -> Review on the next portfolio cadence (e.g., 3 months).
2. **Review findings**: Payment risks are reduced, but new security risks are identified and performance signals are degrading.
3. **Loop back based on what changed**:
   - New security risks -> **Step 1** (identify & quantify security risks).
   - Performance signals -> **Step 1** (identify & quantify performance risks).
   - Re-prioritize the combined set -> **Step 2** (categorize & prioritize with updated exposure).
   - Rebalance the portfolio -> **Step 3** (add/adjust security and performance controls and the evidence you will collect).
   - Continue monitoring -> **Step 4** (track outcomes and cost-effectiveness).

**Common pitfalls:**

- Treating the process as linear (not looping back when new risks emerge).
- Not recognizing when to loop back (continuing with outdated priorities or controls).
- Looping too frequently (changing the portfolio before you have enough data).
- Not documenting why you looped back (losing the rationale and the learning).

### Output of Step 4

By the end of Step 4, you should have:

- An evaluation of the portfolio’s effectiveness and efficiency (against your risks and acceptance thresholds).
- A clear view of what is working, what is not, and why (using both leading and lagging indicators).
- Rebalancing decisions documented, with owners, timelines, and expected outcomes.
- An updated testing strategy (and broader control/evidence portfolio) reflecting the review findings.
- A record of new risks and changed priorities that require looping back in the process.

**Connection back to Step 1:** Reviews may reveal new risks or changes in the risk landscape. When that happens, loop back to Step 1 to identify and quantify the new risks, so the testing strategy stays aligned with current priorities.