# Tiden evaluation plan

Companion to [Preserving Human Intent with Tiden](proposal-tiden.md).

This plan outlines how the hypothesis could be evaluated. An evaluation should establish whether intent survives and guides subsequent work, whether automatic feedback corrects drift from that intent, and whether the resulting benefits justify the complete operating cost.

## What to measure

Three families of outcomes:

- **Intent preservation and use.** Accuracy of recorded objectives, reasons, tradeoffs, and corrections; availability before the agent writes affected code; appropriate use in later decisions and handover; counts of omissions, changed meaning, invented reasons, and obsolete guidance.
- **Adherence and corrective feedback.** Independently checked behaviour against supplied intent; meaningful detection of drift; subsequent correction or explicit deferral. Prevention, detection, and recovery would be assessed separately, including cases where code and tests share a misunderstanding. The evaluation would also check whether incomplete verification in one session prevents further development in the next.
- **Cost and delivery.** Total tokens and model and tool costs; human time spent stating intent, answering questions, correcting records, testing, and directing repairs; elapsed time; and completed, verified changes over the observation period.

A benchmark showing fewer unwanted implementation changes can support an adherence claim. The broader intent-debt hypothesis also requires evidence that reasons remain available and inform later decisions. Intent debt can accumulate while current behaviour remains unchanged.

## Conditions to compare

The initial comparison would hold the team arrangement constant:

| Condition | Workflow |
|---|---|
| Existing workflow | Developers work in separate agent-assisted sessions, using their existing requests, specifications, decision records, conversations, tests, and ways of supplying context, with access to product and QA expertise. |
| Existing workflow with Tiden | The same arrangement, adding Tiden's shared specs, automatic context supply, capture, appraisal, corrective feedback, and test reporting. |

Both conditions would receive equivalent human objectives, reasons, planned corrections, and authorised revisions, with comparable access to expertise. The baseline would retain its useful documentation and automation. If an advantage over a deliberate spec/ADR practice is claimed, that practice needs to be represented in the comparison.

The result would estimate the contribution of adding Tiden to the tested workflow. A claim of lower staffing or coordination costs than collaborative building would require a separate comparison with that arrangement. Separate developer sessions provide the first setting; the mechanism could also be evaluated in other team configurations.

## What to hold fixed

The comparison would keep the starting product, tasks, model and agent configuration, degree of autonomy, participant responsibilities, and available staffing comparable. It would also record whether manual testing or code inspection was needed in each workflow, what it was needed for, and the effort involved.

An evaluator-held record of supplied human decisions and revisions would provide the reference for independent behavioural checks and judgments about retained reasoning. Generated specs and tests cannot establish their own correctness. Fresh agent sessions would use what their assigned workflow normally retains; any restriction on access to the original conversation would apply equally.

Independent assessment would observe outcomes without supplying its findings to either workflow during the observation period. Any subsequent repair prompted by an evaluator's findings would be recorded as a separate intervention. Feedback from each workflow's own checks would continue normally.

Product and workflow versions, reporting setup, synchronization settings, gate rules, and any configured human approval steps would be recorded. A configuration requiring review before an update and one applying it automatically are different interventions.

## Unit and time horizon

A pilot could begin with a small product and a known set of human decisions. The refund scenario could include the $500 rule, its abuse-prevention rationale, and a rejected alternative: approval for every refund was considered but rejected because support could not handle the volume. These facts would be supplied at the start of the trial.

The product would then be followed through:

1. Construction and a later feature that must respect an earlier decision.
2. A deliberately introduced error in a captured spec, a human correction, and a fresh session that should receive the correction.
3. Code, tests generated from that code, and documentation generated from the code and tests all repeating a mistake contrary to unchanged human intent.
4. An authorised policy revision.
5. Handover requiring a newcomer to use the recorded reason and rejected alternative.

In the ratification trial, the human decision would remain at $500 while the implementation threshold was deliberately changed to $5,000. Tests would be generated from that incorrect implementation, followed by documentation from the code and tests. The evaluation would track what Tiden supplies to the agent, what appraisal reports, and what the agent changes. Detection, correction, and deferring repair would be recorded as separate outcomes.

An important failure case would be that the original $500 decision remains in history, but the next agent receives a newer $5,000 spec and follows it. This is a hypothetical test, not an observed finding about Tiden.

