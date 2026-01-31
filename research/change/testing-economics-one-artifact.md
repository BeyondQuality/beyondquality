# Economics of testing

## Testing as a risk-mitigation investment

Testing is an appraisal activity: it produces evidence about risks by exposing defects and failure modes. Testing does not reduce risk on its own. Risk is reduced only when the findings lead to _effective action_: fixes, mitigations, controls, rollback plans, guardrails, and so on.

Like any other engineering activity, testing consumes resources: time, effort, and tools.

In economics, investment is commonly defined as "_any asset obtained at a cost, on the expectation that it will deliver future value greater than its initial cost_".

Testing fits this definition: it is an investment made today to reduce the probability and impact of costly failures tomorrow, thereby optimizing future outcomes.

Because testing is an economic investment, its return cannot be guaranteed. At best, we can estimate expected value: testing reduces the likelihood and impact of costly failures, but those failures may never occur. In that sense, testing is comparable to insurance or preventive healthcare: we spend resources today based on forecasts of risk and cost, to reduce exposure to larger, uncertain losses later.

**The Cost of Quality (CoQ) framework**

The economics of testing can be described using the classic CoQ framework, which categorizes quality-related costs into four types:

1. **Prevention costs**: activities that prevent defects from being introduced
   - Training, standards, process improvements
   - Design reviews, architecture reviews
   - Threat modeling, security design
   - Coding standards, best practices

2. **Appraisal costs**: Activities that detect defects before they reach customers
   - Testing (static and dynamic)
   - Code reviews, inspections
   - Static analysis (SAST, linters)
   - Quality audits, reviews

3. **Internal failure costs**: Costs of defects found before release
   - Rework, bug fixing
   - Debugging time
   - Re-testing after fixes
   - Delayed releases

4. **External failure costs**: Costs of defects found after release
   - Production incidents, outages
   - Customer support, escalations
   - Lost revenue, customer churn
   - Regulatory fines, legal liability
   - Reputational damage

The economic goal is to optimize total cost of quality by investing in prevention and appraisal to reduce expensive internal and external failures. Testing, as an appraisal activity, **is most cost-effective when the evidence it produces leads to actions that avoid external failures**. External failures are often far more costly than pre-release discovery because they combine remediation cost with customer impact, operational disruption, and reputational damage. The size of this multiplier varies widely by domain and defect class, so teams should calibrate it using their own incident data. This framework makes the economic value of testing explicit and legible.

Recognizing that we do need to invest, the next question becomes where to allocate those resources. Budgets are never limitless, and the law of diminishing returns means that simply adding more testing yields progressively smaller risk reduction. Instead, we must treat testing like an investment portfolio: selecting a mix of activities that provides the maximum reduction in risk for the resources available.

To build such a portfolio, we must first identify which risks matter most. The ISO/IEC/IEEE 29119 series (especially the test planning process in ISO/IEC/IEEE 29119-2) supports a risk-based approach where risks and priorities are used to guide what gets tested, when, and how deeply. ISO/IEC 25010 (SQuaRE product quality model) provides a structured set of quality characteristics that can be used as a vocabulary to categorize product-quality risks. Starting from prioritised risks lets us make deliberate, economically sound decisions about what testing to invest in, and how much, so the portfolio matches the organization’s risk tolerance and business priorities. In this document, those quality characteristics are used as *risk categories* to make risk-based decisions explicit, traceable, and reviewable over time.

These risks are best framed as the risk of failing to meet one or more quality characteristics (see Figure 1). ISO/IEC 25010 defines a product quality model and a separate quality-in-use model in the SQuaRE family. Note that ISO/IEC 25010 exists in multiple editions: the 2011 edition presents eight product quality characteristics, while newer editions update the model. If your organization standardizes on a specific edition, align the labels in this document (and Figure 1) to that edition.

Figure 1: Quality Characteristics
![Figure 1, Quality Characteristics](quality_characteristics.png)

Once risks (i.e., specific quality characteristics at risk) are prioritised, we gain clarity on _where_ to invest: which risks we must reduce most, and which can be given less attention. For example, in an early prototype, maintainability and portability may be low-risk, while in a production system they often become critical.

The question of _how_ to invest is more complex. Every testing level, type, and measure (see Figure 2) affects multiple risks at once, and in different ways. Overlap is inevitable: one activity can mitigate several risks, and multiple activities can address the same risk. That overlap is a feature, not a flaw: it creates safety margins. What you must avoid is coverage gaps ("underlap"), where some prioritised risks remain uncovered. Since no investment can eliminate risk entirely, high-criticality risks often justify deliberate redundancy, but only when the checks are diverse and low-correlation (for example, static analysis plus dynamic testing, unit tests plus contract tests, or different oracles). Avoid repeating the same oracle at multiple expensive levels: highly correlated redundancy adds little safety for its cost.

Figure 2: Testing types, activities and measures:
![Figure 2, Testing types, activities and measures](testing_types_activities_measures.png)

**Note**: Some industries are governed by mandatory software safety/quality standards that prescribe required verification/validation activities and evidence. Examples include DO-178C (aviation), ISO 26262 (automotive), and IEC 62304 (medical device software).

**Key terminology:**

- **Defect**: An error, fault, or flaw in a work product (code, design, requirements, or documentation) that may cause a failure. Defects can exist in the system but may not yet be observed.
- **Failure**: The manifestation of a defect when the system does not behave as expected. Failures are observed in operation
- **Risk**: The possibility that a defect will cause a failure, resulting in negative consequences. Risks describe potential future events, not current states.
- **Control**: A measure that prevents, detects, or mitigates a risk (e.g., input validation, access control, rate limiting, canary rollout, rollback automation, feature flags).
- **Appraisal (CoQ)**: Activities whose primary purpose is to *assess* or *evaluate* quality by producing evidence (e.g., testing, reviews, audits). In CoQ language, testing is an appraisal cost.
- **Testing activity (ISO/IEC/IEEE 29119)**: Activities within the ISO 29119 test process that produce test results and work products (plans, conditions, cases, procedures, logs, reports). In this framework, testing activities are a major evidence-producing stream used to support risk decisions.
- **Evidence**: Information produced by testing or other appraisal activities that supports claims about quality or risk reduction.
- **Test basis**: The body of knowledge used as the foundation for test analysis and design (ISO/IEC/IEEE 29119). In this framework, risk statements become part of the test basis.
- **Traceability**: The ability to link testing activities back to specific risks, requirements, or quality characteristics, enabling justification and measurement.

