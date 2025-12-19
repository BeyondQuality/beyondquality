## Table of contents

- Step 1 — Identify & quantify risks
- [Step 2 — Categorize & prioritize risks](step2.md)
- [Step 3 — Decide where, how and how much to test](step3.md)
- [Step 4 — Review and rebalance the portfolio](step4.md)
- [Complete testing taxonomy](taxonomy.md)

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