Record updates would also be evaluated alongside session verification. The linked product documentation describes spec reconciliation from shipped code and automatic merging of product records despite a blocked gate. The question is whether the current human decision remains the reference through those operations and into the next agent session. Completing verification, updating the product record, and authorising a policy change are distinct events. [Automatic intent-branch merging](https://docs.tiden.ai/docs/product/branches#automatic-merge-of-intent-branches).

A separate test could ask for a reason that was never supplied. If the scenario explains why approval is required but gives no reason for choosing exactly $500, a later participant should recognise that the exact threshold's rationale is unknown. An invented explanation should not be attributed to the original decision-maker.

These deliberately introduced situations would examine detection, correction, and preservation. Ordinary construction would also be observed to estimate how often mistakes arise naturally.

After a pilot, the study could expand across products and participants and include concurrent workstreams. A decision revised while affected sessions are in progress would allow observation of whether that revision reaches each session. Requests for human decisions and the time needed to answer them would also be recorded.

The product/team sequence would be the unit of replication. Longer maintenance and turnover trials are needed to assess whether early benefits persist.

## How to judge outcomes

### Intent preservation and use

Before each trial, the evaluator's reference would identify the supplied rules, reasons, accepted tradeoffs, rejected alternatives, known unknowns, and authorised revisions. It would also specify which of these the later task requires and what actions would respect the current decisions.

Each supplied item would be assessed as faithfully retained, partly retained, missing, or contradicted. Unsupported reasons attributed to a human would be counted separately. The evaluation would distinguish four observations:

| Observation | Evidence |
|---|---|
| Retained in the record | The current record represents the supplied decision and its reasoning accurately, with superseded decisions distinguishable. |
| Available before affected work | The agent's actual context contains the relevant current intent before it writes the affected code. For a human participant, record what they retrieve and consult. |
| Recovered by a later participant | A newcomer can explain the rule, its reason, and the rejected alternative, and recognise when a reason was never supplied. |
| Used in a subsequent decision | The participant's proposed action respects the current decision or explicitly seeks an authorised revision, with reasoning that addresses the relevant tradeoff. |

For example, a newcomer asked to make refunds faster might recall that approval limits abuse, yet propose removing approval without reconsidering that tradeoff. That would show retained reasoning without appropriate use. Improving processing within the policy, or asking the product owner to reconsider the delay and abuse tradeoff, would demonstrate use. The scoring should allow different justified proposals.

Consequential intent loss would be identified through its effect on the later task: an unauthorised payment, an obsolete policy applied, or a decision made on an invented rationale. Missing reasoning would also be recorded when no behavioural consequence appears during the trial. Evaluator judgments would cite the supplied decision and the observed action; ambiguous cases would be reported separately.

### Prevention, detection, and correction

Workflow traces would retain the sequence of implementation, appraisal feedback, and correction, including the first implementation presented as complete and the final result. These observations would leave the automatic workflow running normally.

In ordinary construction, a correct first completed implementation without earlier corrective feedback would support prevention. A correct result reached after feedback identifies a violation would support recovery. Expected failures during unfinished construction, such as a test run before its implementation, would be recorded separately.

Detection would require feedback that identifies an actual disagreement with the supplied intent; reports of disagreement in conforming behaviour would be counted as false alarms. Correction would require the resulting implementation to satisfy the independent behavioural checks. Deliberately introduced defects would provide evidence about detection and recovery.

Detection and resolution would be recorded separately. For each detected disagreement, the record would show whether repair completed automatically, followed human clarification or instruction, was explicitly deferred, or remained unresolved at the end of observation. A human correction deliberately supplied by the trial would be labelled so that subsequent success measures whether the workflow preserves and uses it.

For every human intervention, record the question or problem, the answer or action, when it occurred, and the time spent and waiting. Distinguish a new business decision from repeating an existing rule or directing an implementation repair. If a person has to tell the agent to restore the $500 threshold, the resulting repair would count as requiring human help.

### Completion and cost

Before the main study, specify a common observation period and resource limits for comparable tasks, together with rules for supplying help. The pilot would inform these choices; they would be fixed before comparing outcomes.

A completed, verified change would require the requested behaviour and relevant existing obligations to pass the independent checks, with the workflow's required verification completed for the implementation being assessed. An explicit deferral would remain an unresolved outcome. Work stopped at a time or resource limit would retain its unresolved status, and all effort spent on it would remain in the cost totals.

Delivery costs would include setup, context preparation, generation, verification, questions, correction, and work carried into later sessions. Record the effort of the study's independent assessment separately from the human checks needed to deliver the product. This keeps the measurement work distinguishable from the operating effort being evaluated.

## What would weaken or falsify the hypothesis

- Records improve, but relevant intent still fails to reach or influence subsequent work.
- Corrections repeatedly disappear, reasons are invented, or code-derived guidance overrides contradictory human decisions.
- Automatic feedback identifies inconsistencies without producing correction or a clear record of what remains unresolved.
- The workflow produces no meaningful reduction in consequential intent loss or misapplication under the tested conditions.
- Early benefits disappear during maintenance or handover.

Better retention without better use supports a narrower preservation benefit. Equal intent outcomes at lower effort support an economic benefit. Better outcomes whose operating cost exceeds the value of the avoided mistakes would undermine the adoption case, even if the preservation mechanism works.

The main study would use practical benefit thresholds defined in advance and report uncertainty. An inconclusive result should remain inconclusive. Any company-produced benchmark should expose its tasks, configurations, interventions, scoring, and failures to scrutiny; independent replication would strengthen the evidence.

## Questions for the experimental program

- **How much work can the automatic loop complete without human action?** Which checks and corrections can agents handle, when do they need a decision or other help, and does any manual appraisal remain necessary?
- **How reliably does the verification block operate?** What evidence completes the verification requirement, and does unfinished verification continue to block further development across session restarts and changes?
- **Does relevant intent reach every affected session?** Context selection may miss a requirement from another feature, and decisions may change while concurrent work is underway. The reliability of supplying current intent needs evaluation.
- **Is human implementation comprehension or manual code inspection necessary?** Do people need to retain the ability to supervise, diagnose, or evolve the implementation manually? If so, for which tasks, why, and with how much human effort?
- **Does reasoning survive as well as rules?** Capturing desired behaviour is easier to observe than retaining accepted tradeoffs and rejected alternatives. Missing knowledge must remain recognisable, and people must be able to reconsider earlier decisions.
- **Does coherence survive long-term change and turnover?** Do corrections and authorised revisions remain effective through many later updates, and can newcomers use the accumulated reasoning?
- **What are the net economic gains?** Total token consumption, manual testing, correction effort, and delivery time would be assessed across products of different sizes and complexity. Savings from one part of the workflow must be evaluated together with the costs of the others.