The prioritised list of testing approaches defines the test strategy for the identified and prioritised risks. In most organizations, this portfolio is still assembled largely through expert judgment, making it an investment decision under uncertainty.

As with any investment, allocating resources is not enough. We also need a way to assess whether these choices are delivering economic value. That requires a structured review process that compares expected outcomes with actual results and helps us rebalance the testing portfolio over time.

**A structured approach: the four-step process**

To build and maintain an economically optimal testing portfolio, organizations should follow a systematic four-step process:

1. **Identify & quantify risks** — Gather stakeholder concerns and fears, express them as explicit risk statements, and estimate their impact on engineering effort and business outcomes.
2. **Categorize & prioritize risks** — Map risks to ISO/IEC 25010 quality characteristics and rank them by risk exposure (likelihood * impact), where impact may be financial, safety, legal, operational, or reputational.
3. **Decide where, how and how much to test** — Select testing types, levels, techniques, coverage targets, and practices that produce credible evidence efficiently, balancing static and dynamic activities.
4. **Review and rebalance the portfolio** — Periodically assess risk reduction versus effort, then reallocate investments to maintain economic optimality

This cycle keeps testing investment aligned with business priorities, avoids both under-testing and waste, and adapts as risks and priorities evolve. The following sections detail each step with practical guidance.

## Step 1 — Identify & quantify risks

ISO/IEC/IEEE 29119 supports risk-based testing and includes risk considerations as part of test planning. In practice, risks often begin as unstructured concerns or "fears" from managers, engineers, and other stakeholders. These fears may be emotional, vague, or context-specific, but they still signal real uncertainty about what could go wrong.

See **Key terminology** above for definitions of defect, failure, and risk. In Step 1, capture risks as "what could fail" and "what it would cost," not as a list of suspected defects.

The purpose of Step 1 is to achieve both emotional and economic alignment: we surface fears, convert them into explicit risk statements, and estimate impact, so stakeholders share a clear view of what matters most and why specific testing investments are justified.

### How to identify risks

**Gather fears from stakeholders**

Start by collecting concerns from all relevant stakeholders, then translate them into risk statements in the next step:

- **Managers**: Business impact, delivery timelines, customer satisfaction, regulatory compliance, reputation
- **Engineers**: Technical debt, system complexity, integration risks, performance bottlenecks, security vulnerabilities
- **Product owners**: Feature completeness, user experience, market fit
- **Operations/DevOps**: Deployment risks, infrastructure stability, monitoring gaps
- **Security teams**: Threat vectors, compliance gaps, data protection
- **Support/Customer success**: Common failure patterns, user confusion points

**Methods for gathering fears:**
- **Structured workshops**: Facilitate cross-functional sessions to surface concerns and assumptions
- **One-on-one interviews**: Capture concerns that may not surface in group settings
- **Surveys**: Collect input from distributed teams or larger organizations
- **Retrospectives and postmortems**: Extract recurring failure patterns and lessons from incidents
- **Documentation review**: Review risk registers, incident reports, support data, and quality metrics

**Common pitfalls:**
- Only consulting technical teams (missing business perspective)
- Ignoring "soft" concerns that seem hard to quantify
- Rushing identification to get to "the real work"
- Assuming stakeholders share the same risk vocabulary and priorities

### Convert fears into explicit risk statements

Fears are often vague ("I’m worried about performance"), or emotional ("This feels risky"). To make them actionable, convert each fear into an explicit risk statement using this structure:

**Risk statement template:**
> "If [condition/event], then [negative consequence] may occur, resulting in [impact on quality characteristic/business objective]."

**Examples:**

| Fear | Explicit Risk Statement |
|------|------------------------|
| "I'm worried the system will be slow" | "If the system experiences peak load during checkout, then response times may exceed 2 seconds, resulting in customer abandonment and lost revenue (performance efficiency risk)." |
| "What if we break something in production?" | "If a regression defect is introduced in the payment module, then transactions may fail silently, resulting in lost revenue and customer trust (reliability risk)." |
| "I don't trust this third-party integration" | "If the third-party API changes its contract without notice, then our integration may fail, resulting in service disruption (compatibility/interoperability risk)." |
| "Security keeps me up at night" | "If user input is not properly sanitized, then SQL injection attacks may occur, resulting in data breach and regulatory penalties (security risk)." |

**Guidelines for conversion:**
- Be specific about the trigger condition (when/where it happens).
- State the failure mode or negative consequence clearly.
- Link the consequence to measurable impact (revenue, churn, SLA/SLO breach, incident cost, delivery delay, legal exposure).
- Avoid vague phrasing like "the system may fail". Name what fails, when, and how you’d notice.

**Risk statement quality checklist:**

Before moving to quantification, verify each risk statement meets these criteria:

- **Trigger condition is observable**: Can you detect when the condition occurs? (e.g., "peak load during checkout" is observable via monitoring.)
- **Consequence is measurable**: Can you measure the negative outcome? (e.g., "response times exceed 2 seconds" is measurable.)
- **Impacted quality characteristic(s) named**: Which ISO/IEC 25010 quality characteristic(s) would be violated? (e.g., "performance efficiency risk".)
- **Owner identified**: Who is responsible for monitoring and responding to this risk?
- **Detection signal defined**: What would tell us the risk is materializing? (e.g., "monitoring alerts when response time > 2s", "customer complaints about slow checkout".)
- **Actionability**: If this risk score rises, what decision will we take? (block release, add tests, add guardrails, change rollout, accept risk.)

A risk statement that passes this checklist is ready for quantification and prioritization. If it fails, refine it before proceeding.

**Common pitfalls:**
- Leaving risks as vague fears without explicit statements.
- Failing to identify the trigger condition.
- Not connecting to business or quality impact.
- Creating too many similar risks that should be consolidated.

### Quantify potential impact

Once risks are explicit, quantify their potential impact so you can prioritize and make investment decisions. Different stakeholders can provide different inputs to quantify impact:

