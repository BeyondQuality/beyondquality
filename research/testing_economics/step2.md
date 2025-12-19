## Table of contents

- [Step 1 — Identify & quantify risks](step1.md)
- Step 2 — Categorize & prioritize risks
- [Step 3 — Decide where, how and how much to test](step3.md)
- [Step 4 — Review and rebalance the portfolio](step4.md)
- [Complete testing taxonomy](taxonomy.md)

## Step 2 — Categorize & prioritize risks

With explicit, quantified risks from Step 1, we now categorize them and prioritize them by risk exposure. The SQuaRE quality models provide a useful taxonomy for this: ISO/IEC 25010 defines the product quality model (quality characteristics of the system itself), and related SQuaRE standards define quality-in-use models (user outcomes in context). We use these characteristics as a consistent vocabulary to describe what "good" looks like, and what could go wrong.

For every product, and at every stage of its lifecycle, the importance of these characteristics will vary. In an early prototype, functional suitability and usability may dominate, while maintainability and portability carry less risk. In production, all characteristics matter, especially reliability, security, and performance efficiency.

The purpose of Step 2 is to decide what matters most. We do that by mapping risks to quality characteristics and prioritizing them by risk exposure (likelihood × impact), which clarifies which risks we must reduce most and which can receive less attention.

Risk exposure uses a context-specific, multi-criteria definition of impact, such as financial, safety, legal, operational, or reputational. In commercial SaaS, financial impact often dominates; in safety-critical or regulated contexts, safety and legal impact may be primary.

### Map risks to ISO/IEC 25010 quality characteristics

ISO/IEC 25010 defines eight product quality characteristics:

1. **Functional suitability** — Does the system provide the functions users need, correctly and completely?
2. **Performance efficiency** — Does the system meet performance expectations under stated conditions (time, throughput, resource use)?
3. **Compatibility** (including interoperability) — Can the system operate and exchange information with other systems in its environment?
4. **Usability** — Can intended users achieve their goals effectively, efficiently, and satisfactorily?
5. **Reliability** — Does the system operate consistently, and can it recover when failures occur?
6. **Security** — Does the system protect information and resist threats (confidentiality, integrity, authenticity, accountability)?
7. **Maintainability** — Can the system be analyzed, modified, and tested efficiently as it evolves?
8. **Portability** — Can the system be transferred and adapted to different environments?
Additionally, ISO/IEC 25010 includes a **quality-in-use model**, which describes how well the system enables users to achieve their goals in real usage contexts.

**Product quality vs. quality-in-use:**

In the SQuaRE family, **product quality** describes properties of the software/system (what it does and how well it is built), while **quality-in-use** describes real user outcomes in context (how effectively, efficiently, and satisfactorily users achieve goals, and how risk is experienced in real use).

Good test strategies connect both layers: testing and review activities produce evidence about **product quality**, while **quality-in-use** is validated through real usage signals (telemetry, support data, user research, and feedback). Product-quality evidence should *predict* quality-in-use outcomes, and those predictions should be checked against real-world signals.

**How to measure quality-in-use:**

Quality-in-use focuses on real-world user outcomes, not just system capabilities. When mapping risks to quality-in-use, define how you will *measure* user effectiveness, efficiency, and satisfaction:

- **Task success rate:** Percentage of users who successfully complete key tasks (e.g., checkout completion rate, account creation success rate).
- **Time on task:** Average time users take to complete key tasks (e.g., time to complete a purchase, time to find information).
- **User error rate:** Frequency of user errors or failed attempts (e.g., form validation errors, navigation dead-ends, incorrect data entry).
- **User satisfaction metrics:** NPS, CSAT, user ratings, and qualitative feedback tied to specific journeys.
- **Churn and retention signals:** Changes in churn, retention, cancellations, or downgrade reasons attributed to quality issues.
- **Support ticket taxonomy:** Categorize support tickets by quality characteristic and journey (e.g., "user couldn't complete task" -> quality-in-use signal).

**How to map risks:**

For each explicit risk statement from Step 1, identify which ISO/IEC 25010 quality characteristic(s) would be violated if the risk materializes. A single risk can map to multiple characteristics (and often should, if the impact spans multiple dimensions).

**Mapping heuristics:**
- If the risk is about incorrect behavior or missing functionality -> **Functional suitability**
- If the risk is about response time, throughput, latency, or resource usage -> **Performance efficiency**
- If the risk is about working with other systems/environments, APIs, protocols, or formats -> **Compatibility** (including **Interoperability**)
- If the risk is about user experience, learnability, accessibility, or ease of use -> **Usability**
- If the risk is about stability, availability, resilience, or recovery -> **Reliability**
- If the risk is about confidentiality, integrity, access control, or threat exposure -> **Security**
- If the risk is about changeability, complexity, testability, or technical debt -> **Maintainability**
- If the risk is about deployment targets, runtime environments, or migration/installation -> **Portability**
- If the risk is about real user outcomes (task success, satisfaction, freedom from risk) in context -> **Quality-in-use**

