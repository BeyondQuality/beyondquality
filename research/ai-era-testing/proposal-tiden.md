# Direction 3: Preserving Human Intent with Tiden

Discussion: https://github.com/BeyondQuality/beyondquality/discussions/28

**About this evaluation:** Vitaly Sharovatov, a contributor to this research, works at Qase as a developer advocate. Discussions within this research helped inform Qase's development of Tiden.

This proposal sets out an open evaluation of whether Tiden delivers on its promise to preserve human intent and verify agent-generated changes. We plan to publish evaluation methods, benchmarks, and results as the work progresses, including negative and inconclusive findings. Where feasible, experiment code will also be released as open source. We invite criticism, collaboration, and application of the evaluation framework to other products addressing the same problems.

---

## Context

The [analysis](analysis.md) identifies two debts that accumulate when implementation is delegated to coding agents: comprehension debt, the loss of the "how", and intent debt, the loss of the "why". Intent includes the business problem, the reasons for decisions, and the tradeoffs people consciously accepted. Losing it leaves a team unable to judge whether behaviour should remain, change, or disappear, even when the implementation still works.

The [research question](analysis-research-question.md) asks whether a configuration of people, process, tools, and AI agents can preserve intent during construction, keep comprehension sufficient for supervision, intervention, and evolution, and produce records of human decisions that stay coherent through maintenance, extension, and team turnover.

The [collaborative-building proposal](proposal.md) investigates a configuration in which product, engineering, and QA judgment participate in small construction decisions while an agent implements. Staffing is both a recurring objection and an open question in that proposal:

- One QA engineer supporting five developers cannot attend five concurrent building sessions.
- Product expertise and decision authority may also be shared across workstreams.

The proposal's possible economic benefits do not remove the organisational change needed to make that participation available.

This motivates investigating another possible answer to the research question: individual engineers work with coding agents, while automation captures and supplies shared intent, checks the generated code, and directs corrective work. Engineers consult product and QA colleagues when needed. The question is whether this arrangement can meet the research conditions with lower staffing and coordination demands, and fewer changes to existing development processes, than collaborative building.