**Ask engineers to quantify potential loss of speed/effort:**
- How much development speed would be lost if this risk materializes?
- How many hours or days would be needed to investigate and fix?
- What is the impact on deployment frequency or lead time?
- How does this affect team capacity for new features?

**Examples (using three-point estimation):**
- "If this integration breaks: optimistic 1 day, most likely 2 days, pessimistic 4 days to diagnose and fix, blocking the team."
- "Performance degradation: optimistic 20 hours, most likely 40 hours, pessimistic 80 hours of optimization work, delaying the next release by 1 to 2 weeks."
- "Security vulnerabilities discovered late: optimistic 1 sprint disruption, most likely 2 sprints, pessimistic 4 sprints of emergency patching."

**Ask managers to quantify potential financial impact:**
- What is the potential revenue loss if this risk occurs?
- What are the costs of incident response and remediation?
- What is the impact on customer retention or acquisition?
- What are the regulatory or legal consequences?
- What is the cost of reputational damage?

**Examples (using three-point estimation):**
- "Payment failures: optimistic $20K per day, most likely $50K per day, pessimistic $100K per day in lost revenue until resolved."
- "Data breach: optimistic $1M (fines only), most likely $2.5M (fines + $500K churn), pessimistic $5M (fines + major churn + legal costs)."
- "System downtime during peak hours: optimistic $5K per hour, most likely $10K per hour, pessimistic $20K per hour in lost transactions until resolved."
- "Late delivery due to quality issues: optimistic $100K contract penalty, most likely $200K, pessimistic $500K."

**Quantification methods:**

Use **three-point estimation** (optimistic, most likely, pessimistic) rather than single-point estimates. This makes uncertainty explicit and improves Step 4 learning when you compare estimates with actual outcomes.

- **Historical data**: Use past incidents and near-misses to estimate realistic impact ranges.
- **Expert estimation**: Use domain experts to propose the three-point ranges when data is sparse.
- **Scenario analysis**: Model best-case, most-likely, and worst-case scenarios explicitly.
- **Industry benchmarks**: Use comparable incidents from similar organizations to sanity-check your ranges.
- **Stakeholder interviews**: Ask stakeholders for acceptable loss thresholds and credible worst-case outcomes.

**Using three-point estimates:**
- Record all three values for each risk (optimistic, most likely, pessimistic).
- Use the **most likely** value for the first-pass prioritization.
- Revisit the estimates in Step 4 using actual outcomes, and update the ranges over time.
- If your estimates are consistently wrong (for example, off by ~3x), recalibrate the estimation approach and your reference data.

**Common pitfalls:**
- Stopping at "we don't know" instead of producing a rough range.
- Quantifying only technical impact (and missing business impact).
- Quantifying only business impact (and missing engineering speed/effort impact).
- Using implausible worst-case numbers that distort decisions.
- Ignoring probability (high-impact but low-probability risks may be over-prioritised)

### Output of Step 1

By the end of Step 1, you should have:
- A list of explicit risk statements (not vague fears).
- Impact estimates for each risk as three-point ranges (engineering effort/schedule impact and business impact).
- Documented stakeholder agreement on which risks matter most and why.
- A concrete input for Step 2 prioritization and Step 3 investment decisions.

**Test basis and traceability:** ISO/IEC/IEEE 29119 defines the test basis as the body of knowledge used as the foundation for test analysis and design (for example, requirements, designs, and other relevant artifacts). In this framework, explicit risk statements from Step 1 are treated as a first-class input to the test basis. By doing so, each testing activity can be traced back to specific risks (and, where applicable, requirements and quality characteristics), enabling clear justification for testing investments and clearer evidence that prioritised risks are being addressed.

**Connection to Step 2:** Once risks are identified and quantified, we categorize them by mapping each risk to ISO/IEC 25010 quality characteristics, then prioritize by risk exposure (likelihood × impact). This produces an ordered risk list that drives systematic selection of testing activities in Step 3.

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

## Step 3 — Decide where, how and how much to test

With prioritised risks mapped to quality characteristics from Step 2, we now select the controls that produce credible evidence at minimal cost. The principle is to prefer the lowest-cost test level and the earliest feasible point in the lifecycle that can produce credible evidence.

**The evidence ladder (cost-effectiveness principle):**

For each risk, consider controls in order of cost-effectiveness, from lowest to highest cost:

1. **Prevent via design and standards** (cheapest): Coding standards, architecture patterns, threat modeling, design reviews.
2. **Detect via static review and analysis**: Code reviews, SAST, linters, requirements/design reviews.
3. **Detect via unit and component tests**: Fast, isolated checks; use test doubles where appropriate.
4. **Detect via contract and integration tests**: Interface checks, API contract tests, component integration.
5. **Detect via system and end-to-end tests**: End-to-end scenarios, system integration.
6. **Detect via production guardrails and telemetry** (highest consequence if missed): SLOs/error budgets, alerting, canaries, rollback automation.

Runtime production controls can be cheap to execute, but they address high-consequence uncertainty. They should complement—not replace—earlier evidence.

Select the lowest rung on this ladder that provides credible evidence for the risk. Do not jump to expensive levels when lower-cost levels suffice, but do not rely on low-level evidence for risks that only manifest at higher system scopes.

**Risk controls are broader than tests:**

Economically, many of the highest-return controls are not tests. The optimal portfolio mixes testing (appraisal) with operational risk controls, for example:

- **Progressive delivery**: canary releases, blue/green deployments, fast rollback automation
- **Feature flags and kill switches**: ability to disable features quickly in production
- **Runtime monitoring and alerting**: observability tied to specific risks, anomaly detection
- **Operational controls**: rate limiting, circuit breakers, dependency pinning, sandboxing
- **Security controls**: WAF rules, input validation, access controls
- **Release gates**: SLOs and error budgets used as release criteria

Testing is the appraisal stream that produces evidence these controls exist and work. When selecting controls, choose the lowest-cost combination that still provides credible evidence for the risks you prioritised.