**Examples:**

| Risk Statement | Quality Characteristic(s) |
|----------------|---------------------------|
| "If the system experiences peak load during checkout, then response times may exceed 2 seconds, resulting in customer abandonment and lost revenue" | Performance efficiency |
| "If a regression defect is introduced in the payment module, then transactions may fail silently, resulting in lost revenue and customer trust" | Functional suitability, Reliability |
| "If the third-party API changes its contract without notice, then our integration may fail, resulting in service disruption" | Compatibility/Interoperability, Reliability |
| "If user input is not properly sanitized, then SQL injection attacks may occur, resulting in data breach and regulatory penalties" | Security, Functional suitability |
| "If the codebase becomes too complex, then new features take 3x longer to implement, resulting in delayed releases" | Maintainability |
| "If the UI is not accessible, then users with disabilities cannot complete purchases, resulting in legal compliance issues and lost revenue" | Usability, Quality-in-use |
| "If users cannot successfully complete checkout, then purchase abandonment increases, resulting in lost revenue and poor user experience" | Quality-in-use, Functional suitability |

**Common pitfalls:**
- Forcing a risk into a single quality characteristic when it clearly spans multiple
- Mapping based on the testing type you plan to run, instead of the underlying quality concern
- Missing relevant (but less obvious) quality characteristics
- Ignoring quality-in-use when the risk is really about real-world user outcomes

### Prioritize risks by risk exposure (likelihood × impact)

Once risks are mapped to quality characteristics, prioritize them by **risk exposure = likelihood × impact**. Define **impact** using the criteria that matter in your context (financial, safety, legal, operational, reputational). If multiple criteria matter, combine them with explicit weights that reflect your organization's priorities and risk tolerance.

This reduces arbitrary prioritization by making trade-offs visible (for example, avoiding a focus on rare catastrophes at the expense of frequent, moderate losses, or the opposite).

**Multi-criteria impact:** Impact should reflect your context. In commercial SaaS, financial impact often dominates. In safety-critical domains (aviation, medical devices), safety impact dominates. In regulated industries, legal and regulatory impact may dominate. In platform and reliability contexts, operational and reputational impacts can be non-linear (for example, trust effects after repeated incidents). Choose impact criteria that match your organization's risk tolerance and stakeholder priorities.

**Engineering impact as adjustment:** Treat engineering impact (speed/effort) as an adjustment factor that reflects delivery constraints (or a tie-breaker when exposures are similar), not as the primary driver of risk exposure.

**Risk exposure calculation:**

Calculate risk exposure as **likelihood × impact**, where impact is multi-criteria based on your context:

**Impact scoring (0-10):** Choose the impact criteria relevant to your context:

- **Financial impact** (for commercial contexts): Revenue loss, costs, fines
  - $0-10K: 1-2
  - $10K-50K: 3-4
  - $50K-200K: 5-6
  - $200K-1M: 7-8
  - $1M+: 9-10

- **Safety impact** (for safety-critical contexts): Harm to users, regulatory violations
  - Minor/nuisance: 1-3
  - Moderate injury/incident: 4-6
  - Serious injury/system failure: 7-8
  - Catastrophic/life-threatening: 9-10

- **Legal/Regulatory impact** (for regulated contexts): Fines, compliance violations, legal liability
  - Minor compliance issue: 1-3
  - Moderate violation: 4-6
  - Significant fine/penalty: 7-8
  - Major regulatory action: 9-10

- **Operational impact** (for platform/reliability contexts): Service disruption, trust damage
  - Brief/minor disruption: 1-3
  - Moderate service impact: 4-6
  - Significant outage: 7-8
  - Extended/critical failure: 9-10

- **Reputational impact**: Brand damage, customer trust loss
  - Minor reputation issue: 1-3
  - Moderate brand impact: 4-6
  - Significant reputation damage: 7-8
  - Severe/catastrophic brand damage: 9-10

**Likelihood score** (0-10): Based on probability that the risk will materialize
- **Low probability**: Rarely occurs, requires specific conditions (1-3)
- **Medium probability**: Occurs occasionally, some conditions needed (4-6)
- **High probability**: Likely to occur, common conditions (7-10)
- Use historical data, expert judgment, or scenario analysis to estimate

**Risk exposure = Likelihood × Impact**

In multi-criteria contexts, define **Weighted impact** first, then compute exposure:

- **Weighted impact** = (Financial × w_financial) + (Safety × w_safety) + (Legal × w_legal) + (Operational × w_operational) + (Reputational × w_reputational)
- **Risk exposure** = Likelihood × Weighted impact

