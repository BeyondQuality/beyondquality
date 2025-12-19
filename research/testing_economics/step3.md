## Table of contents

- [Step 1 — Identify & quantify risks](step1.md)
- [Step 2 — Categorize & prioritize risks](step2.md)
- Step 3 — Decide where, how and how much to test
- [Step 4 — Review and rebalance the portfolio](step4.md)
- [Complete testing taxonomy](taxonomy.md)

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