The question of _how_ to invest is multi-dimensional: choose testing types (what quality to target), test levels (where to test), the static vs dynamic balance, test design techniques plus coverage (how to design and how much), and test practices (how to execute). Each type and level can address multiple risks, and multiple techniques or practices may cover the same risk. The result is an explicit mapping: risk -> controls -> evidence, which is the core output of this step.

The prioritised set of approaches defines the testing strategy for the identified and prioritised risks. For a complete taxonomy of testing types, levels, techniques, and practices, see the [Complete Testing Taxonomy](#complete-testing-taxonomy) section.

### Select testing types aligned to quality characteristics

Testing types target specific quality characteristics from ISO/IEC 25010. A testing type defines _what quality is being evaluated_. By mapping your prioritised quality characteristics to corresponding testing types, you ensure that your testing evidence is directed at the risks you have identified.

**Quality characteristic -> Testing type mapping:**

| Quality Characteristic | Primary Testing Types | Additional Testing Types |
|----------------------|----------------------|-------------------------|
| **Functional suitability** | Functional testing | Requirements-based testing, Scenario/use-case testing |
| **Performance efficiency** | Performance testing, Load testing, Stress testing, Capacity testing | Recovery testing (performance aspect) |
| **Compatibility** (including interoperability) | Compatibility testing, Interoperability testing | Cross-browser testing, Portability testing (environment aspect) |
| **Usability** | Usability testing | Accessibility testing, Localization testing |
| **Reliability** | Reliability testing, Chaos testing | Disaster/recovery testing, Recovery testing |
| **Security** | Security testing | Penetration testing, Vulnerability scanning, Threat modeling (static) |
| **Maintainability** | Maintainability testing | Code reviews (static), Architecture reviews (static) |
| **Portability** | Portability testing | Cross-browser testing, Installability testing, Conversion testing |
| **Quality-in-use** | Usability testing, Functional testing (user scenarios) | Procedure testing, Acceptance testing |

**How to select:**

1. For each prioritised quality characteristic from Step 2, identify the corresponding testing types from the mapping above.
2. Remember that one testing type may address multiple quality characteristics (e.g., functional testing supports both functional suitability and quality-in-use).
3. Prioritise testing types based on the priority of the quality characteristics they target.
4. Treat testing types as the "what". You will later decide "where" (test levels) and "how" (static vs dynamic activities, techniques, practices).

**Examples:**

- Risk: "Payment module regression" -> Functional suitability, reliability -> **Functional testing**, **Reliability testing**.
- Risk: "Performance degradation" -> Performance efficiency -> **Performance testing**, **Load testing**, **Stress testing**.
- Risk: "Security vulnerability" -> Security -> **Security testing**, plus supporting controls such as **Threat modeling** and **Penetration testing**.

**Common pitfalls:**
- Selecting testing types based on what is "standard", rather than what addresses your prioritised risks.
- Missing relevant testing types (e.g., omitting accessibility when usability risks are material).
- Treating one testing type as sufficient when multiple qualities are at risk.
- Mixing up type ("what") with level ("where") or tool/practice ("how").

### Choose appropriate test levels

Test levels describe the scope in the system hierarchy and lifecycle where evidence is produced (unit -> integration/contract -> system -> acceptance). The economic principle is to prefer the lowest-cost level where the risk can be detected with credible evidence.

Different levels expose different fault classes. Unit and component testing is best at catching local logic errors and boundary conditions. Integration and contract testing reveals interface mismatches and protocol/contract violations. System testing exposes end-to-end behavior, configuration issues, and cross-cutting concerns. Acceptance and field testing validates suitability for users, operations, and regulations.

Keeping levels distinct speeds feedback where it is cheapest (lower levels), and reserves slower, costlier testing for risks that only appear at higher scopes.

**Test levels:**
- **Unit** — The smallest testable unit (e.g., function, method, class)
- **Component** — A component in isolation (with test doubles for dependencies)
- **Component-integration/Contract** — Interfaces between components (contract and integration at the boundary)
- **System** — The complete system behaving as a whole
- **System-integration** — Integration with external systems (third parties, other services, shared infrastructure)
- **Acceptance (UAT/OAT/FAT)** — Acceptance by users, operations, or customers (including operational and factory acceptance where applicable)
- **Alpha/Beta (Field)** — Real-world usage in controlled or semi-controlled conditions

**How to choose:**

1. For each risk, identify the lowest level where it can be detected with credible evidence.
2. Prefer lower levels (unit, component) for local logic errors, boundary conditions, and component behavior.
3. Use integration/contract levels for interface mismatches, protocol issues, and contract violations.
4. Reserve system and acceptance levels for end-to-end behavior, configuration issues, and user-facing concerns.
5. Consider cost: lower levels are faster and cheaper; higher levels are slower and more expensive.
6. Some risks require coverage at more than one level; when you add redundancy, keep it diverse (different levels and different oracles).

**Examples:**

- **Risk**: "Payment calculation logic error" -> Best detected at the **Unit** level (cheapest, fastest feedback).
- **Risk**: "Third-party API contract mismatch" -> Best detected at the **Component-integration/Contract** level.
- **Risk**: "End-to-end checkout flow failure" -> Requires the **System** level (end-to-end checks).
- **Risk**: "User cannot complete purchase due to UI workflow/usability issues" -> Often requires **System** and/or **Acceptance** level evidence (depending on whether the concern is functional flow vs real user outcomes).

**Common pitfalls:**

- Testing everything at the system/end-to-end level (slow, expensive, brittle).
- Ignoring lower levels where risks can be caught cheaper and faster.
- Testing at the wrong level (e.g., trying to prove an integration works using only unit tests with mocks).
- Overusing mocks at lower levels so tests "pass" while real integrations still fail.
- Forgetting that some risks need evidence at multiple levels (e.g., security needs both code-level controls and system-level behavior).

### Decide static vs dynamic balance

Static and dynamic testing are fundamentally different ways of producing test evidence. Static testing examines artifacts without executing the software; dynamic testing executes the system to observe behavior.

Static testing can start from requirements, designs, code, configuration, or models, so you can act weeks earlier. It is especially effective at catching insecure coding patterns, dependency issues, unreachable states, and missing or inconsistent requirements. Dynamic testing requires a working product, but it is the only way to observe emergent runtime behavior such as integration faults, concurrency/timing issues, performance under load, real security exposures, and UX problems.

The split is economic as well: defects removed through reviews or static analysis are typically cheaper to fix because they are found earlier, before integration and deployment amplify rework and coordination costs.

**When to use static testing:**

- Code quality and security patterns; coding standards (reviews, SAST, linters)
- Architecture/design/protocol/contract/spec issues (design reviews, inspections)
- Missing or inconsistent requirements; unreachable states (requirements reviews, model verification)
- Early lifecycle phases when the product is not executable yet

**When to use dynamic testing:**
- Runtime behavior: integration faults, concurrency issues, timing issues
- Performance under load; real security exposures
- User experience and accessibility in realistic usage
- End-to-end flows and full system behavior

**How to balance:**

1. Start with static testing wherever the risk can be exposed early and cheaply.
2. Add dynamic testing for risks that only appear during execution (performance, integration, UX).
3. Use cost and feedback speed as defaults: prefer earlier, cheaper evidence unless it is not credible for the risk.
4. For critical risks, combine both: static to catch patterns early, dynamic to validate real behavior.

**Examples:**

- **Risk**: "SQL injection vulnerability" -> **Static testing**: Code review, SAST; **Dynamic testing**: Penetration testing, security testing
- **Risk**: "Performance degradation" -> **Static testing**: Architecture review (early); **Dynamic testing**: Performance testing, load testing (required)
- **Risk**: "Missing requirements" -> **Static testing**: Requirements review (early); **Dynamic testing**: Functional testing (verification)

**Common pitfalls:**

- Ignoring static testing entirely (missing early defect removal)
- Only using static testing (missing runtime behavior that only dynamic testing can reveal)
- Using static and dynamic testing for the wrong risks (e.g., relying only on static testing for performance)
- Forgetting that many critical risks benefit from both static and dynamic testing

### Choose test design techniques and coverage

Test design techniques define how you derive test cases and what you aim to cover (your coverage target). Each technique has a clear input (the model/test basis), a repeatable procedure, and a defined coverage criterion.

Techniques are grouped by their primary source of information: specification-based (black-box), structure-based (white-box), and experience-based. For a complete list of techniques and coverage measures, see the [Complete Testing Taxonomy](#complete-testing-taxonomy) section.

**How to choose techniques:**

1. **Specification-based techniques** (black-box): Use when you have requirements, specifications, or user stories.
   - Equivalence partitioning and boundary-value analysis for input validation.
   - Decision tables for complex business rules.
   - State-transition testing for systems with states.
   - Scenario/use-case testing for user flows.
   - Combinatorial testing for parameter combinations.

2. **Structure-based techniques** (white-box): Use when you need evidence about internal structure.
   - Statement, branch, and decision testing for structural coverage.
   - MC/DC testing for safety-critical systems.
   - Data-flow testing for data dependencies.

3. **Experience-based techniques**: Use to complement specification-based and structure-based techniques.
   - Error guessing based on past experience.
   - Exploratory testing (a practice) guided by charters/tours.

**How to choose coverage:**

Coverage measures define the minimum evidence threshold you want for a given risk. Higher-priority risks typically justify higher coverage targets.

- **High-priority risks**: Aim for higher coverage.
  - Structural: branch/decision coverage, MC/DC (when required).
  - Specification/model: comprehensive scenario coverage, state/transition coverage, decision-table rule coverage.

- **Medium-priority risks**: Aim for moderate coverage.
  - Structural: statement coverage plus targeted branches/decisions.
  - Specification/model: key scenarios and main state transitions.

- **Low-priority risks**: Aim for basic coverage.
  - Specification/model: happy path plus a small number of representative negative cases.
  - Structural: minimal structural coverage (if measured at all).

**Coverage is a proxy for thoroughness, not a guarantee of defect absence:** Coverage shows how much of the test basis (or code structure) you exercised, but it does not prove the absence of defects. Treat coverage targets as minimum evidence thresholds, and triangulate them with defect/incident outcomes in Step 4 to validate that the chosen coverage is actually reducing risk.

**Examples:**

- **Risk**: "Payment calculation error" (high priority) -> **Technique**: equivalence partitioning, boundary-value analysis, decision tables; **Coverage**: all equivalence classes, all boundaries, all decision-table rules.
- **Risk**: "UI layout issue" (medium priority) -> **Technique**: scenario testing, error guessing; **Coverage**: key user scenarios across representative viewports/resolutions, plus common layout breakpoints and error paths.
- **Risk**: "Minor feature enhancement" (low priority) -> **Technique**: scenario testing; **Coverage**: happy path plus a small set of representative negative cases.

**Common pitfalls:**
- Using the wrong technique for the risk (for example, structure-based when specification-based is more appropriate).
- Insufficient coverage for high-priority risks.
- Over-coverage for low-priority risks (waste).
- Not defining coverage targets explicitly.
- Ignoring experience-based techniques that can catch issues others miss.

### Choose test practices

Test practices define how testing work is organized and executed: who does it, when it runs (cadence), where it runs (environment), how it is orchestrated, and how evidence and results are recorded and reported. Practices are orthogonal to types, levels, and techniques.

**Key practice decisions:**

1. **Exploratory vs. scripted**
   - **Exploratory**: for discovery, learning, ambiguous or complex scenarios, and investigative security work.
   - **Scripted**: for regression, compliance, repeatable checks, and CI/CD gates.

2. **Manual vs. automated**
   - **Manual**: for exploration, human judgment, one-off scenarios, and cases where automation cost exceeds benefit.
   - **Automated**: for regression, CI/CD, repetitive checks, and cases where automation cost is justified by reuse and frequency.

3. **Delivery cadence**
   - **On-commit / CI gating**: fast feedback, catch issues early.
   - **Nightly / regression**: broader coverage, catch slower or more expensive checks.
   - **Pre-release hardening**: final validation before release.
   - **Production / canary**: validate with gradual rollout and real telemetry.

4. **Orchestration frameworks**
   - **Keyword-driven** (ISO 29119-5): structured, maintainable test automation.
   - **BDD / specification-by-example**: executable specifications for collaboration and shared understanding.
   - **Data-driven**: parameterized tests to scale coverage efficiently.

**How to choose:**

1. Match practices to the risk profile: frequent-change or high-escape risks should get automated CI gates; ambiguous or novel risks benefit from exploratory sessions.
2. Consider economics: automation has upfront cost and ongoing maintenance cost, but can pay off for checks that run often or block expensive failures.
3. Consider feedback speed: use CI gating for fast, cheap checks; schedule slower, higher-scope suites (regression, load) on an appropriate cadence.
4. Fit the team: choose practices the team can execute reliably, and budget for the skills and tooling required to sustain them.

**Examples:**

- **Risk**: "Payment regression" (high priority, frequent) -> **Practice**: scripted automated checks, CI gating, plus a maintained regression suite.
- **Risk**: "Security vulnerability" (high priority, complex) -> **Practice**: periodic exploratory security sessions, supplemented by automated security checks where feasible.
- **Risk**: "Performance degradation" (high priority, load-dependent) -> **Practice**: automated performance tests on a nightly cadence (or per-merge for critical paths).
- **Risk**: "Usability issue" (medium priority, judgment-heavy) -> **Practice**: structured usability sessions (often exploratory), supported by telemetry and support-signal review.

**Common pitfalls:**

- Over-automating low-ROI checks (high maintenance, low signal, or judgment-heavy scenarios)
- Under-automating repetitive, high-frequency checks (slow feedback, high labor cost, inconsistent execution)
- Choosing practices that do not match the risk profile (for example, relying only on scripted checks where exploration is needed)
- Ignoring team skills and capacity (owning a practice you cannot sustain)
- Treating CI/CD as optional and losing fast feedback loops

### Overlap and coverage gaps

Every testing level, type, and measure affects multiple risks at once, and in different ways. Overlap is normal: one activity can mitigate several risks, and multiple activities can address the same risk. That overlap is a feature because it provides safety margins.

What must be avoided is coverage gaps (sometimes called "underlap"), where important risks have no credible evidence stream. Because no investment can guarantee zero risk, high-criticality risks often justify strategic redundancy, but only when the checks are diverse and low-correlation. Redundancy helps most when the evidence is different: static vs dynamic, unit vs contract, different oracles, different techniques. Avoid duplicating the same oracle at multiple expensive levels (for example, the same functional check at unit, integration, and system levels), because highly correlated redundancy adds little safety and wastes resources.

**How to identify coverage gaps:**

1. Review the prioritised risks from Step 2.
2. For each risk, verify that at least one testing approach addresses it (type, level, technique, and practice).
3. Verify that the chosen approach produces credible evidence at the lowest appropriate level.
4. Flag any risk with no corresponding evidence stream as a coverage gap.

**How to manage overlap:**

1. Treat overlap as a safety margin when it is intentional.
2. Use strategic redundancy for high-criticality risks, but only with diverse, low-correlation checks.
3. **Diversity matters**: redundancy buys the most when checks are different:
   - Static vs dynamic (review or analysis + execution test)
   - Different levels (unit + contract, not unit + integration + system for the same oracle)
   - Different oracles (specification-based + structure-based)
   - Different techniques (equivalence partitioning + error guessing)
4. **Avoid correlated redundancy**: do not duplicate the same oracle at multiple expensive levels (for example, the same functional check at unit, integration, and system levels). Highly correlated redundancy adds little safety and wastes resources.
5. Use overlap deliberately: test critical risks at more than one level for confidence, and ensure the evidence sources are genuinely diverse.

**Common pitfalls:**

- Avoiding all overlap and creating coverage gaps.
- Allowing coverage gaps: risks with no supporting testing approach.
- Adding excessive overlap with correlated checks: duplicating the same oracle across multiple levels and paying more without buying safety.
- Treating all overlap as waste and missing that diverse overlap can provide safety margins.
- Failing to ensure diversity: redundancy is only useful when the checks are low-correlation (independent evidence), not copies of the same signal.

### Output of Step 3

By the end of Step 3, you should have:

- A prioritised list of testing approaches (types, levels, techniques, practices) that address your risks.
- A clear understanding of what to test, where to test, how to design tests, and how to execute them.
- A deliberate balance between static and dynamic approaches.
- Explicit coverage targets for each risk.
- Awareness of overlap (safety margins) and avoidance of coverage gaps.
- A complete test basis: risk statements from Step 1, mapped to quality characteristics from Step 2, with testing approaches selected to address each risk.

**Traceability:** Each testing approach should be traceable back to the specific risk(s) it addresses. This traceability enables you to show that your testing strategy covers all prioritised risks, justify investments, and measure whether risks are being reduced. Coverage evidence (from test design techniques) links back to risks, providing objective proof that the test basis is being addressed.

**The portfolio as a mapping:** A testing portfolio is a traceable chain: risk -> risk controls -> evidence -> acceptance decision -> review metrics. This makes the framework operational: each risk has controls (testing and operational), those controls produce evidence, evidence supports acceptance decisions, and review metrics validate whether the portfolio is working.

**Connection to Step 4:** Once the strategy is implemented, we review and rebalance the portfolio to keep reducing the most important risks in a cost-effective way.

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

# Complete Testing Taxonomy

This document aims to provide full taxonomy of testing types, levels, approaches and methods.

## Introduction

Testing is one of the few engineering activities that directly determines whether a company **survives or collapses**.

When testing fails, it's not just bugs that slip through. This failure might incur financial, operational, and reputational damage that will devastate the entire organization.

Consider just a few examples:

- In 2012, a simple regression error in automated trading software caused Knight Capital a $400 million loss in 45 minutes.

- In 2024, an untested update of CrowdStrike software triggered a global outage across millions of Windows systems, wiping out an estimated $10 billion in market value.

- In 2024, insufficient testing of the Boeing MCAS control logic and its integration contributed to cascading safety issues and losses exceeding $60 billion in market capitalization and penalties.

Each of these disasters stemmed from inadequate or misdirected testing, whether from missing test coverage, flawed test design, or a misunderstanding of what "kind" of testing was needed.

Despite testing's existential importance, the discipline itself remains conceptually tangled. Teams often confuse types with levels, approaches with strategies, and techniques with tools. The result is predictable: suboptimal testing strategies that waste resources, duplicate effort, or fail to prevent the most critical risks.

This article aims to untangle that confusion.

It provides a structured map of software testing, explaining how various testing concepts, from unit to chaos, from shift-left to risk-based, fit together.

## Understanding the Foundations: What Do We Mean by "Testing"?

Testing is often described as a technical or procedural activity: running checks, writing test cases, or executing suites. But fundamentally, testing is an economic and risk-management function.

[See the economics of testing section above for the complete framework](#testing-as-a-risk-mitigation-investment)

> **TL;DR:** the process is simple: we identify and prioritize risks -> pick where to test (levels) -> pick what quality to target (types mapped to QCs from ISO/IEC 25010) -> pick how to design tests and how much to cover (techniques + measures) -> choose how we'll work (practices) -> balance static and dynamic work.

Only when we see testing through this economic lens, does it become clear why we need different levels, types, approaches, and strategies: each addresses distinct classes of risks.

**Note**: This article uses the ISO/IEC/IEEE 29119 series (software testing) together with the ISO/IEC 250xx SQuaRE quality models as its backbone. In brief: ISO/IEC/IEEE 29119-1 defines concepts and terminology; ISO/IEC/IEEE 29119-2 defines test processes; ISO/IEC/IEEE 29119-3 covers test documentation; ISO/IEC/IEEE 29119-4 covers test design techniques; and ISO/IEC/IEEE 29119-5 covers keyword-driven testing. Static reviews and work product review processes are covered in ISO/IEC 20246.

## Complete Testing Taxonomy

ISO 29119 organizes testing along several dimensions that you mix‑and‑match when you write a test strategy.

1. Static vs Dynamic
2. Test Levels
3. Test Types
4. Test Design Techniques & Coverage
5. Test Practices
6. Risk-based Strategy

### 1. **Dynamic vs. Static testing**

First, there's a big distinction between dynamic and static testing.

Static testing implies evaluating software without execution, for instance:
- code reviews/inspections (ISO 20246),
- SAST/linters,
- architecture/design/protocol/contract/spec reviews,
- formal/spec/model verification.

"Static" and "dynamic" testing are fundamentally different ways of _producing test evidence_: different when, what, how much, and how costly. Static testing implies examination without executing the software; dynamic testing implies executing the system to _observe behavior_.

Static testing needs only artifacts like requirements, designs, code, configs, or models, so you can act weeks earlier; dynamic testing requires a working product. Static excels at catching insecure coding patterns, dependency issues, unreachable states, and missing requirements, while dynamic is the only way to see emergent behavior, such as runtime integration faults, concurrency/timing issues, performance under load, real security exposures, and UX problems, etc.

The split is economic as well. Defects removed in reviews or static analysis are typically far cheaper than those found after assembly or deployment.

Also, in many regulated or safety-critical contexts, compliance often mandates specific static activities (coding-rule conformance, threat modeling, formal reviews) in addition to dynamic tests.

All testing activities which imply executing the system fall into dynamic testing category.

### 2. Test levels (where in the lifecycle?)￼

Test level categorises where tests are written in the system hierarchy/lifecycle (unit -> integration -> system -> acceptance).

Different levels expose different fault classes: unit/component work is best at catching local logic errors and boundary conditions; integration/contract work reveals interface and protocol mismatches; system testing exposes end-to-end behavior, configuration, and cross-cutting concerns; acceptance/field testing validates suitability for users, operations, and regulations. Keeping these levels distinct speeds feedback where it's cheapest (lower levels) and reserves slower, costlier runs for risks that only appear at higher scopes.

The separation also improves fault localization and containment (failures found at a defined level are easier to trace and prevent from "escaping" upward), supports budgeting and scheduling (you can invest more in fast, cheap levels and right-size expensive ones), clarifies ownership and handoffs (devs generally own unit/contract, cross-team groups own system/system-integration, product/ops/customers own acceptance), and dictates the right environments and test doubles (mocks/stubs at unit, real contracts/fixtures at integration, production-like data/topology at system and acceptance). It also enables parallelization and CI gates (explicit entry/exit criteria per level), makes coverage and traceability interpretable (map each requirement/risk to the lowest effective level and choose techniques accordingly), satisfies compliance obligations that demand evidence at specific levels (e.g., FAT/SAT/OAT, UAT sign-off), and reinforces risk-based selection so teams don't try to catch everything with slow, brittle end-to-end tests.

Typical test levels:
- [unit](https://qase.io/blog/unit-testing/)
- [component](https://qase.io/blog/component-testing-a-complete-guide/)
- [component-integration](https://qase.io/blog/integration-testing/)/contract
- system
- [system-integration](https://qase.io/blog/system-integration-testing-sit/)
- [acceptance](https://qase.io/blog/acceptance-testing/) ([UAT](https://qase.io/blog/user-acceptance-testing-uat/)/OAT/FAT)
- [alpha/beta](https://qase.io/blog/alpha-testing-vs-beta-testing/) (field)

Additionally to test levels defined in ISO, there're two popular industry extensions:
- [End-to-end](https://qase.io/blog/end-to-end-testing/) testing is most often done at the system level
- [api testing](https://qase.io/blog/a-comprehensive-guide-to-api-testing-best-practices-tools-challenges-and-more/) is most often done treating the whole API as a separate level spanning component and system levels.

### 3. Testing types (what are we testing for, which quality characteristic?)

A testing type answers _what quality are we testing for_? It targets a quality characteristic from ISO/IEC 25010 (e.g., performance efficiency, security, usability, reliability). Many types can be exercised at multiple levels (unit, integration, system, acceptance) and with different techniques (spec-based, structure-based, experience-based), and via static or dynamic activities.

ISO treats testing types as a first-class category to keep _the what_ separate from _the where_ and _the how_: 
- testing type = _the what_ — quality goal
- testing level = _the where_ — unit/integration/system/acceptance, etc.
- testing techniques/practices = _the how_

That separation prevents traps like "performance = only E2E" or "security = pen-test only", makes risks explicit and comparable (types map cleanly to risk classes such as data breach, SLO breach, operability, accessibility), and lets you prioritize without arguing about tools or environments.

**Quality characteristics (ISO/IEC 25010)**: ISO/IEC 25010 defines eight product quality characteristics (functional suitability, performance efficiency, compatibility including interoperability, usability, reliability, security, maintainability, portability) plus a quality-in-use model in the SQuaRE family.

**Testing types**:

- [Functional testing](https://qase.io/blog/functional-testing/)
- Accessibility testing
- Compatibility testing
- Conversion testing
- Disaster/ recovery testing
- Installability testing
- Interoperability testing
- Localization testing
- Maintainability testing
- Performance-related testing
	- [Performance testing](https://qase.io/blog/performance-testing/)
	- Load
	- [Stress testing](https://qase.io/blog/stress-testing-software/)
	- Capacity
	- Recovery
- Portability testing (and [cross-browser testing](https://qase.io/blog/cross-browser-testing/))
- Procedure testing
- Reliability testing (and [chaos testing](https://qase.io/blog/chaos-testing/))
- Security testing
- Usability testing

### 4. Test design techniques & measures (how to design the cases, how to measure coverage?)

A test design technique states how you _derive tests_ and _how much you aim to cover_.

Each technique has a clear input (the model/test basis), a repeatable procedure, and a coverage definition, and leaves _how you work_ (e.g., exploratory/model-based as practices) to other parts of the series. 

The techniques are grouped by their primary source of information: specification-based, structure-based, and experience-based.

**Specification-based ([black-box](https://qase.io/blog/black-box-vs-white-box-testing/))**:
- equivalence partitioning
- boundary-value analysis
- classification-tree method
- decision tables
- cause-effect graphing
- state-transition
- syntax testing
- combinatorial
	- all-combinations
	- pairwise
	- each-choice
	- base-choice
- scenario/use-case testing ([happy path testing](https://qase.io/blog/happy-path-testing/) falls in this category)
- random testing / [monkey testing](https://qase.io/blog/monkey-testing/)
- metamorphic testing
- requirements-based testing

**Structure-based (white-box)**:
- statement testing
- branch/decision testing
- MC/DC testing
- data-flow testing
	- all-defs testing
	- all-uses testing
	- all-DU-paths testing

**Experience-based**:
- error guessing (plus charters/tours under exploratory practice)

**Coverage measures (examples)**:
- Partition/Boundary coverage
- Decision-table rule coverage
- State/Transition coverage
- Pairwise/Combinatorial coverage
- Statement/Branch/Decision/MC-DC
- All-Defs/All-Uses/All-DU-Paths.

### 5. Test practices (how you work)

Practices are ways of organizing/executing testing (orthogonal to types/levels/techniques). Examples: exploratory vs scripted, model-based testing, manual vs automated, continuous testing/CI gating, back-to-back, A/B/experimentation, fuzz testing, keyword-driven testing (29119-5).

While test technique defines _how test cases are derived and what coverage means_; a test practice defines _how the work is organized and executed_, answering the questions like _who does testing_, _with what cadence_, _in which environment_, _using what orchestration_, _and how evidence is captured_.

Practices are structured as choices you can compose with any type, level, or technique.

Testing practices cover:
- **[exploratory](https://qase.io/blog/exploratory-testing/) vs scripted** for the style of design and execution
- **model-based testing; property-based and fuzz-style generation** for the role of models and generators_
- **manual, semi-automated, fully automated** for the degree of automation_
- **keyword-driven per ISO 29119-5; data-driven; BDD/specification-by-example** for the orchestration frameworks
- **on-commit/CI gating, nightly/[regression](https://qase.io/blog/regression-testing/), pre-release hardening, production-like or production with [canary](https://qase.io/blog/canary-testing/)/blue-green and A/B experimentation** for the delivery cadence and place

Keeping practices separate lets you, for example, run exploratory security sessions (experience-based techniques) this afternoon, automate model-based functional checks (spec-based techniques with state/transition coverage) in CI, and protect a release with canary guardrails (a practice at system/field scope), all without changing how you measure sufficiency for each technique. That composability is the point: pick _the what_ (testing type), _the where_ (testing level), _the how much_/_the how_ (technique + coverage), and then choose _the way of working_ (practice) that delivers the evidence efficiently.

Additionally to the practices defined in ISO standards, our industry has a few well-established "extensions":

- [Smoke testing](https://qase.io/blog/smoke-testing/) — a fast, breadth-first gate that answers "is this build even testable?"
- [Sanity testing](https://qase.io/blog/sanity-testing/) a narrow, change-focused confidence check after a fix or small update
- [regression suites](https://qase.io/blog/regression-suites/) are a practice/asset and selection strategy at the same time. They're the maintained set that guards against re-introducing defects
- [bug bash](https://qase.io/blog/bug-bash/) is a practice (an event format rather) that typically uses exploratory techniques at the system or field-like scope
- [ad-hoc testing](https://qase.io/blog/ad-hoc-testing/) is a practice "label" for unstructured testing
- [gray box testing](https://qase.io/blog/gray-box-testing/) — an approach/practice describing knowledge of internals (between black-box and white-box)


### 6. Risk‑based test strategy (how you decide what to do)

A test strategy is simple in principle: start from risk, then choose the minimum set of activities that gives credible evidence that those risks are under control. In practice that means naming the risk, mapping it to an ISO/IEC 25010 quality characteristic (the type—_the what_), selecting the lowest effective level(s) where it can be detected or prevented (_the where_), and then picking test design techniques with explicit coverage targets (_the how much_/_how_). Only after that do you choose practices — exploratory or scripted, model-based or not, manual or automated, CI gating or canary — so the work is delivered efficiently. Balance static activities (reviews, analysis, models) with dynamic execution, and set measurable acceptance targets (SLOs, WCAG conformance, CVSS thresholds, availability/error budgets) so "done" is objective. 29119-2 embeds this selection into the process: define the test basis and risks, build or choose models, select techniques and coverage, plan environments and data, execute, and loop on the results.

## Resources

- [ISO/IEC/IEEE 29119-1:2022 Software and systems engineering — Software testing](https://www.iso.org/standard/81291.html)
- [ISO/IEC 25019:2023 Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — Quality-in-use model](https://www.iso.org/standard/78177.html)
- [Investments](https://www.financestrategists.com/wealth-management/investments/)