**Engineering impact (speed/effort) as adjustment:** Use engineering impact from Step 1 as a separate adjustment factor (or tie-breaker) when exposures are similar. It reflects delivery constraints and is not part of the risk exposure formula.

**Examples:**
- **Commercial SaaS:** Risk exposure = Likelihood × Financial impact (optionally adjusted by engineering impact as a tie-breaker).
- **Safety-critical systems:** Risk exposure = Likelihood × Safety impact, with financial impact treated as secondary in the weighting.

**Scoring is a decision aid, not a measurement of reality:** Avoid false precision. The goal is consistent ranking and a traceable rationale, not "7.2 vs 7.4" debates. Risk exposure helps compare risks, but small score differences are rarely meaningful. Recalibrate your scoring in Step 4 using real outcomes so estimates improve over time.

**Lifecycle adjustment:**

Consider the lifecycle stage when prioritizing risks:
- **Early prototype:** Functional suitability and usability may matter most, while maintainability and portability are often less critical.
- **Production system:** All characteristics become critical, especially reliability, security, and performance efficiency.

**Prioritization example (commercial SaaS context):**

| Risk | Financial Impact | Impact Score | Likelihood | Likelihood Score | Risk Exposure (Likelihood × Impact) | Quality Characteristic |
|------|------------------|-------------|------------|-----------------|-----------------------------------|----------------------|
| Payment module regression | $50K/day | 7 | High (frequent changes) | 8 | 56 | Functional suitability, Reliability |
| Performance degradation | $10K/hour | 9 | Medium (under load) | 5 | 45 | Performance efficiency |
| Security vulnerability | $2M fines + $500K churn | 10 | Low (rare attack) | 2 | 20 | Security |
| Code complexity | $200K contract penalty | 8 | High (ongoing issue) | 9 | 72 | Maintainability |

Note: Risk exposure = likelihood × impact. In this commercial context, financial impact is used. Engineering impact (speed/effort) can be used as an adjustment factor when risk exposures are similar.

**Common pitfalls:**
- Ignoring lifecycle stage (treating prototype risks the same as production risks).
- Giving all risks equal priority without using quantified data.
- Using only financial impact in contexts where other criteria matter (e.g., safety in medical devices, legal in regulated industries).
- Using impact without likelihood (over-prioritizing high-impact, low-probability risks and under-prioritizing likely moderate-impact risks).
- Over-estimating the likelihood of rare events (skewing prioritization toward unlikely scenarios).
- Not choosing impact criteria that match your context (using financial impact when safety or legal impact should be primary).
- Treating engineering impact as part of risk exposure (it is an adjustment factor, not the primary driver).

### Risk acceptance and thresholds

Not all risks can be eliminated, and some may remain high even after investment in controls and testing. In many standards-driven or regulated contexts, you need explicit risk acceptance criteria and documented decisions for any risk you choose to accept.

**Define risk acceptance thresholds:**

Establish thresholds that define when a risk is:
- **Unacceptable:** Must be reduced through additional controls and/or testing (example: risk exposure > 50).
- **Acceptable with controls:** Can proceed if adequate controls are in place and evidence is sufficient (example: risk exposure 20–50).
- **Acceptable:** Low enough to proceed without additional controls (example: risk exposure < 20).

Thresholds should reflect your organization's risk tolerance and context. Safety-critical and regulated systems typically use lower thresholds than commercial SaaS, and may require formal sign-off and documented justification even at moderate exposure.

**Document risk acceptance decisions:**

For any risk that remains above your acceptance threshold after investment in controls and testing:
- **Require explicit sign-off:** A designated owner accepts the risk.
- **Document rationale:** Why is this risk acceptable now, and what controls are in place?
- **Set a review cadence:** When will this risk be re-evaluated?
- **Define triggers:** What conditions force re-assessment (e.g., incident, architectural change, usage growth, new regulation)?

This ensures that "risk-based testing" means deliberate, traceable decisions rather than unmanaged uncertainty.

### Output of Step 2

By the end of Step 2, you should have:
- A prioritised list of risks, each mapped to one or more ISO/IEC 25010 quality characteristics.
- A ranked view of "what matters most" based on risk exposure (likelihood × impact), with impact defined for your context (financial, safety, legal, operational, or reputational).
- An explicit note of lifecycle effects on prioritization (e.g., prototype vs production).
- Risk acceptance thresholds defined.
- Explicit acceptance decisions documented for any risks accepted above the threshold.
- A foundation for selecting testing types that target the highest-priority quality characteristics.

**Connection to Step 3:** With prioritised risks mapped to quality characteristics, you can now select testing types aligned to those characteristics, choose appropriate test levels, balance static and dynamic work, set test design techniques and coverage targets, and choose test practices that deliver evidence efficiently.