[Tiden](https://tiden.ai/) provides a concrete candidate for this configuration, combining shared specs and decision records with automatic context supply, capture, verification, and corrective feedback. People can consult the same specs directly.

This is a separate proposal with its own mechanism, operating assumptions, economics, and evaluation. Separate developer sessions with shared product and QA availability provide the first experimental setting.

## Scope

The [research question](analysis-research-question.md) requires a solution to preserve intent during construction, maintain sufficient comprehension, produce human-authored anchors, and keep those anchors coherent through change and turnover.

This proposal investigates how adding Tiden to the development workflow addresses three of those conditions:

- **Intent during construction:** Tiden supplies the agent with expressed objectives and relevant earlier decisions before implementation. Its automatic appraisal directs correction when the generated code does not meet the recorded requirements.
- **Human-authored anchors:** Tiden's records preserve people's decisions, stated reasons, and accepted tradeoffs. They show which statements came from people and which were the agent's own conclusions.
- **Lifecycle coherence:** Tiden carries corrections and authorised revisions into the guidance supplied to later agent sessions and available to newcomers.

**The comprehension condition remains open in a workflow using Tiden and coding agents.** Automated checks provide evidence about implementation behaviour. Whether people using this workflow need to retain the ability to supervise, diagnose, or evolve the implementation manually remains a research question. Evaluation should establish whether any tasks require human code understanding or manual inspection, and why. A workflow requiring neither remains a possible successful outcome.

The hypothesis concerns intent that people have actually stated and how it guides later work. Code alone cannot reliably recover reasons that have been lost. People can investigate and decide what the product should do now, but that new decision does not tell us why it was originally built that way.

---

## 1. The core hypothesis

The hypothesis: Tiden can reduce the accumulation and consequences of intent debt by automatically capturing and reusing explicitly expressed human intent, supplying relevant intent to coding agents during construction, and automatically checking their work against it and directing correction.

The hypothesis predicts four effects from adding Tiden to the workflow:

- **Earlier decisions constrain new construction.** A feature request rarely repeats every existing obligation. An agent can implement the requested feature successfully while breaking another requirement. Supplying relevant specs before implementation gives it both the new objective and the existing behaviour it must preserve.
- **Drift from intent triggers corrective work.** Automatic appraisal compares the agent's work with the recorded requirements. An inconsistency or missing verification sends the agent back to investigate, correct, and check its work.
- **Reasoning remains usable across sessions.** A later developer can find both the refund approval rule and why the team introduced it. They can use that reasoning when changing the feature, even if the people who made the original decision are unavailable.
- **People and agents share access to intent.** Team members can consult the captured specs when they need to recall a decision. Their agents receive relevant specs during construction, without each developer having to remember, find, and manually repeat every applicable requirement. This could make collaboration across separate sessions easier.

For these effects to occur, the captured intent must accurately represent what people wanted and reach the agents working on affected features. Checks must assess that intent, and the agent must respond to inconsistencies. These are the parts of Tiden's workflow whose effectiveness the evaluation would examine.

The economic hypothesis is lower total delivery cost through fewer incorrect attempts, less manual appraisal, and less manual testing. Section 4 develops these mechanisms and the costs that could offset them.

---

## 2. The operating model

### Who does what

| Participant | Responsibility |
|---|---|
| People with product or domain authority | State objectives, constraints, reasons, and accepted tradeoffs; answer business questions when consulted by the person running the agent; authorise policy changes. |
| People providing engineering and QA judgment | Supply technical constraints and risk knowledge; help the person running the agent resolve engineering or quality questions when consulted. |
| Coding agent | Implements changes, writes or updates executable tests, runs tools, responds to verification feedback, asks the person running it for clarification when unsure, and captures session decisions and outcomes. |
| Tiden | Stores shared specs and decisions, automatically supplies relevant context, checks work against the specs, directs corrective work, and keeps the records and verification evidence. |
| Test runners and reporting integrations | Execute checks and deliver results for the relevant implementation and environment. |

These are responsibilities rather than required job titles or a prescribed headcount. In the first experimental setting, developers work in separate sessions and share access to product and QA expertise. An engineer or QA specialist may also hold business context and decision authority. The experiment should measure which actions require a person and how much time those actions take.

### Before implementation

An engineer asks their coding agent to build a feature and explains what they want and why. Tiden captures that intent and supplies the agent with relevant existing specs, decisions, affected behaviour, and coverage information before implementation. The agent starts with both the requested change and requirements the product must continue to satisfy.

Tiden's specs describe product behaviour and carry sources and history. Decision records can retain stated reasons, rejected alternatives, and whether a statement came from a human or an agent. A rule tells the agent what must happen; its reason helps people decide how to apply or revise the rule when a new situation arises. [Specs documentation](https://docs.tiden.ai/docs/product/specs).

For an established product, Tiden can import existing requirements or draft them from the code. Team members can review the inferred requirements in Tiden and correct them where necessary. Human confirmation or correction establishes whether the described behaviour is what the product should do. People can also supply the reasons for it; code alone cannot establish an unrecorded business rationale.

### During construction

The agent implements the change using the supplied intent, writes or updates executable tests, and runs verification. Tiden checks the work against the specs and connects requirements to the checks and their results.

Verification feedback returns to the agent within the workflow. The agent investigates failures, corrects the implementation, and reruns the checks. People do not have to relay each failure manually.

When the agent is unsure, it asks the person running it for clarification. That person answers, consulting a product owner, domain expert, or QA specialist if needed, as developers did before AI-assisted development. If the answer clarifies requirements or intent, it becomes part of the spec and guides later sessions.

### Closing the session and starting the next

Capture turns the session's objectives, decisions, corrections, and outcomes into updates to the product record. Tiden stores them and supplies relevant current context to the next session. [Intent capture](https://docs.tiden.ai/docs/how-to/configure-agents#set-up-intent-capture).

Verification also carries across sessions. **If verification was left incomplete in the previous session, Tiden prevents the agent from proceeding with further development until that verification is completed.** An unfinished check cannot simply be left behind when a new session starts.

People supply or revise the business decisions; agents can draft their representation. A correction to a spec or clarification during a session should become guidance for subsequent work.

The cycle is therefore:

**Human intent → relevant specs supplied to the agent → implementation and automatic verification → agent correction or a new human decision → updated context for subsequent work.**

---

## 3. From preserved intent to prevention and better appraisal

### Earlier intent shapes new construction

Consider a hypothetical online shop whose product owner decides:

> Refunds above $500 require manager approval. We accept slower processing of large refunds because we want to limit refund abuse.

The approval rule comes from the [research question's example](analysis-research-question.md). The rationale and subsequent events here are illustrative.

Later, a developer asks an agent to add bulk refunds. The request does not repeat the approval rule. A batch containing a $100 refund and a $1,000 refund should still leave the larger refund awaiting approval. If the agent receives the earlier spec before deciding how bulk processing works, it can build the new feature around that requirement. Otherwise, it could satisfy the new request by processing the batch while accidentally bypassing an existing control.

The reason also matters. A developer considering whether several smaller refunds could bypass approval can consult the recorded concern about abuse and discuss the question with the product owner. If they decide an additional rule is needed, the developer gives the decision and its reasoning to the agent. Tiden captures them in the spec for later sessions.

This is prevention: accumulated intent shapes construction before incompatible behaviour is implemented. Relevant context must include requirements from other affected features, not only the new bulk-processing request.

### Verification returns incompatible work for correction

Tiden supplies the same intent to guide verification: the small refund should proceed, and the larger refund should await approval. If a test shows that the generated code processes both without approval, the failure returns the agent to the implementation to investigate and correct it.

Tiden relates specs, implementation references, test cases, and execution results. The coding agent writes or updates the necessary tests, test runners execute them, and reporting integrations provide results. Tiden uses these relationships and results in its appraisal and feedback to the agent. [Tests documentation](https://docs.tiden.ai/docs/product/tests), [reporting integrations](https://docs.tiden.ai/docs/integrations/overview#test-reporters).

For example, a stored case saying "check that a $1,000 refund awaits approval" describes the expected outcome. The executable test submits the refund in a test scenario and checks that outcome; its reported result shows whether the check passed on the implementation tested. After a relevant implementation change, the agent needs to run the check again. Execution and reporting happen within the automatic workflow.

In the refund example, testing only small refunds leaves the approval rule unchecked. A test that expects automatic payment of a $1,000 refund contains the wrong expectation. Linking that test to the approval spec would not change what it checks: it would still accept a refund that should await approval. The spec supplies the expected outcome for assessing both the implementation and the test.

Tiden's gates combine coverage, results, freshness, component risk, and production issues where available. Missing verification or an inconsistency becomes further work for the agent. Evaluation needs to establish which evidence satisfies the verification requirement and how reliably the feedback produces a correct result. [Quality gates](https://docs.tiden.ai/docs/product/quality-gates), [session workflow](https://tiden.ai/).

**Tiden combines prevention and appraisal.** Supplying intent before implementation supports prevention; checking the result against it and directing correction performs appraisal. An agent can still misunderstand a rule in both code and tests, so the benefit needs to be measured through independently checked outcomes, including system-level behaviour.

### Interrupting the generative ratification loop

The [lifecycle analysis](analysis-lifecycle.md) describes a chain in which agents generate new artifacts from preceding ones and carry their errors forward:

**Wrong AI-generated code → tests generated from that code accept the wrong behaviour → documentation generated from the code and tests presents it as intended → a new session treats those artifacts as authoritative.**

For example, an agent working without Tiden might implement bulk refunds that pay large refunds without approval. Tests generated from that implementation could assert that those refunds should be paid automatically. Documentation generated from the code and tests could describe bypassing approval as the bulk feature's intended behaviour. An agent in a new session could then treat those tests and documentation as authoritative when extending the feature. None of those steps consults the original human decision requiring approval.

Tiden's mechanism supplies a reference outside that chain: the captured human requirement that refunds above $500 need approval, together with its stated reason. That spec guides construction and supplies the expected outcome for appraisal. If the code pays the larger refund automatically, the difference should cause correction against the spec.

This connects directly to the [original proposal's artifact mechanism](proposal.md#from-tests-to-all-lifecycle-artifacts). The source of the reasoning matters: an agent can draft a spec from a human decision, and people can review and correct a spec initially inferred from code. The resulting human-confirmed intent can then guide other artifacts.

For that reference to work across successive changes, it must remain usable when the product record is updated. Suppose the implementation accidentally raises the approval threshold to $5,000 while the human decision remains at $500. A spec derived from the changed code could accurately describe the $5,000 behaviour. If the next session treats that description as the intended policy, the error guides further work even though the original decision remains in history.

The unchanged $500 decision must therefore continue to guide appraisal and correction until an authorised decision revises it. The [evaluation plan](tiden-evaluation.md#unit-and-time-horizon) tests this distinction in a hypothetical trial where code, tests, and documentation repeat the same mistake.

### Corrections and revised decisions change future work

People can correct a captured spec when it does not represent what they meant, or revise it when the business policy changes. Tiden and the coding agent carry those changes into the record used for later work.

For example, if the product owner changes the refund approval policy after reviewing its business consequences, the new decision and its stated reasons should guide subsequent implementation and checks. Tiden keeps a change history for each spec, so the earlier policy remains available in that history.

A newcomer can also use the existing reasoning before proposing a change. Someone asked to make refunds faster can consult the recorded concern about abuse and the team's accepted processing delay. That gives them a basis for deciding whether to improve processing within the policy or ask the product owner to reconsider the policy itself.

---

## 4. The economics argument

The research began with a capacity problem: agent-generated code can arrive faster than people can inspect and test it. The proposed savings come from reducing AI usage wasted on incorrect work and the human effort needed to establish confidence in a change.

### Fewer incorrect attempts and lower token consumption

Relevant specs give the agent the new objective together with existing requirements the change must preserve. In a product with many interacting features, this could reduce the chance of implementing a locally correct change that breaks another part of the application.

An agent that produces the required behaviour on the first attempt avoids some of the tokens spent reconstructing context, investigating mistakes, and rewriting code.

Token savings must be measured across the complete workflow, including context preparation, appraisal, test generation, and correction. Fewer implementation attempts establish a saving only if the total usage falls. The magnitude of the proposed saving requires evidence.

### Less manual appraisal against intent

Without automatic appraisal, a person may need to inspect the completed bulk-refund feature, recall the approval policy, and discover that the agent bypassed it. Tiden supplies that policy before construction and automatically checks the work against the recorded requirements afterward. Inconsistencies return to the agent for correction.

The proposed saving is the human time otherwise spent establishing whether the right behaviour was built, finding disagreements with existing requirements, and repeatedly directing repairs. The staffing implication follows: a product owner can record the refund policy once, and developers and their agents working on affected features can use it. A new policy question still needs an answer, but every implementation does not require the policy to be explained and checked manually again.

### Less manual testing of implementation behaviour

The coding agent can write or update executable tests, run them, and respond to results supplied through Tiden's integrations. This could reduce the manual execution and repeated testing needed to check the implementation, including regression checks after a correction.

Any human code understanding or manual inspection needed for diagnosis or further development would also be recorded, with its purpose and cost.

Together, automatic prevention and appraisal move verification into the same working process as code generation. The capacity question is whether the complete workflow can deliver correctly verified changes at the required pace. Faster generation alone is insufficient; the comparison must include completed verification and any necessary correction.

### Measuring the complete cost

An economic evaluation would compare successive changes to the same product with and without Tiden. The comparison would retain the team's existing specifications, decision records, conversations, tests, and ways of finding and supplying product context.

Total cost would include all model and tool costs, together with time spent on human actions that actually occur: stating or changing intent, answering a new business question, correcting a spec, manually checking behaviour, or investigating a problem the automatic workflow has not resolved. Tiden's storage, capture, and automatic updates are part of the tool workflow; they should not be counted as routine manual record maintenance.

The [Cost of Quality framework](evaluation.md#the-economic-argument-coq-and-direction-12) connects prevention and appraisal costs to avoided rework and failures. Relevant measures would include token usage, human time, elapsed delivery time, setup, corrections, and defects that escape verification. Any wait for a human decision would be recorded with the question and the actual delay.

---

## 5. Evaluation

An evaluation should establish whether intent survives and guides subsequent work, whether automatic feedback corrects code that does not meet that intent, and whether the benefits justify the complete operating cost. Whether any manual code understanding or inspection is needed also remains to be investigated.

The initial comparison would use the same development arrangement with and without Tiden. Both conditions would receive equivalent human objectives and decisions, retain their existing documentation and tests, and have comparable access to product and QA expertise. The comparison would include total token and tool costs, human effort, and delivery time.

This would estimate the contribution of adding Tiden to the tested workflow. Establishing lower staffing and coordination costs than collaborative building would require a separate comparison that measures those costs in both arrangements.

Better intent preservation and use would support the mechanism; equivalent outcomes at lower effort would support an economic benefit. Lost or invented reasons, ineffective corrections, or benefits that disappear during maintenance and handover would weaken the hypothesis. The [Tiden evaluation plan](tiden-evaluation.md) develops the measurements, controls, trial scenarios, and experimental questions.

---

## 6. Open research questions

- **How much verification and correction can the automatic workflow complete reliably?** Which failures can agents resolve, which require a human decision or other help, and how much manual appraisal remains necessary?
- **Is human implementation comprehension necessary?** Do any tasks require people to understand or inspect the code to supervise, diagnose, or evolve the system? If so, what understanding is needed and how is it maintained?
- **Does intent remain coherent through sustained change and turnover?** Do reasons remain useful alongside rules, do corrections and authorised revisions reach all affected sessions, and can newcomers use the record when making new decisions?
- **When is this workflow economically and organisationally preferable?** How do product complexity, concurrent workstreams, access to expertise, and accumulated intent affect total cost? Comparisons with existing development and collaborative building would establish where each arrangement is useful.

---

[Research question](analysis-research-question.md) · [Collaborative-building proposal](proposal.md) · [Industry-response evaluation](evaluation.md) · [Research hub](analysis.md)
